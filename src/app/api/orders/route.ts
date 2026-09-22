import { NextResponse } from "next/server";
import { listOrders } from "@/lib/orders/repository";
import { isAdminAuthenticated } from "@/lib/admin/session";

export const runtime = "nodejs";

export async function POST() {
  return NextResponse.json(
    { error: "Cash on Delivery is no longer available. Start payment from checkout." },
    { status: 410 },
  );
}

export async function GET(request: Request) {
  if (!await isAdminAuthenticated()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? undefined;
  const status = searchParams.get("status") as "new" | "pending" | "completed" | "cancelled" | undefined;
  return NextResponse.json({ orders: await listOrders({ search, status }) });
}
