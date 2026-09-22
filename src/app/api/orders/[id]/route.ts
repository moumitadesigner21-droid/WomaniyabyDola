import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminAuthenticated } from "@/lib/admin/session";
import { parseJsonBody } from "@/lib/api/validation";
import {
  getOrderById,
  updateOrderStatus,
} from "@/lib/orders/repository";

const orderPatchSchema = z.object({
  orderStatus: z.enum(["new", "pending", "completed", "cancelled"]).optional(),
  paymentStatus: z.enum(["COD", "paid", "pending", "failed", "user_dropped", "refunded"]).optional(),
});

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const order = await getOrderById(id);

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({ order });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = await parseJsonBody(request, orderPatchSchema);
  if (!parsed.ok) return parsed.response;

  const { id } = await context.params;
  const existing = await getOrderById(id);
  if (existing && existing.paymentStatus !== "COD" && parsed.data.paymentStatus && parsed.data.paymentStatus !== existing.paymentStatus) {
    return NextResponse.json({ error: "Online payment status is verified by Cashfree and cannot be changed manually. Refunds must be processed in Cashfree." }, { status: 409 });
  }
  const order = await updateOrderStatus(id, parsed.data);

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({ order });
}
