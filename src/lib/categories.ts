import type { Product } from "@/lib/data";

export const CATEGORY_SLUGS = [
  "gamcha",
  "sarees",
  "outfits",
  "skirts-wrappers",
  "shrug",
  "jamdani",
  "mekhla-chador",
  "dupattas",
  "cotton-stoles",
] as const;

export type CategorySlug = (typeof CATEGORY_SLUGS)[number];

export interface SubcategoryDefinition {
  slug: string;
  name: string;
}

export interface CategoryDefinition {
  slug: CategorySlug;
  name: string;
  description: string;
  subcategories: SubcategoryDefinition[];
}

/** Maps legacy display names and query params to canonical slugs. */
export const LEGACY_CATEGORY_MAP: Record<string, CategorySlug> = {
  Gamcha: "gamcha",
  gamcha: "gamcha",
  Saree: "sarees",
  Sarees: "sarees",
  sarees: "sarees",
  Outfits: "outfits",
  Dresses: "outfits",
  outfits: "outfits",
  "Skirts & Wrappers": "skirts-wrappers",
  "skirts-wrappers": "skirts-wrappers",
  Shrug: "shrug",
  shrug: "shrug",
  Jamdani: "jamdani",
  jamdani: "jamdani",
  "Mekhla Chador": "mekhla-chador",
  "mekhla-chador": "mekhla-chador",
  Dupattas: "dupattas",
  dupattas: "dupattas",
  "Cotton Stoles": "cotton-stoles",
  "cotton-stoles": "cotton-stoles",
};

export const categories: CategoryDefinition[] = [
  {
    slug: "gamcha",
    name: "Gamcha",
    description:
      "Patchwork sarees, shrugs, dupattas, co-ord sets, dresses, skirts & jackets in Northeast gamcha fabric.",
    subcategories: [
      { slug: "gamcha-sarees", name: "Gamcha Sarees" },
      { slug: "gamcha-shrugs", name: "Gamcha Shrugs" },
      { slug: "gamcha-dupattas", name: "Gamcha Dupattas" },
      { slug: "gamcha-outfits", name: "Gamcha Outfits" },
      { slug: "gamcha-skirts", name: "Gamcha Skirts" },
    ],
  },
  {
    slug: "sarees",
    name: "Saree",
    description: "Silk, cotton, gamcha & handloom sarees handcrafted in Jalpaiguri.",
    subcategories: [
      { slug: "gamcha-sarees", name: "Gamcha Sarees" },
      { slug: "cotton-sarees", name: "Cotton Sarees" },
      { slug: "silk-sarees", name: "Silk Sarees" },
      { slug: "patchwork-sarees", name: "Patchwork Sarees" },
      { slug: "handloom-sarees", name: "Handloom Sarees" },
      { slug: "printed-sarees", name: "Printed Sarees" },
    ],
  },
  {
    slug: "outfits",
    name: "Outfits",
    description: "Dresses, co-ord sets, dhoti sets & gamcha shirts for everyday wear.",
    subcategories: [
      { slug: "coord-sets", name: "Co-ord Sets" },
      { slug: "dresses", name: "Dresses" },
      { slug: "dhoti-sets", name: "Dhoti Sets" },
      { slug: "shirts", name: "Shirts" },
      { slug: "jackets", name: "Jackets" },
    ],
  },
  {
    slug: "skirts-wrappers",
    name: "Skirts & Wrappers",
    description: "Wrapped skirts, dokhona sets & gamcha skirt ensembles.",
    subcategories: [
      { slug: "wrapped-skirts", name: "Wrapped Skirts" },
      { slug: "dokhona-sets", name: "Dokhona Sets" },
      { slug: "skirt-sets", name: "Skirt Sets" },
    ],
  },
  {
    slug: "shrug",
    name: "Shrug",
    description: "Layered ethnic shrugs, wrap jackets & gamcha outerwear.",
    subcategories: [
      { slug: "long-shrugs", name: "Long Shrugs" },
      { slug: "wrap-jackets", name: "Wrap Jackets" },
      { slug: "gamcha-shrugs", name: "Gamcha Shrugs" },
    ],
  },
  {
    slug: "jamdani",
    name: "Jamdani",
    description: "Woven poetry on cotton — sarees, dresses & co-ord sets.",
    subcategories: [
      { slug: "jamdani-dresses", name: "Jamdani Dresses" },
      { slug: "jamdani-coord-sets", name: "Jamdani Co-ord Sets" },
    ],
  },
  {
    slug: "mekhla-chador",
    name: "Mekhla Chador",
    description: "Select Assam heritage Mekhla Chador pieces.",
    subcategories: [
      { slug: "cotton-mekhla", name: "Cotton Mekhla" },
      { slug: "silk-mekhla", name: "Silk Mekhla" },
    ],
  },
  {
    slug: "dupattas",
    name: "Dupattas",
    description: "Handcrafted dupattas to pair with your ethnic looks.",
    subcategories: [
      { slug: "gamcha-dupattas", name: "Gamcha Dupattas" },
      { slug: "cotton-dupattas", name: "Cotton Dupattas" },
    ],
  },
  {
    slug: "cotton-stoles",
    name: "Cotton Stoles",
    description:
      "Handwoven and embroidered cotton stoles — 2 m length, 50 cm breadth.",
    subcategories: [
      { slug: "handwoven-stoles", name: "Handwoven Stoles" },
      { slug: "embroidered-stoles", name: "Embroidered Stoles" },
    ],
  },
];

export function isCategorySlug(value: string): value is CategorySlug {
  return CATEGORY_SLUGS.includes(value as CategorySlug);
}

export function normalizeCategorySlug(value: string): CategorySlug | undefined {
  if (isCategorySlug(value)) return value;
  return LEGACY_CATEGORY_MAP[value];
}

export function getCategoryBySlug(slug: string): CategoryDefinition | undefined {
  return categories.find((category) => category.slug === slug);
}

export function getCategoryLabel(slug: CategorySlug): string {
  return getCategoryBySlug(slug)?.name ?? slug;
}

export function getSubcategoryLabel(
  categorySlug: CategorySlug,
  subcategorySlug: string,
): string {
  const category = getCategoryBySlug(categorySlug);
  const subcategory = category?.subcategories.find(
    (item) => item.slug === subcategorySlug,
  );
  return subcategory?.name ?? subcategorySlug;
}

export function getCategoryPath(
  slug: CategorySlug,
  subcategory?: string,
): string {
  if (subcategory) {
    return `/category/${slug}/${subcategory}`;
  }
  return `/category/${slug}`;
}

export function inferSubcategory(product: Product): string | undefined {
  const name = product.name.toLowerCase();
  const slug = product.slug.toLowerCase();

  switch (product.category) {
    case "sarees":
      if (name.includes("gamcha") || slug.includes("gamcha")) {
        return "gamcha-sarees";
      }
      if (
        name.includes("silk") ||
        name.includes("benarasi") ||
        name.includes("katan") ||
        name.includes("art silk")
      ) {
        return "silk-sarees";
      }
      if (name.includes("patchwork")) return "patchwork-sarees";
      if (name.includes("handloom")) return "handloom-sarees";
      if (
        name.includes("print") ||
        name.includes("tie") ||
        name.includes("mulmul") ||
        name.includes("satin")
      ) {
        return "printed-sarees";
      }
      if (name.includes("cotton")) return "cotton-sarees";
      return undefined;

    case "outfits":
      if (name.includes("shirt")) return "shirts";
      if (name.includes("jacket")) return "jackets";
      if (name.includes("dhoti")) return "dhoti-sets";
      if (
        name.includes("dress") ||
        name.includes("kaftan") ||
        name.includes("maxi")
      ) {
        return "dresses";
      }
      if (name.includes("coord") || name.includes("co-ord") || name.includes("set")) {
        return "coord-sets";
      }
      return undefined;

    case "skirts-wrappers":
      if (name.includes("dokhona")) return "dokhona-sets";
      if (name.includes("jacket") && name.includes("skirt")) {
        return "skirt-sets";
      }
      if (name.includes("skirt") || name.includes("wrapper")) {
        return "wrapped-skirts";
      }
      return undefined;

    case "shrug":
      if (name.includes("gamcha")) return "gamcha-shrugs";
      if (name.includes("jacket") || name.includes("wrap")) {
        return "wrap-jackets";
      }
      return "long-shrugs";

    case "jamdani":
      if (name.includes("coord") || name.includes("co-ord") || name.includes("set")) {
        return "jamdani-coord-sets";
      }
      return "jamdani-dresses";

    case "mekhla-chador":
      if (name.includes("silk")) return "silk-mekhla";
      return "cotton-mekhla";

    case "dupattas":
      if (name.includes("gamcha")) return "gamcha-dupattas";
      return "cotton-dupattas";

    case "cotton-stoles":
      if (
        name.includes("embroider") ||
        name.includes("floral") ||
        name.includes("geometric")
      ) {
        return "embroidered-stoles";
      }
      return "handwoven-stoles";

    default:
      return undefined;
  }
}

export function resolveProductSubcategory(product: Product): string | undefined {
  return product.subcategory ?? inferSubcategory(product);
}

export function filterProductsByCategory(
  products: Product[],
  category: CategorySlug,
): Product[] {
  return products.filter((product) => product.category === category);
}

export function filterProductsBySubcategory(
  products: Product[],
  category: CategorySlug,
  subcategory: string,
): Product[] {
  return products.filter(
    (product) =>
      product.category === category &&
      resolveProductSubcategory(product) === subcategory,
  );
}

export function getProductCountByCategory(
  products: Product[],
  category: CategorySlug,
): number {
  if (category === "gamcha") {
    return products.filter(
      (product) =>
        `${product.slug} ${product.name}`.toLowerCase().includes("gamcha"),
    ).length;
  }
  return filterProductsByCategory(products, category).length;
}
