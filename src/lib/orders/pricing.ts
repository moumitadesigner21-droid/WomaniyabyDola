import { getCouponByCode } from "@/lib/cms/coupons-repository";
import {
  findCmsProducts,
  hasVariants,
  resolveVariantPricing,
} from "@/lib/cms/products-repository";
import type { CmsCoupon, CmsProduct } from "@/lib/cms/types";
import { variantLabelFor } from "@/lib/cms/variants";
import { getShippingPaymentConfig } from "@/lib/orders/repository";

export class PricingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PricingError";
  }
}

export interface QuoteItemInput {
  productId?: string;
  slug?: string;
  variantId?: string;
  size?: string;
  quantity: number;
}

export interface PricedItem {
  productId: string;
  slug: string;
  name: string;
  size: string | null;
  variantId: string | null;
  variantLabel: string | null;
  quantity: number;
  /** Unit price from the DB (sale price when set), never from the client. */
  price: number;
  image: string;
  categorySlug: string;
}

export interface OrderQuote {
  items: PricedItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  couponCode: string | null;
  freeShippingThreshold: number | null;
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Resolves each cart line against the catalog and rejects anything unsellable. */
export async function priceItems(items: QuoteItemInput[]): Promise<PricedItem[]> {
  if (!items.length) {
    throw new PricingError("Your cart is empty.");
  }

  // One round-trip for every product in the cart.
  const catalog = await findCmsProducts({
    ids: items.map((item) => item.productId ?? ""),
    slugs: items.map((item) => item.slug ?? ""),
  });
  const findProduct = (item: QuoteItemInput): CmsProduct | null =>
    (item.productId && catalog.byId.get(item.productId)) ||
    (item.slug && catalog.bySlug.get(item.slug)) ||
    null;

  return items.map((item) => {
    const product = findProduct(item);
    const label = item.slug ?? item.productId ?? "item";

    if (!product || !product.enabled) {
      throw new PricingError(`"${label}" is no longer available.`);
    }

    const quantity = Math.max(1, Math.floor(item.quantity));

    // Products with options: the chosen variant carries stock and price.
    if (hasVariants(product)) {
      const variant =
        product.variants.find((v) => v.id === item.variantId) ??
        // Legacy carts that only sent a size for a single-option product.
        (product.options.length === 1 && item.size
          ? product.variants.find(
              (v) => v.optionValues[product.options[0].name] === item.size,
            )
          : undefined);

      if (!variant) {
        throw new PricingError(
          `Please choose ${product.options.map((o) => o.name.toLowerCase()).join(" and ")} for "${product.name}".`,
        );
      }
      const variantLabel = variantLabelFor(product.options, variant.optionValues);
      const displayName = `${product.name} (${variantLabel})`;

      if (!variant.inStock || variant.stockQuantity <= 0) {
        throw new PricingError(`"${displayName}" is out of stock.`);
      }
      if (variant.stockQuantity < quantity) {
        throw new PricingError(
          `Only ${variant.stockQuantity} of "${displayName}" left in stock.`,
        );
      }

      return {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        size: variantLabel,
        variantId: variant.id,
        variantLabel,
        quantity,
        price: resolveVariantPricing(product, variant).price,
        image: variant.image ?? product.image,
        categorySlug: product.categorySlug,
      };
    }

    if (!product.inStock) {
      throw new PricingError(`"${product.name}" is out of stock.`);
    }
    if (product.stockQuantity < quantity) {
      throw new PricingError(
        product.stockQuantity > 0
          ? `Only ${product.stockQuantity} of "${product.name}" left in stock.`
          : `"${product.name}" is out of stock.`,
      );
    }

    const size = item.size?.trim() || null;
    if (product.sizes.length) {
      if (!size || !product.sizes.includes(size)) {
        throw new PricingError(`Please choose a valid size for "${product.name}".`);
      }
    }

    return {
      productId: product.id,
      slug: product.slug,
      name: product.name,
      size,
      variantId: null,
      variantLabel: null,
      quantity,
      price: product.salePrice ?? product.price,
      image: product.image,
      categorySlug: product.categorySlug,
    };
  });
}

function isCouponActive(coupon: CmsCoupon, now = new Date()): boolean {
  if (!coupon.enabled) return false;
  if (coupon.validFrom && new Date(coupon.validFrom) > now) return false;
  if (coupon.validUntil && new Date(coupon.validUntil) < now) return false;
  return true;
}

function couponEligibleSubtotal(coupon: CmsCoupon, items: PricedItem[]): number {
  return items.reduce((sum, item) => {
    if (coupon.productId && item.productId !== coupon.productId) return sum;
    if (coupon.categorySlug && item.categorySlug !== coupon.categorySlug) return sum;
    return sum + item.price * item.quantity;
  }, 0);
}

/**
 * Computes the authoritative totals for a set of cart lines.
 * Throws PricingError with a customer-facing message when the order
 * cannot be fulfilled as requested.
 */
export async function quoteOrder(
  rawItems: QuoteItemInput[],
  couponCode?: string | null,
): Promise<OrderQuote> {
  const items = await priceItems(rawItems);
  const subtotal = roundMoney(
    items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  );

  const config = await getShippingPaymentConfig();

  if (config.minOrderValue > 0 && subtotal < config.minOrderValue) {
    throw new PricingError(
      `Minimum order value is ₹${config.minOrderValue.toLocaleString("en-IN")}.`,
    );
  }

  let discount = 0;
  let freeShipping = false;
  let appliedCode: string | null = null;

  const code = couponCode?.trim().toUpperCase();
  if (code) {
    const coupon = await getCouponByCode(code);
    if (!coupon || !isCouponActive(coupon)) {
      throw new PricingError("That coupon code is not valid.");
    }
    if (subtotal < coupon.minOrderValue) {
      throw new PricingError(
        `Coupon ${coupon.code} needs a minimum order of ₹${coupon.minOrderValue.toLocaleString("en-IN")}.`,
      );
    }

    const eligible = couponEligibleSubtotal(coupon, items);
    if (eligible <= 0) {
      throw new PricingError(
        `Coupon ${coupon.code} does not apply to the items in your cart.`,
      );
    }

    discount =
      coupon.discountType === "percentage"
        ? (eligible * coupon.discountValue) / 100
        : Math.min(coupon.discountValue, eligible);
    discount = roundMoney(Math.max(0, discount));
    freeShipping = coupon.freeShipping;
    appliedCode = coupon.code;
  }

  const qualifiesForFreeShipping =
    config.freeShippingThreshold != null &&
    config.freeShippingThreshold > 0 &&
    subtotal >= config.freeShippingThreshold;

  const shipping =
    freeShipping || qualifiesForFreeShipping
      ? 0
      : roundMoney(Math.max(0, config.flatShippingRate));

  const total = roundMoney(Math.max(0, subtotal + shipping - discount));

  return {
    items,
    subtotal,
    shipping,
    discount,
    total,
    couponCode: appliedCode,
    freeShippingThreshold: config.freeShippingThreshold,
  };
}
