import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/validation";
import { getCurrentCustomer } from "@/lib/customers/session";
import { getOrderForCustomer } from "@/lib/orders/repository";

export const runtime = "nodejs";

type Context = { params: Promise<{ id: string }> };

export const GET = withErrorHandling<Context>(async (_request, context) => {
  const customer = await getCurrentCustomer();
  if (!customer) return NextResponse.json({ error: "Please sign in." }, { status: 401 });

  const { id } = await context.params;
  const order = await getOrderForCustomer(customer.id, id);
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
  return NextResponse.json({ order });
});
