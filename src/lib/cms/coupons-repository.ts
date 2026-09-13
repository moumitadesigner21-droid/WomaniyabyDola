import { execute, nowIso, queryAll, queryOne, uuid, type Row } from "@/lib/db";
import type { CmsCoupon } from "@/lib/cms/types";

function rowToCoupon(row: Row): CmsCoupon {
  return {
    id: String(row.id),
    code: String(row.code),
    discountType: row.discount_type as CmsCoupon["discountType"],
    discountValue: Number(row.discount_value),
    minOrderValue: Number(row.min_order_value),
    validFrom: row.valid_from ? String(row.valid_from) : null,
    validUntil: row.valid_until ? String(row.valid_until) : null,
    categorySlug: row.category_slug ? String(row.category_slug) : null,
    productId: row.product_id ? String(row.product_id) : null,
    freeShipping: Boolean(row.free_shipping),
    enabled: Boolean(row.enabled),
    createdAt: String(row.created_at),
  };
}

export async function listCoupons(): Promise<CmsCoupon[]> {
  const rows = await queryAll("SELECT * FROM coupons ORDER BY created_at DESC");
  return rows.map(rowToCoupon);
}

export async function getCouponById(id: string): Promise<CmsCoupon | null> {
  const row = await queryOne("SELECT * FROM coupons WHERE id = ?", id);
  return row ? rowToCoupon(row) : null;
}

export async function getCouponByCode(code: string): Promise<CmsCoupon | null> {
  const row = await queryOne(
    "SELECT * FROM coupons WHERE code = ?",
    code.trim().toUpperCase(),
  );
  return row ? rowToCoupon(row) : null;
}

export async function createCoupon(
  input: Omit<CmsCoupon, "id" | "createdAt">,
): Promise<CmsCoupon> {
  const id = uuid();

  await execute(
    `INSERT INTO coupons (
      id, code, discount_type, discount_value, min_order_value,
      valid_from, valid_until, category_slug, product_id, free_shipping, enabled, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    id,
    input.code.toUpperCase(),
    input.discountType,
    input.discountValue,
    input.minOrderValue,
    input.validFrom,
    input.validUntil,
    input.categorySlug,
    input.productId,
    input.freeShipping ? 1 : 0,
    input.enabled ? 1 : 0,
    nowIso(),
  );

  return (await getCouponById(id))!;
}

export async function updateCoupon(
  id: string,
  input: Partial<Omit<CmsCoupon, "id" | "createdAt">>,
): Promise<CmsCoupon | null> {
  const existing = await getCouponById(id);
  if (!existing) return null;

  const merged = { ...existing, ...input };

  await execute(
    `UPDATE coupons SET
      code = ?, discount_type = ?, discount_value = ?,
      min_order_value = ?, valid_from = ?, valid_until = ?,
      category_slug = ?, product_id = ?, free_shipping = ?, enabled = ?
     WHERE id = ?`,
    merged.code.toUpperCase(),
    merged.discountType,
    merged.discountValue,
    merged.minOrderValue,
    merged.validFrom,
    merged.validUntil,
    merged.categorySlug,
    merged.productId,
    merged.freeShipping ? 1 : 0,
    merged.enabled ? 1 : 0,
    id,
  );

  return getCouponById(id);
}

export async function deleteCoupon(id: string): Promise<boolean> {
  const { changes } = await execute("DELETE FROM coupons WHERE id = ?", id);
  return changes > 0;
}
