import { cache } from "react";
import { categories as staticCategories } from "@/lib/categories";
import { execute, queryAll, queryOne, type Row } from "@/lib/db";
import type { CmsCategory } from "@/lib/cms/types";

function rowToCategory(row: Row, subs: CmsCategory["subcategories"]): CmsCategory {
  return {
    slug: String(row.slug),
    name: String(row.name),
    description: row.description ? String(row.description) : null,
    image: row.image ? String(row.image) : null,
    heroImage: row.hero_image ? String(row.hero_image) : null,
    heroImagePosition: row.hero_image_position ? String(row.hero_image_position) : null,
    sortOrder: Number(row.sort_order),
    enabled: Boolean(row.enabled),
    seoTitle: row.seo_title ? String(row.seo_title) : null,
    seoDescription: row.seo_description ? String(row.seo_description) : null,
    subcategories: subs,
  };
}

export const listCategories = cache(async (): Promise<CmsCategory[]> => {
  const [rows, subRows] = await Promise.all([
    queryAll("SELECT * FROM categories ORDER BY sort_order, name"),
    queryAll("SELECT * FROM category_subcategories ORDER BY sort_order, name"),
  ]);
  const subsByCategory = new Map<string, CmsCategory["subcategories"]>();
  for (const sub of subRows) {
    const key = String(sub.category_slug);
    const list = subsByCategory.get(key) ?? [];
    list.push({ slug: String(sub.slug), name: String(sub.name), sortOrder: Number(sub.sort_order) });
    subsByCategory.set(key, list);
  }
  return rows.map((row) => rowToCategory(row, subsByCategory.get(String(row.slug)) ?? []));
});

/** DB row with static definition as fallback (older DBs may lack a row). */
export const getCategory = cache(async (slug: string): Promise<CmsCategory | null> => {
  const row = await queryOne("SELECT * FROM categories WHERE slug = ?", slug);
  if (row) {
    const subs = await queryAll(
      "SELECT * FROM category_subcategories WHERE category_slug = ? ORDER BY sort_order, name",
      slug,
    );
    return rowToCategory(
      row,
      subs.map((sub) => ({ slug: String(sub.slug), name: String(sub.name), sortOrder: Number(sub.sort_order) })),
    );
  }
  const fallback = staticCategories.find((category) => category.slug === slug);
  if (!fallback) return null;
  return {
    slug: fallback.slug,
    name: fallback.name,
    description: fallback.description,
    image: null,
    heroImage: null,
    heroImagePosition: null,
    sortOrder: 0,
    enabled: true,
    seoTitle: null,
    seoDescription: null,
    subcategories: fallback.subcategories.map((sub, index) => ({ ...sub, sortOrder: index })),
  };
});

export interface CategoryUpdate {
  name?: string;
  description?: string | null;
  image?: string | null;
  heroImage?: string | null;
  heroImagePosition?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  enabled?: boolean;
}

export async function updateCategory(slug: string, input: CategoryUpdate): Promise<CmsCategory | null> {
  const existing = await getCategory(slug);
  if (!existing) return null;
  const merged = { ...existing, ...input };

  await execute(
    `INSERT INTO categories (slug, name, description, image, hero_image, hero_image_position, sort_order, enabled, seo_title, seo_description)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(slug) DO UPDATE SET
       name = excluded.name, description = excluded.description, image = excluded.image,
       hero_image = excluded.hero_image, hero_image_position = excluded.hero_image_position,
       enabled = excluded.enabled, seo_title = excluded.seo_title, seo_description = excluded.seo_description`,
    slug,
    merged.name,
    merged.description,
    merged.image,
    merged.heroImage,
    merged.heroImagePosition,
    merged.sortOrder,
    merged.enabled ? 1 : 0,
    merged.seoTitle,
    merged.seoDescription,
  );

  return getCategory(slug);
}
