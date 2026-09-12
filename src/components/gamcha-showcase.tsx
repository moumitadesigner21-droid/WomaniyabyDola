"use client";

import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import type { Product } from "@/lib/data";

export function GamchaShowcase({ products }: { products: Product[] }) {
  return (
    <section
      id="gamcha"
      className="scroll-mt-36 border-y border-charcoal/8 bg-ivory py-16 lg:scroll-mt-40 lg:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-2xl">
          <p className="mb-3 text-xs tracking-[0.3em] text-gold uppercase">
            Patchwork &amp; Colour
          </p>
          <h2 className="font-serif text-3xl text-maroon sm:text-4xl">Gamcha</h2>
          <p className="mt-4 text-base leading-relaxed text-warm-gray">
            All {products.length} gamcha pieces — sarees, shrugs, dupattas,
            co-ord sets, dresses, skirts, and jackets crafted from Northeast
            fabric with a modern, wearable spirit.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
            />
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href="/category/gamcha"
            className="inline-flex min-h-[48px] items-center justify-center bg-maroon px-8 py-3 text-[11px] font-semibold tracking-[0.18em] text-ivory uppercase transition-colors hover:bg-maroon-dark"
          >
            Shop All Gamcha
          </Link>
        </div>
      </div>
    </section>
  );
}
