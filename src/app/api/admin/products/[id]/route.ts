import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin/session";
import { parseJsonBody, withErrorHandling } from "@/lib/api/validation";
import {
  deleteProduct,
  getCmsProductById,
  updateProduct,
} from "@/lib/cms/products-repository";
import { deleteOrphanedUploads } from "@/lib/cms/media";
import { revalidateStorefront } from "@/lib/cms/revalidate";
import { productPatchSchema } from "@/lib/cms/schemas";

export const runtime = "nodejs";

type Context = { params: Promise<{ id: string }> };

export const GET = withErrorHandling<Context>(async (_request, context) => {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const product = await getCmsProductById(id);

  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ product });
});

export const PATCH = withErrorHandling<Context>(async (request, context) => {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = await parseJsonBody(request, productPatchSchema);
  if (!parsed.ok) return parsed.response;

  const { id } = await context.params;
  const product = await updateProduct(id, parsed.data);

  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  revalidateStorefront();
  return NextResponse.json({ product });
});

export const DELETE = withErrorHandling<Context>(async (_request, context) => {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const existing = await getCmsProductById(id);
  const deleted = await deleteProduct(id);

  if (!deleted || !existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await deleteOrphanedUploads([
    existing.image,
    existing.hoverImage,
    existing.palluImage,
    ...existing.images.map((image) => image.url),
  ]);

  revalidateStorefront();
  return NextResponse.json({ success: true });
});
