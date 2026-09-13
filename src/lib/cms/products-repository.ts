import type { CategorySlug } from "@/lib/categories";
import type { Product } from "@/lib/data";
import {
  batch,
  nowIso,
  queryAll,
  queryOne,
  stmt,
  uuid,
  type Row,
} from "@/lib/db";
import type {
  CmsProduct,
  CmsProductInput,
  CmsProductOption,
  CmsProductVariant,
  CmsProductVariantInput,
} from "@/lib/cms/types";
import { variantIdFor, variantLabelFor } from "@/lib/cms/variants";
import type { ProductVariant } from "@/lib/data";

type ImageRow = CmsProduct["images"][number];

function parseJsonArray(value: unknown): string[] {
  if (typeof value !== "string" || !value) return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function parseOptions(value: unknown): CmsProductOption[] {
  if (typeof value !== "string" || !value) return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((o): o is CmsProductOption => Boolean(o) && typeof o === "object" && typeof (o as CmsProductOption).name === "string")
      .map((o) => ({ name: String(o.name), values: Array.isArray(o.values) ? o.values.map(String) : [] }));
  } catch {
    return [];
  }
}

function rowToVariant(row: Row): CmsProductVariant {
  let optionValues: Record<string, string> = {};
  try {
    const parsed = JSON.parse(String(row.option_values)) as unknown;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      optionValues = Object.fromEntries(
        Object.entries(parsed as Record<string, unknown>).map(([k, v]) => [k, String(v)]),
      );
    }
  } catch {
    optionValues = {};
  }
  return {
    id: String(row.id),
    productId: String(row.product_id),
    optionValues,
    sku: row.sku ? String(row.sku) : null,
    price: row.price != null ? Number(row.price) : null,
    salePrice: row.sale_price != null ? Number(row.sale_price) : null,
    stockQuantity: Number(row.stock_quantity),
    inStock: Boolean(row.in_stock),
    image: row.image ? String(row.image) : null,
    sortOrder: Number(row.sort_order),
  };
}

function rowToCmsProduct(row: Row, images: ImageRow[], variants: CmsProductVariant[]): CmsProduct {
  return {
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    description: row.description ? String(row.description) : null,
    categorySlug: String(row.category_slug) as CategorySlug,
    subcategorySlug: row.subcategory_slug ? String(row.subcategory_slug) : null,
    price: Number(row.price),
    salePrice: row.sale_price != null ? Number(row.sale_price) : null,
    sku: row.sku ? String(row.sku) : null,
    stockQuantity: Number(row.stock_quantity),
    inStock: Boolean(row.in_stock),
    enabled: Boolean(row.enabled),
    featured: Boolean(row.featured),
    isNew: Boolean(row.is_new),
    isBestseller: Boolean(row.is_bestseller),
    onSale: Boolean(row.on_sale),
    badgeText: row.badge_text ? String(row.badge_text) : null,
    fabric: row.fabric ? String(row.fabric) : null,
    color: row.color ? String(row.color) : null,
    careInstructions: row.care_instructions
      ? String(row.care_instructions)
      : null,
    dimensions: row.dimensions ? String(row.dimensions) : null,
    customSizeNote: row.custom_size_note ? String(row.custom_size_note) : null,
    image: String(row.image),
    hoverImage: row.hover_image ? String(row.hover_image) : null,
    imagePosition: row.image_position ? String(row.image_position) : null,
    portrait: Boolean(row.portrait),
    cardBackground: row.card_background ? String(row.card_background) : null,
    highlights: parseJsonArray(row.highlights),
    tags: parseJsonArray(row.tags),
    sizes: parseJsonArray(row.sizes),
    colors: parseJsonArray(row.colors),
    seoTitle: row.seo_title ? String(row.seo_title) : null,
    seoDescription: row.seo_description ? String(row.seo_description) : null,
    videoUrl: row.video_url ? String(row.video_url) : null,
    palluImage: row.pallu_image ? String(row.pallu_image) : null,
    sortOrder: Number(row.sort_order),
    images,
    options: parseOptions(row.options),
    variants,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function rowToImage(row: Row): ImageRow {
  return {
    id: Number(row.id),
    productId: String(row.product_id),
    url: String(row.url),
    altText: row.alt_text ? String(row.alt_text) : null,
    sortOrder: Number(row.sort_order),
    imageType: String(row.image_type) as ImageRow["imageType"],
  };
}

/**
 * Loads images for many products in one query and attaches them, avoiding an
 * N+1 round-trip per product (each D1 query is a network hop).
 */
async function hydrateProducts(rows: Row[]): Promise<CmsProduct[]> {
  if (!rows.length) return [];

  const ids = rows.map((row) => String(row.id));
  const imagesByProduct = new Map<string, ImageRow[]>();
  const variantsByProduct = new Map<string, CmsProductVariant[]>();
  // D1 caps bound parameters per statement (100); chunk the IN list.
  for (let i = 0; i < ids.length; i += 90) {
    const chunk = ids.slice(i, i + 90);
    const placeholders = chunk.map(() => "?").join(", ");
    const [imageRows, variantRows] = await Promise.all([
      queryAll(
        `SELECT id, product_id, url, alt_text, sort_order, image_type
         FROM product_images WHERE product_id IN (${placeholders})
         ORDER BY sort_order, id`,
        ...chunk,
      ),
      queryAll(
        `SELECT * FROM product_variants WHERE product_id IN (${placeholders})
         ORDER BY sort_order, id`,
        ...chunk,
      ),
    ]);
    for (const row of imageRows) {
      const image = rowToImage(row);
      const list = imagesByProduct.get(image.productId) ?? [];
      list.push(image);
      imagesByProduct.set(image.productId, list);
    }
    for (const row of variantRows) {
      const variant = rowToVariant(row);
      const list = variantsByProduct.get(variant.productId) ?? [];
      list.push(variant);
      variantsByProduct.set(variant.productId, list);
    }
  }

  return rows.map((row) =>
    rowToCmsProduct(
      row,
      imagesByProduct.get(String(row.id)) ?? [],
      variantsByProduct.get(String(row.id)) ?? [],
    ),
  );
}

async function hydrateOne(row: Row | null): Promise<CmsProduct | null> {
  if (!row) return null;
  const [product] = await hydrateProducts([row]);
  return product ?? null;
}

/** Effective price/sale price for a variant, inheriting from the product. */
export function resolveVariantPricing(product: CmsProduct, variant: CmsProductVariant) {
  const price = variant.price ?? product.price;
  const salePrice = variant.salePrice ?? (variant.price == null ? product.salePrice : null);
  return {
    price: salePrice != null && salePrice < price ? salePrice : price,
    compareAtPrice: salePrice != null && salePrice < price ? price : undefined,
  };
}

export function hasVariants(product: CmsProduct): boolean {
  return product.options.length > 0 && product.variants.length > 0;
}

function toStorefrontVariants(product: CmsProduct): ProductVariant[] {
  return product.variants.map((variant) => ({
    id: variant.id,
    values: variant.optionValues,
    label: variantLabelFor(product.options, variant.optionValues),
    ...resolveVariantPricing(product, variant),
    inStock: variant.inStock && variant.stockQuantity > 0,
    image: variant.image ?? undefined,
  }));
}

export function cmsProductToProduct(product: CmsProduct): Product {
  const gallery = product.images
    .filter((image) => image.imageType === "gallery")
    .map((image) => image.url);

  const variants = hasVariants(product) ? toStorefrontVariants(product) : undefined;
  const variantPrices = variants?.map((v) => v.price) ?? [];
  const displayPrice = variantPrices.length
    ? Math.min(...variantPrices)
    : (product.salePrice ?? product.price);
  const productInStock = variants
    ? variants.some((v) => v.inStock)
    : product.inStock && product.stockQuantity > 0;

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    category: product.categorySlug,
    subcategory: product.subcategorySlug ?? undefined,
    price: displayPrice,
    image: product.image,
    isNew: product.isNew,
    isBestseller: product.isBestseller,
    imagePosition: product.imagePosition ?? undefined,
    portrait: product.portrait,
    sizes: product.sizes.length ? product.sizes : undefined,
    customSizeNote: product.customSizeNote ?? undefined,
    dimensions: product.dimensions ?? undefined,
    gallery: gallery.length ? gallery : undefined,
    hoverImage: product.hoverImage ?? undefined,
    description: product.description ?? undefined,
    cardBackground: product.cardBackground ?? undefined,
    inStock: productInStock,
    compareAtPrice:
      !variants && product.salePrice != null && product.salePrice < product.price
        ? product.price
        : undefined,
    options: variants ? product.options : undefined,
    variants,
  };
}

export async function listAllProducts(includeDisabled = false): Promise<CmsProduct[]> {
  const rows = await queryAll(
    includeDisabled
      ? "SELECT * FROM products ORDER BY sort_order, name"
      : "SELECT * FROM products WHERE enabled = 1 ORDER BY sort_order, name",
  );
  return hydrateProducts(rows);
}

export async function listEnabledProductsAsCatalog(): Promise<Product[]> {
  const products = await listAllProducts(false);
  return products.map(cmsProductToProduct);
}

export async function getCmsProductById(id: string): Promise<CmsProduct | null> {
  return hydrateOne(await queryOne("SELECT * FROM products WHERE id = ?", id));
}

export async function getCmsProductBySlug(slug: string): Promise<CmsProduct | null> {
  return hydrateOne(await queryOne("SELECT * FROM products WHERE slug = ?", slug));
}

/** Several products by id and/or slug in one round-trip (used by order pricing). */
export async function findCmsProducts(keys: {
  ids: string[];
  slugs: string[];
}): Promise<{ byId: Map<string, CmsProduct>; bySlug: Map<string, CmsProduct> }> {
  const ids = [...new Set(keys.ids)].filter(Boolean);
  const slugs = [...new Set(keys.slugs)].filter(Boolean);
  const byId = new Map<string, CmsProduct>();
  const bySlug = new Map<string, CmsProduct>();
  if (!ids.length && !slugs.length) return { byId, bySlug };

  const clauses: string[] = [];
  const params: string[] = [];
  if (ids.length) {
    clauses.push(`id IN (${ids.map(() => "?").join(", ")})`);
    params.push(...ids);
  }
  if (slugs.length) {
    clauses.push(`slug IN (${slugs.map(() => "?").join(", ")})`);
    params.push(...slugs);
  }

  const rows = await queryAll(
    `SELECT * FROM products WHERE ${clauses.join(" OR ")}`,
    ...params,
  );
  for (const product of await hydrateProducts(rows)) {
    byId.set(product.id, product);
    bySlug.set(product.slug, product);
  }
  return { byId, bySlug };
}

export async function getCatalogProductBySlug(slug: string): Promise<Product | undefined> {
  const product = await getCmsProductBySlug(slug);
  return product && product.enabled ? cmsProductToProduct(product) : undefined;
}

const PRODUCT_COLUMNS = [
  "id", "slug", "name", "description", "category_slug", "subcategory_slug",
  "price", "sale_price", "sku", "stock_quantity", "in_stock", "enabled", "featured",
  "is_new", "is_bestseller", "on_sale", "badge_text", "fabric", "color", "care_instructions",
  "dimensions", "custom_size_note", "image", "hover_image", "image_position", "portrait",
  "card_background", "highlights", "tags", "sizes", "colors", "seo_title", "seo_description",
  "video_url", "pallu_image", "sort_order", "options", "created_at", "updated_at",
] as const;

function productValues(
  id: string,
  input: CmsProductInput,
  createdAt: string,
  updatedAt: string,
): unknown[] {
  return [
    id,
    input.slug,
    input.name,
    input.description ?? null,
    input.categorySlug,
    input.subcategorySlug ?? null,
    input.price,
    input.salePrice ?? null,
    input.sku ?? null,
    input.stockQuantity ?? 0,
    input.inStock === false ? 0 : 1,
    input.enabled === false ? 0 : 1,
    input.featured ? 1 : 0,
    input.isNew ? 1 : 0,
    input.isBestseller ? 1 : 0,
    input.onSale ? 1 : 0,
    input.badgeText ?? null,
    input.fabric ?? null,
    input.color ?? null,
    input.careInstructions ?? null,
    input.dimensions ?? null,
    input.customSizeNote ?? null,
    input.image,
    input.hoverImage ?? null,
    input.imagePosition ?? null,
    input.portrait ? 1 : 0,
    input.cardBackground ?? null,
    JSON.stringify(input.highlights ?? []),
    JSON.stringify(input.tags ?? []),
    JSON.stringify(input.sizes ?? []),
    JSON.stringify(input.colors ?? []),
    input.seoTitle ?? null,
    input.seoDescription ?? null,
    input.videoUrl ?? null,
    input.palluImage ?? null,
    input.sortOrder ?? 0,
    JSON.stringify(normalizeOptions(input.options ?? [])),
    createdAt,
    updatedAt,
  ];
}

function normalizeOptions(options: CmsProductOption[]): CmsProductOption[] {
  return options
    .map((option) => ({
      name: option.name.trim(),
      values: [...new Set(option.values.map((v) => v.trim()).filter(Boolean))],
    }))
    .filter((option) => option.name && option.values.length);
}

function variantStatements(
  productId: string,
  options: CmsProductOption[],
  variants: CmsProductVariantInput[],
): D1PreparedStatement[] {
  const normalized = normalizeOptions(options);
  const rows = normalized.length
    ? variants
        // Keep only combinations that are valid for the current options.
        .filter((variant) =>
          normalized.every((option) => option.values.includes(variant.optionValues[option.name] ?? "")),
        )
        .map((variant) => ({
          ...variant,
          id: variantIdFor(normalized, variant.optionValues),
        }))
        // Canonical order = option order (S/M/L × Red/Blue), not submission order.
        .sort((a, b) => {
          const rank = (v: { optionValues: Record<string, string> }) =>
            normalized.map((option) => option.values.indexOf(v.optionValues[option.name] ?? ""));
          const ra = rank(a);
          const rb = rank(b);
          for (let i = 0; i < ra.length; i++) if (ra[i] !== rb[i]) return ra[i] - rb[i];
          return 0;
        })
        .map((variant, index) => ({ ...variant, sortOrder: index }))
    : [];

  return [
    stmt("DELETE FROM product_variants WHERE product_id = ?", productId),
    ...rows.map((variant) =>
      stmt(
        `INSERT INTO product_variants
           (id, product_id, option_values, sku, price, sale_price, stock_quantity, in_stock, image, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        variant.id,
        productId,
        JSON.stringify(variant.optionValues),
        variant.sku ?? null,
        variant.price ?? null,
        variant.salePrice ?? null,
        variant.stockQuantity ?? 0,
        variant.inStock === false ? 0 : 1,
        variant.image ?? null,
        variant.sortOrder,
      ),
    ),
  ];
}

function imageStatements(
  productId: string,
  images: Omit<ImageRow, "id" | "productId">[],
): D1PreparedStatement[] {
  return [
    stmt("DELETE FROM product_images WHERE product_id = ?", productId),
    ...images.map((image, index) =>
      stmt(
        `INSERT INTO product_images (product_id, url, alt_text, sort_order, image_type)
         VALUES (?, ?, ?, ?, ?)`,
        productId,
        image.url,
        image.altText,
        image.sortOrder ?? index,
        image.imageType,
      ),
    ),
  ];
}

export async function createProduct(input: CmsProductInput): Promise<CmsProduct> {
  const id = uuid();
  const now = nowIso();
  const placeholders = PRODUCT_COLUMNS.map(() => "?").join(", ");

  await batch([
    stmt(
      `INSERT INTO products (${PRODUCT_COLUMNS.join(", ")}) VALUES (${placeholders})`,
      ...productValues(id, input, now, now),
    ),
    ...imageStatements(id, input.images ?? []),
    ...variantStatements(id, input.options ?? [], input.variants ?? []),
  ]);

  return (await getCmsProductById(id))!;
}

export async function updateProduct(
  id: string,
  input: Partial<CmsProductInput>,
): Promise<CmsProduct | null> {
  const existing = await getCmsProductById(id);
  if (!existing) return null;

  const merged: CmsProductInput = { ...existing, ...input };
  const values = productValues(id, merged, existing.createdAt, nowIso());

  const updatable = PRODUCT_COLUMNS.map((column, index) => ({ column, value: values[index] }))
    .filter(({ column }) => column !== "id" && column !== "created_at");

  await batch([
    stmt(
      `UPDATE products SET ${updatable.map(({ column }) => `${column} = ?`).join(", ")} WHERE id = ?`,
      ...updatable.map(({ value }) => value),
      id,
    ),
    ...(input.images ? imageStatements(id, input.images) : []),
    ...(input.options !== undefined || input.variants !== undefined
      ? variantStatements(id, merged.options ?? [], merged.variants ?? existing.variants)
      : []),
  ]);

  return getCmsProductById(id);
}

export async function deleteProduct(id: string): Promise<boolean> {
  // product_images has ON DELETE CASCADE, but be explicit in case FKs are off.
  const results = await batch([
    stmt("DELETE FROM product_images WHERE product_id = ?", id),
    stmt("DELETE FROM product_variants WHERE product_id = ?", id),
    stmt("DELETE FROM products WHERE id = ?", id),
  ]);
  return (results[2]?.meta.changes ?? 0) > 0;
}

export async function listFeaturedProducts(): Promise<Product[]> {
  const rows = await queryAll(
    "SELECT * FROM products WHERE enabled = 1 AND featured = 1 ORDER BY sort_order, name",
  );
  return (await hydrateProducts(rows)).map(cmsProductToProduct);
}

/** Products flagged NEW, newest first. */
export async function listNewProducts(limit = 8): Promise<Product[]> {
  const rows = await queryAll(
    `SELECT * FROM products WHERE enabled = 1 AND is_new = 1
     ORDER BY created_at DESC, sort_order, name LIMIT ?`,
    limit,
  );
  return (await hydrateProducts(rows)).map(cmsProductToProduct);
}

export async function listBestsellerProducts(): Promise<Product[]> {
  const rows = await queryAll(
    `SELECT * FROM products
     WHERE enabled = 1 AND (is_bestseller = 1 OR featured = 1)
     ORDER BY is_bestseller DESC, sort_order, name LIMIT 8`,
  );
  return (await hydrateProducts(rows)).map(cmsProductToProduct);
}

export async function listLowStockProducts(threshold = 3): Promise<CmsProduct[]> {
  const rows = await queryAll(
    `SELECT * FROM products
     WHERE enabled = 1 AND in_stock = 1 AND stock_quantity <= ? AND stock_quantity > 0
     ORDER BY stock_quantity ASC LIMIT 10`,
    threshold,
  );
  return hydrateProducts(rows);
}

export async function listOutOfStockProducts(): Promise<CmsProduct[]> {
  const rows = await queryAll(
    "SELECT * FROM products WHERE enabled = 1 AND (in_stock = 0 OR stock_quantity <= 0) ORDER BY updated_at DESC LIMIT 10",
  );
  return hydrateProducts(rows);
}

/** True when any product, product image, or site-content blob references the URL. */
export async function isImageUrlReferenced(url: string): Promise<boolean> {
  // instr() instead of LIKE: D1 rejects long LIKE patterns as "too complex".
  const row = await queryOne(
    `SELECT 1 AS hit FROM products WHERE image = ?1 OR hover_image = ?1 OR pallu_image = ?1
     UNION ALL SELECT 1 FROM product_images WHERE url = ?1
     UNION ALL SELECT 1 FROM site_content WHERE instr(value, ?1) > 0
     LIMIT 1`,
    url,
  );
  return Boolean(row);
}
