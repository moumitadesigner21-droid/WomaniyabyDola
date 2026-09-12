import { randomUUID } from "crypto";
import type { CategorySlug } from "@/lib/categories";
import type { Product } from "@/lib/data";
import { getDb } from "@/lib/orders/db";
import type { CmsProduct, CmsProductInput } from "@/lib/cms/types";

function parseJsonArray(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function rowToCmsProduct(
  row: Record<string, unknown>,
  images: CmsProduct["images"],
): CmsProduct {
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
    highlights: parseJsonArray(String(row.highlights)),
    tags: parseJsonArray(String(row.tags)),
    sizes: parseJsonArray(String(row.sizes)),
    colors: parseJsonArray(String(row.colors)),
    seoTitle: row.seo_title ? String(row.seo_title) : null,
    seoDescription: row.seo_description ? String(row.seo_description) : null,
    videoUrl: row.video_url ? String(row.video_url) : null,
    palluImage: row.pallu_image ? String(row.pallu_image) : null,
    sortOrder: Number(row.sort_order),
    images,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function getProductImages(productId: string): CmsProduct["images"] {
  const database = getDb();
  const rows = database
    .prepare(
      `SELECT id, product_id, url, alt_text, sort_order, image_type
       FROM product_images WHERE product_id = ? ORDER BY sort_order, id`,
    )
    .all(productId) as Record<string, unknown>[];

  return rows.map((row) => ({
    id: Number(row.id),
    productId: String(row.product_id),
    url: String(row.url),
    altText: row.alt_text ? String(row.alt_text) : null,
    sortOrder: Number(row.sort_order),
    imageType: String(row.image_type) as CmsProduct["images"][number]["imageType"],
  }));
}

export function cmsProductToProduct(product: CmsProduct): Product {
  const gallery = product.images
    .filter((image) => image.imageType === "gallery")
    .map((image) => image.url);

  const displayPrice = product.salePrice ?? product.price;

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
  };
}

function loadProductRow(row: Record<string, unknown>) {
  return rowToCmsProduct(row, getProductImages(String(row.id)));
}

export function listAllProducts(includeDisabled = false): CmsProduct[] {
  const database = getDb();
  const query = includeDisabled
    ? "SELECT * FROM products ORDER BY sort_order, name"
    : "SELECT * FROM products WHERE enabled = 1 ORDER BY sort_order, name";

  const rows = database.prepare(query).all() as Record<string, unknown>[];
  return rows.map(loadProductRow);
}

export function listEnabledProductsAsCatalog(): Product[] {
  return listAllProducts(false).map(cmsProductToProduct);
}

export function getCmsProductById(id: string): CmsProduct | null {
  const database = getDb();
  const row = database.prepare("SELECT * FROM products WHERE id = ?").get(id) as
    | Record<string, unknown>
    | undefined;
  return row ? loadProductRow(row) : null;
}

export function getCmsProductBySlug(slug: string): CmsProduct | null {
  const database = getDb();
  const row = database
    .prepare("SELECT * FROM products WHERE slug = ?")
    .get(slug) as Record<string, unknown> | undefined;
  return row ? loadProductRow(row) : null;
}

export function getCatalogProductBySlug(slug: string): Product | undefined {
  const product = getCmsProductBySlug(slug);
  return product && product.enabled ? cmsProductToProduct(product) : undefined;
}

export function createProduct(input: CmsProductInput): CmsProduct {
  const database = getDb();
  const id = randomUUID();
  const now = new Date().toISOString();

  database
    .prepare(
      `INSERT INTO products (
        id, slug, name, description, category_slug, subcategory_slug,
        price, sale_price, sku, stock_quantity, in_stock, enabled, featured,
        is_new, is_bestseller, on_sale, badge_text, fabric, color, care_instructions,
        dimensions, custom_size_note, image, hover_image, image_position, portrait,
        card_background, highlights, tags, sizes, colors, seo_title, seo_description,
        video_url, pallu_image, sort_order, created_at, updated_at
      ) VALUES (
        @id, @slug, @name, @description, @categorySlug, @subcategorySlug,
        @price, @salePrice, @sku, @stockQuantity, @inStock, @enabled, @featured,
        @isNew, @isBestseller, @onSale, @badgeText, @fabric, @color, @careInstructions,
        @dimensions, @customSizeNote, @image, @hoverImage, @imagePosition, @portrait,
        @cardBackground, @highlights, @tags, @sizes, @colors, @seoTitle, @seoDescription,
        @videoUrl, @palluImage, @sortOrder, @createdAt, @updatedAt
      )`,
    )
    .run({
      id,
      slug: input.slug,
      name: input.name,
      description: input.description ?? null,
      categorySlug: input.categorySlug,
      subcategorySlug: input.subcategorySlug ?? null,
      price: input.price,
      salePrice: input.salePrice ?? null,
      sku: input.sku ?? null,
      stockQuantity: input.stockQuantity ?? 0,
      inStock: input.inStock === false ? 0 : 1,
      enabled: input.enabled === false ? 0 : 1,
      featured: input.featured ? 1 : 0,
      isNew: input.isNew ? 1 : 0,
      isBestseller: input.isBestseller ? 1 : 0,
      onSale: input.onSale ? 1 : 0,
      badgeText: input.badgeText ?? null,
      fabric: input.fabric ?? null,
      color: input.color ?? null,
      careInstructions: input.careInstructions ?? null,
      dimensions: input.dimensions ?? null,
      customSizeNote: input.customSizeNote ?? null,
      image: input.image,
      hoverImage: input.hoverImage ?? null,
      imagePosition: input.imagePosition ?? null,
      portrait: input.portrait ? 1 : 0,
      cardBackground: input.cardBackground ?? null,
      highlights: JSON.stringify(input.highlights ?? []),
      tags: JSON.stringify(input.tags ?? []),
      sizes: JSON.stringify(input.sizes ?? []),
      colors: JSON.stringify(input.colors ?? []),
      seoTitle: input.seoTitle ?? null,
      seoDescription: input.seoDescription ?? null,
      videoUrl: input.videoUrl ?? null,
      palluImage: input.palluImage ?? null,
      sortOrder: input.sortOrder ?? 0,
      createdAt: now,
      updatedAt: now,
    });

  replaceProductImages(id, input.images ?? []);
  return getCmsProductById(id)!;
}

export function updateProduct(
  id: string,
  input: Partial<CmsProductInput>,
): CmsProduct | null {
  const existing = getCmsProductById(id);
  if (!existing) return null;

  const database = getDb();
  const now = new Date().toISOString();
  const merged = { ...existing, ...input };

  database
    .prepare(
      `UPDATE products SET
        slug = @slug, name = @name, description = @description,
        category_slug = @categorySlug, subcategory_slug = @subcategorySlug,
        price = @price, sale_price = @salePrice, sku = @sku,
        stock_quantity = @stockQuantity, in_stock = @inStock, enabled = @enabled,
        featured = @featured, is_new = @isNew, is_bestseller = @isBestseller,
        on_sale = @onSale, badge_text = @badgeText, fabric = @fabric, color = @color,
        care_instructions = @careInstructions, dimensions = @dimensions,
        custom_size_note = @customSizeNote, image = @image, hover_image = @hoverImage,
        image_position = @imagePosition, portrait = @portrait,
        card_background = @cardBackground, highlights = @highlights, tags = @tags,
        sizes = @sizes, colors = @colors, seo_title = @seoTitle,
        seo_description = @seoDescription, video_url = @videoUrl,
        pallu_image = @palluImage, sort_order = @sortOrder, updated_at = @updatedAt
      WHERE id = @id`,
    )
    .run({
      id,
      slug: merged.slug,
      name: merged.name,
      description: merged.description,
      categorySlug: merged.categorySlug,
      subcategorySlug: merged.subcategorySlug,
      price: merged.price,
      salePrice: merged.salePrice,
      sku: merged.sku,
      stockQuantity: merged.stockQuantity,
      inStock: merged.inStock ? 1 : 0,
      enabled: merged.enabled ? 1 : 0,
      featured: merged.featured ? 1 : 0,
      isNew: merged.isNew ? 1 : 0,
      isBestseller: merged.isBestseller ? 1 : 0,
      onSale: merged.onSale ? 1 : 0,
      badgeText: merged.badgeText,
      fabric: merged.fabric,
      color: merged.color,
      careInstructions: merged.careInstructions,
      dimensions: merged.dimensions,
      customSizeNote: merged.customSizeNote,
      image: merged.image,
      hoverImage: merged.hoverImage,
      imagePosition: merged.imagePosition,
      portrait: merged.portrait ? 1 : 0,
      cardBackground: merged.cardBackground,
      highlights: JSON.stringify(merged.highlights),
      tags: JSON.stringify(merged.tags),
      sizes: JSON.stringify(merged.sizes),
      colors: JSON.stringify(merged.colors),
      seoTitle: merged.seoTitle,
      seoDescription: merged.seoDescription,
      videoUrl: merged.videoUrl,
      palluImage: merged.palluImage,
      sortOrder: merged.sortOrder,
      updatedAt: now,
    });

  if (input.images) {
    replaceProductImages(id, input.images);
  }

  return getCmsProductById(id);
}

export function deleteProduct(id: string): boolean {
  const database = getDb();
  const result = database.prepare("DELETE FROM products WHERE id = ?").run(id);
  return result.changes > 0;
}

function replaceProductImages(
  productId: string,
  images: Omit<CmsProduct["images"][number], "id" | "productId">[],
) {
  const database = getDb();
  database.prepare("DELETE FROM product_images WHERE product_id = ?").run(productId);

  const insert = database.prepare(`
    INSERT INTO product_images (product_id, url, alt_text, sort_order, image_type)
    VALUES (@productId, @url, @altText, @sortOrder, @imageType)
  `);

  images.forEach((image, index) => {
    insert.run({
      productId,
      url: image.url,
      altText: image.altText,
      sortOrder: image.sortOrder ?? index,
      imageType: image.imageType,
    });
  });
}

export function listFeaturedProducts(): Product[] {
  const database = getDb();
  const rows = database
    .prepare(
      "SELECT * FROM products WHERE enabled = 1 AND featured = 1 ORDER BY sort_order, name",
    )
    .all() as Record<string, unknown>[];

  return rows.map((row) => cmsProductToProduct(loadProductRow(row)));
}

export function listBestsellerProducts(): Product[] {
  const database = getDb();
  const rows = database
    .prepare(
      `SELECT * FROM products
       WHERE enabled = 1 AND (is_bestseller = 1 OR featured = 1)
       ORDER BY is_bestseller DESC, sort_order, name LIMIT 8`,
    )
    .all() as Record<string, unknown>[];

  return rows.map((row) => cmsProductToProduct(loadProductRow(row)));
}

export function listLowStockProducts(threshold = 3): CmsProduct[] {
  const database = getDb();
  const rows = database
    .prepare(
      `SELECT * FROM products
       WHERE enabled = 1 AND in_stock = 1 AND stock_quantity <= ? AND stock_quantity > 0
       ORDER BY stock_quantity ASC LIMIT 10`,
    )
    .all(threshold) as Record<string, unknown>[];

  return rows.map(loadProductRow);
}

export function listOutOfStockProducts(): CmsProduct[] {
  const database = getDb();
  const rows = database
    .prepare(
      "SELECT * FROM products WHERE enabled = 1 AND (in_stock = 0 OR stock_quantity <= 0) ORDER BY updated_at DESC LIMIT 10",
    )
    .all() as Record<string, unknown>[];

  return rows.map(loadProductRow);
}
