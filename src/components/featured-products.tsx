import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import type { Product } from "@/lib/data";

/** Products flagged `featured` in the CMS. Rendered when the homepage has a `featured` section. */
export function FeaturedProducts({ products }: { products: Product[] }) {
  if (!products.length) return null;

  return (
    <section id="featured" className="bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between lg:mb-14">
          <div>
            <p className="mb-3 text-xs tracking-[0.3em] text-gold uppercase">
              Handpicked
            </p>
            <h2 className="font-serif text-3xl text-maroon sm:text-4xl">
              Featured Collection
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-sm tracking-widest text-maroon uppercase transition-colors hover:text-maroon-dark"
          >
            View All Products →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-8">
          {products.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
