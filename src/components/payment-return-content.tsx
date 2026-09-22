"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import type { PublicPaymentOrder } from "@/lib/payments/public-order";
import { openCardCheckout } from "@/lib/payments/checkout";

export function PaymentReturnContent() {
  const params = useSearchParams();
  const { clearCart } = useCart();
  const [order, setOrder] = useState<PublicPaymentOrder | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  async function retryPayment() {
    setRetrying(true);
    try {
      const response = await fetch("/api/payments/cashfree/retry", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId: params.get("order_id"), token: params.get("token") }) });
      const payload = await response.json() as { paymentSessionId?: string; environment: "sandbox" | "production"; error?: string };
      if (!response.ok || !payload.paymentSessionId) throw new Error(payload.error || "Unable to resume payment.");
      await openCardCheckout(payload.paymentSessionId, payload.environment);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to resume payment."); }
    finally { setRetrying(false); }
  }

  useEffect(() => {
    void Promise.resolve().then(() => {
      const orderId = params.get("order_id");
      if (!orderId) {
        setError("We could not identify this payment.");
        setLoading(false);
        return;
      }
      return fetch(`/api/payments/cashfree/status?order_id=${encodeURIComponent(orderId)}&token=${encodeURIComponent(params.get("token") ?? "")}`)
        .then(async (response) => {
          const payload = (await response.json()) as { order?: PublicPaymentOrder; error?: string };
          if (!response.ok || !payload.order) throw new Error(payload.error ?? "Unable to verify payment.");
          setOrder(payload.order);
          if (payload.order.paymentStatus === "paid") {
            localStorage.removeItem("womania-active-checkout");
            clearCart();
          }
        })
        .catch((reason) => setError(reason instanceof Error ? reason.message : "Unable to verify payment."))
        .finally(() => setLoading(false));
    });
  }, [clearCart, params]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
      {loading ? <p className="text-sm text-warm-gray">Verifying your payment securely…</p> : null}
      {!loading && order?.paymentStatus === "paid" ? (
        <div className="border border-charcoal/10 bg-white p-8">
          <CheckCircle2 className="mx-auto h-12 w-12 text-forest" />
          <p className="mt-6 text-[10px] tracking-[0.28em] text-gold uppercase">Payment confirmed</p>
          <h1 className="mt-2 font-serif text-3xl text-maroon">Thank you, {order.customerName.split(" ")[0]}!</h1>
          <p className="mt-3 text-sm text-warm-gray">Your card payment was successful and your order is confirmed.</p>
          <p className="mt-6 font-serif text-2xl text-charcoal">#{order.orderNumber}</p>
          <p className="mt-2 text-sm text-charcoal">Total paid: {formatPrice(order.total)}</p>
          <Link href="/shop" className="mt-8 inline-flex min-h-[48px] items-center justify-center bg-maroon px-8 py-3 text-xs font-semibold tracking-[0.18em] text-ivory uppercase">Continue shopping</Link>
        </div>
      ) : null}
      {!loading && order?.paymentStatus === "pending" ? (
        <div className="border border-charcoal/10 bg-white p-8">
          <h1 className="font-serif text-3xl text-maroon">{order.retryAllowed ? "Payment attempt unsuccessful" : "Payment confirmation pending"}</h1>
          <p className="mt-3 text-sm text-warm-gray">{order.retryAllowed ? "You can try another card for this same order. Your items are reserved until checkout expires." : "We are checking your payment. Check the status again before making another payment."}</p>
          {order.retryAllowed ? <button disabled={retrying} onClick={retryPayment} className="mt-8 min-h-[48px] bg-maroon px-8 py-3 text-ivory">{retrying ? "Opening checkout…" : "Retry card payment"}</button> : null}
          <button onClick={() => window.location.reload()} className="mt-4 block w-full text-sm underline">Check payment status</button>
        </div>
      ) : null}
      {!loading && (error || order?.paymentStatus === "failed" || order?.paymentStatus === "user_dropped") ? (
        <div className="border border-maroon/20 bg-white p-8">
          <XCircle className="mx-auto h-12 w-12 text-maroon" />
          <h1 className="mt-6 font-serif text-3xl text-maroon">{error ? "Payment status unavailable" : "Payment was not completed"}</h1>
          <p className="mt-3 text-sm text-warm-gray">{error || "This checkout has expired. You can return to checkout and try again."}</p>
          {error ? <button onClick={() => window.location.reload()} className="mt-8 min-h-[48px] bg-maroon px-8 py-3 text-ivory">Check this payment again</button> :
            <Link href="/checkout" onClick={() => localStorage.removeItem("womania-active-checkout")} className="mt-8 inline-flex min-h-[48px] items-center justify-center bg-maroon px-8 py-3 text-xs font-semibold tracking-[0.18em] text-ivory uppercase">Start a new checkout</Link>}
        </div>
      ) : null}
    </div>
  );
}
