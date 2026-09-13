import { NextResponse } from "next/server";
import { parseJsonBody, withErrorHandling } from "@/lib/api/validation";
import { listAddresses, listWishlistProductIds, updateCustomerProfile } from "@/lib/customers/repository";
import { profileSchema } from "@/lib/customers/schemas";
import { getCurrentCustomer } from "@/lib/customers/session";

export const runtime = "nodejs";

/** Session bootstrap for the storefront: who am I, my wishlist, my addresses. */
export const GET = withErrorHandling(async () => {
  const customer = await getCurrentCustomer();
  if (!customer) {
    return NextResponse.json({ customer: null, wishlist: [], addresses: [] });
  }
  const [wishlist, addresses] = await Promise.all([
    listWishlistProductIds(customer.id),
    listAddresses(customer.id),
  ]);
  return NextResponse.json({ customer, wishlist, addresses });
});

export const PATCH = withErrorHandling(async (request: Request) => {
  const customer = await getCurrentCustomer();
  if (!customer) return NextResponse.json({ error: "Please sign in." }, { status: 401 });

  const parsed = await parseJsonBody(request, profileSchema);
  if (!parsed.ok) return parsed.response;

  const updated = await updateCustomerProfile(customer.id, {
    name: parsed.data.name,
    phone: parsed.data.phone === "" ? null : parsed.data.phone,
  });
  return NextResponse.json({ customer: updated });
});
