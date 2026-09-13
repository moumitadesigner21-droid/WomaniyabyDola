"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import type { Product } from "@/lib/data";

const ease = [0.22, 1, 0.36, 1] as const;

/** Latest products flagged NEW in the admin. */
export function NewArrivals({ products }: { products: Product[] }) {
  const reducedMotion = useReducedMotion() ?? false;
  if (!products.length) return null;

  return (
    <section id="new-arrivals" className="relative overflow-hidden bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6 lg:mb-14">
          <div className="max-w-xl">
            <p className="inline-flex items-center gap-2 text-[10px] tracking-[0.28em] text-gold uppercase">
              <Sparkles className="h-3.5 w-3.5" />
              Just In
            </p>
            <h2 className="mt-3 font-serif text-3xl leading-tight text-maroon sm:text-4xl lg:text-5xl">
              New arrivals
            </h2>
            <p className="mt-3 text-base leading-relaxed text-warm-gray">
              Fresh from the loom — the latest pieces to land in the studio.
            </p>
          </div>
          <Link
            href="/shop?sort=newness"
            className="inline-flex items-center gap-2 border border-maroon/25 px-5 py-2.5 text-[10px] font-semibold tracking-[0.2em] text-maroon uppercase transition-colors hover:border-maroon hover:bg-maroon hover:text-ivory"
          >
            See everything new
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 scrollbar-none sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 lg:grid-cols-4 lg:gap-8">
          {products.slice(0, 8).map((product, index) => (
            <motion.div
              key={product.id}
              initial={reducedMotion ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: (index % 4) * 0.08, ease }}
              className="w-[72vw] shrink-0 snap-start sm:w-auto"
            >
              <ProductCard product={product} sizes="(max-width: 640px) 72vw, (max-width: 1024px) 50vw, 25vw" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
