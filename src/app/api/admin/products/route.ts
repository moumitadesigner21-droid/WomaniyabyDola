import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin/session";
import {
  createProduct,
  listAllProducts,
} from "@/lib/cms/products-repository";
import { revalidateStorefront } from "@/lib/cms/revalidate";
import type { CmsProductInput } from "@/lib/cms/types";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const includeDisabled = searchParams.get("all") === "1";

  return NextResponse.json({ products: listAllProducts(includeDisabled) });
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as CmsProductInput;
  const product = createProduct(body);
  revalidateStorefront();

  return NextResponse.json({ product }, { status: 201 });
}
