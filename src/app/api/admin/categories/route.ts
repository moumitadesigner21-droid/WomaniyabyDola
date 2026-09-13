import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminAuthenticated } from "@/lib/admin/session";
import { parseJsonBody, withErrorHandling } from "@/lib/api/validation";
import { CATEGORY_SLUGS } from "@/lib/categories";
import { listCategories, updateCategory } from "@/lib/cms/categories-repository";
import { revalidateStorefront } from "@/lib/cms/revalidate";

export const runtime = "nodejs";

const patchSchema = z.object({
  slug: z.enum(CATEGORY_SLUGS),
  name: z.string().trim().min(1).max(80).optional(),
  description: z.string().trim().max(500).nullable().optional(),
  image: z.string().trim().max(1000).nullable().optional(),
  seoTitle: z.string().trim().max(70).nullable().optional(),
  seoDescription: z.string().trim().max(200).nullable().optional(),
  enabled: z.boolean().optional(),
});

export const GET = withErrorHandling(async () => {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ categories: await listCategories() });
});

export const PATCH = withErrorHandling(async (request: Request) => {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = await parseJsonBody(request, patchSchema);
  if (!parsed.ok) return parsed.response;

  const { slug, ...input } = parsed.data;
  const category = await updateCategory(slug, input);
  if (!category) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  revalidateStorefront();
  return NextResponse.json({ category });
});
