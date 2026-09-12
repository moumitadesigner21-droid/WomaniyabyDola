import { NextResponse } from "next/server";
import {
  createOrder,
  getOrderById,
  getSettings,
  listOrders,
  updateOrderNotificationStatus,
} from "@/lib/orders/repository";
import { sendOwnerEmailNotification } from "@/lib/orders/email";
import {
  sendCustomerWhatsAppNotification,
  sendOwnerWhatsAppNotification,
} from "@/lib/orders/whatsapp";
import type {
  CreateOrderInput,
  OrderItemInput,
  PaymentStatus,
} from "@/lib/orders/types";
import { isAdminAuthenticated } from "@/lib/admin/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      customerName?: string;
      customerPhone?: string;
      customerEmail?: string;
      customerAddress?: string;
      notes?: string;
      paymentStatus?: PaymentStatus;
      shipping?: number;
      discount?: number;
      items?: OrderItemInput[];
      idempotencyKey?: string;
    };

    if (
      !body.customerName?.trim() ||
      !body.customerPhone?.trim() ||
      !body.idempotencyKey?.trim() ||
      !body.items?.length
    ) {
      const missing: string[] = [];
      if (!body.customerName?.trim()) missing.push("customer name");
      if (!body.customerPhone?.trim()) missing.push("phone number");
      if (!body.idempotencyKey?.trim()) missing.push("order reference");
      if (!body.items?.length) missing.push("cart items");

      return NextResponse.json(
        {
          error: `Missing required order fields: ${missing.join(", ")}.`,
        },
        { status: 400 },
      );
    }

    const input: CreateOrderInput = {
      customerName: body.customerName.trim(),
      customerPhone: body.customerPhone.trim(),
      customerEmail: body.customerEmail?.trim(),
      customerAddress: body.customerAddress?.trim(),
      notes: body.notes?.trim(),
      paymentStatus: body.paymentStatus ?? "COD",
      shipping: body.shipping,
      discount: body.discount,
      items: body.items.map((item) => ({
        productId: item.productId,
        slug: item.slug,
        name: item.name,
        size: item.size,
        quantity: Math.max(1, item.quantity),
        price: item.price,
      })),
      idempotencyKey: body.idempotencyKey.trim(),
    };

    const result = createOrder(input);

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

    const settings = getSettings();
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

      updateOrderNotificationStatus(result.order.id, {
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

      updateOrderNotificationStatus(result.order.id, {
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

      updateOrderNotificationStatus(result.order.id, {
        emailNotified: email.success,
        emailError: email.error,
      });
    }

    const order =
      getOrderById(result.order.id) ?? {
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

  const orders = listOrders({ search, status });
  return NextResponse.json({ orders });
}
