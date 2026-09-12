import { NextResponse } from "next/server";
import { getSettings } from "@/lib/orders/repository";

export const runtime = "nodejs";

export async function GET() {
  const settings = getSettings();
  return NextResponse.json({
    flatShippingRate: settings.flatShippingRate,
  });
}
