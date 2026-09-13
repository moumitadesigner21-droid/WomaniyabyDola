import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin/session";
import { withErrorHandling } from "@/lib/api/validation";
import { getDashboardStats } from "@/lib/cms/dashboard";

export const runtime = "nodejs";

export const GET = withErrorHandling(async () => {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ stats: await getDashboardStats() });
});
