import type { Product } from "@/lib/data";

export function getProductPath(slug: string) {
  return `/products/${slug}`;
}

export function getProductImagesFromProduct(product: Product): string[] {
  const images = [product.image, ...(product.gallery ?? [])];
  return [...new Set(images.filter(Boolean))];
}
