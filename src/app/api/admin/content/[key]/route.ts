import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin/session";
import { getSiteContent, upsertSiteContent } from "@/lib/cms/content-repository";
import { revalidateStorefront } from "@/lib/cms/revalidate";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ key: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { key } = await context.params;
  const value = getSiteContent(key, null);

  return NextResponse.json({ key, value });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ key: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { key } = await context.params;
  const body = (await request.json()) as { value: unknown };
  upsertSiteContent(key, body.value);
  revalidateStorefront();

  return NextResponse.json({ key, value: body.value });
}
