"use client";

import { Sparkles } from "lucide-react";
import Link from "next/link";
import {
  ProductShowcaseRail,
} from "@/components/product-showcase-rail";
import type { Product } from "@/lib/data";
import { formatPrice } from "@/lib/format";
import { productsToShowcaseItems } from "@/lib/showcase";

const RAIL_LIMIT = 7;

export function Bestsellers({ products }: { products: Product[] }) {
  const items = productsToShowcaseItems(products.slice(0, RAIL_LIMIT));
  const startingPrice = products.reduce(
    (min, p) => Math.min(min, p.price),
    products[0]?.price ?? 0,
  );

  return (
    <ProductShowcaseRail
      id="bestsellers"
      eyebrowIcon={Sparkles}
      eyebrow="Customer Favourites"
      title="Gamcha & Best Sellers"
      intro={
        <>
          Signature gamcha shrugs, sarees, dupattas & jackets — handpicked
          favourites from the studio.{" "}
          <Link
            href="/shop"
            className="text-gold-light underline-offset-2 hover:underline"
          >
            View all products
          </Link>
          .
        </>
      }
      stats={{
        primary: { value: `${items.length}+`, label: "Picks" },
        secondary: {
          value: formatPrice(startingPrice),
          label: "Starting at",
        },
      }}
      items={items}
      cta={{ href: "/shop", label: "View All Products" }}
    />
  );
}
