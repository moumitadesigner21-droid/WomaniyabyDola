import { NextResponse } from "next/server";
import { parseJsonBody, withErrorHandling } from "@/lib/api/validation";
import { findCmsProducts, cmsProductToProduct } from "@/lib/cms/products-repository";
import { addToWishlist, listWishlistProductIds, removeFromWishlist } from "@/lib/customers/repository";
import { wishlistSchema } from "@/lib/customers/schemas";
import { getCurrentCustomer } from "@/lib/customers/session";

export const runtime = "nodejs";

/** Wishlist with resolved products (disabled products are dropped). */
export const GET = withErrorHandling(async () => {
  const customer = await getCurrentCustomer();
  if (!customer) return NextResponse.json({ error: "Please sign in." }, { status: 401 });

  const ids = await listWishlistProductIds(customer.id);
  const { byId } = await findCmsProducts({ ids, slugs: [] });
  const products = ids
    .map((id) => byId.get(id))
    .filter((product) => product && product.enabled)
    .map((product) => cmsProductToProduct(product!));
  return NextResponse.json({ productIds: ids, products });
});

/** Merge product ids into the wishlist (used to sync a guest wishlist on login). */
export const POST = withErrorHandling(async (request: Request) => {
  const customer = await getCurrentCustomer();
  if (!customer) return NextResponse.json({ error: "Please sign in." }, { status: 401 });

  const parsed = await parseJsonBody(request, wishlistSchema);
  if (!parsed.ok) return parsed.response;

  await addToWishlist(customer.id, parsed.data.productIds);
  return NextResponse.json({ productIds: await listWishlistProductIds(customer.id) });
});

export const DELETE = withErrorHandling(async (request: Request) => {
  const customer = await getCurrentCustomer();
  if (!customer) return NextResponse.json({ error: "Please sign in." }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");
  if (!productId) return NextResponse.json({ error: "Missing productId." }, { status: 400 });

  await removeFromWishlist(customer.id, productId);
  return NextResponse.json({ productIds: await listWishlistProductIds(customer.id) });
});
