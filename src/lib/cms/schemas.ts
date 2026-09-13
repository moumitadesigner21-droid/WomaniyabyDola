import { z } from "zod";
import { CATEGORY_SLUGS } from "@/lib/categories";

const nullableString = (max = 2000) => z.string().trim().max(max).nullable().optional();
const stringArray = z.array(z.string().trim().min(1).max(120)).max(50);

export const productImageSchema = z.object({
  url: z.string().trim().min(1).max(1000),
  altText: z.string().trim().max(300).nullable().default(null),
  sortOrder: z.number().int().min(0).default(0),
  imageType: z.enum(["gallery", "pallu", "drape", "video_thumb"]).default("gallery"),
});

const productFields = z.object({
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required.")
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase letters, numbers and hyphens."),
  name: z.string().trim().min(1, "Name is required.").max(200),
  description: nullableString(5000),
  categorySlug: z.enum(CATEGORY_SLUGS),
  subcategorySlug: nullableString(100),
  price: z.number().min(0, "Price must be 0 or more."),
  salePrice: z.number().min(0).nullable().optional(),
  sku: nullableString(100),
  stockQuantity: z.number().int().min(0).optional(),
  inStock: z.boolean().optional(),
  enabled: z.boolean().optional(),
  featured: z.boolean().optional(),
  isNew: z.boolean().optional(),
  isBestseller: z.boolean().optional(),
  onSale: z.boolean().optional(),
  badgeText: nullableString(40),
  fabric: nullableString(200),
  color: nullableString(200),
  careInstructions: nullableString(2000),
  dimensions: nullableString(300),
  customSizeNote: nullableString(500),
  image: z.string().trim().min(1, "Main image is required.").max(1000),
  hoverImage: nullableString(1000),
  imagePosition: nullableString(60),
  portrait: z.boolean().optional(),
  cardBackground: nullableString(60),
  highlights: stringArray.optional(),
  tags: stringArray.optional(),
  sizes: stringArray.optional(),
  colors: stringArray.optional(),
  seoTitle: nullableString(200),
  seoDescription: nullableString(500),
  videoUrl: nullableString(1000),
  palluImage: nullableString(1000),
  sortOrder: z.number().int().optional(),
  images: z.array(productImageSchema).max(30).optional(),
  options: z.array(z.lazy(() => productOptionSchema)).max(3).optional(),
  variants: z.array(z.lazy(() => productVariantSchema)).max(200).optional(),
});

const salePriceRule = {
  message: "Sale price cannot exceed the regular price.",
  path: ["salePrice"],
};

export const productOptionSchema = z.object({
  name: z.string().trim().min(1, "Option name is required.").max(40),
  values: z.array(z.string().trim().min(1).max(60)).min(1, "Add at least one value.").max(30),
});

export const productVariantSchema = z.object({
  id: z.string().trim().max(200).optional(),
  optionValues: z.record(z.string().max(40), z.string().max(60)),
  sku: z.string().trim().max(100).nullable().default(null),
  price: z.number().min(0).nullable().default(null),
  salePrice: z.number().min(0).nullable().default(null),
  stockQuantity: z.number().int().min(0).default(0),
  inStock: z.boolean().default(true),
  image: z.string().trim().max(1000).nullable().default(null),
  sortOrder: z.number().int().min(0).default(0),
});

export const productInputSchema = productFields.refine(
  (p) => p.salePrice == null || p.salePrice <= p.price,
  salePriceRule,
);

// A PATCH may omit `price`; only enforce the rule when both are present.
export const productPatchSchema = productFields.partial().refine(
  (p) => p.salePrice == null || p.price == null || p.salePrice <= p.price,
  salePriceRule,
);

const couponFields = z.object({
  code: z
    .string()
    .trim()
    .min(2)
    .max(40)
    .regex(/^[A-Za-z0-9_-]+$/, "Code may only contain letters, numbers, - and _.")
    .transform((v) => v.toUpperCase()),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.number().min(0),
  minOrderValue: z.number().min(0).default(0),
  validFrom: z.string().datetime({ offset: true }).nullable().optional(),
  validUntil: z.string().datetime({ offset: true }).nullable().optional(),
  categorySlug: z.enum(CATEGORY_SLUGS).nullable().optional(),
  productId: nullableString(100),
  freeShipping: z.boolean().default(false),
  enabled: z.boolean().default(true),
});

const percentRule = {
  message: "Percentage discount cannot exceed 100.",
  path: ["discountValue"],
};

export const couponInputSchema = couponFields.refine(
  (c) => c.discountType !== "percentage" || c.discountValue <= 100,
  percentRule,
);

export const couponPatchSchema = couponFields
  .partial()
  .extend({ id: z.string().min(1) })
  .refine(
    (c) =>
      c.discountType !== "percentage" ||
      c.discountValue == null ||
      c.discountValue <= 100,
    percentRule,
  );

export const navigationPutSchema = z.object({
  location: z.enum(["header", "footer"]),
  items: z
    .array(
      z.object({
        id: z.string().trim().min(1).max(100),
        label: z.string().trim().min(1).max(80),
        href: z.string().trim().min(1).max(500),
        parentId: z.string().trim().max(100).nullable().optional(),
        sortOrder: z.number().int().optional(),
        enabled: z.boolean().optional(),
      }),
    )
    .max(50),
});

export const settingsPatchSchema = z.object({
  ownerWhatsappNumber: z
    .string()
    .trim()
    .transform((v) => v.replace(/\D/g, ""))
    .pipe(z.string().min(10, "Enter a valid WhatsApp number.").max(15))
    .optional(),
  orderEmail: z.string().trim().email("Enter a valid email.").optional(),
  flatShippingRate: z.number().min(0).optional(),
});

/** Site-content blobs are free-form JSON; just reject empty/oversized payloads. */
export const siteContentPatchSchema = z.object({
  value: z.unknown().refine((v) => v !== undefined, "value is required."),
});

export const SITE_CONTENT_KEY_PATTERN = /^[a-z0-9_]{1,64}$/;
