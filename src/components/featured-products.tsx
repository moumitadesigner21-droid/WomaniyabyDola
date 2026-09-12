"use client";

import Link from "next/link";
import { useState } from "react";
import { ProductCard } from "@/components/product-card";
import { products, type ProductTab } from "@/lib/data";

const tabs: { key: ProductTab; label: string }[] = [
  { key: "newArrivals", label: "New Arrivals" },
  { key: "bestsellers", label: "Bestsellers" },
  { key: "under2500", label: "Under ₹2,500" },
];

export function FeaturedProducts() {
  const [activeTab, setActiveTab] = useState<ProductTab>("newArrivals");
  const items = products[activeTab];

  return (
    <section className="bg-white py-16 lg:py-24">
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
          <div className="flex flex-col gap-4 sm:items-end">
            <div className="flex gap-1 border-b border-maroon/10 sm:gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative px-4 py-2.5 text-sm tracking-wide transition-colors ${
                    activeTab === tab.key
                      ? "font-medium text-maroon"
                      : "text-warm-gray hover:text-charcoal"
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.key && (
                    <span className="absolute right-0 bottom-0 left-0 h-0.5 bg-gold" />
                  )}
                </button>
              ))}
            </div>
            <Link
              href="/shop"
              className="text-sm tracking-widest text-maroon uppercase transition-colors hover:text-maroon-dark"
            >
              View All Products →
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-8">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
