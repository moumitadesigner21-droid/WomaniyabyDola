"use client";

import { Minus, Plus, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { WishlistButton } from "@/components/wishlist-button";
import { useCart } from "@/lib/cart";
import { getCategoryLabel, getCategoryPath } from "@/lib/categories";
import type { Product } from "@/lib/data";
import { getProductImagesFromProduct } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";

interface ProductDetailProps {
  product: Product;
}

export function ProductDetail({ product }: ProductDetailProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addItem } = useCart();
  const options = product.options ?? [];
  const variants = product.variants ?? [];
  const images = [
    ...new Set([
      ...getProductImagesFromProduct(product),
      ...variants.map((v) => v.image).filter((src): src is string => Boolean(src)),
    ]),
  ];
  const hasOptions = options.length > 0 && variants.length > 0;

  const initialSize =
    product.sizes?.find((size) => size === searchParams.get("size")) ??
    product.sizes?.[0] ??
    "";
  const [selectedImage, setSelectedImage] = useState(product.image);
  const [selectedSize, setSelectedSize] = useState(initialSize);
  const [quantity, setQuantity] = useState(1);
  // One chosen value per option; pre-select the first in-stock variant.
  const [selection, setSelection] = useState<Record<string, string>>(() => {
    const first = variants.find((v) => v.inStock) ?? variants[0];
    return first ? { ...first.values } : {};
  });

  const selectedVariant = hasOptions
    ? variants.find((v) => options.every((o) => v.values[o.name] === selection[o.name]))
    : undefined;
  const selectionComplete = !hasOptions || options.every((o) => selection[o.name]);

  /** True when picking `value` for `option` (keeping the rest) yields an in-stock variant. */
  const isValueAvailable = (optionName: string, value: string) =>
    variants.some(
      (v) =>
        v.inStock &&
        v.values[optionName] === value &&
        options.every((o) => o.name === optionName || !selection[o.name] || v.values[o.name] === selection[o.name]),
    );

  const displayPrice = selectedVariant?.price ?? product.price;
  const displayCompareAt = selectedVariant ? selectedVariant.compareAtPrice : product.compareAtPrice;
  const soldOut = hasOptions
    ? selectionComplete
      ? !selectedVariant || !selectedVariant.inStock
      : product.inStock === false
    : product.inStock === false;
  const isSkirtProduct = product.category === "skirts-wrappers";
  const isOutfitProduct =
    product.category === "outfits" || product.category === "jamdani";
  const isTallPortrait =
    !isSkirtProduct &&
    !isOutfitProduct &&
    (product.portrait ?? product.category === "shrug");
  const imageObjectClass = isTallPortrait
    ? "object-contain object-top p-2"
    : isSkirtProduct || isOutfitProduct || product.category === "sarees"
      ? "object-contain object-center p-2"
      : "object-cover";
  const imagePositionStyle =
    isTallPortrait || isSkirtProduct || isOutfitProduct || product.category === "sarees"
      ? { objectPosition: product.imagePosition ?? "center center" }
      : undefined;

  const details = useMemo(
    () => [product.dimensions, product.description].filter(Boolean),
    [product.dimensions, product.description],
  );

  // Sticky mobile bar shows once the main buttons scroll out of view.
  const ctaRef = useRef<HTMLDivElement>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const node = ctaRef.current;
      if (!node) return;
      // Show once the main buttons have scrolled above the viewport.
      setShowStickyBar(node.getBoundingClientRect().bottom < 0);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (showStickyBar) document.body.setAttribute("data-sticky-bar", "");
    else document.body.removeAttribute("data-sticky-bar");
    return () => {
      document.body.removeAttribute("data-sticky-bar");
    };
  }, [showStickyBar]);

  const canBuy = hasOptions
    ? Boolean(selectedVariant?.inStock)
    : !soldOut && !(product.sizes?.length && !selectedSize);

  const addSelection = () =>
    addItem(product, {
      size: hasOptions ? undefined : selectedSize || undefined,
      variantId: selectedVariant?.id,
      quantity,
    });

  const handleAddToCart = () => {
    if (!canBuy) return;
    addSelection();
    router.push("/cart");
  };

  const handleBuyNow = () => {
    if (!canBuy) return;
    addSelection();
    router.push("/checkout");
  };

  const chooseValue = (optionName: string, value: string) => {
    const next = { ...selection, [optionName]: value };
    setSelection(next);
    const match = variants.find((v) => options.every((o) => v.values[o.name] === next[o.name]));
    if (match?.image) setSelectedImage(match.image);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 pb-24 sm:px-6 lg:px-8 lg:py-14">
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-2 text-xs tracking-[0.14em] text-warm-gray uppercase"
      >
        <Link href="/" className="transition-colors hover:text-maroon">
          Home
        </Link>
        <span aria-hidden="true">→</span>
        <Link
          href={getCategoryPath(product.category)}
          className="transition-colors hover:text-maroon"
        >
          {getCategoryLabel(product.category)}
        </Link>
        <span aria-hidden="true">→</span>
        <span className="text-charcoal">{product.name}</span>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-14">
        <div className="flex gap-3 sm:gap-4">
          {images.length > 1 ? (
            <div
              className="flex w-[4.5rem] shrink-0 flex-col gap-2 overflow-y-auto sm:w-20 lg:w-24"
              aria-label="Product image thumbnails"
            >
              {images.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  aria-label={`Show ${product.name} photo ${index + 1}`}
                  aria-current={selectedImage === image ? "true" : undefined}
                  onClick={() => setSelectedImage(image)}
                  className={`relative aspect-[3/4] w-full shrink-0 overflow-hidden border bg-ivory transition-colors ${
                    selectedImage === image
                      ? "border-maroon"
                      : "border-charcoal/10 hover:border-maroon/40"
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${product.name} — photo ${index + 1}`}
                    fill
                    className="object-contain object-center p-1"
                    sizes="96px"
                  />
                </button>
              ))}
            </div>
          ) : null}

          <div className="min-w-0 flex-1">
            <div
              className={`relative overflow-hidden bg-white ${
                isTallPortrait ? "aspect-[9/16]" : "aspect-[3/4]"
              }`}
              style={
                product.cardBackground
                  ? { backgroundColor: product.cardBackground }
                  : undefined
              }
            >
              <Image
                src={selectedImage}
                alt={product.name}
                fill
                priority
                className={imageObjectClass}
                style={imagePositionStyle}
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col">
          <div className="flex flex-wrap gap-2">
            {product.isNew ? (
              <span className="bg-maroon px-2 py-1 text-[9px] font-medium tracking-[0.15em] text-ivory uppercase">
                New
              </span>
            ) : null}
            {product.isBestseller ? (
              <span className="bg-gold px-2 py-1 text-[9px] font-medium tracking-[0.15em] text-charcoal uppercase">
                Bestseller
              </span>
            ) : null}
          </div>

          <p className="mt-4 text-[10px] tracking-[0.2em] text-warm-gray uppercase">
            {getCategoryLabel(product.category)}
          </p>
          <div className="mt-2 flex items-start justify-between gap-4">
            <h1 className="font-serif text-3xl leading-tight text-maroon sm:text-4xl">
              {product.name}
            </h1>
            <WishlistButton
              productId={product.id}
              size="md"
              className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center border border-charcoal/15 text-charcoal transition-colors hover:border-maroon hover:text-maroon"
            />
          </div>
          <p className="mt-4 text-2xl font-medium text-maroon">
            {formatPrice(displayPrice)}
            {displayCompareAt ? (
              <span className="ml-3 text-base font-normal text-warm-gray line-through">
                {formatPrice(displayCompareAt)}
              </span>
            ) : null}
          </p>

          {details.length > 0 ? (
            <div className="mt-6 space-y-3 border-t border-charcoal/10 pt-6">
              {product.description ? (
                <p className="text-sm leading-relaxed text-charcoal/85">
                  {product.description}
                </p>
              ) : null}
              {product.dimensions ? (
                <p className="text-sm text-warm-gray">{product.dimensions}</p>
              ) : null}
            </div>
          ) : (
            <p className="mt-6 text-sm leading-relaxed text-charcoal/80">
              Handcrafted heritage piece from Womania by Dola. Select your options
              below and place your order on our checkout page.
            </p>
          )}

          {hasOptions
            ? options.map((option) => (
                <div key={option.name} className="mt-8">
                  <p className="mb-3 text-[10px] font-semibold tracking-[0.2em] text-charcoal uppercase">
                    {option.name}
                    {selection[option.name] ? (
                      <span className="ml-2 font-normal normal-case tracking-normal text-warm-gray">
                        {selection[option.name]}
                      </span>
                    ) : null}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {option.values.map((value) => {
                      const active = selection[option.name] === value;
                      const available = isValueAvailable(option.name, value);
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => chooseValue(option.name, value)}
                          aria-pressed={active}
                          className={`relative inline-flex min-h-[40px] items-center justify-center border px-4 py-2 text-xs font-semibold transition-colors ${
                            active
                              ? "border-maroon bg-maroon text-ivory"
                              : available
                                ? "border-charcoal/20 bg-white text-charcoal hover:border-maroon/50 hover:text-maroon"
                                : "border-dashed border-charcoal/20 bg-white text-charcoal/40"
                          }`}
                        >
                          {value}
                          {!available ? (
                            <span aria-hidden className="absolute inset-x-1 top-1/2 h-px -rotate-12 bg-charcoal/30" />
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            : null}
          {hasOptions && selectionComplete && selectedVariant && !selectedVariant.inStock ? (
            <p className="mt-3 text-xs text-maroon">This combination is sold out.</p>
          ) : null}
          {hasOptions && product.customSizeNote ? (
            <p className="mt-3 text-xs leading-relaxed text-warm-gray">{product.customSizeNote}</p>
          ) : null}

          {!hasOptions && product.sizes?.length ? (
            <div className="mt-8">
              <p className="mb-3 text-[10px] font-semibold tracking-[0.2em] text-charcoal uppercase">
                Select Size
              </p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    aria-pressed={selectedSize === size}
                    className={`inline-flex min-h-[40px] items-center justify-center border px-4 py-2 text-xs font-semibold transition-colors ${
                      selectedSize === size
                        ? "border-maroon bg-maroon text-ivory"
                        : "border-charcoal/20 bg-white text-charcoal hover:border-maroon/50 hover:text-maroon"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              {product.customSizeNote ? (
                <p className="mt-2 text-xs leading-relaxed text-warm-gray">
                  {product.customSizeNote}
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="mt-8">
            <p className="mb-3 text-[10px] font-semibold tracking-[0.2em] text-charcoal uppercase">
              Quantity
            </p>
            <div className="inline-flex items-center border border-charcoal/15">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                className="flex h-10 w-10 items-center justify-center text-charcoal hover:bg-ivory"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="min-w-[2.5rem] text-center text-sm font-medium">
                {quantity}
              </span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => setQuantity((value) => value + 1)}
                className="flex h-10 w-10 items-center justify-center text-charcoal hover:bg-ivory"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {soldOut && !hasOptions ? (
            <div className="mt-8 border border-charcoal/15 bg-ivory px-6 py-4 text-center">
              <p className="text-xs font-semibold tracking-[0.16em] text-charcoal uppercase">
                Sold Out
              </p>
              <p className="mt-1 text-xs text-warm-gray">
                Message us on WhatsApp to ask about a restock or a custom order.
              </p>
            </div>
          ) : (
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!canBuy}
                className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 border border-maroon bg-maroon px-6 py-3 text-xs font-semibold tracking-[0.16em] text-ivory uppercase transition-colors hover:bg-maroon-dark disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ShoppingBag className="h-4 w-4" />
                {hasOptions && !canBuy ? "Sold Out" : "Add to Cart"}
              </button>
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={!canBuy}
                className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 border border-charcoal/15 bg-white px-6 py-3 text-xs font-semibold tracking-[0.16em] text-charcoal uppercase transition-colors hover:border-maroon/40 hover:text-maroon disabled:cursor-not-allowed disabled:opacity-50"
              >
                Buy Now
              </button>
            </div>
          )}
          <div ref={ctaRef} aria-hidden className="h-px" />
        </div>
      </div>

      {/* Sticky mobile CTA */}
      <div
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-charcoal/10 bg-ivory/95 px-4 py-3 backdrop-blur transition-transform duration-300 lg:hidden ${
          showStickyBar ? "translate-y-0" : "translate-y-full"
        }`}
        aria-hidden={!showStickyBar}
      >
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-warm-gray">{product.name}</p>
            <p className="font-medium text-maroon">
              {formatPrice(displayPrice)}
              {hasOptions && selectedVariant ? (
                <span className="ml-2 text-xs font-normal text-warm-gray">{selectedVariant.label}</span>
              ) : null}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              if (!canBuy) {
                ctaRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                return;
              }
              handleAddToCart();
            }}
            tabIndex={showStickyBar ? 0 : -1}
            className={`inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 px-5 text-xs font-semibold tracking-[0.16em] uppercase ${
              soldOut && !hasOptions
                ? "border border-charcoal/15 text-warm-gray"
                : "bg-maroon text-ivory"
            }`}
          >
            <ShoppingBag className="h-4 w-4" />
            {soldOut && !hasOptions ? "Sold out" : canBuy ? "Add to cart" : "Choose options"}
          </button>
        </div>
      </div>
    </div>
  );
}
