"use client";

import { ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { WishlistButton } from "@/components/wishlist-button";
import { getProductPath } from "@/lib/catalog";
import { getCategoryLabel } from "@/lib/categories";
import { getProductHoverImage, type Product } from "@/lib/data";
import { formatPrice } from "@/lib/format";

interface ProductCardProps {
  product: Product;
  sizes?: string;
}

function SizeSelector({
  product,
  selectedSize,
  onSelect,
}: {
  product: Product;
  selectedSize: string;
  onSelect: (size: string) => void;
}) {
  if (!product.sizes?.length) return null;

  return (
    <div className="mt-3 rounded-lg border border-charcoal/10 bg-white p-3">
      <p className="mb-2 text-[10px] font-semibold tracking-[0.2em] text-charcoal uppercase">
        Select Size
      </p>
      <div className="flex flex-wrap gap-2">
        {product.sizes.map((size) => {
          const isSelected = selectedSize === size;
          const isCompact = size.length <= 3;

          return (
            <button
              key={size}
              type="button"
              onClick={() => onSelect(size)}
              aria-pressed={isSelected}
              aria-label={`Select size ${size}`}
              className={`inline-flex min-h-[36px] items-center justify-center border px-3 py-1.5 text-xs font-semibold transition-colors ${
                isCompact ? "min-w-[36px]" : "max-w-full"
              } ${
                isSelected
                  ? "border-maroon bg-maroon text-ivory shadow-sm"
                  : "border-charcoal/20 bg-ivory text-charcoal hover:border-maroon/50 hover:text-maroon"
              }`}
            >
              {size}
            </button>
          );
        })}
      </div>
      {product.customSizeNote && (
        <p className="mt-2 text-[10px] leading-relaxed text-warm-gray">
          {product.customSizeNote}
        </p>
      )}
    </div>
  );
}

export function ProductCard({
  product,
  sizes = "(max-width: 1024px) 50vw, 25vw",
}: ProductCardProps) {
  const isSkirtProduct = product.category === "skirts-wrappers";
  const isOutfitProduct =
    product.category === "outfits" || product.category === "jamdani";
  const isTallPortrait =
    !isSkirtProduct &&
    !isOutfitProduct &&
    (product.portrait ?? product.category === "shrug");
  const hasOptions = Boolean(product.variants?.length);
  // Legacy size-only products can pick a size on the card; option products go to the page.
  const hasSizes = !hasOptions && Boolean(product.sizes?.length);
  const soldOut = product.inStock === false;
  const [selectedSize, setSelectedSize] = useState(
    () => product.sizes?.[0] ?? "",
  );

  const productUrl = getProductPath(product.slug);
  const sizedProductUrl = selectedSize
    ? `${productUrl}?size=${encodeURIComponent(selectedSize)}`
    : productUrl;

  const hoverImage = getProductHoverImage(product);
  const hasHoverImage = Boolean(hoverImage);
  const imageObjectClass = isTallPortrait
    ? "object-contain object-top p-1"
    : isSkirtProduct || isOutfitProduct
      ? "object-contain object-center p-1.5"
      : "object-cover";
  const imagePositionStyle =
    isTallPortrait || isSkirtProduct || isOutfitProduct
      ? { objectPosition: product.imagePosition ?? "center center" }
      : undefined;
  const hoverScaleClass =
    isSkirtProduct || isOutfitProduct
      ? "[@media(hover:hover)]:group-hover:scale-[1.02]"
      : !isTallPortrait
        ? "[@media(hover:hover)]:group-hover:scale-105"
        : "";

  return (
    <article className="group flex h-full flex-col">
      <div
        className={`relative mb-4 overflow-hidden ${
          product.cardBackground ? "" : "bg-ivory"
        } ${isTallPortrait ? "aspect-[9/16]" : "aspect-[3/4]"}`}
        style={
          product.cardBackground
            ? { backgroundColor: product.cardBackground }
            : undefined
        }
      >
        <Link href={productUrl} className="absolute inset-0 z-0 block">
          <div
            className={`absolute inset-0 bg-white transition-transform duration-500 ease-out ${hoverScaleClass}`}
          >
            <Image
              src={product.image}
              alt={product.name}
              fill
              className={`${imageObjectClass} transition-opacity duration-[400ms] ease-in-out ${
                hasHoverImage
                  ? "[@media(hover:hover)]:group-hover:opacity-0"
                  : ""
              }`}
              style={imagePositionStyle}
              sizes={sizes}
            />
            {hoverImage ? (
              <Image
                src={hoverImage}
                alt={`${product.name} — alternate view`}
                fill
                className={`${imageObjectClass} opacity-0 transition-opacity duration-[400ms] ease-in-out [@media(hover:hover)]:group-hover:opacity-100`}
                style={imagePositionStyle}
                sizes={sizes}
              />
            ) : null}
          </div>
        </Link>
        <div className="pointer-events-none absolute top-3 left-3 z-10 flex flex-col gap-1.5">
          {soldOut && (
            <span className="bg-charcoal px-2 py-1 text-[9px] font-medium tracking-[0.15em] text-ivory uppercase">
              Sold Out
            </span>
          )}
          {product.isNew && (
            <span className="bg-maroon px-2 py-1 text-[9px] font-medium tracking-[0.15em] text-ivory uppercase">
              New
            </span>
          )}
          {product.isBestseller && (
            <span className="bg-gold px-2 py-1 text-[9px] font-medium tracking-[0.15em] text-charcoal uppercase">
              Bestseller
            </span>
          )}
        </div>
        <div className="absolute top-3 right-3 z-20 flex flex-col gap-2 opacity-0 transition-opacity group-hover:opacity-100 has-[[aria-pressed=true]]:opacity-100 [@media(hover:none)]:opacity-100">
          <WishlistButton
            productId={product.id}
            className="flex h-9 w-9 items-center justify-center bg-ivory/90 text-charcoal transition-colors hover:bg-gold"
          />
        </div>
        {!soldOut && (
          <Link
            href={hasSizes ? sizedProductUrl : productUrl}
            className="absolute right-0 bottom-0 left-0 z-20 flex translate-y-full items-center justify-center gap-2 bg-maroon/90 py-3 text-xs tracking-widest text-ivory uppercase transition-transform group-hover:translate-y-0"
          >
            <ShoppingBag className="h-4 w-4" />
            {hasSizes || hasOptions ? "Select Options" : "Buy Now"}
          </Link>
        )}
      </div>

      <div className="flex flex-1 flex-col">
        <p className="mb-1 text-[10px] tracking-[0.2em] text-warm-gray uppercase">
          {getCategoryLabel(product.category)}
        </p>
        <Link href={productUrl}>
          <h3 className="text-sm leading-snug text-charcoal transition-colors group-hover:text-maroon lg:text-base">
            {product.name}
          </h3>
        </Link>

        {hasSizes && (
          <SizeSelector
            product={product}
            selectedSize={selectedSize}
            onSelect={setSelectedSize}
          />
        )}

        <p className="mt-2 font-medium text-maroon">
          {hasOptions ? <span className="mr-1 text-xs font-normal text-warm-gray">from</span> : null}
          {formatPrice(product.price)}
          {product.compareAtPrice ? (
            <span className="ml-2 text-xs font-normal text-warm-gray line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          ) : null}
        </p>

        {product.dimensions && (
          <p className="mt-1 text-xs leading-relaxed text-warm-gray">
            {product.dimensions}
          </p>
        )}
        {product.description && (
          <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-warm-gray">
            {product.description}
          </p>
        )}

        {soldOut ? (
          <Link
            href={productUrl}
            className="mt-auto inline-flex min-h-[42px] items-center justify-center gap-2 border border-charcoal/20 bg-ivory px-4 py-2.5 text-[10px] font-semibold tracking-[0.16em] text-warm-gray uppercase"
          >
            Sold Out
          </Link>
        ) : (
          <Link
            href={hasSizes ? sizedProductUrl : productUrl}
            className="mt-auto inline-flex min-h-[42px] items-center justify-center gap-2 border border-maroon bg-maroon px-4 py-2.5 text-[10px] font-semibold tracking-[0.16em] text-ivory uppercase transition-colors hover:bg-maroon-dark"
          >
            <ShoppingBag className="h-4 w-4" />
            {hasSizes || hasOptions ? "View Product" : "Buy Now"}
          </Link>
        )}
      </div>
    </article>
  );
}
