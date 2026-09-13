"use client";

import { Check, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { WishlistButton } from "@/components/wishlist-button";
import { useCart } from "@/lib/cart";
import { getProductPath } from "@/lib/catalog";
import { getCategoryLabel } from "@/lib/categories";
import { getProductHoverImage, type Product } from "@/lib/data";
import { formatPrice } from "@/lib/format";

interface ProductCardProps {
  product: Product;
  sizes?: string;
  /** Lazy-load below the fold (default) or prioritise above it. */
  priority?: boolean;
}

/**
 * One card design for every product: a 3:4 photo frame, badges top-left,
 * heart top-right, name/price, and a single call to action — quick add for
 * simple products, "Choose options" for sized/variant ones.
 */
export function ProductCard({
  product,
  sizes = "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw",
  priority = false,
}: ProductCardProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!added) return;
    const timer = window.setTimeout(() => setAdded(false), 1800);
    return () => window.clearTimeout(timer);
  }, [added]);

  const productUrl = getProductPath(product.slug);
  const hoverImage = getProductHoverImage(product);
  const soldOut = product.inStock === false;
  const needsOptions = Boolean(product.variants?.length || product.sizes?.length);
  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : 0;
  // Full-length shots should keep the face in frame when cropped to 3:4.
  const objectPosition = product.imagePosition ?? (product.portrait ? "center top" : "center 20%");

  const quickAdd = () => {
    if (soldOut || needsOptions) return;
    addItem(product, { quantity: 1 });
    setAdded(true);
  };

  return (
    <article className="group flex h-full flex-col">
      <div className="relative mb-3 aspect-[3/4] overflow-hidden bg-[#f2ede6]">
        <Link href={productUrl} className="absolute inset-0 block" aria-label={product.name}>
          <Image
            src={product.image}
            alt={product.name}
            fill
            priority={priority}
            className={`object-cover transition-all duration-700 ease-out [@media(hover:hover)]:group-hover:scale-[1.04] ${
              hoverImage ? "[@media(hover:hover)]:group-hover:opacity-0" : ""
            } ${soldOut ? "opacity-70 saturate-[0.6]" : ""}`}
            style={{ objectPosition }}
            sizes={sizes}
          />
          {hoverImage ? (
            <Image
              src={hoverImage}
              alt=""
              fill
              className="object-cover opacity-0 transition-opacity duration-500 [@media(hover:hover)]:group-hover:opacity-100"
              style={{ objectPosition }}
              sizes={sizes}
            />
          ) : null}
        </Link>

        <div className="pointer-events-none absolute top-2.5 left-2.5 z-10 flex flex-col items-start gap-1">
          {soldOut ? (
            <span className="bg-charcoal px-2 py-1 text-[9px] font-semibold tracking-[0.16em] text-ivory uppercase">Sold out</span>
          ) : null}
          {!soldOut && discount > 0 ? (
            <span className="bg-forest px-2 py-1 text-[9px] font-semibold tracking-[0.16em] text-ivory uppercase">−{discount}%</span>
          ) : null}
          {product.isNew ? (
            <span className="bg-maroon px-2 py-1 text-[9px] font-semibold tracking-[0.16em] text-ivory uppercase">New</span>
          ) : null}
          {product.isBestseller ? (
            <span className="bg-gold px-2 py-1 text-[9px] font-semibold tracking-[0.16em] text-charcoal uppercase">Bestseller</span>
          ) : null}
        </div>

        <div className="absolute top-2.5 right-2.5 z-10 opacity-0 transition-opacity group-hover:opacity-100 has-[[aria-pressed=true]]:opacity-100 [@media(hover:none)]:opacity-100">
          <WishlistButton
            productId={product.id}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-ivory/95 text-charcoal shadow-sm transition-colors hover:text-maroon"
          />
        </div>

        {/* Desktop hover CTA */}
        {!soldOut ? (
          <div className="absolute inset-x-2.5 bottom-2.5 z-10 hidden translate-y-2 opacity-0 transition-all duration-300 [@media(hover:hover)]:block [@media(hover:hover)]:group-hover:translate-y-0 [@media(hover:hover)]:group-hover:opacity-100">
            {needsOptions ? (
              <Link
                href={productUrl}
                className="flex min-h-[40px] items-center justify-center gap-2 bg-ivory/95 text-[10px] font-semibold tracking-[0.18em] text-charcoal uppercase shadow-sm backdrop-blur-sm transition-colors hover:bg-maroon hover:text-ivory"
              >
                Choose options
              </Link>
            ) : (
              <button
                type="button"
                onClick={quickAdd}
                className={`flex min-h-[40px] w-full items-center justify-center gap-2 text-[10px] font-semibold tracking-[0.18em] uppercase shadow-sm backdrop-blur-sm transition-colors ${
                  added ? "bg-forest text-ivory" : "bg-ivory/95 text-charcoal hover:bg-maroon hover:text-ivory"
                }`}
              >
                {added ? <Check className="h-3.5 w-3.5" /> : <ShoppingBag className="h-3.5 w-3.5" />}
                {added ? "Added to cart" : "Add to cart"}
              </button>
            )}
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col">
        <p className="text-[10px] tracking-[0.2em] text-warm-gray uppercase">
          {getCategoryLabel(product.category)}
        </p>
        <Link href={productUrl} className="mt-1 block">
          <h3 className="line-clamp-2 min-h-[2.6em] text-sm leading-snug text-charcoal transition-colors group-hover:text-maroon">
            {product.name}
          </h3>
        </Link>
        <p className="mt-1.5 flex flex-wrap items-baseline gap-x-2 text-sm">
          {product.variants?.length ? <span className="text-xs text-warm-gray">from</span> : null}
          <span className="font-medium text-maroon">{formatPrice(product.price)}</span>
          {product.compareAtPrice ? (
            <span className="text-xs text-warm-gray line-through">{formatPrice(product.compareAtPrice)}</span>
          ) : null}
        </p>
        {product.sizes?.length && !product.variants?.length ? (
          <p className="mt-1 truncate text-[11px] text-warm-gray">{product.sizes.join(" · ")}</p>
        ) : product.options?.length ? (
          <p className="mt-1 truncate text-[11px] text-warm-gray">
            {product.options.map((option) => `${option.values.length} ${option.name.toLowerCase()}${option.values.length === 1 ? "" : "s"}`).join(" · ")}
          </p>
        ) : null}

        {/* Touch devices: always-visible CTA */}
        <div className="mt-3 [@media(hover:hover)]:hidden">
          {soldOut ? (
            <Link href={productUrl} className="flex min-h-[40px] items-center justify-center border border-charcoal/15 text-[10px] font-semibold tracking-[0.18em] text-warm-gray uppercase">
              Sold out
            </Link>
          ) : needsOptions ? (
            <Link href={productUrl} className="flex min-h-[40px] items-center justify-center border border-maroon text-[10px] font-semibold tracking-[0.18em] text-maroon uppercase">
              Choose options
            </Link>
          ) : (
            <button
              type="button"
              onClick={quickAdd}
              className={`flex min-h-[40px] w-full items-center justify-center gap-2 text-[10px] font-semibold tracking-[0.18em] uppercase transition-colors ${
                added ? "bg-forest text-ivory" : "bg-maroon text-ivory"
              }`}
            >
              {added ? <Check className="h-3.5 w-3.5" /> : <ShoppingBag className="h-3.5 w-3.5" />}
              {added ? "Added" : "Add to cart"}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
