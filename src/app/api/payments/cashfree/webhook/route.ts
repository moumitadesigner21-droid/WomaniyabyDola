import { NextResponse } from "next/server";
import { verifyCashfreeWebhook } from "@/lib/payments/cashfree";
import { reconcileCashfreePayment } from "@/lib/payments/finalize";
import { getOrderByNumber } from "@/lib/orders/repository";
import { execute } from "@/lib/db";

export const runtime = "nodejs";
const events = new Set(["PAYMENT_SUCCESS_WEBHOOK", "PAYMENT_FAILED_WEBHOOK", "PAYMENT_USER_DROPPED_WEBHOOK"]);

export async function POST(request: Request) {
  const raw = await request.text();
  if (!await verifyCashfreeWebhook(raw, request.headers.get("x-webhook-timestamp"), request.headers.get("x-webhook-signature"))) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  }
  try {
    const payload = JSON.parse(raw);
    if (!events.has(payload.type)) return NextResponse.json({ received: true, ignored: true });
    const orderNumber = payload.data?.order?.order_id;
    if (typeof orderNumber !== "string") return NextResponse.json({ error: "Missing order." }, { status: 400 });
    if (!await getOrderByNumber(orderNumber)) return NextResponse.json({ received: true, ignored: true });
    await reconcileCashfreePayment(orderNumber);
    const hash = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw))), b => b.toString(16).padStart(2, "0")).join("");
    await execute("INSERT OR IGNORE INTO cashfree_webhook_receipts (event_hash, order_number, event_type, received_at) VALUES (?, ?, ?, ?)", hash, orderNumber, payload.type, new Date().toISOString());
    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: "Payment reconciliation failed; retry delivery." }, { status: 500 });
  }
}
