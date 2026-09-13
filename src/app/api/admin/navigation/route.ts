import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin/session";
import { parseJsonBody, withErrorHandling } from "@/lib/api/validation";
import {
  listNavigation,
  replaceNavigation,
} from "@/lib/cms/navigation-repository";
import { revalidateStorefront } from "@/lib/cms/revalidate";
import { navigationPutSchema } from "@/lib/cms/schemas";

export const runtime = "nodejs";

export const GET = withErrorHandling(async (request: Request) => {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("location");
  const location = raw === "header" || raw === "footer" ? raw : undefined;

  return NextResponse.json({ items: await listNavigation(location) });
});

export const PUT = withErrorHandling(async (request: Request) => {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = await parseJsonBody(request, navigationPutSchema);
  if (!parsed.ok) return parsed.response;
  const body = parsed.data;

  await replaceNavigation(
    body.location,
    body.items.map((item, index) => ({
      id: item.id,
      label: item.label,
      href: item.href,
      parentId: item.parentId ?? null,
      sortOrder: item.sortOrder ?? index,
      enabled: item.enabled ?? true,
    })),
  );

  revalidateStorefront();
  return NextResponse.json({ success: true });
});
