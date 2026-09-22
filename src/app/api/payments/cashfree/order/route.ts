import { NextResponse } from "next/server";
import { z } from "zod";
import { getClientIp, rateLimit } from "@/lib/api/rate-limit";
import { parseJsonBody } from "@/lib/api/validation";
import { getCurrentCustomer } from "@/lib/customers/session";
import { getSiteUrl } from "@/lib/site-url";
import { orderItemSchema } from "@/lib/orders/schemas";
import { createOrder, getShippingPaymentConfig, updateCashfreePayment, OutOfStockError, getOrderByIdempotencyKey } from "@/lib/orders/repository";
import { cashfreeEnvironment } from "@/lib/payments/config";
import { publicPaymentOrder } from "@/lib/payments/public-order";
import { PricingError, quoteOrder } from "@/lib/orders/pricing";
import { createCashfreeOrder, isCashfreeConfigured } from "@/lib/payments/cashfree";

export const runtime = "nodejs";

const schema = z.object({
  customerName: z.string().trim().min(2).max(120),
  customerPhone: z.string().trim().regex(/^\+?[\d\s-]{10,15}$/),
  customerEmail: z.string().trim().email().max(200).optional().or(z.literal("")),
  customerAddress: z.string().trim().min(10).max(1000),
  notes: z.string().trim().max(1000).optional(),
  couponCode: z.string().trim().max(40).optional(),
  idempotencyKey: z.string().trim().min(8).max(100),
  items: z.array(orderItemSchema).min(1).max(50),
});

export async function POST(request: Request) {
  const limiter = await rateLimit("ORDER_LIMITER", getClientIp(request));
  if (!limiter.allowed) return NextResponse.json({ error: "Too many payment attempts. Please try again shortly." }, { status: 429 });
  if (!isCashfreeConfigured()) return NextResponse.json({ error: "Online payments are not configured yet. Add the Cashfree environment variables and try again." }, { status: 503 });

  const parsed = await parseJsonBody(request, schema);
  if (!parsed.ok) return parsed.response;
  const body = parsed.data;

  try {
    const config = await getShippingPaymentConfig();
    if (!config.paymentsEnabled) return NextResponse.json({ error: "Online payments are temporarily unavailable." }, { status: 503 });
    const existing = await getOrderByIdempotencyKey(body.idempotencyKey);
    if (existing) {
      if (existing.customerPhone !== body.customerPhone || existing.customerName !== body.customerName || existing.customerAddress !== body.customerAddress ||
          (existing.customerEmail ?? "") !== (body.customerEmail ?? "") || (existing.notes ?? "") !== (body.notes ?? "") ||
          (existing.couponCode ?? "") !== (body.couponCode ?? "").toUpperCase() ||
          existing.items.length !== body.items.length || existing.items.some((item, i) =>
            item.quantity !== body.items[i].quantity || (item.productId !== body.items[i].productId && item.slug !== body.items[i].slug) || (item.variantId ?? null) !== (body.items[i].variantId ?? null) || (!item.variantId && (item.size ?? "") !== (body.items[i].size ?? "")))) {
        return NextResponse.json({ error: "Checkout details changed. Resolve the previous payment before starting another checkout.", returnUrl: `/checkout/payment-return?order_id=${existing.orderNumber}&token=${existing.id}` }, { status: 409 });
      }
      if (existing.paymentStatus !== "paid" && existing.inventoryReleased) {
        return NextResponse.json({ error: "This checkout expired. Please try again.", restart: true }, { status: 409 });
      }
    }
    const quote = existing ? null : await quoteOrder(body.items, body.couponCode);
    const customer = await getCurrentCustomer();
    const result = existing ? { order: existing, duplicate: true } : await createOrder({
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      customerEmail: body.customerEmail || undefined,
      customerAddress: body.customerAddress,
      notes: body.notes || undefined,
      paymentStatus: "pending",
      items: quote!.items,
      subtotal: quote!.subtotal,
      shipping: quote!.shipping,
      discount: quote!.discount,
      total: quote!.total,
      couponCode: quote!.couponCode,
      customerId: customer?.id ?? null,
      idempotencyKey: body.idempotencyKey,
    });

    if (result.order.paymentStatus === "paid") {
      return NextResponse.json({ order: publicPaymentOrder(result.order), alreadyPaid: true, returnUrl: `/checkout/payment-return?order_id=${result.order.orderNumber}&token=${result.order.id}` });
    }

    let cashfreeOrderId = result.order.cashfreeOrderId;
    let paymentSessionId = result.order.cashfreePaymentSessionId;
    if (!cashfreeOrderId || !paymentSessionId) {
      const returnUrl = new URL("/checkout/payment-return", getSiteUrl()).toString();
      const notifyUrl = new URL("/api/payments/cashfree/webhook", getSiteUrl()).toString();
      try {
        const cashfree = await createCashfreeOrder(result.order, returnUrl, notifyUrl);
        cashfreeOrderId = cashfree.order_id ?? result.order.orderNumber;
        paymentSessionId = cashfree.payment_session_id ?? null;
        await updateCashfreePayment(result.order.id, {
          paymentStatus: "pending",
          cashfreeOrderId,
          cashfreePaymentSessionId: paymentSessionId,
        });
      } catch (error) {
        // Timeouts are ambiguous: keep the reservation and retry the same provider order.
        await updateCashfreePayment(result.order.id, { paymentStatus: "pending", paymentFailureReason: "Unable to establish payment session; retry with the same order." });
        throw error;
      }
    }

    const order = (await updateCashfreePayment(result.order.id, { paymentStatus: "pending", cashfreeOrderId, cashfreePaymentSessionId: paymentSessionId })) ?? result.order;
    return NextResponse.json({ order: publicPaymentOrder(order), cashfreeOrderId, paymentSessionId, environment: cashfreeEnvironment(), duplicate: result.duplicate });
  } catch (error) {
    if (error instanceof PricingError || error instanceof OutOfStockError) return NextResponse.json({ error: error.message }, { status: 409 });
    console.error("Cashfree order creation failed:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to start payment." }, { status: 502 });
  }
}

/** The random checkout key is a bearer recovery token; never return customer details. */
export async function GET(request: Request) {
  if (!(await rateLimit("ORDER_LIMITER", getClientIp(request))).allowed) return NextResponse.json({ error: "Please try again shortly." }, { status: 429 });
  const key = new URL(request.url).searchParams.get("key");
  if (!key || key.length < 8 || key.length > 100) return NextResponse.json({ error: "Invalid checkout reference." }, { status: 400 });
  const order = await getOrderByIdempotencyKey(key);
  return NextResponse.json({ returnUrl: order ? `/checkout/payment-return?order_id=${order.orderNumber}&token=${order.id}` : null }, { headers: { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" } });
}
