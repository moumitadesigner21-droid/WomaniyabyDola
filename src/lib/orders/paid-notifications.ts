import { getSettings, getOrderById, updateOrderNotificationStatus } from "@/lib/orders/repository";
import { sendOwnerEmailNotification } from "@/lib/orders/email";
import { execute, queryAll } from "@/lib/db";
import { cashfreeEnvironment } from "@/lib/payments/config";

async function claim(orderId: string, channel: string) {
  await execute("INSERT OR IGNORE INTO payment_notification_jobs (order_id, channel, next_at) VALUES (?, ?, ?)", orderId, channel, new Date().toISOString());
  const token = crypto.randomUUID();
  const result = await execute("UPDATE payment_notification_jobs SET state = 'sending', lease_token = ?, attempts = attempts + 1, next_at = ? WHERE order_id = ? AND channel = ? AND state != 'sent' AND next_at <= ?", token, new Date(Date.now() + 300_000).toISOString(), orderId, channel, new Date().toISOString());
  return result.changes === 1 ? token : null;
}
async function finish(orderId: string, channel: string, token: string, success: boolean, error?: string | null) {
  const result = await execute(`UPDATE payment_notification_jobs SET state = ?, last_error = ?, lease_token = NULL, next_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '+' || MIN(3600, 60 * (1 << MIN(attempts, 6))) || ' seconds') WHERE order_id = ? AND channel = ? AND lease_token = ?`, success ? "sent" : "pending", error ?? null, orderId, channel, token);
  return result.changes === 1;
}
import { sendCustomerWhatsAppNotification, sendOwnerWhatsAppNotification } from "@/lib/orders/whatsapp";

export async function notifyPaidOrder(orderId: string) {
  const order = await getOrderById(orderId);
  if (!order || order.paymentStatus !== "paid") return order;
  if (cashfreeEnvironment() === "sandbox") return order;
  const settings = await getSettings();

  let token: string | null;
  if (!order.whatsappNotified && (token = await claim(orderId, "owner-whatsapp"))) {
    const result = await sendOwnerWhatsAppNotification(order, settings.ownerWhatsappNumber);
    if (await finish(orderId, "owner-whatsapp", token, result.success, result.error)) await updateOrderNotificationStatus(order.id, { whatsappNotified: result.success, whatsappError: result.error });
  }
  if (!order.customerWhatsappNotified && (token = await claim(orderId, "customer-whatsapp"))) {
    const result = await sendCustomerWhatsAppNotification(order);
    if (await finish(orderId, "customer-whatsapp", token, result.success, result.error)) await updateOrderNotificationStatus(order.id, { customerWhatsappNotified: result.success, customerWhatsappError: result.error });
  }
  if (!order.emailNotified && (token = await claim(orderId, "owner-email"))) {
    const result = await sendOwnerEmailNotification(order, settings.orderEmail);
    if (await finish(orderId, "owner-email", token, result.success, result.error)) await updateOrderNotificationStatus(order.id, { emailNotified: result.success, emailError: result.error });
  }
  return getOrderById(order.id);
}

/** Also repairs a crash after marking paid but before creating notification jobs. */
export async function retryPaidNotifications() {
  if (cashfreeEnvironment() === "sandbox") return { checked: 0 };
  const rows = await queryAll<{ id: string }>(`SELECT id FROM orders WHERE payment_status = 'paid' AND (
    (whatsapp_notified = 0 AND NOT EXISTS (SELECT 1 FROM payment_notification_jobs WHERE order_id = orders.id AND channel = 'owner-whatsapp' AND (state = 'sent' OR next_at > ?))) OR
    (customer_whatsapp_notified = 0 AND NOT EXISTS (SELECT 1 FROM payment_notification_jobs WHERE order_id = orders.id AND channel = 'customer-whatsapp' AND (state = 'sent' OR next_at > ?))) OR
    (email_notified = 0 AND NOT EXISTS (SELECT 1 FROM payment_notification_jobs WHERE order_id = orders.id AND channel = 'owner-email' AND (state = 'sent' OR next_at > ?)))) LIMIT 10`, ...Array(3).fill(new Date().toISOString()));
  for (const row of rows) {
    try { await notifyPaidOrder(row.id); } catch { console.error("Notification retry deferred", row.id); }
  }
  return { checked: rows.length };
}
