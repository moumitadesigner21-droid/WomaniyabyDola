import { NextResponse } from "next/server";
import { getOrderByNumber } from "@/lib/orders/repository";
import { getCashfreeOrder, getCashfreePayments } from "@/lib/payments/cashfree";
import { cashfreeEnvironment } from "@/lib/payments/config";
import { getClientIp, rateLimit } from "@/lib/api/rate-limit";

export async function POST(request: Request) {
  if (!(await rateLimit("ORDER_LIMITER", getClientIp(request))).allowed) return NextResponse.json({ error: "Please try again shortly." }, { status: 429 });
  const body = await request.json().catch(() => null) as { orderId?: unknown; token?: unknown } | null;
  if (typeof body?.orderId !== "string" || typeof body?.token !== "string") return NextResponse.json({ error: "Missing payment reference." }, { status: 400 });
  const local = await getOrderByNumber(body.orderId);
  if (!local || local.id !== body.token) return NextResponse.json({ error: "Order not found." }, { status: 404 });
  if (local.inventoryReleased || ["paid", "refunded"].includes(local.paymentStatus)) return NextResponse.json({ error: "This order cannot be retried." }, { status: 409 });
  try {
    const [remote, payments] = await Promise.all([getCashfreeOrder(body.orderId), getCashfreePayments(body.orderId)]);
    if (remote.order_status !== "ACTIVE" || payments.some(p => ["SUCCESS", "PENDING"].includes(p.payment_status ?? ""))) return NextResponse.json({ error: "Please check the payment status before retrying." }, { status: 409 });
    return NextResponse.json({ paymentSessionId: remote.payment_session_id, environment: cashfreeEnvironment() }, { headers: { "Cache-Control": "no-store" } });
  } catch { return NextResponse.json({ error: "Unable to resume checkout." }, { status: 502 }); }
}
