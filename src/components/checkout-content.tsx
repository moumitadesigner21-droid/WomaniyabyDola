"use client";

import { ArrowLeft, CheckCircle2, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import type { Order, PaymentStatus } from "@/lib/orders/types";

interface OrderPlacementResult {
  order: Order;
  whatsappSent: boolean;
  whatsappError: string | null;
  customerWhatsappSent: boolean;
  customerWhatsappError: string | null;
  emailSent: boolean;
  emailError: string | null;
  duplicate: boolean;
}

export function CheckoutContent() {
  const { items, subtotal, itemCount, hydrated, clearCart } = useCart();
  const idempotencyKey = useRef(
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `order-${Date.now()}`,
  );

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("COD");
  const [shipping, setShipping] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [result, setResult] = useState<OrderPlacementResult | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const response = await fetch("/api/store/config");
        if (!response.ok) return;
        const payload = (await response.json()) as {
          flatShippingRate?: number;
        };
        setShipping(payload.flatShippingRate ?? 0);
      } catch {
        // Keep default shipping at 0
      }
    })();
  }, []);

  const total = useMemo(
    () => Math.max(0, subtotal + shipping - discount),
    [subtotal, shipping, discount],
  );

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <p className="text-sm text-warm-gray">Loading your cart...</p>
      </div>
    );
  }

  if (itemCount === 0 && !result) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <ShoppingBag className="mx-auto h-10 w-10 text-maroon/60" />
        <h1 className="mt-6 font-serif text-3xl text-maroon">Nothing to checkout</h1>
        <p className="mt-3 text-warm-gray">Add products to your cart first.</p>
        <Link
          href="/shop"
          className="mt-8 inline-flex min-h-[44px] items-center justify-center bg-maroon px-8 py-3 text-xs font-semibold tracking-[0.18em] text-ivory uppercase transition-colors hover:bg-maroon-dark"
        >
          Shop Collection
        </Link>
      </div>
    );
  }

  if (result) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="border border-charcoal/10 bg-white p-8 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-forest" />
          <h1 className="mt-6 font-serif text-3xl text-maroon">Order Confirmed</h1>
          <p className="mt-3 text-sm text-warm-gray">
            Thank you, {result.order.customerName}. Your order has been received.
          </p>

          <p className="mt-6 font-serif text-2xl text-charcoal">
            #{result.order.orderNumber}
          </p>

          <div className="mt-6 space-y-2 text-sm text-charcoal">
            <p>Total: {formatPrice(result.order.total)}</p>
            <p>
              Payment:{" "}
              {result.order.paymentStatus === "COD"
                ? "Cash on Delivery"
                : result.order.paymentStatus}
            </p>
          </div>

          {result.customerWhatsappSent ? (
            <p className="mt-6 text-sm text-forest">
              A WhatsApp confirmation was sent to{" "}
              <span className="font-medium">{result.order.customerPhone}</span>.
            </p>
          ) : (
            <p className="mt-6 text-sm text-warm-gray">
              Your order is confirmed. Our team will reach out to you shortly on
              WhatsApp or phone.
            </p>
          )}

          {result.whatsappSent ? (
            <p className="mt-3 text-xs text-warm-gray">
              Womania has also been notified about your order.
            </p>
          ) : null}

          {result.emailSent ? (
            <p className="mt-3 text-xs text-warm-gray">
              A backup email notification was sent to the boutique.
            </p>
          ) : null}

          {result.customerWhatsappError && !result.customerWhatsappSent ? (
            <p className="mt-3 text-xs text-warm-gray">
              We could not deliver WhatsApp automatically; our team will still
              contact you on the number you provided.
            </p>
          ) : null}

          <Link
            href="/shop"
            className="mt-8 inline-flex min-h-[48px] items-center justify-center bg-maroon px-8 py-3 text-xs font-semibold tracking-[0.18em] text-ivory uppercase transition-colors hover:bg-maroon-dark"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!name.trim() || !phone.trim() || !address.trim()) {
      setSubmitError("Please fill in your name, phone, and delivery address.");
      return;
    }

    if (items.length === 0) {
      setSubmitError("Your cart is empty. Add products before placing an order.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name.trim(),
          customerPhone: phone.trim(),
          customerEmail: email.trim() || undefined,
          customerAddress: address.trim(),
          notes: notes.trim() || undefined,
          paymentStatus,
          shipping,
          discount,
          idempotencyKey: idempotencyKey.current,
          items: items.map((item) => ({
            productId: item.productId,
            slug: item.slug,
            name: item.name,
            size: item.size,
            quantity: item.quantity,
            price: item.price,
          })),
        }),
      });

      const raw = await response.text();
      let payload: OrderPlacementResult & { error?: string } = {
        order: {} as Order,
        whatsappSent: false,
        whatsappError: null,
        customerWhatsappSent: false,
        customerWhatsappError: null,
        emailSent: false,
        emailError: null,
        duplicate: false,
      };

      if (raw) {
        try {
          payload = JSON.parse(raw) as OrderPlacementResult & { error?: string };
        } catch {
          setSubmitError("Unable to place order. Please try again.");
          return;
        }
      }

      if (!response.ok) {
        setSubmitError(payload.error ?? "Unable to place order.");
        return;
      }

      clearCart();
      setResult(payload);
    } catch {
      setSubmitError("Unable to place order. Please check your connection.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/cart"
        className="inline-flex items-center gap-2 text-xs tracking-[0.16em] text-warm-gray uppercase transition-colors hover:text-maroon"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to cart
      </Link>

      <h1 className="mt-6 font-serif text-3xl text-maroon sm:text-4xl">Checkout</h1>
      <p className="mt-2 text-sm text-warm-gray">
        Complete your details and place your order. The boutique owner will be
        notified instantly on WhatsApp.
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
        <form onSubmit={handleSubmit} className="space-y-5 border border-charcoal/10 bg-white p-6">
          <h2 className="text-xs font-semibold tracking-[0.2em] text-charcoal uppercase">
            Contact & Delivery
          </h2>

          <label className="block">
            <span className="mb-2 block text-xs tracking-[0.14em] text-charcoal uppercase">
              Full name *
            </span>
            <input
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full border border-charcoal/15 bg-ivory px-4 py-3 text-sm outline-none transition-colors focus:border-maroon"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs tracking-[0.14em] text-charcoal uppercase">
              Phone *
            </span>
            <input
              required
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="w-full border border-charcoal/15 bg-ivory px-4 py-3 text-sm outline-none transition-colors focus:border-maroon"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs tracking-[0.14em] text-charcoal uppercase">
              Email
            </span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full border border-charcoal/15 bg-ivory px-4 py-3 text-sm outline-none transition-colors focus:border-maroon"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs tracking-[0.14em] text-charcoal uppercase">
              Delivery address *
            </span>
            <textarea
              required
              rows={4}
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              className="w-full resize-y border border-charcoal/15 bg-ivory px-4 py-3 text-sm outline-none transition-colors focus:border-maroon"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs tracking-[0.14em] text-charcoal uppercase">
              Order notes
            </span>
            <textarea
              rows={3}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="w-full resize-y border border-charcoal/15 bg-ivory px-4 py-3 text-sm outline-none transition-colors focus:border-maroon"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs tracking-[0.14em] text-charcoal uppercase">
              Payment method
            </span>
            <select
              value={paymentStatus}
              onChange={(event) =>
                setPaymentStatus(event.target.value as PaymentStatus)
              }
              className="w-full border border-charcoal/15 bg-ivory px-4 py-3 text-sm outline-none focus:border-maroon"
            >
              <option value="COD">Cash on Delivery</option>
              <option value="pending">Online Payment (Pending)</option>
              <option value="paid">Already Paid</option>
            </select>
          </label>

          {submitError ? (
            <p className="text-sm text-maroon">{submitError}</p>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 bg-maroon px-4 py-3 text-xs font-semibold tracking-[0.16em] text-ivory uppercase transition-colors hover:bg-maroon-dark disabled:opacity-60"
          >
            <ShoppingBag className="h-4 w-4" />
            {submitting ? "Placing Order..." : "Place Order"}
          </button>
        </form>

        <aside className="h-fit border border-charcoal/10 bg-white p-6">
          <h2 className="text-xs font-semibold tracking-[0.2em] text-charcoal uppercase">
            Your Order
          </h2>
          <ul className="mt-4 space-y-4">
            {items.map((item) => (
              <li key={item.lineId} className="flex gap-3">
                <div className="relative h-16 w-14 shrink-0 overflow-hidden bg-ivory">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-contain object-center p-0.5"
                    sizes="56px"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm leading-snug text-charcoal">
                    {item.name}
                  </p>
                  {item.size ? (
                    <p className="mt-0.5 text-xs text-warm-gray">Size: {item.size}</p>
                  ) : null}
                  <p className="mt-1 text-xs text-warm-gray">
                    Qty {item.quantity} · {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-5 space-y-2 border-t border-charcoal/10 pt-5 text-sm">
            <div className="flex justify-between text-warm-gray">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-warm-gray">
              <span>Shipping</span>
              <span>{formatPrice(shipping)}</span>
            </div>
            <div className="flex justify-between text-warm-gray">
              <span>Discount</span>
              <span>{formatPrice(discount)}</span>
            </div>
            <div className="flex justify-between font-medium text-maroon">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
