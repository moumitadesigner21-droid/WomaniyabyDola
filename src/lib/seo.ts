import type { Metadata } from "next";
import { cache } from "react";
import { CONTENT_DEFAULTS } from "@/lib/cms/content-defaults";
import { getSiteContent } from "@/lib/cms/content-repository";
import { SEO_PAGE_KEYS, seoSchema, type PageSeo, type SeoContent } from "@/lib/cms/content-schemas";
import type { CmsCategory } from "@/lib/cms/types";
import type { Product } from "@/lib/data";
import { getSocial } from "@/lib/site-chrome";
import { getSiteUrl } from "@/lib/site-url";

export type SeoPageKey = (typeof SEO_PAGE_KEYS)[number];

/** Parsed `seo` blob with defaults filled in. Memoised per request. */
export const getSeoSettings = cache(async (): Promise<SeoContent> => {
  const raw = await getSiteContent<unknown>("seo", null);
  const parsed = seoSchema.safeParse(raw ?? {});
  return parsed.success ? parsed.data : CONTENT_DEFAULTS.seo;
});

function absolute(url: string): string {
  if (!url) return url;
  if (url.startsWith("http")) return url;
  return new URL(url, getSiteUrl()).toString();
}

interface MetadataInput {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  image?: string;
  noindex?: boolean;
  type?: "website" | "article";
}

/** Shared builder so every page gets canonical, OG, Twitter and keywords consistently. */
export async function buildMetadata(input: MetadataInput): Promise<Metadata> {
  const seo = await getSeoSettings();
  const image = input.image || seo.ogImage;
  const keywords = [...new Set([...(input.keywords ?? []), ...seo.keywords])].filter(Boolean);

  return {
    title: input.title,
    description: input.description,
    keywords: keywords.length ? keywords : undefined,
    alternates: { canonical: input.path },
    robots: input.noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      type: input.type ?? "website",
      siteName: seo.siteTitle,
      title: input.title,
      description: input.description,
      url: input.path,
      locale: "en_IN",
      images: image ? [{ url: absolute(image) }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      site: seo.twitterHandle || undefined,
      title: input.title,
      description: input.description,
      images: image ? [absolute(image)] : undefined,
    },
  };
}

/** Metadata for one of the fixed pages, honouring the admin's per-page overrides. */
export async function buildPageMetadata(
  page: SeoPageKey,
  fallback: { title: string; description: string; path: string },
): Promise<Metadata> {
  const seo = await getSeoSettings();
  const override: PageSeo = seo.pages[page];
  return buildMetadata({
    title: override.title || fallback.title,
    description: override.description || fallback.description,
    path: fallback.path,
    keywords: override.keywords,
    image: override.ogImage,
    noindex: override.noindex,
  });
}

export async function buildCategoryMetadata(
  category: CmsCategory,
  subcategory?: { slug: string; name: string },
): Promise<Metadata> {
  const path = subcategory
    ? `/category/${category.slug}/${subcategory.slug}`
    : `/category/${category.slug}`;
  const baseTitle = category.seoTitle || category.name;
  const title = subcategory ? `${subcategory.name} · ${baseTitle}` : baseTitle;
  const description =
    category.seoDescription ||
    category.description ||
    `Shop ${category.name.toLowerCase()} handcrafted by Womania by Dola in Jalpaiguri.`;

  return buildMetadata({
    title,
    description,
    path,
    keywords: [category.name, subcategory?.name ?? "", `${category.name} online India`].filter(Boolean),
    image: category.image ?? undefined,
    noindex: !category.enabled,
  });
}

// ---------- Structured data ----------

type JsonLd = Record<string, unknown>;

export async function organizationJsonLd(): Promise<JsonLd> {
  const [seo, social] = await Promise.all([getSeoSettings(), getSocial()]);
  const org = seo.organization;
  const base = getSiteUrl().origin;
  const sameAs = [
    ...org.sameAs,
    social.instagramUrl,
    social.facebookUrl,
    social.youtubeUrl,
  ].filter(Boolean);

  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "OnlineStore"],
    "@id": `${base}/#organization`,
    name: org.name || seo.siteTitle,
    legalName: org.legalName || undefined,
    url: base,
    logo: absolute(org.logo || "/womania-logo.png"),
    email: org.email || social.email || undefined,
    telephone: org.phone || social.phone || undefined,
    address:
      org.streetAddress || org.locality
        ? {
            "@type": "PostalAddress",
            streetAddress: org.streetAddress || undefined,
            addressLocality: org.locality || undefined,
            addressRegion: org.region || undefined,
            postalCode: org.postalCode || undefined,
            addressCountry: org.country || "IN",
          }
        : undefined,
    sameAs: sameAs.length ? sameAs : undefined,
  };
}

export async function websiteJsonLd(): Promise<JsonLd> {
  const seo = await getSeoSettings();
  const base = getSiteUrl().origin;
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${base}/#website`,
    name: seo.siteTitle,
    url: base,
    publisher: { "@id": `${base}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${base}/shop?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]): JsonLd {
  const base = getSiteUrl().origin;
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${base}${item.path}`,
    })),
  };
}

export function itemListJsonLd(name: string, products: Product[]): JsonLd {
  const base = getSiteUrl().origin;
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: products.length,
    itemListElement: products.slice(0, 50).map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${base}/products/${product.slug}`,
      name: product.name,
      image: absolute(product.image),
    })),
  };
}

export function productJsonLd(product: Product, images: string[], sku: string | null): JsonLd {
  const base = getSiteUrl().origin;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: images.map(absolute),
    sku: sku ?? product.id,
    brand: { "@type": "Brand", name: "Womania by Dola" },
    offers: {
      "@type": "Offer",
      url: `${base}/products/${product.slug}`,
      priceCurrency: "INR",
      price: product.price,
      availability:
        product.inStock === false
          ? "https://schema.org/OutOfStock"
          : "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@id": `${base}/#organization` },
    },
  };
}
