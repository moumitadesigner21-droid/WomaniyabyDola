"use client";

import { CheckCircle2, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCustomer } from "@/lib/customer";
import { formatPrice } from "@/lib/format";
import type { Order } from "@/lib/orders/types";

export const LAST_ORDER_KEY = "womania-last-order";

export interface PlacedOrderSummary {
  order: Order;
  customerWhatsappSent: boolean;
  customerWhatsappError: string | null;
  whatsappSent: boolean;
}

/** Reads the just-placed order from sessionStorage (set by the checkout). */
export function ThankYouContent() {
  const { customer } = useCustomer();
  const [summary, setSummary] = useState<PlacedOrderSummary | null | undefined>(undefined);

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(LAST_ORDER_KEY);
      setSummary(raw ? (JSON.parse(raw) as PlacedOrderSummary) : null);
    } catch {
      setSummary(null);
    }
  }, []);

  if (summary === undefined) {
    return <div className="mx-auto max-w-2xl px-4 py-24 text-center text-sm text-warm-gray">Loading…</div>;
  }

  if (!summary) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <CheckCircle2 className="mx-auto h-12 w-12 text-forest" />
        <h1 className="mt-6 font-serif text-3xl text-maroon">Thank you</h1>
        <p className="mt-3 text-sm text-warm-gray">
          Your order details will be shared on WhatsApp. If you have an account, you can find every order under My Account.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/account/orders" className="inline-flex min-h-[48px] items-center justify-center border border-maroon px-8 py-3 text-xs font-semibold tracking-[0.18em] text-maroon uppercase transition-colors hover:bg-maroon hover:text-ivory">
            My orders
          </Link>
          <Link href="/shop" className="inline-flex min-h-[48px] items-center justify-center bg-maroon px-8 py-3 text-xs font-semibold tracking-[0.18em] text-ivory uppercase transition-colors hover:bg-maroon-dark">
            Continue shopping
          </Link>
        </div>
      </div>
    );
  }

  const { order } = summary;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:py-20">
      <div className="border border-charcoal/10 bg-white p-8 text-center sm:p-10">
        <CheckCircle2 className="mx-auto h-12 w-12 text-forest" />
        <p className="mt-6 text-[10px] tracking-[0.28em] text-gold uppercase">Order confirmed</p>
        <h1 className="mt-2 font-serif text-3xl text-maroon sm:text-4xl">Thank you, {order.customerName.split(" ")[0]}!</h1>
        <p className="mt-3 text-sm leading-relaxed text-warm-gray">
          We&apos;ve received your order and will confirm it on WhatsApp shortly. Pay in cash when it arrives.
        </p>

        <div className="mt-8 border-y border-charcoal/10 py-5">
          <p className="text-[10px] tracking-[0.2em] text-warm-gray uppercase">Order number</p>
          <p className="mt-1 font-serif text-2xl text-charcoal">#{order.orderNumber}</p>
        </div>

        <ul className="mt-6 divide-y divide-charcoal/10 text-left text-sm">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-start justify-between gap-4 py-3">
              <span>
                <span className="block text-charcoal">{item.name}</span>
                <span className="block text-xs text-warm-gray">
                  {item.variantLabel ?? (item.size ? `Size: ${item.size}` : null)}
                  {item.variantLabel || item.size ? " · " : ""}Qty {item.quantity}
                </span>
              </span>
              <span className="shrink-0 text-charcoal">{formatPrice(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-1.5 text-sm text-warm-gray">
          <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatPrice(order.subtotal)}</dd></div>
          <div className="flex justify-between"><dt>Shipping</dt><dd>{order.shipping === 0 ? "Free" : formatPrice(order.shipping)}</dd></div>
          {order.discount > 0 ? (
            <div className="flex justify-between text-forest"><dt>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</dt><dd>−{formatPrice(order.discount)}</dd></div>
          ) : null}
          <div className="flex justify-between border-t border-charcoal/10 pt-2 text-base font-medium text-maroon"><dt>Total</dt><dd>{formatPrice(order.total)}</dd></div>
        </dl>

        <div className="mt-6 space-y-2 text-sm">
          <p className="text-left text-xs leading-relaxed text-warm-gray">
            <span className="font-medium text-charcoal">Delivering to:</span> {order.customerAddress}
          </p>
          <p className={`inline-flex items-center gap-2 text-xs ${summary.customerWhatsappSent ? "text-forest" : "text-warm-gray"}`}>
            <MessageCircle className="h-3.5 w-3.5" />
            {summary.customerWhatsappSent
              ? `A confirmation was sent to ${order.customerPhone} on WhatsApp.`
              : `We'll reach you on ${order.customerPhone} to confirm.`}
          </p>
        </div>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          {customer ? (
            <Link href={`/account/orders/${order.id}`} className="inline-flex min-h-[48px] items-center justify-center border border-maroon px-8 py-3 text-xs font-semibold tracking-[0.18em] text-maroon uppercase transition-colors hover:bg-maroon hover:text-ivory">
              View order in my account
            </Link>
          ) : (
            <Link href="/account/register?next=%2Faccount%2Forders" className="inline-flex min-h-[48px] items-center justify-center border border-maroon px-8 py-3 text-xs font-semibold tracking-[0.18em] text-maroon uppercase transition-colors hover:bg-maroon hover:text-ivory">
              Create an account to track orders
            </Link>
          )}
          <Link href="/shop" className="inline-flex min-h-[48px] items-center justify-center bg-maroon px-8 py-3 text-xs font-semibold tracking-[0.18em] text-ivory uppercase transition-colors hover:bg-maroon-dark">
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
