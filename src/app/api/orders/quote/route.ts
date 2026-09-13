import { NextResponse } from "next/server";
import { getClientIp, rateLimit } from "@/lib/api/rate-limit";
import { parseJsonBody } from "@/lib/api/validation";
import { PricingError, quoteOrder } from "@/lib/orders/pricing";
import { quoteSchema } from "@/lib/orders/schemas";

export const runtime = "nodejs";

/**
 * Public: returns authoritative totals for the current cart so the checkout
 * page shows the same numbers the server will charge. Also validates coupons.
 */
export async function POST(request: Request) {
  const limiter = await rateLimit("QUOTE_LIMITER", getClientIp(request));
  if (!limiter.allowed) {
    return NextResponse.json(
      { error: "Too many requests." },
      { status: 429, headers: { "Retry-After": String(limiter.retryAfterSeconds) } },
    );
  }

  const parsed = await parseJsonBody(request, quoteSchema);
  if (!parsed.ok) return parsed.response;

  try {
    const quote = await quoteOrder(parsed.data.items, parsed.data.couponCode);
    return NextResponse.json({ quote });
  } catch (error) {
    if (error instanceof PricingError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    console.error("Quote failed:", error);
    return NextResponse.json({ error: "Unable to price your cart." }, { status: 500 });
  }
}
