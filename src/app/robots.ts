import type { MetadataRoute } from "next";
import { getSeoSettings } from "@/lib/seo";
import { getSiteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

const PAGE_PATHS = {
  home: "/",
  shop: "/shop",
  about: "/about-us",
  contact: "/contact-us",
  policies: "/policies",
} as const;

export default async function robots(): Promise<MetadataRoute.Robots> {
  const base = getSiteUrl().origin;
  const seo = await getSeoSettings();
  const noindex = (Object.keys(PAGE_PATHS) as (keyof typeof PAGE_PATHS)[])
    .filter((key) => seo.pages[key].noindex && key !== "home")
    .map((key) => PAGE_PATHS[key]);

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api", "/cart", "/checkout", ...noindex],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
