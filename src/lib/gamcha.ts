import type { Product } from "@/lib/data";

export type GamchaGroup =
  | "all"
  | "sarees"
  | "shrugs"
  | "dupattas"
  | "outfits"
  | "skirts-wrappers";

export const GAMCHA_SUBCATEGORY_GROUPS: Record<
  string,
  Exclude<GamchaGroup, "all">
> = {
  "gamcha-sarees": "sarees",
  "gamcha-shrugs": "shrugs",
  "gamcha-dupattas": "dupattas",
  "gamcha-outfits": "outfits",
  "gamcha-skirts": "skirts-wrappers",
};

export function isGamchaProduct(product: Product): boolean {
  return hasGamchaInName(product.slug, product.name);
}

export function hasGamchaInName(slug: string, name: string): boolean {
  const haystack = `${slug} ${name}`.toLowerCase();
  return haystack.includes("gamcha");
}

export function getGamchaProductGroup(
  product: Product,
): Exclude<GamchaGroup, "all"> {
  switch (product.category) {
    case "sarees":
      return "sarees";
    case "shrug":
      return "shrugs";
    case "dupattas":
      return "dupattas";
    case "skirts-wrappers":
      return "skirts-wrappers";
    default:
      return "outfits";
  }
}

export function gamchaSubcategoryToGroup(
  subcategory: string,
): Exclude<GamchaGroup, "all"> | undefined {
  return GAMCHA_SUBCATEGORY_GROUPS[subcategory];
}

export function getGamchaGroupLabel(group: GamchaGroup): string {
  switch (group) {
    case "all":
      return "All Gamcha";
    case "sarees":
      return "Sarees";
    case "shrugs":
      return "Shrugs";
    case "dupattas":
      return "Dupattas";
    case "outfits":
      return "Outfits";
    case "skirts-wrappers":
      return "Skirts & Wrappers";
  }
}

export function isGamchaCategoryKey(value: string): boolean {
  return value === "gamcha";
}

export function getGamchaCategoryHref(): string {
  return "/category/gamcha";
}

export function resolveGamchaSubcategory(product: Product): string {
  switch (getGamchaProductGroup(product)) {
    case "sarees":
      return "gamcha-sarees";
    case "shrugs":
      return "gamcha-shrugs";
    case "dupattas":
      return "gamcha-dupattas";
    case "skirts-wrappers":
      return "gamcha-skirts";
    default:
      return "gamcha-outfits";
  }
}

function sortGamchaProducts(products: Product[]): Product[] {
  return [...products].sort((a, b) => {
    const score = (product: Product) =>
      (product.isBestseller ? 2 : 0) + (product.isNew ? 1 : 0);
    const byFeatured = score(b) - score(a);
    if (byFeatured !== 0) return byFeatured;
    return a.name.localeCompare(b.name);
  });
}

export function filterGamchaProducts(
  products: Product[],
  group: GamchaGroup = "all",
): Product[] {
  const gamchaProducts = products.filter(isGamchaProduct);

  const filtered =
    group === "all"
      ? gamchaProducts
      : gamchaProducts.filter(
          (product) => getGamchaProductGroup(product) === group,
        );

  return sortGamchaProducts(filtered);
}
