import type { MetadataRoute } from "next";
import { getAllCatalogProducts, listAllProducts } from "@/lib/catalog-server";
import { listCategories } from "@/lib/cms/categories-repository";
import { getSeoSettings } from "@/lib/seo";
import { getSiteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl().origin;
  const now = new Date();
  const [seo, categories] = await Promise.all([getSeoSettings(), listCategories()]);

  const staticPages: MetadataRoute.Sitemap = (
    [
      ["home", "/", "daily", 1],
      ["shop", "/shop", "daily", 0.9],
      ["about", "/about-us", "monthly", 0.5],
      ["contact", "/contact-us", "monthly", 0.5],
      ["policies", "/policies", "yearly", 0.3],
    ] as const
  )
    .filter(([key]) => !seo.pages[key].noindex)
    .map(([, path, changeFrequency, priority]) => ({
      url: `${base}${path}`,
      lastModified: now,
      changeFrequency,
      priority,
    }));

  const categoryPages: MetadataRoute.Sitemap = categories.filter((c) => c.enabled).flatMap((category) => [
    {
      url: `${base}/category/${category.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    ...category.subcategories.map((sub) => ({
      url: `${base}/category/${category.slug}/${sub.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ]);

  const [cmsProducts, catalog] = await Promise.all([
    listAllProducts(false),
    getAllCatalogProducts(),
  ]);
  const updatedBySlug = new Map(
    cmsProducts.map((product) => [product.slug, product.updatedAt]),
  );

  const productPages: MetadataRoute.Sitemap = catalog.map(
    (product) => ({
      url: `${base}/products/${product.slug}`,
      lastModified: updatedBySlug.get(product.slug)
        ? new Date(updatedBySlug.get(product.slug)!)
        : now,
      changeFrequency: "weekly",
      priority: 0.7,
    }),
  );

  return [...staticPages, ...categoryPages, ...productPages];
}
