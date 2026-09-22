import { z } from "zod";
import { CATEGORY_SLUGS } from "@/lib/categories";

/**
 * Validation for every `site_content` blob. `PATCH /api/admin/content/[key]`
 * rejects payloads that don't match, so a bad save can never blank a page.
 * Keep in sync with the storefront components that consume each key.
 */

const str = (max = 500) => z.string().trim().max(max);
const optStr = (max = 500) => z.string().trim().max(max).optional().default("");
const url = z.string().trim().max(1000);
const image = z.string().trim().max(1000);

export const announcementBarSchema = z.object({
  enabled: z.boolean().default(true),
  text: str(200),
});

export const HOMEPAGE_SECTION_TYPES = [
  "hero",
  "trust",
  "collections",
  "categories",
  "new_arrivals",
  "bestsellers",
  "featured",
  "story",
  "how_we_work",
  "lookbook",
  "testimonials",
] as const;

export type HomepageSectionType = (typeof HOMEPAGE_SECTION_TYPES)[number];

/** Every section the homepage knows about, in the recommended order. */
export const HOMEPAGE_SECTION_CATALOGUE: {
  type: HomepageSectionType;
  label: string;
  enabled: boolean;
}[] = [
  { type: "hero", label: "Hero Banner", enabled: true },
  { type: "trust", label: "Why Shop With Us (trust strip)", enabled: true },
  { type: "collections", label: "See Our Collection", enabled: true },
  { type: "categories", label: "Shop by Category", enabled: true },
  { type: "new_arrivals", label: "New Arrivals", enabled: true },
  { type: "bestsellers", label: "Best Sellers", enabled: true },
  { type: "featured", label: "Featured Collection", enabled: false },
  { type: "story", label: "Our Story (founder)", enabled: true },
  { type: "how_we_work", label: "How We Work", enabled: true },
  { type: "lookbook", label: "Real Women, Real Stories (photo wall)", enabled: true },
  { type: "testimonials", label: "Voices of Womania", enabled: true },
];

/**
 * Fills in sections that a stored list doesn't know about yet (added after
 * the site was set up), keeping the stored order and inserting new ones at
 * their catalogue position. Result is sorted with fresh sortOrder values.
 */
export function mergeHomepageSections(
  stored: { id: string; type: string; enabled: boolean; sortOrder: number; label: string }[],
): { id: string; type: HomepageSectionType; enabled: boolean; sortOrder: number; label: string }[] {
  const known = new Set<string>(HOMEPAGE_SECTION_TYPES);
  const ordered = [...stored]
    .filter((section) => known.has(section.type))
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((section) => ({ ...section, type: section.type as HomepageSectionType }));

  const present = new Set(ordered.map((section) => section.type));
  let insertAt = 0;
  for (const entry of HOMEPAGE_SECTION_CATALOGUE) {
    const index = ordered.findIndex((section) => section.type === entry.type);
    if (index !== -1) {
      insertAt = index + 1;
      continue;
    }
    if (present.has(entry.type)) continue;
    ordered.splice(insertAt, 0, {
      id: entry.type,
      type: entry.type,
      enabled: entry.enabled,
      sortOrder: insertAt,
      label: entry.label,
    });
    insertAt += 1;
  }

  return ordered.map((section, index) => ({ ...section, sortOrder: index }));
}

export const homepageSectionsSchema = z
  .array(
    z.object({
      id: str(60).min(1),
      type: z.enum(HOMEPAGE_SECTION_TYPES),
      enabled: z.boolean(),
      sortOrder: z.number().int().min(0),
      label: str(80),
    }),
  )
  .max(20);

export const heroSlidesSchema = z
  .array(
    z.object({
      desktopImage: image.min(1, "Desktop image is required."),
      mobileImage: optStr(1000),
      imagePosition: optStr(60),
      thumbnailPosition: optStr(60),
      meta: optStr(120),
      stat: optStr(120),
      eyebrow: optStr(80),
      title: str(140).min(1, "Headline is required."),
      description: optStr(400),
      primaryButtonText: optStr(40),
      primaryButtonUrl: optStr(1000),
      secondaryButtonText: optStr(40),
      secondaryButtonUrl: optStr(1000),
      active: z.boolean().default(true),
      order: z.number().int().min(0).default(0),
    }),
  )
  .max(10);

export const collectionBannersSchema = z
  .array(
    z.object({
      title: str(80).min(1),
      subtitle: optStr(140),
      image: image.min(1),
      href: url.min(1),
      imagePosition: optStr(60),
    }),
  )
  .max(12);

export const shopCollectionsSchema = z
  .array(
    z.object({
      title: str(80).min(1),
      subtitle: optStr(140),
      image: image.min(1),
      href: url.min(1),
      categoryKey: z.enum([...CATEGORY_SLUGS, "all"]).or(str(60)),
      imagePosition: optStr(60),
      portrait: z.boolean().optional(),
    }),
  )
  .max(20);

export const bestsellersConfigSchema = z.object({
  productSlugs: z.array(str(200)).max(24).default([]),
});

export const howWeWorkSchema = z
  .array(
    z.object({
      step: str(10),
      title: str(80).min(1),
      description: str(400),
      href: optStr(1000),
    }),
  )
  .max(8);

export const testimonialsSchema = z
  .array(
    z.object({
      quote: str(600).min(1),
      name: str(80).min(1),
      city: optStr(80),
      rating: z.number().int().min(1).max(5).default(5),
    }),
  )
  .max(20);

export const aboutUsSchema = z.object({
  welcome: z.object({
    eyebrow: optStr(80),
    title: str(140).min(1),
    intro: str(1000),
  }),
  story: z.object({
    title: str(140),
    paragraphs: z.array(str(2000)).max(10),
    founderName: optStr(80),
    founderBio: optStr(1000),
    quote: optStr(400),
  }),
  philosophy: z.object({
    title: str(140),
    paragraphs: z.array(str(2000)).max(10),
    fabrics: z.array(z.object({ name: str(80), note: str(300) })).max(12),
  }),
  highlights: z.array(z.object({ title: str(80), description: str(300) })).max(8),
  promise: z.object({
    title: str(140),
    paragraphs: z.array(str(2000)).max(10),
  }),
});

export const VOICE_CATEGORIES = ["client", "pageant", "intern", "studio"] as const;

export const voicesGallerySchema = z.object({
  eyebrow: optStr(80),
  title: str(140),
  intro: optStr(600),
  items: z
    .array(
      z.object({
        id: str(60).min(1),
        image: image.min(1),
        alt: str(200),
        category: z.enum(VOICE_CATEGORIES),
        caption: optStr(140),
      }),
    )
    .max(60),
});

export const contactUsSchema = z.object({
  hero: z.object({
    eyebrow: optStr(80),
    title: str(140).min(1),
    intro: optStr(600),
  }),
  reach: z
    .array(
      z.object({
        label: str(40).min(1),
        value: str(120),
        href: optStr(1000),
        note: optStr(120),
      }),
    )
    .max(8),
  faqEyebrow: optStr(80),
  faqTitle: optStr(140),
  formEyebrow: optStr(80),
  formTitle: optStr(140),
  formNote: optStr(300),
  faqs: z
    .array(
      z.object({
        id: str(60).min(1),
        question: str(200).min(1),
        /** Plain paragraphs. */
        answer: z.array(str(1000)).default([]),
        /** Optional lead-in shown above numbered steps. */
        intro: optStr(600),
        /** Numbered steps. */
        steps: z.array(str(500)).default([]),
        /** Bulleted points. */
        list: z.array(str(500)).default([]),
      }),
    )
    .max(20),
});

export const policiesSchema = z.object({
  shipping: optStr(5000),
  returns: optStr(5000),
  privacy: optStr(8000),
  terms: optStr(8000),
  sizeGuide: optStr(5000),
  care: optStr(5000),
  faq: z
    .array(z.object({ question: str(200).min(1), answer: str(2000) }))
    .max(30)
    .default([]),
});

export const socialSchema = z.object({
  whatsappNumber: str(20),
  phone: optStr(30),
  email: optStr(120),
  address: optStr(300),
  businessHours: optStr(120),
  facebookUrl: optStr(300),
  instagramUrl: optStr(300),
  youtubeUrl: optStr(300),
  otherLinks: z.array(z.object({ label: str(40).min(1), url: url.min(1) })).max(8).default([]),
});

export const shippingPaymentSchema = z.object({
  flatShippingRate: z.number().min(0).default(0),
  freeShippingThreshold: z.number().min(0).nullable().default(null),
  paymentsEnabled: z.boolean().default(true),
  minOrderValue: z.number().min(0).default(0),
  deliveryZones: optStr(200),
});

export const whatsappTemplateSchema = z.object({
  template: z.string().max(4000),
});

export const appearanceSchema = z.object({
  logoUrl: image.min(1),
  faviconUrl: optStr(1000),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use a hex colour like #6B1E2E"),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use a hex colour like #C9A227"),
  fontHeading: optStr(40),
  fontBody: optStr(40),
});

const pageSeoSchema = z.object({
  title: optStr(70),
  description: optStr(200),
  keywords: z.array(str(60)).max(20).default([]),
  ogImage: optStr(1000),
  noindex: z.boolean().default(false),
});

export const SEO_PAGE_KEYS = ["home", "shop", "about", "contact", "policies"] as const;

export const seoSchema = z.object({
  siteTitle: str(60).min(1),
  titleTemplate: str(80).default("%s | Womania by Dola"),
  homepageTitle: str(70),
  homepageDescription: str(200),
  keywords: z.array(str(60)).max(30).default([]),
  ogImage: optStr(1000),
  favicon: optStr(1000),
  twitterHandle: optStr(40),
  googleSiteVerification: optStr(200),
  organization: z
    .object({
      name: optStr(120),
      legalName: optStr(120),
      logo: optStr(1000),
      phone: optStr(30),
      email: optStr(120),
      streetAddress: optStr(200),
      locality: optStr(80),
      region: optStr(80),
      postalCode: optStr(20),
      country: optStr(4).default("IN"),
      sameAs: z.array(url).max(10).default([]),
    })
    .prefault({}),
  pages: z
    .object({
      home: pageSeoSchema.prefault({}),
      shop: pageSeoSchema.prefault({}),
      about: pageSeoSchema.prefault({}),
      contact: pageSeoSchema.prefault({}),
      policies: pageSeoSchema.prefault({}),
    })
    .prefault({}),
});

export const shopPageSchema = z.object({
  eyebrow: optStr(80),
  title: str(120).min(1),
  description: optStr(400),
  heroImage: optStr(1000),
  heroImagePosition: optStr(60),
});

export const CONTENT_SCHEMAS = {
  shop_page: shopPageSchema,
  announcement_bar: announcementBarSchema,
  homepage_sections: homepageSectionsSchema,
  hero_slides: heroSlidesSchema,
  collection_banners: collectionBannersSchema,
  collections: shopCollectionsSchema,
  bestsellers_config: bestsellersConfigSchema,
  how_we_work: howWeWorkSchema,
  testimonials: testimonialsSchema,
  about_us: aboutUsSchema,
  voices_gallery: voicesGallerySchema,
  contact_us: contactUsSchema,
  policies: policiesSchema,
  social: socialSchema,
  shipping_payment: shippingPaymentSchema,
  whatsapp_template: whatsappTemplateSchema,
  customer_whatsapp_template: whatsappTemplateSchema,
  appearance: appearanceSchema,
  seo: seoSchema,
} as const;

export type ContentKey = keyof typeof CONTENT_SCHEMAS;

export type AnnouncementBar = z.infer<typeof announcementBarSchema>;
export type HomepageSectionItem = z.infer<typeof homepageSectionsSchema>[number];
export type HeroSlideContent = z.infer<typeof heroSlidesSchema>[number];
export type CollectionBanner = z.infer<typeof collectionBannersSchema>[number];
export type ShopCollection = z.infer<typeof shopCollectionsSchema>[number];
export type BestsellersConfig = z.infer<typeof bestsellersConfigSchema>;
export type HowWeWorkStep = z.infer<typeof howWeWorkSchema>[number];
export type Testimonial = z.infer<typeof testimonialsSchema>[number];
export type AboutUsContent = z.infer<typeof aboutUsSchema>;
export type VoicesGalleryContent = z.infer<typeof voicesGallerySchema>;
export type ContactUsContent = z.infer<typeof contactUsSchema>;
export type PoliciesContent = z.infer<typeof policiesSchema>;
export type SocialContent = z.infer<typeof socialSchema>;
export type ShippingPaymentContent = z.infer<typeof shippingPaymentSchema>;
export type WhatsAppTemplateContent = z.infer<typeof whatsappTemplateSchema>;
export type AppearanceContent = z.infer<typeof appearanceSchema>;
export type SeoContent = z.infer<typeof seoSchema>;
export type ShopPageContent = z.infer<typeof shopPageSchema>;
export type PageSeo = z.infer<typeof pageSeoSchema>;

export function isContentKey(key: string): key is ContentKey {
  return Object.prototype.hasOwnProperty.call(CONTENT_SCHEMAS, key);
}
