import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin/session";
import { parseJsonBody, withErrorHandling } from "@/lib/api/validation";
import { settingsPatchSchema } from "@/lib/cms/schemas";
import { getSettings, updateSettings } from "@/lib/orders/repository";

export const runtime = "nodejs";

export const GET = withErrorHandling(async () => {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ settings: await getSettings() });
});

export const PATCH = withErrorHandling(async (request: Request) => {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = await parseJsonBody(request, settingsPatchSchema);
  if (!parsed.ok) return parsed.response;

  return NextResponse.json({ settings: await updateSettings(parsed.data) });
});
