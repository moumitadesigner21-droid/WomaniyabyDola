import { NextResponse } from "next/server";
import { parseJsonBody, withErrorHandling } from "@/lib/api/validation";
import { deleteAddress, updateAddress } from "@/lib/customers/repository";
import { addressSchema } from "@/lib/customers/schemas";
import { getCurrentCustomer } from "@/lib/customers/session";

export const runtime = "nodejs";

type Context = { params: Promise<{ id: string }> };

export const PATCH = withErrorHandling<Context>(async (request, context) => {
  const customer = await getCurrentCustomer();
  if (!customer) return NextResponse.json({ error: "Please sign in." }, { status: 401 });

  const parsed = await parseJsonBody(request, addressSchema.partial());
  if (!parsed.ok) return parsed.response;

  const { id } = await context.params;
  const address = await updateAddress(customer.id, id, parsed.data);
  if (!address) return NextResponse.json({ error: "Address not found." }, { status: 404 });
  return NextResponse.json({ address });
});

export const DELETE = withErrorHandling<Context>(async (_request, context) => {
  const customer = await getCurrentCustomer();
  if (!customer) return NextResponse.json({ error: "Please sign in." }, { status: 401 });

  const { id } = await context.params;
  const deleted = await deleteAddress(customer.id, id);
  if (!deleted) return NextResponse.json({ error: "Address not found." }, { status: 404 });
  return NextResponse.json({ success: true });
});
