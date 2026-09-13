import { NextResponse } from "next/server";
import { parseJsonBody, withErrorHandling } from "@/lib/api/validation";
import { createAddress, listAddresses } from "@/lib/customers/repository";
import { addressSchema } from "@/lib/customers/schemas";
import { getCurrentCustomer } from "@/lib/customers/session";

export const runtime = "nodejs";

export const GET = withErrorHandling(async () => {
  const customer = await getCurrentCustomer();
  if (!customer) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  return NextResponse.json({ addresses: await listAddresses(customer.id) });
});

export const POST = withErrorHandling(async (request: Request) => {
  const customer = await getCurrentCustomer();
  if (!customer) return NextResponse.json({ error: "Please sign in." }, { status: 401 });

  const parsed = await parseJsonBody(request, addressSchema);
  if (!parsed.ok) return parsed.response;

  const existing = await listAddresses(customer.id);
  if (existing.length >= 10) {
    return NextResponse.json({ error: "You can save up to 10 addresses." }, { status: 400 });
  }

  const address = await createAddress(customer.id, {
    ...parsed.data,
    label: parsed.data.label ?? null,
    line2: parsed.data.line2 ?? null,
    landmark: parsed.data.landmark ?? null,
  });
  return NextResponse.json({ address }, { status: 201 });
});
