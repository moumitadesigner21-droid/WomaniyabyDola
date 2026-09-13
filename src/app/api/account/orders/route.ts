import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/validation";
import { getCurrentCustomer } from "@/lib/customers/session";
import { listOrdersForCustomer } from "@/lib/orders/repository";

export const runtime = "nodejs";

export const GET = withErrorHandling(async () => {
  const customer = await getCurrentCustomer();
  if (!customer) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  return NextResponse.json({ orders: await listOrdersForCustomer(customer.id) });
});
