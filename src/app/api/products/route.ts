import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/validation";
import { cmsProductToProduct, findCmsProducts } from "@/lib/cms/products-repository";

export const runtime = "nodejs";

/** Public: resolve up to 100 product ids (used by the guest wishlist). */
export const GET = withErrorHandling(async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const ids = (searchParams.get("ids") ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
    .slice(0, 100);
  if (!ids.length) return NextResponse.json({ products: [] });

  const { byId } = await findCmsProducts({ ids, slugs: [] });
  const products = ids
    .map((id) => byId.get(id))
    .filter((product) => product && product.enabled)
    .map((product) => cmsProductToProduct(product!));
  return NextResponse.json({ products });
});
