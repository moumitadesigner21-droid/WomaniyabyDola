import { randomUUID } from "crypto";
import { getDb } from "@/lib/orders/db";
import type {
  CreateOrderInput,
  CreateOrderResult,
  Order,
  OrderItem,
  OrderStatus,
  PaymentStatus,
  StoreSettings,
} from "@/lib/orders/types";

function rowToOrder(row: Record<string, unknown>, items: OrderItem[]): Order {
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

function getOrderItems(orderId: string): OrderItem[] {
  const database = getDb();
  const rows = database
    .prepare(
      `SELECT id, order_id, product_id, slug, name, size, quantity, price
       FROM order_items WHERE order_id = ? ORDER BY id`,
    )
    .all(orderId) as Record<string, unknown>[];

  return rows.map((row) => ({
    id: Number(row.id),
    orderId: String(row.order_id),
    productId: row.product_id ? String(row.product_id) : null,
    slug: row.slug ? String(row.slug) : null,
    name: String(row.name),
    size: row.size ? String(row.size) : null,
    quantity: Number(row.quantity),
    price: Number(row.price),
  }));
}

function generateOrderNumber(): string {
  const database = getDb();
  const today = new Date();
  const datePart = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("");

  const prefix = `WD-${datePart}`;
  const last = database
    .prepare(
      "SELECT order_number FROM orders WHERE order_number LIKE ? ORDER BY order_number DESC LIMIT 1",
    )
    .get(`${prefix}-%`) as { order_number: string } | undefined;

  let sequence = 1;
  if (last?.order_number) {
    const parts = last.order_number.split("-");
    const lastSeq = Number.parseInt(parts.at(-1) ?? "0", 10);
    if (!Number.isNaN(lastSeq)) sequence = lastSeq + 1;
  }

  return `${prefix}-${String(sequence).padStart(4, "0")}`;
}

export function getSettings(): StoreSettings {
  const database = getDb();
  const rows = database
    .prepare("SELECT key, value FROM settings")
    .all() as { key: string; value: string }[];

  const map = new Map(rows.map((row) => [row.key, row.value]));

  return {
    ownerWhatsappNumber:
      map.get("owner_whatsapp_number") ?? "919775301488",
    orderEmail:
      map.get("order_email") ?? "womaniadesignstudio@gmail.com",
    flatShippingRate: Number(map.get("flat_shipping_rate") ?? "0"),
  };
}

export function updateSettings(
  partial: Partial<StoreSettings>,
): StoreSettings {
  const database = getDb();
  const upsert = database.prepare(
    "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
  );

  if (partial.ownerWhatsappNumber !== undefined) {
    upsert.run("owner_whatsapp_number", partial.ownerWhatsappNumber);
  }
  if (partial.orderEmail !== undefined) {
    upsert.run("order_email", partial.orderEmail);
  }
  if (partial.flatShippingRate !== undefined) {
    upsert.run("flat_shipping_rate", String(partial.flatShippingRate));
  }

  return getSettings();
}

export function getOrderByIdempotencyKey(key: string): Order | null {
  const database = getDb();
  const row = database
    .prepare("SELECT * FROM orders WHERE idempotency_key = ?")
    .get(key) as Record<string, unknown> | undefined;

  if (!row) return null;
  return rowToOrder(row, getOrderItems(String(row.id)));
}

export function getOrderById(id: string): Order | null {
  const database = getDb();
  const row = database
    .prepare("SELECT * FROM orders WHERE id = ?")
    .get(id) as Record<string, unknown> | undefined;

  if (!row) return null;
  return rowToOrder(row, getOrderItems(id));
}

export function listOrders(query?: {
  search?: string;
  status?: OrderStatus;
}): Order[] {
  const database = getDb();
  const conditions: string[] = [];
  const params: string[] = [];

  if (query?.status) {
    conditions.push("order_status = ?");
    params.push(query.status);
  }

  if (query?.search?.trim()) {
    const term = `%${query.search.trim()}%`;
    conditions.push(
      "(order_number LIKE ? OR customer_name LIKE ? OR customer_phone LIKE ?)",
    );
    params.push(term, term, term);
  }

  const where =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const rows = database
    .prepare(`SELECT * FROM orders ${where} ORDER BY created_at DESC`)
    .all(...params) as Record<string, unknown>[];

  return rows.map((row) => rowToOrder(row, getOrderItems(String(row.id))));
}

export function createOrder(input: CreateOrderInput): CreateOrderResult {
  const existing = getOrderByIdempotencyKey(input.idempotencyKey);
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

  const settings = getSettings();
  const subtotal = input.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const shipping = input.shipping ?? settings.flatShippingRate;
  const discount = input.discount ?? 0;
  const total = Math.max(0, subtotal + shipping - discount);

  const id = randomUUID();
  const orderNumber = generateOrderNumber();
  const createdAt = new Date().toISOString();
  const database = getDb();

  const insertOrder = database.prepare(`
    INSERT INTO orders (
      id, order_number, customer_name, customer_phone, customer_email,
      customer_address, notes, subtotal, shipping, discount, total,
      payment_status, order_status, idempotency_key, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', ?, ?)
  `);

  const insertItem = database.prepare(`
    INSERT INTO order_items (order_id, product_id, slug, name, size, quantity, price)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const transaction = database.transaction(() => {
    insertOrder.run(
      id,
      orderNumber,
      input.customerName,
      input.customerPhone,
      input.customerEmail ?? null,
      input.customerAddress ?? null,
      input.notes ?? null,
      subtotal,
      shipping,
      discount,
      total,
      input.paymentStatus,
      input.idempotencyKey,
      createdAt,
    );

    for (const item of input.items) {
      insertItem.run(
        id,
        item.productId ?? null,
        item.slug ?? null,
        item.name,
        item.size ?? null,
        item.quantity,
        item.price,
      );
    }
  });

  transaction();

  const order = getOrderById(id);
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

export function updateOrderNotificationStatus(
  orderId: string,
  update: {
    whatsappNotified?: boolean;
    whatsappError?: string | null;
    customerWhatsappNotified?: boolean;
    customerWhatsappError?: string | null;
    emailNotified?: boolean;
    emailError?: string | null;
  },
) {
  const database = getDb();
  const fields: string[] = [];
  const values: Array<string | number | null> = [];

  if (update.whatsappNotified !== undefined) {
    fields.push("whatsapp_notified = ?");
    values.push(update.whatsappNotified ? 1 : 0);
  }
  if (update.whatsappError !== undefined) {
    fields.push("whatsapp_error = ?");
    values.push(update.whatsappError);
  }
  if (update.customerWhatsappNotified !== undefined) {
    fields.push("customer_whatsapp_notified = ?");
    values.push(update.customerWhatsappNotified ? 1 : 0);
  }
  if (update.customerWhatsappError !== undefined) {
    fields.push("customer_whatsapp_error = ?");
    values.push(update.customerWhatsappError);
  }
  if (update.emailNotified !== undefined) {
    fields.push("email_notified = ?");
    values.push(update.emailNotified ? 1 : 0);
  }
  if (update.emailError !== undefined) {
    fields.push("email_error = ?");
    values.push(update.emailError);
  }

  if (fields.length === 0) return;

  values.push(orderId);
  database
    .prepare(`UPDATE orders SET ${fields.join(", ")} WHERE id = ?`)
    .run(...values);
}

export function updateOrderStatus(
  orderId: string,
  update: { orderStatus?: OrderStatus; paymentStatus?: PaymentStatus },
): Order | null {
  const database = getDb();
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

  values.push(orderId);
  database
    .prepare(`UPDATE orders SET ${fields.join(", ")} WHERE id = ?`)
    .run(...values);

  return getOrderById(orderId);
}
