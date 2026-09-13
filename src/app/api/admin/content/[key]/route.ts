import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin/session";
import { withErrorHandling } from "@/lib/api/validation";
import { CONTENT_SCHEMAS, isContentKey } from "@/lib/cms/content-schemas";
import { getSiteContent, upsertSiteContent } from "@/lib/cms/content-repository";
import { revalidateStorefront } from "@/lib/cms/revalidate";

export const runtime = "nodejs";

type Context = { params: Promise<{ key: string }> };

export const GET = withErrorHandling<Context>(async (_request, context) => {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { key } = await context.params;
  if (!isContentKey(key)) {
    return NextResponse.json({ error: "Unknown content key." }, { status: 404 });
  }

  return NextResponse.json({ key, value: await getSiteContent(key, null) });
});

export const PATCH = withErrorHandling<Context>(async (request, context) => {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { key } = await context.params;
  if (!isContentKey(key)) {
    return NextResponse.json({ error: "Unknown content key." }, { status: 404 });
  }

  let body: { value?: unknown };
  try {
    body = (await request.json()) as { value?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const result = CONTENT_SCHEMAS[key].safeParse(body.value);
  if (!result.success) {
    const issues = result.error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    }));
    return NextResponse.json(
      { error: issues[0] ? `${issues[0].path || key}: ${issues[0].message}` : "Invalid content.", issues },
      { status: 400 },
    );
  }

  await upsertSiteContent(key, result.data);
  revalidateStorefront();

  return NextResponse.json({ key, value: result.data });
});
