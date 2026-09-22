import { NextResponse } from "next/server";
import { getOrderByNumber } from "@/lib/orders/repository";
import { reconcileCashfreePayment } from "@/lib/payments/finalize";
import { publicPaymentOrder } from "@/lib/payments/public-order";
import { getClientIp, rateLimit } from "@/lib/api/rate-limit";

export const runtime = "nodejs";
export async function GET(request: Request) {
  const limit = await rateLimit("QUOTE_LIMITER", getClientIp(request));
  if (!limit.allowed) return NextResponse.json({ error: "Please try again shortly." }, { status: 429 });
  const params = new URL(request.url).searchParams;
  const orderId = params.get("order_id");
  const token = params.get("token");
  if (!orderId || !token) return NextResponse.json({ error: "Missing payment reference." }, { status: 400 });
  const local = await getOrderByNumber(orderId);
  if (!local || token !== local.id) return NextResponse.json({ error: "Order not found." }, { status: 404 });
  try {
    const order = await reconcileCashfreePayment(orderId);
    if (!order) throw new Error("Order not found.");
    return NextResponse.json({ order: publicPaymentOrder(order) }, { headers: { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" } });
  } catch {
    return NextResponse.json({ error: "Unable to verify payment yet. Please check again before making another payment." }, { status: 502 });
  }
}
