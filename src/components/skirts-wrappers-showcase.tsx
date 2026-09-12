"use client";

import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { isGamchaProduct } from "@/lib/gamcha";
import { skirtsAndWrappersProducts } from "@/lib/data";

const showcaseSkirts = skirtsAndWrappersProducts.filter(
  (product) => !isGamchaProduct(product),
);

export function SkirtsWrappersShowcase() {
  return (
    <section id="skirts" className="border-y border-charcoal/8 bg-ivory py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-2xl">
          <p className="mb-3 text-xs tracking-[0.3em] text-gold uppercase">
            Wrap &amp; Drape
          </p>
          <h2 className="font-serif text-3xl text-maroon sm:text-4xl">
            Skirts &amp; Wrappers
          </h2>
          <p className="mt-4 text-base leading-relaxed text-warm-gray">
            Showing all {showcaseSkirts.length} non-gamcha pieces from the
            Skirts &amp; Wrappers collection — dokhona wraps and Karbi sets.
            <span className="block mt-1">
              Gamcha skirts are in{" "}
              <a href="/category/gamcha" className="text-maroon underline-offset-2 hover:underline">
                Gamcha
              </a>
              .
            </span>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3">
          {showcaseSkirts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
            />
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href="/category/skirts-wrappers"
            className="inline-flex min-h-[48px] items-center justify-center bg-maroon px-8 py-3 text-[11px] font-semibold tracking-[0.18em] text-ivory uppercase transition-colors hover:bg-maroon-dark"
          >
            Shop All Skirts &amp; Wrappers
          </Link>
        </div>
      </div>
    </section>
  );
}
