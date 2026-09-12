"use client";

import { Minus, Plus, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useCart } from "@/lib/cart";
import { getCategoryLabel, getCategoryPath } from "@/lib/categories";
import { getProductHoverImage, type Product } from "@/lib/data";
import { getProductImagesFromProduct } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";

interface ProductDetailProps {
  product: Product;
}

export function ProductDetail({ product }: ProductDetailProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addItem } = useCart();
  const images = getProductImagesFromProduct(product);
  const initialSize =
    product.sizes?.find((size) => size === searchParams.get("size")) ??
    product.sizes?.[0] ??
    "";
  const [selectedImage, setSelectedImage] = useState(product.image);
  const [selectedSize, setSelectedSize] = useState(initialSize);
  const [quantity, setQuantity] = useState(1);

  const hoverImage = getProductHoverImage(product);
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

  const handleAddToCart = () => {
    if (product.sizes?.length && !selectedSize) return;
    addItem(product, {
      size: selectedSize || undefined,
      quantity,
    });
    router.push("/cart");
  };

  const handleBuyNow = () => {
    if (product.sizes?.length && !selectedSize) return;
    addItem(product, {
      size: selectedSize || undefined,
      quantity,
    });
    router.push("/checkout");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
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
              {images.map((image) => (
                <button
                  key={image}
                  type="button"
                  aria-label="Show product image"
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
                    alt=""
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
          <h1 className="mt-2 font-serif text-3xl leading-tight text-maroon sm:text-4xl">
            {product.name}
          </h1>
          <p className="mt-4 text-2xl font-medium text-maroon">
            {formatPrice(product.price)}
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

          {product.sizes?.length ? (
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

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleAddToCart}
              className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 border border-maroon bg-maroon px-6 py-3 text-xs font-semibold tracking-[0.16em] text-ivory uppercase transition-colors hover:bg-maroon-dark"
            >
              <ShoppingBag className="h-4 w-4" />
              Add to Cart
            </button>
            <button
              type="button"
              onClick={handleBuyNow}
              className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 border border-charcoal/15 bg-white px-6 py-3 text-xs font-semibold tracking-[0.16em] text-charcoal uppercase transition-colors hover:border-maroon/40 hover:text-maroon"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
