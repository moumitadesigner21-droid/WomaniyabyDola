import { NextResponse } from "next/server";
import { verifyCashfreeWebhook } from "@/lib/payments/cashfree";
import { reconcileExpiredPayments } from "@/lib/payments/finalize";
import { retryPaidNotifications } from "@/lib/orders/paid-notifications";

export async function POST(request: Request) {
  const body = await request.text();
  const timestamp = request.headers.get("x-webhook-timestamp");
  if (body !== "reconcile-expired-payments" || !timestamp || !Number.isFinite(Number(timestamp)) ||
      Math.abs(Date.now() - Number(timestamp)) > 60_000 ||
      !await verifyCashfreeWebhook(body, timestamp, request.headers.get("x-webhook-signature"))) {
    return NextResponse.json({error:"Unauthorized"}, {status:401});
  }
  return NextResponse.json({ payments: await reconcileExpiredPayments(), notifications: await retryPaidNotifications() });
}
