import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin/session";
import { withErrorHandling } from "@/lib/api/validation";
import { listCustomersWithStats } from "@/lib/customers/repository";

export const runtime = "nodejs";

export const GET = withErrorHandling(async (request: Request) => {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  return NextResponse.json({ customers: await listCustomersWithStats(searchParams.get("search") ?? undefined) });
});
