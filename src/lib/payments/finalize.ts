import { getOrderByNumber, releaseOrderInventory, updateCashfreePayment } from "@/lib/orders/repository";
import { notifyPaidOrder } from "@/lib/orders/paid-notifications";
import { execute, queryAll } from "@/lib/db";
import { CashfreeApiError, getCashfreeOrder, getCashfreePayments } from "./cashfree";

/** Provider API is authoritative; never finalize from a browser or event status. */
export async function reconcileCashfreePayment(orderNumber: string) {
  const order = await getOrderByNumber(orderNumber);
  if (!order) throw new Error("Order not found.");
  if (order.paymentStatus === "paid" || order.paymentStatus === "refunded" || order.inventoryReleased) return order;
  let remote;
  try { remote = await getCashfreeOrder(orderNumber); }
  catch (error) {
    if (error instanceof CashfreeApiError && error.status === 404 && error.code === "order_not_found" &&
        !order.cashfreeOrderId && order.inventoryReservedUntil && Date.parse(order.inventoryReservedUntil) + 300_000 < Date.now()) {
      return releaseOrderInventory(order.id);
    }
    throw error;
  }
  const payments = await getCashfreePayments(orderNumber);
  if (remote.order_id !== orderNumber || remote.order_currency !== "INR" ||
      typeof remote.order_amount !== "number" || Math.round(remote.order_amount * 100) !== Math.round(order.total * 100)) {
    throw new Error("Cashfree order does not match the local order.");
  }
  for (const attempt of payments) {
    if (attempt.cf_payment_id == null || !attempt.payment_status) continue;
    await execute(`INSERT INTO cashfree_payment_attempts (payment_id, order_id, status, amount, currency, updated_at)
      VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(payment_id) DO UPDATE SET
      status = CASE WHEN status = 'SUCCESS' THEN status ELSE excluded.status END,
      updated_at = excluded.updated_at`, String(attempt.cf_payment_id), order.id,
      attempt.payment_status, attempt.payment_amount ?? null, attempt.payment_currency ?? null, new Date().toISOString());
  }
  const successful = payments.find((p) => p.payment_status === "SUCCESS");
  if (successful) {
    if (successful.payment_currency !== "INR" || typeof successful.payment_amount !== "number" ||
        Math.round(successful.payment_amount * 100) !== Math.round(order.total * 100)) {
      throw new Error("Cashfree payment amount or currency mismatch.");
    }
    if (order.inventoryReleased) throw new Error("Paid order requires manual inventory reconciliation.");
    await updateCashfreePayment(order.id, {
      paymentStatus: "paid", cashfreeOrderId: orderNumber,
      cashfreePaymentId: String(successful.cf_payment_id),
      cashfreePaymentMethod: Object.keys(successful.payment_method ?? {})[0] ?? null,
      paymentVerifiedAt: new Date().toISOString(), paymentFailureReason: null,
    });
    return notifyPaidOrder(order.id);
  }
  if (["EXPIRED", "TERMINATED"].includes(remote.order_status ?? "")) {
    return releaseOrderInventory(order.id);
  }
  return updateCashfreePayment(order.id, {
    paymentStatus: "pending", cashfreeOrderId: orderNumber,
    paymentFailureReason: payments.find((p) => p.payment_status === "FAILED")?.payment_message ?? null,
  });
}

/** Bounded sweep from cron and checkout. Unknown provider state keeps stock reserved. */
export async function reconcileExpiredPayments() {
  const rows = await queryAll<{ order_number: string }>(`SELECT order_number FROM orders
    WHERE inventory_reserved_until < ? AND inventory_released = 0
    AND payment_status NOT IN ('paid', 'refunded', 'COD')
    AND (reconciliation_next_at IS NULL OR reconciliation_next_at <= ?)
    ORDER BY COALESCE(reconciliation_next_at, inventory_reserved_until) LIMIT 10`, new Date().toISOString(), new Date().toISOString());
  let errors = 0;
  for (const row of rows) {
    const now = new Date().toISOString();
    // Claim before contacting the provider; a crashed worker becomes eligible again.
    const claim = await execute(`UPDATE orders SET reconciliation_next_at = ?, reconciliation_attempts = reconciliation_attempts + 1
      WHERE order_number = ? AND (reconciliation_next_at IS NULL OR reconciliation_next_at <= ?)`,
      new Date(Date.now() + 300_000).toISOString(), row.order_number, now);
    if (!claim.changes) continue;
    try { await reconcileCashfreePayment(row.order_number); }
    catch {
      errors++;
      await execute(`UPDATE orders SET reconciliation_next_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '+' || MIN(3600, 60 * (1 << MIN(reconciliation_attempts, 6))) || ' seconds') WHERE order_number = ?`, row.order_number);
      console.error("Payment reconciliation deferred", row.order_number);
    }
  }
  return { checked: rows.length, errors };
}
