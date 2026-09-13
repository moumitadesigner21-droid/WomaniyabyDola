import { cache } from "react";
import { hashPassword, verifyPassword } from "@/lib/admin/password";
import { batch, execute, nowIso, queryAll, queryOne, stmt, uuid, type Row } from "@/lib/db";
import type { Customer, CustomerAddress, CustomerAddressInput } from "@/lib/customers/types";

function rowToCustomer(row: Row): Customer {
  return {
    id: String(row.id),
    email: String(row.email),
    name: String(row.name),
    phone: row.phone ? String(row.phone) : null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    lastLoginAt: row.last_login_at ? String(row.last_login_at) : null,
  };
}

function rowToAddress(row: Row): CustomerAddress {
  return {
    id: String(row.id),
    customerId: String(row.customer_id),
    label: row.label ? String(row.label) : null,
    fullName: String(row.full_name),
    phone: String(row.phone),
    line1: String(row.line1),
    line2: row.line2 ? String(row.line2) : null,
    city: String(row.city),
    state: String(row.state),
    postalCode: String(row.postal_code),
    landmark: row.landmark ? String(row.landmark) : null,
    isDefault: Boolean(row.is_default),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export const getCustomerById = cache(async (id: string): Promise<Customer | null> => {
  const row = await queryOne("SELECT * FROM customers WHERE id = ?", id);
  return row ? rowToCustomer(row) : null;
});

export async function getCustomerByEmail(email: string): Promise<Customer | null> {
  const row = await queryOne("SELECT * FROM customers WHERE email = ?", normalizeEmail(email));
  return row ? rowToCustomer(row) : null;
}

export async function createCustomer(input: {
  email: string;
  password: string;
  name: string;
  phone?: string | null;
}): Promise<Customer> {
  const id = uuid();
  const now = nowIso();
  await execute(
    `INSERT INTO customers (id, email, password_hash, name, phone, created_at, updated_at, last_login_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    id,
    normalizeEmail(input.email),
    await hashPassword(input.password),
    input.name.trim(),
    input.phone?.trim() || null,
    now,
    now,
    now,
  );
  return (await getCustomerById(id))!;
}

export async function authenticateCustomer(
  email: string,
  password: string,
): Promise<Customer | null> {
  const row = await queryOne("SELECT * FROM customers WHERE email = ?", normalizeEmail(email));
  if (!row) return null;
  const ok = await verifyPassword(password, String(row.password_hash));
  if (!ok) return null;
  await execute("UPDATE customers SET last_login_at = ? WHERE id = ?", nowIso(), String(row.id));
  return rowToCustomer(row);
}

export async function updateCustomerProfile(
  id: string,
  input: { name?: string; phone?: string | null },
): Promise<Customer | null> {
  const existing = await getCustomerById(id);
  if (!existing) return null;
  await execute(
    "UPDATE customers SET name = ?, phone = ?, updated_at = ? WHERE id = ?",
    input.name?.trim() || existing.name,
    input.phone === undefined ? existing.phone : input.phone?.trim() || null,
    nowIso(),
    id,
  );
  return queryOne("SELECT * FROM customers WHERE id = ?", id).then((row) => (row ? rowToCustomer(row) : null));
}

export async function changeCustomerPassword(
  id: string,
  currentPassword: string,
  newPassword: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const row = await queryOne("SELECT password_hash FROM customers WHERE id = ?", id);
  if (!row) return { ok: false, error: "Account not found." };
  if (!(await verifyPassword(currentPassword, String(row.password_hash)))) {
    return { ok: false, error: "Current password is incorrect." };
  }
  await execute(
    "UPDATE customers SET password_hash = ?, updated_at = ? WHERE id = ?",
    await hashPassword(newPassword),
    nowIso(),
    id,
  );
  return { ok: true };
}

// ---------- Addresses ----------

export async function listAddresses(customerId: string): Promise<CustomerAddress[]> {
  const rows = await queryAll(
    "SELECT * FROM customer_addresses WHERE customer_id = ? ORDER BY is_default DESC, updated_at DESC",
    customerId,
  );
  return rows.map(rowToAddress);
}

export async function getAddress(customerId: string, id: string): Promise<CustomerAddress | null> {
  const row = await queryOne(
    "SELECT * FROM customer_addresses WHERE customer_id = ? AND id = ?",
    customerId,
    id,
  );
  return row ? rowToAddress(row) : null;
}

export async function createAddress(
  customerId: string,
  input: CustomerAddressInput,
): Promise<CustomerAddress> {
  const id = uuid();
  const now = nowIso();
  const count = await queryOne<{ c: number }>(
    "SELECT COUNT(*) AS c FROM customer_addresses WHERE customer_id = ?",
    customerId,
  );
  const makeDefault = input.isDefault || Number(count?.c ?? 0) === 0;

  await batch([
    ...(makeDefault
      ? [stmt("UPDATE customer_addresses SET is_default = 0 WHERE customer_id = ?", customerId)]
      : []),
    stmt(
      `INSERT INTO customer_addresses
         (id, customer_id, label, full_name, phone, line1, line2, city, state, postal_code, landmark, is_default, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      id,
      customerId,
      input.label?.trim() || null,
      input.fullName.trim(),
      input.phone.trim(),
      input.line1.trim(),
      input.line2?.trim() || null,
      input.city.trim(),
      input.state.trim(),
      input.postalCode.trim(),
      input.landmark?.trim() || null,
      makeDefault ? 1 : 0,
      now,
      now,
    ),
  ]);

  return (await getAddress(customerId, id))!;
}

export async function updateAddress(
  customerId: string,
  id: string,
  input: Partial<CustomerAddressInput>,
): Promise<CustomerAddress | null> {
  const existing = await getAddress(customerId, id);
  if (!existing) return null;
  const merged = { ...existing, ...input };

  await batch([
    ...(merged.isDefault
      ? [stmt("UPDATE customer_addresses SET is_default = 0 WHERE customer_id = ?", customerId)]
      : []),
    stmt(
      `UPDATE customer_addresses SET
         label = ?, full_name = ?, phone = ?, line1 = ?, line2 = ?, city = ?, state = ?,
         postal_code = ?, landmark = ?, is_default = ?, updated_at = ?
       WHERE customer_id = ? AND id = ?`,
      merged.label?.trim() || null,
      merged.fullName.trim(),
      merged.phone.trim(),
      merged.line1.trim(),
      merged.line2?.trim() || null,
      merged.city.trim(),
      merged.state.trim(),
      merged.postalCode.trim(),
      merged.landmark?.trim() || null,
      merged.isDefault ? 1 : 0,
      nowIso(),
      customerId,
      id,
    ),
  ]);

  return getAddress(customerId, id);
}

export async function deleteAddress(customerId: string, id: string): Promise<boolean> {
  const { changes } = await execute(
    "DELETE FROM customer_addresses WHERE customer_id = ? AND id = ?",
    customerId,
    id,
  );
  if (changes > 0) {
    // Keep exactly one default when one exists.
    const remaining = await listAddresses(customerId);
    if (remaining.length && !remaining.some((a) => a.isDefault)) {
      await execute(
        "UPDATE customer_addresses SET is_default = 1 WHERE id = ?",
        remaining[0].id,
      );
    }
  }
  return changes > 0;
}

// ---------- Wishlist ----------

export async function listWishlistProductIds(customerId: string): Promise<string[]> {
  const rows = await queryAll<{ product_id: string }>(
    "SELECT product_id FROM wishlist_items WHERE customer_id = ? ORDER BY created_at DESC",
    customerId,
  );
  return rows.map((row) => row.product_id);
}

export async function addToWishlist(customerId: string, productIds: string[]): Promise<void> {
  const unique = [...new Set(productIds.filter(Boolean))];
  if (!unique.length) return;
  const now = nowIso();
  await batch(
    unique.map((productId) =>
      stmt(
        "INSERT OR IGNORE INTO wishlist_items (customer_id, product_id, created_at) VALUES (?, ?, ?)",
        customerId,
        productId,
        now,
      ),
    ),
  );
}

export async function removeFromWishlist(customerId: string, productId: string): Promise<void> {
  await execute(
    "DELETE FROM wishlist_items WHERE customer_id = ? AND product_id = ?",
    customerId,
    productId,
  );
}

// ---------- Admin ----------

export interface CustomerSummary extends Customer {
  orderCount: number;
  totalSpent: number;
}

export async function listCustomersWithStats(search?: string): Promise<CustomerSummary[]> {
  const term = search?.trim().toLowerCase();
  const rows = await queryAll(
    `SELECT c.*, COUNT(o.id) AS order_count, COALESCE(SUM(CASE WHEN o.order_status != 'cancelled' THEN o.total END), 0) AS total_spent
     FROM customers c
     LEFT JOIN orders o ON o.customer_id = c.id
     ${term ? "WHERE instr(lower(c.name), ?1) > 0 OR instr(c.email, ?1) > 0 OR instr(COALESCE(c.phone, ''), ?1) > 0" : ""}
     GROUP BY c.id
     ORDER BY c.created_at DESC
     LIMIT 500`,
    ...(term ? [term] : []),
  );
  return rows.map((row) => ({
    ...rowToCustomer(row),
    orderCount: Number(row.order_count),
    totalSpent: Number(row.total_spent),
  }));
}
