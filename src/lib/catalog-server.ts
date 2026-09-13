import { cache } from "react";
import {
  cmsProductToProduct,
  getCatalogProductBySlug,
  getCmsProductBySlug,
  listAllProducts,
  listBestsellerProducts,
  listEnabledProductsAsCatalog,
  listFeaturedProducts,
} from "@/lib/cms/products-repository";
import {
  filterProductsByCategory,
  filterProductsBySubcategory,
  type CategorySlug,
} from "@/lib/categories";
import {
  filterGamchaProducts,
  gamchaSubcategoryToGroup,
  type GamchaGroup,
} from "@/lib/gamcha";
import type { Product } from "@/lib/data";
import { getSiteContent } from "@/lib/cms/content-repository";
import type { HeroSlide } from "@/lib/data";

/** All sellable products from CMS, enabled only. Memoised per request. */
export const getAllCatalogProducts = cache(async (): Promise<Product[]> => {
  return listEnabledProductsAsCatalog();
});

export async function getGamchaProducts(group: GamchaGroup = "all"): Promise<Product[]> {
  return filterGamchaProducts(await getAllCatalogProducts(), group);
}

export const getProductBySlug = cache(async (slug: string): Promise<Product | undefined> => {
  return getCatalogProductBySlug(slug);
});

export async function getProductsByCategory(category: CategorySlug): Promise<Product[]> {
  if (category === "gamcha") {
    return getGamchaProducts();
  }

  return filterProductsByCategory(await getAllCatalogProducts(), category);
}

export async function getProductsBySubcategory(
  category: CategorySlug,
  subcategory: string,
): Promise<Product[]> {
  if (category === "gamcha") {
    const group = gamchaSubcategoryToGroup(subcategory);
    if (!group) return [];
    return getGamchaProducts(group);
  }

  return filterProductsBySubcategory(
    await getAllCatalogProducts(),
    category,
    subcategory,
  );
}

export async function getBestsellerProducts(): Promise<Product[]> {
  const configured = await getSiteContent<{ productSlugs?: string[] }>(
    "bestsellers_config",
    {},
  );

  if (configured.productSlugs?.length) {
    const all = await getAllCatalogProducts();
    const bySlug = new Map(all.map((product) => [product.slug, product]));
    const products = configured.productSlugs
      .map((slug) => bySlug.get(slug))
      .filter((product): product is Product => Boolean(product));
    if (products.length) return products;
  }

  return listBestsellerProducts();
}

export async function getFeaturedProducts(): Promise<Product[]> {
  return listFeaturedProducts();
}

export async function getHeroSlides(): Promise<HeroSlide[]> {
  return getSiteContent<HeroSlide[]>("hero_slides", []);
}

export async function getProductImages(product: Product): Promise<string[]> {
  const cmsProduct = await getCmsProductBySlug(product.slug);
  if (cmsProduct) {
    const ordered = [...cmsProduct.images]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((image) => image.url);
    return [...new Set([product.image, ...ordered].filter(Boolean))];
  }

  const images = [product.image, ...(product.gallery ?? [])];
  return [...new Set(images.filter(Boolean))];
}

export { listAllProducts, cmsProductToProduct, getCmsProductBySlug };
