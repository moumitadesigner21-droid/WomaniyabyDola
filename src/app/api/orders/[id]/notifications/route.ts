import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin/session";
import { getOrderById } from "@/lib/orders/repository";
import { execute } from "@/lib/db";
import { notifyPaidOrder } from "@/lib/orders/paid-notifications";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  if (!await isAdminAuthenticated()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const order = await getOrderById(id);
  if (!order || order.paymentStatus !== "paid") return NextResponse.json({ error: "A paid order is required." }, { status: 409 });
  // Never reset sent jobs or steal an active delivery lease.
  await execute("UPDATE payment_notification_jobs SET next_at = ? WHERE order_id = ? AND state = 'pending'", new Date().toISOString(), id);
  return NextResponse.json({ order: await notifyPaidOrder(id) });
}
