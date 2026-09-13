import { cache } from "react";
import { getSiteContent, upsertSiteContent } from "@/lib/cms/content-repository";
import type { ShippingPaymentSettings } from "@/lib/cms/types";
import {
  batch,
  execute,
  nowIso,
  queryAll,
  queryOne,
  stmt,
  uuid,
  type Row,
} from "@/lib/db";
import type {
  CreateOrderInput,
  CreateOrderResult,
  Order,
  OrderItem,
  OrderStatus,
  PaymentStatus,
  ShippingPaymentConfig,
  StoreSettings,
} from "@/lib/orders/types";

function rowToOrder(row: Row, items: OrderItem[]): Order {
  return {
    id: String(row.id),
    orderNumber: String(row.order_number),
    customerName: String(row.customer_name),
    customerPhone: String(row.customer_phone),
    customerEmail: row.customer_email ? String(row.customer_email) : null,
    customerAddress: row.customer_address ? String(row.customer_address) : null,
    notes: row.notes ? String(row.notes) : null,
    subtotal: Number(row.subtotal),
    shipping: Number(row.shipping),
    discount: Number(row.discount),
    total: Number(row.total),
    couponCode: row.coupon_code ? String(row.coupon_code) : null,
    customerId: row.customer_id ? String(row.customer_id) : null,
    paymentStatus: row.payment_status as PaymentStatus,
    orderStatus: row.order_status as OrderStatus,
    whatsappNotified: Boolean(row.whatsapp_notified),
    whatsappError: row.whatsapp_error ? String(row.whatsapp_error) : null,
    customerWhatsappNotified: Boolean(row.customer_whatsapp_notified),
    customerWhatsappError: row.customer_whatsapp_error
      ? String(row.customer_whatsapp_error)
      : null,
    emailNotified: Boolean(row.email_notified),
    emailError: row.email_error ? String(row.email_error) : null,
    idempotencyKey: String(row.idempotency_key),
    createdAt: String(row.created_at),
    items,
  };
}

function rowToItem(row: Row): OrderItem {
  return {
    id: Number(row.id),
    orderId: String(row.order_id),
    productId: row.product_id ? String(row.product_id) : null,
    slug: row.slug ? String(row.slug) : null,
    name: String(row.name),
    size: row.size ? String(row.size) : null,
    variantId: row.variant_id ? String(row.variant_id) : null,
    variantLabel: row.variant_label ? String(row.variant_label) : null,
    quantity: Number(row.quantity),
    price: Number(row.price),
  };
}

/** Attaches items to many orders with a single query. */
async function hydrateOrders(rows: Row[]): Promise<Order[]> {
  if (!rows.length) return [];
  const ids = rows.map((row) => String(row.id));
  const itemsByOrder = new Map<string, OrderItem[]>();

  for (let i = 0; i < ids.length; i += 90) {
    const chunk = ids.slice(i, i + 90);
    const itemRows = await queryAll(
      `SELECT id, order_id, product_id, slug, name, size, variant_id, variant_label, quantity, price
       FROM order_items WHERE order_id IN (${chunk.map(() => "?").join(", ")})
       ORDER BY id`,
      ...chunk,
    );
    for (const row of itemRows) {
      const item = rowToItem(row);
      const list = itemsByOrder.get(item.orderId) ?? [];
      list.push(item);
      itemsByOrder.set(item.orderId, list);
    }
  }

  return rows.map((row) => rowToOrder(row, itemsByOrder.get(String(row.id)) ?? []));
}

async function nextOrderNumber(): Promise<string> {
  const today = new Date();
  const datePart = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("");
  const prefix = `WD-${datePart}`;

  const last = await queryOne<{ order_number: string }>(
    "SELECT order_number FROM orders WHERE order_number LIKE ? ORDER BY order_number DESC LIMIT 1",
    `${prefix}-%`,
  );

  let sequence = 1;
  if (last?.order_number) {
    const lastSeq = Number.parseInt(last.order_number.split("-").at(-1) ?? "0", 10);
    if (!Number.isNaN(lastSeq)) sequence = lastSeq + 1;
  }

  return `${prefix}-${String(sequence).padStart(4, "0")}`;
}

export const getSettings = cache(async function getSettings(): Promise<StoreSettings> {
  const rows = await queryAll<{ key: string; value: string }>(
    "SELECT key, value FROM settings",
  );
  const map = new Map(rows.map((row) => [row.key, row.value]));

  return {
    ownerWhatsappNumber: map.get("owner_whatsapp_number") ?? "919775301488",
    orderEmail: map.get("order_email") ?? "womaniadesignstudio@gmail.com",
    flatShippingRate: Number(map.get("flat_shipping_rate") ?? "0"),
  };
});

export async function updateSettings(
  partial: Partial<StoreSettings>,
): Promise<StoreSettings> {
  const upsert = (key: string, value: string) =>
    stmt(
      "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
      key,
      value,
    );

  const statements: D1PreparedStatement[] = [];
  if (partial.ownerWhatsappNumber !== undefined) {
    statements.push(upsert("owner_whatsapp_number", partial.ownerWhatsappNumber));
  }
  if (partial.orderEmail !== undefined) {
    statements.push(upsert("order_email", partial.orderEmail));
  }
  if (partial.flatShippingRate !== undefined) {
    statements.push(upsert("flat_shipping_rate", String(partial.flatShippingRate)));
  }
  if (statements.length) await batch(statements);

  if (partial.flatShippingRate !== undefined) {
    const shippingPayment = await getSiteContent<Partial<ShippingPaymentSettings>>(
      "shipping_payment",
      {},
    );
    await upsertSiteContent("shipping_payment", {
      ...shippingPayment,
      flatShippingRate: partial.flatShippingRate,
    });
  }

  return getSettings();
}

/**
 * Shipping/payment rules used by `quoteOrder`. The `shipping_payment` site-content
 * blob is the source of truth; `settings.flat_shipping_rate` is kept in sync by
 * `updateSettings` and only used as a fallback for older data.
 */
export async function getShippingPaymentConfig(): Promise<ShippingPaymentConfig> {
  const [content, settings] = await Promise.all([
    getSiteContent<Partial<ShippingPaymentSettings>>("shipping_payment", {}),
    getSettings(),
  ]);

  const flat = Number(content.flatShippingRate ?? settings.flatShippingRate);
  const threshold =
    content.freeShippingThreshold == null
      ? null
      : Number(content.freeShippingThreshold);
  const minOrder = Number(content.minOrderValue ?? 0);

  return {
    flatShippingRate: Number.isFinite(flat) && flat > 0 ? flat : 0,
    freeShippingThreshold:
      threshold != null && Number.isFinite(threshold) && threshold > 0
        ? threshold
        : null,
    codEnabled: content.codEnabled ?? true,
    minOrderValue: Number.isFinite(minOrder) && minOrder > 0 ? minOrder : 0,
  };
}

export async function getOrderByIdempotencyKey(key: string): Promise<Order | null> {
  const row = await queryOne("SELECT * FROM orders WHERE idempotency_key = ?", key);
  if (!row) return null;
  const [order] = await hydrateOrders([row]);
  return order ?? null;
}

export async function getOrderById(id: string): Promise<Order | null> {
  const row = await queryOne("SELECT * FROM orders WHERE id = ?", id);
  if (!row) return null;
  const [order] = await hydrateOrders([row]);
  return order ?? null;
}

export async function listOrders(query?: {
  search?: string;
  status?: OrderStatus;
}): Promise<Order[]> {
  const conditions: string[] = [];
  const params: string[] = [];

  if (query?.status) {
    conditions.push("order_status = ?");
    params.push(query.status);
  }

  if (query?.search?.trim()) {
    // instr() rather than LIKE '%term%': D1 rejects longer LIKE patterns.
    const term = query.search.trim().toLowerCase();
    conditions.push(
      "(instr(lower(order_number), ?1) > 0 OR instr(lower(customer_name), ?1) > 0 OR instr(customer_phone, ?1) > 0 OR instr(lower(COALESCE(customer_email, '')), ?1) > 0)",
    );
    params.push(term);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const rows = await queryAll(
    `SELECT * FROM orders ${where} ORDER BY created_at DESC LIMIT 500`,
    ...params,
  );

  return hydrateOrders(rows);
}

export async function listOrdersForCustomer(customerId: string): Promise<Order[]> {
  const rows = await queryAll(
    "SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC LIMIT 200",
    customerId,
  );
  return hydrateOrders(rows);
}

export async function getOrderForCustomer(customerId: string, id: string): Promise<Order | null> {
  const row = await queryOne("SELECT * FROM orders WHERE id = ? AND customer_id = ?", id, customerId);
  if (!row) return null;
  const [order] = await hydrateOrders([row]);
  return order ?? null;
}

export class OutOfStockError extends Error {
  constructor(public readonly productName: string) {
    super(`"${productName}" just sold out.`);
    this.name = "OutOfStockError";
  }
}

export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  const existing = await getOrderByIdempotencyKey(input.idempotencyKey);
  if (existing) {
    return {
      order: existing,
      whatsappSent: existing.whatsappNotified,
      whatsappError: existing.whatsappError,
      customerWhatsappSent: existing.customerWhatsappNotified,
      customerWhatsappError: existing.customerWhatsappError,
      emailSent: existing.emailNotified,
      emailError: existing.emailError,
      duplicate: true,
    };
  }

  const id = uuid();
  const orderNumber = await nextOrderNumber();
  const createdAt = nowIso();

  // D1 batches are atomic, but they cannot abort mid-way on a business rule,
  // so we check the stock decrements' `changes` afterwards and compensate.
  const stockStatements = input.items.map((item) =>
    item.variantId
      ? stmt(
          `UPDATE product_variants
           SET stock_quantity = stock_quantity - ?1,
               in_stock = CASE WHEN stock_quantity - ?1 <= 0 THEN 0 ELSE in_stock END
           WHERE product_id = ?2 AND id = ?3 AND in_stock = 1 AND stock_quantity >= ?1`,
          item.quantity,
          item.productId,
          item.variantId,
        )
      : stmt(
          `UPDATE products
           SET stock_quantity = stock_quantity - ?1,
               in_stock = CASE WHEN stock_quantity - ?1 <= 0 THEN 0 ELSE in_stock END,
               updated_at = ?2
           WHERE id = ?3 AND enabled = 1 AND in_stock = 1 AND stock_quantity >= ?1`,
          item.quantity,
          createdAt,
          item.productId,
        ),
  );

  const results = await batch([
    stmt(
      `INSERT INTO orders (
        id, order_number, customer_name, customer_phone, customer_email,
        customer_address, notes, subtotal, shipping, discount, total, coupon_code,
        customer_id, payment_status, order_status, idempotency_key, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', ?, ?)`,
      id,
      orderNumber,
      input.customerName,
      input.customerPhone,
      input.customerEmail ?? null,
      input.customerAddress ?? null,
      input.notes ?? null,
      input.subtotal,
      input.shipping,
      input.discount,
      input.total,
      input.couponCode,
      input.customerId ?? null,
      input.paymentStatus,
      input.idempotencyKey,
      createdAt,
    ),
    ...input.items.map((item) =>
      stmt(
        `INSERT INTO order_items (order_id, product_id, slug, name, size, variant_id, variant_label, quantity, price)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        id,
        item.productId,
        item.slug,
        item.name,
        item.size,
        item.variantId,
        item.variantLabel,
        item.quantity,
        item.price,
      ),
    ),
    ...stockStatements,
  ]);

  const stockResults = results.slice(1 + input.items.length);
  const failedIndex = stockResults.findIndex((r) => (r.meta.changes ?? 0) === 0);
  if (failedIndex !== -1) {
    // Roll back: restore stock for the lines that did decrement, drop the order.
    const succeeded = input.items.filter((_, i) => i !== failedIndex && (stockResults[i].meta.changes ?? 0) > 0);
    await batch([
      ...succeeded.map((item) =>
        item.variantId
          ? stmt(
              "UPDATE product_variants SET stock_quantity = stock_quantity + ?, in_stock = 1 WHERE product_id = ? AND id = ?",
              item.quantity,
              item.productId,
              item.variantId,
            )
          : stmt(
              "UPDATE products SET stock_quantity = stock_quantity + ?, in_stock = 1 WHERE id = ?",
              item.quantity,
              item.productId,
            ),
      ),
      stmt("DELETE FROM order_items WHERE order_id = ?", id),
      stmt("DELETE FROM orders WHERE id = ?", id),
    ]);
    throw new OutOfStockError(input.items[failedIndex].name);
  }

  const order = await getOrderById(id);
  if (!order) {
    throw new Error("Failed to create order");
  }

  return {
    order,
    whatsappSent: false,
    whatsappError: null,
    customerWhatsappSent: false,
    customerWhatsappError: null,
    emailSent: false,
    emailError: null,
    duplicate: false,
  };
}

export async function updateOrderNotificationStatus(
  orderId: string,
  update: {
    whatsappNotified?: boolean;
    whatsappError?: string | null;
    customerWhatsappNotified?: boolean;
    customerWhatsappError?: string | null;
    emailNotified?: boolean;
    emailError?: string | null;
  },
): Promise<void> {
  const fields: string[] = [];
  const values: Array<string | number | null> = [];

  const set = (column: string, value: string | number | null) => {
    fields.push(`${column} = ?`);
    values.push(value);
  };

  if (update.whatsappNotified !== undefined) set("whatsapp_notified", update.whatsappNotified ? 1 : 0);
  if (update.whatsappError !== undefined) set("whatsapp_error", update.whatsappError);
  if (update.customerWhatsappNotified !== undefined) set("customer_whatsapp_notified", update.customerWhatsappNotified ? 1 : 0);
  if (update.customerWhatsappError !== undefined) set("customer_whatsapp_error", update.customerWhatsappError);
  if (update.emailNotified !== undefined) set("email_notified", update.emailNotified ? 1 : 0);
  if (update.emailError !== undefined) set("email_error", update.emailError);

  if (fields.length === 0) return;

  await execute(`UPDATE orders SET ${fields.join(", ")} WHERE id = ?`, ...values, orderId);
}

export async function updateOrderStatus(
  orderId: string,
  update: { orderStatus?: OrderStatus; paymentStatus?: PaymentStatus },
): Promise<Order | null> {
  const fields: string[] = [];
  const values: string[] = [];

  if (update.orderStatus) {
    fields.push("order_status = ?");
    values.push(update.orderStatus);
  }
  if (update.paymentStatus) {
    fields.push("payment_status = ?");
    values.push(update.paymentStatus);
  }

  if (fields.length === 0) return getOrderById(orderId);

  await execute(`UPDATE orders SET ${fields.join(", ")} WHERE id = ?`, ...values, orderId);
  return getOrderById(orderId);
}
