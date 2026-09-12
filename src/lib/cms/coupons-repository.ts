import { randomUUID } from "crypto";
import { getDb } from "@/lib/orders/db";
import type { CmsCoupon } from "@/lib/cms/types";

function rowToCoupon(row: Record<string, unknown>): CmsCoupon {
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

export function listCoupons(): CmsCoupon[] {
  const database = getDb();
  const rows = database
    .prepare("SELECT * FROM coupons ORDER BY created_at DESC")
    .all() as Record<string, unknown>[];

  return rows.map(rowToCoupon);
}

export function createCoupon(
  input: Omit<CmsCoupon, "id" | "createdAt">,
): CmsCoupon {
  const database = getDb();
  const id = randomUUID();
  const createdAt = new Date().toISOString();

  database
    .prepare(
      `INSERT INTO coupons (
        id, code, discount_type, discount_value, min_order_value,
        valid_from, valid_until, category_slug, product_id, free_shipping, enabled, created_at
      ) VALUES (
        @id, @code, @discountType, @discountValue, @minOrderValue,
        @validFrom, @validUntil, @categorySlug, @productId, @freeShipping, @enabled, @createdAt
      )`,
    )
    .run({
      id,
      code: input.code.toUpperCase(),
      discountType: input.discountType,
      discountValue: input.discountValue,
      minOrderValue: input.minOrderValue,
      validFrom: input.validFrom,
      validUntil: input.validUntil,
      categorySlug: input.categorySlug,
      productId: input.productId,
      freeShipping: input.freeShipping ? 1 : 0,
      enabled: input.enabled ? 1 : 0,
      createdAt,
    });

  return rowToCoupon(
    database.prepare("SELECT * FROM coupons WHERE id = ?").get(id) as Record<
      string,
      unknown
    >,
  );
}

export function updateCoupon(
  id: string,
  input: Partial<Omit<CmsCoupon, "id" | "createdAt">>,
): CmsCoupon | null {
  const database = getDb();
  const existing = database
    .prepare("SELECT * FROM coupons WHERE id = ?")
    .get(id) as Record<string, unknown> | undefined;

  if (!existing) return null;

  const merged = { ...rowToCoupon(existing), ...input };

  database
    .prepare(
      `UPDATE coupons SET
        code = @code, discount_type = @discountType, discount_value = @discountValue,
        min_order_value = @minOrderValue, valid_from = @validFrom, valid_until = @validUntil,
        category_slug = @categorySlug, product_id = @productId,
        free_shipping = @freeShipping, enabled = @enabled
      WHERE id = @id`,
    )
    .run({
      id,
      code: merged.code.toUpperCase(),
      discountType: merged.discountType,
      discountValue: merged.discountValue,
      minOrderValue: merged.minOrderValue,
      validFrom: merged.validFrom,
      validUntil: merged.validUntil,
      categorySlug: merged.categorySlug,
      productId: merged.productId,
      freeShipping: merged.freeShipping ? 1 : 0,
      enabled: merged.enabled ? 1 : 0,
    });

  return rowToCoupon(
    database.prepare("SELECT * FROM coupons WHERE id = ?").get(id) as Record<
      string,
      unknown
    >,
  );
}

export function deleteCoupon(id: string): boolean {
  const database = getDb();
  const result = database.prepare("DELETE FROM coupons WHERE id = ?").run(id);
  return result.changes > 0;
}
