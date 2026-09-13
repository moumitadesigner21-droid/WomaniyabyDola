"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ProductCard } from "@/components/product-card";
import { useCustomer } from "@/lib/customer";
import type { Product } from "@/lib/data";

/** Resolves wishlist ids to products; works for guests (localStorage) and accounts. */
export function WishlistGrid() {
  const { wishlist, hydrated, customer } = useCustomer();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const key = wishlist.join(",");

  useEffect(() => {
    if (!hydrated) return;
    let cancelled = false;
    void (async () => {
      if (!key) {
        if (!cancelled) {
          setProducts([]);
          setLoading(false);
        }
        return;
      }
      const response = await fetch(`/api/products?ids=${encodeURIComponent(key)}`);
      const payload = (await response.json().catch(() => ({ products: [] }))) as { products: Product[] };
      if (!cancelled) {
        setProducts(payload.products ?? []);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hydrated, key]);

  if (!hydrated || loading) {
    return <p className="text-sm text-warm-gray">Loading your wishlist…</p>;
  }

  if (!products.length) {
    return (
      <div className="border border-dashed border-charcoal/20 bg-white px-6 py-12 text-center">
        <p className="font-serif text-xl text-charcoal">Nothing saved yet</p>
        <p className="mt-2 text-sm text-warm-gray">
          Tap the heart on any product to keep it here{customer ? "" : " — sign in to keep it across devices"}.
        </p>
        <Link href="/shop" className="mt-6 inline-flex min-h-[44px] items-center justify-center bg-maroon px-8 py-3 text-xs font-semibold tracking-[0.18em] text-ivory uppercase transition-colors hover:bg-maroon-dark">
          Browse the collection
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 lg:gap-8">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} sizes="(max-width: 1024px) 50vw, 33vw" />
      ))}
    </div>
  );
}
