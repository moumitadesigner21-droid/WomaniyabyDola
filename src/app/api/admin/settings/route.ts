import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin/session";
import { getSettings, updateSettings } from "@/lib/orders/repository";

export const runtime = "nodejs";

export async function GET() {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ settings: getSettings() });
}

export async function PATCH(request: Request) {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    ownerWhatsappNumber?: string;
    orderEmail?: string;
    flatShippingRate?: number;
  };

  const settings = updateSettings({
    ownerWhatsappNumber: body.ownerWhatsappNumber?.replace(/\D/g, ""),
    orderEmail: body.orderEmail?.trim(),
    flatShippingRate: body.flatShippingRate,
  });

  return NextResponse.json({ settings });
}
