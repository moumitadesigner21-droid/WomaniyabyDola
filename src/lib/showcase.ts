import type { CategorySlug } from "@/lib/categories";
import { getCategoryLabel } from "@/lib/categories";
import type { Product } from "@/lib/data";
import type { ShowcaseRailItem } from "@/components/product-showcase-rail";

const CATEGORY_ACCENTS: Partial<Record<CategorySlug, string>> = {
  shrug: "#5c3d2e",
  sarees: "#6b1e2e",
  dupattas: "#2d6a4f",
  outfits: "#4a3728",
  "skirts-wrappers": "#7c4a2d",
  gamcha: "#6b1e2e",
  "mekhla-chador": "#1e4d3a",
  jamdani: "#3d2c4a",
  "cotton-stoles": "#5c4033",
};

const FALLBACK_ACCENTS = [
  "#6b1e2e",
  "#2d6a4f",
  "#b8860b",
  "#4a3728",
  "#5c3d2e",
  "#7c2d12",
  "#1e3a5f",
  "#8b4513",
];

export function productToShowcaseItem(
  product: Product,
  index: number,
): ShowcaseRailItem {
  const accent =
    CATEGORY_ACCENTS[product.category] ??
    FALLBACK_ACCENTS[index % FALLBACK_ACCENTS.length];

  const tag = getCategoryLabel(product.category);

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: product.price,
    image: product.image,
    imagePosition: product.imagePosition,
    description: product.description,
    tag,
    accent,
  };
}

export function productsToShowcaseItems(products: Product[]): ShowcaseRailItem[] {
  return products.map(productToShowcaseItem);
}
