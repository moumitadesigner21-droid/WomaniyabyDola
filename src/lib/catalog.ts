import type { Product } from "@/lib/data";

export function getProductPath(slug: string) {
  return `/products/${slug}`;
}

export function getProductImagesFromProduct(product: Product): string[] {
  // Admin stores the card hover and the pallu/drape on their own columns.
  // The detail page should show every photo, in the same order as the form.
  const images = [
    product.image,
    product.hoverImage,
    product.palluImage,
    ...(product.gallery ?? []),
  ];
  return [...new Set(images.filter((src): src is string => Boolean(src)))];
}
