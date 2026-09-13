import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin/session";
import { parseJsonBody, withErrorHandling } from "@/lib/api/validation";
import {
  createProduct,
  listAllProducts,
} from "@/lib/cms/products-repository";
import { revalidateStorefront } from "@/lib/cms/revalidate";
import { productInputSchema } from "@/lib/cms/schemas";

export const runtime = "nodejs";

export const GET = withErrorHandling(async (request: Request) => {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const includeDisabled = searchParams.get("all") === "1";

  return NextResponse.json({ products: await listAllProducts(includeDisabled) });
});

export const POST = withErrorHandling(async (request: Request) => {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = await parseJsonBody(request, productInputSchema);
  if (!parsed.ok) return parsed.response;

  const product = await createProduct(parsed.data);
  revalidateStorefront();

  return NextResponse.json({ product }, { status: 201 });
});
