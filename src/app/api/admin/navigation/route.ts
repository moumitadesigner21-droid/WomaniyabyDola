import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin/session";
import {
  listNavigation,
  replaceNavigation,
} from "@/lib/cms/navigation-repository";
import { revalidateStorefront } from "@/lib/cms/revalidate";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const location = searchParams.get("location") as "header" | "footer" | null;

  return NextResponse.json({
    items: listNavigation(location ?? undefined),
  });
}

export async function PUT(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    location: "header" | "footer";
    items: {
      id: string;
      label: string;
      href: string;
      parentId?: string | null;
      sortOrder?: number;
      enabled?: boolean;
    }[];
  };

  replaceNavigation(
    body.location,
    body.items.map((item, index) => ({
      id: item.id,
      label: item.label,
      href: item.href,
      parentId: item.parentId ?? null,
      sortOrder: item.sortOrder ?? index,
      enabled: item.enabled ?? true,
      location: body.location,
    })),
  );

  revalidateStorefront();
  return NextResponse.json({ success: true });
}
