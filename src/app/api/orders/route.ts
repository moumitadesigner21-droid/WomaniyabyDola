import { NextResponse } from "next/server";
import { z } from "zod";
import { getClientIp, rateLimit } from "@/lib/api/rate-limit";
import { parseJsonBody } from "@/lib/api/validation";
import {
  createOrder,
  getOrderById,
  getSettings,
  getShippingPaymentConfig,
  listOrders,
  OutOfStockError,
  updateOrderNotificationStatus,
} from "@/lib/orders/repository";
import { PricingError, quoteOrder } from "@/lib/orders/pricing";
import { orderItemSchema } from "@/lib/orders/schemas";
import { sendOwnerEmailNotification } from "@/lib/orders/email";
import {
  sendCustomerWhatsAppNotification,
  sendOwnerWhatsAppNotification,
} from "@/lib/orders/whatsapp";
import { isAdminAuthenticated } from "@/lib/admin/session";
import { getCurrentCustomer } from "@/lib/customers/session";

export const runtime = "nodejs";

const createOrderSchema = z.object({
  customerName: z.string().trim().min(2, "Please enter your name.").max(120),
  customerPhone: z
    .string()
    .trim()
    .regex(/^\+?[\d\s-]{10,15}$/, "Please enter a valid phone number."),
  customerEmail: z
    .string()
    .trim()
    .email("Please enter a valid email address.")
    .max(200)
    .optional()
    .or(z.literal("")),
  customerAddress: z
    .string()
    .trim()
    .min(10, "Please enter your full delivery address.")
    .max(1000),
  notes: z.string().trim().max(1000).optional(),
  couponCode: z.string().trim().max(40).optional(),
  idempotencyKey: z.string().trim().min(8).max(100),
  items: z.array(orderItemSchema).min(1, "Your cart is empty.").max(50),
});

export async function POST(request: Request) {
  const limiter = await rateLimit("ORDER_LIMITER", getClientIp(request));
  if (!limiter.allowed) {
    return NextResponse.json(
      { error: "Too many orders from this connection. Please try again shortly." },
      {
        status: 429,
        headers: { "Retry-After": String(limiter.retryAfterSeconds) },
      },
    );
  }

  const parsed = await parseJsonBody(request, createOrderSchema);
  if (!parsed.ok) return parsed.response;
  const body = parsed.data;

  try {
    const config = await getShippingPaymentConfig();
    if (!config.codEnabled) {
      return NextResponse.json(
        { error: "Ordering is temporarily unavailable. Please contact us on WhatsApp." },
        { status: 503 },
      );
    }

    // Authoritative totals come from the catalog, never from the client.
    const quote = await quoteOrder(body.items, body.couponCode);
    const customer = await getCurrentCustomer();

    const result = await createOrder({
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      customerEmail: body.customerEmail || undefined,
      customerAddress: body.customerAddress,
      notes: body.notes || undefined,
      // Cash on delivery is the only payment method offered; the admin can
      // mark an order paid later from /admin/orders.
      paymentStatus: "COD",
      items: quote.items.map((item) => ({
        productId: item.productId,
        slug: item.slug,
        name: item.name,
        size: item.size,
        variantId: item.variantId,
        variantLabel: item.variantLabel,
        quantity: item.quantity,
        price: item.price,
      })),
      subtotal: quote.subtotal,
      shipping: quote.shipping,
      discount: quote.discount,
      total: quote.total,
      couponCode: quote.couponCode,
      customerId: customer?.id ?? null,
      idempotencyKey: body.idempotencyKey,
    });

    if (result.duplicate) {
      return NextResponse.json({
        order: result.order,
        whatsappSent: result.order.whatsappNotified,
        whatsappError: result.order.whatsappError,
        customerWhatsappSent: result.order.customerWhatsappNotified,
        customerWhatsappError: result.order.customerWhatsappError,
        emailSent: result.order.emailNotified,
        emailError: result.order.emailError,
        duplicate: true,
      });
    }

    const settings = await getSettings();
    let whatsappSent = false;
    let whatsappError: string | null = null;
    let customerWhatsappSent = false;
    let customerWhatsappError: string | null = null;
    let emailSent = false;
    let emailError: string | null = null;

    if (!result.order.whatsappNotified) {
      const whatsapp = await sendOwnerWhatsAppNotification(
        result.order,
        settings.ownerWhatsappNumber,
      );
      whatsappSent = whatsapp.success;
      whatsappError = whatsapp.error;

      await updateOrderNotificationStatus(result.order.id, {
        whatsappNotified: whatsapp.success,
        whatsappError: whatsapp.error,
      });
    }

    if (!result.order.customerWhatsappNotified) {
      const customerWhatsapp = await sendCustomerWhatsAppNotification(
        result.order,
      );
      customerWhatsappSent = customerWhatsapp.success;
      customerWhatsappError = customerWhatsapp.error;

      await updateOrderNotificationStatus(result.order.id, {
        customerWhatsappNotified: customerWhatsapp.success,
        customerWhatsappError: customerWhatsapp.error,
      });
    }

    if (!result.order.emailNotified) {
      const email = await sendOwnerEmailNotification(
        result.order,
        settings.orderEmail,
      );
      emailSent = email.success;
      emailError = email.error;

      await updateOrderNotificationStatus(result.order.id, {
        emailNotified: email.success,
        emailError: email.error,
      });
    }

    const order =
      (await getOrderById(result.order.id)) ?? {
        ...result.order,
        whatsappNotified: whatsappSent,
        whatsappError,
        customerWhatsappNotified: customerWhatsappSent,
        customerWhatsappError,
        emailNotified: emailSent,
        emailError,
      };

    return NextResponse.json({
      order,
      whatsappSent,
      whatsappError,
      customerWhatsappSent,
      customerWhatsappError,
      emailSent,
      emailError,
      duplicate: false,
    });
  } catch (error) {
    if (error instanceof PricingError || error instanceof OutOfStockError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    console.error("Order creation failed:", error);
    return NextResponse.json(
      { error: "Failed to place order. Please try again." },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? undefined;
  const status = searchParams.get("status") as
    | "new"
    | "pending"
    | "completed"
    | "cancelled"
    | undefined;

  const orders = await listOrders({ search, status });
  return NextResponse.json({ orders });
}
