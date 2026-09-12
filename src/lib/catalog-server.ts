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

/** All sellable products from CMS, enabled only. Server-only. */
export function getAllCatalogProducts(): Product[] {
  return listEnabledProductsAsCatalog();
}

export function getGamchaProducts(group: GamchaGroup = "all"): Product[] {
  return filterGamchaProducts(getAllCatalogProducts(), group);
}

export function getProductBySlug(slug: string): Product | undefined {
  return getCatalogProductBySlug(slug);
}

export function getProductsByCategory(category: CategorySlug): Product[] {
  if (category === "gamcha") {
    return getGamchaProducts();
  }

  return filterProductsByCategory(getAllCatalogProducts(), category);
}

export function getProductsBySubcategory(
  category: CategorySlug,
  subcategory: string,
): Product[] {
  if (category === "gamcha") {
    const group = gamchaSubcategoryToGroup(subcategory);
    if (!group) return [];
    return getGamchaProducts(group);
  }

  return filterProductsBySubcategory(
    getAllCatalogProducts(),
    category,
    subcategory,
  );
}

export function getBestsellerProducts(): Product[] {
  const configured = getSiteContent<{ productSlugs?: string[] }>(
    "bestsellers_config",
    {},
  );

  if (configured.productSlugs?.length) {
    const products = configured.productSlugs
      .map((slug) => getProductBySlug(slug))
      .filter(Boolean) as Product[];
    if (products.length) return products;
  }

  return listBestsellerProducts();
}

export function getFeaturedProducts(): Product[] {
  return listFeaturedProducts();
}

export function getHeroSlides(): HeroSlide[] {
  return getSiteContent<HeroSlide[]>("hero_slides", []);
}

export function getProductImages(product: Product): string[] {
  const cmsProduct = getCmsProductBySlug(product.slug);
  if (cmsProduct) {
    const ordered = cmsProduct.images
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((image) => image.url);
    return [...new Set([product.image, ...ordered].filter(Boolean))];
  }

  const images = [product.image, ...(product.gallery ?? [])];
  return [...new Set(images.filter(Boolean))];
}

export {
  listAllProducts,
  cmsProductToProduct,
  getCmsProductBySlug,
};
