"use client";

import { Layers } from "lucide-react";
import Link from "next/link";
import { ProductShowcaseRail } from "@/components/product-showcase-rail";
import { getProductPath } from "@/lib/catalog";
import { shrugProducts, type ShrugProduct } from "@/lib/data";
import { formatPrice } from "@/lib/format";
import { hasGamchaInName } from "@/lib/gamcha";
import type { ShowcaseRailItem } from "@/components/product-showcase-rail";

const showcaseShrugs = shrugProducts.filter(
  (product) => !hasGamchaInName(product.slug, product.name),
);

function shrugToRailItem(product: ShrugProduct): ShowcaseRailItem {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: product.price,
    image: product.image,
    imagePosition: product.imagePosition,
    description: product.description,
    tag: product.tag,
    accent: product.accent,
  };
}

export function ShrugShowcase() {
  const items = showcaseShrugs.map(shrugToRailItem);
  const minPrice = showcaseShrugs.reduce(
    (min, p) => Math.min(min, p.price),
    showcaseShrugs[0]?.price ?? 0,
  );

  return (
    <ProductShowcaseRail
      id="shrug"
      eyebrowIcon={Layers}
      eyebrow="The Shrug Edit"
      title="Layer up. Stand out."
      intro={
        <>
          Silk, khadi & tribal shrugs — ethnic layers for everyday style. Gamcha
          shrugs and jackets are in{" "}
          <Link
            href="/category/gamcha"
            className="text-gold-light underline-offset-2 hover:underline"
          >
            Gamcha
          </Link>
          .
        </>
      }
      stats={{
        primary: { value: `${showcaseShrugs.length}+`, label: "Styles" },
        secondary: { value: formatPrice(minPrice), label: "Starting at" },
      }}
      items={items}
      cta={{ href: "/category/shrug", label: "Browse All Shrugs" }}
    />
  );
}

// keep path helper available for any legacy imports
export function getShrugBuyUrl(slug: string) {
  return getProductPath(slug);
}
