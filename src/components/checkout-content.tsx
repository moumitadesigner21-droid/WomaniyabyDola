"use client";

import { ArrowLeft, CheckCircle2, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AddressCard, AddressFields, emptyAddress } from "@/components/account/address-book";
import { useCart } from "@/lib/cart";
import { useCustomer } from "@/lib/customer";
import { formatAddress, type CustomerAddressInput } from "@/lib/customers/types";
import { formatPrice } from "@/lib/format";
import type { OrderQuote } from "@/lib/orders/pricing";
import type { Order } from "@/lib/orders/types";

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

function makeIdempotencyKey() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `order-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function CheckoutContent() {
  const { items, subtotal, itemCount, hydrated, clearCart } = useCart();
  const { customer, addresses, hydrated: customerHydrated, setAddresses } = useCustomer();
  const [idempotencyKey] = useState(makeIdempotencyKey);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState<CustomerAddressInput>(emptyAddress);
  // Saved address chosen at checkout; "new" = typing a fresh one.
  const [selectedAddressId, setSelectedAddressId] = useState<string | "new" | null>(null);
  const [saveAddress, setSaveAddress] = useState(true);
  const [prefilled, setPrefilled] = useState(false);

  // Pre-fill contact details and default address once the session is known.
  if (customerHydrated && customer && !prefilled) {
    setPrefilled(true);
    if (!name) setName(customer.name);
    if (!phone && customer.phone) setPhone(customer.phone);
    if (!email) setEmail(customer.email);
    const preferred = addresses.find((a) => a.isDefault) ?? addresses[0];
    setSelectedAddressId(preferred ? preferred.id : "new");
  }

  const chosenSaved = selectedAddressId && selectedAddressId !== "new"
    ? addresses.find((a) => a.id === selectedAddressId)
    : undefined;
  const [notes, setNotes] = useState("");
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponMessage, setCouponMessage] = useState("");
  const [quote, setQuote] = useState<OrderQuote | null>(null);
  const [quoteError, setQuoteError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [result, setResult] = useState<OrderPlacementResult | null>(null);

  // `items` only changes reference when the cart mutates, so this is stable
  // across re-renders and safe to use as an effect dependency.
  const cartPayload = useMemo(
    () =>
      items.map((item) => ({
        productId: item.productId,
        slug: item.slug,
        variantId: item.variantId,
        size: item.size,
        quantity: item.quantity,
      })),
    [items],
  );

  const fetchQuote = useCallback(
    async (couponCode: string | null) => {
      if (cartPayload.length === 0) return null;

      const response = await fetch("/api/orders/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartPayload,
          couponCode: couponCode ?? undefined,
        }),
      });
      const payload = (await response.json()) as {
        quote?: OrderQuote;
        error?: string;
      };
      if (!response.ok || !payload.quote) {
        throw new Error(payload.error ?? "Unable to price your cart.");
      }
      return payload.quote;
    },
    [cartPayload],
  );

  useEffect(() => {
    if (!hydrated) return;
    let cancelled = false;
    void (async () => {
      try {
        const next = await fetchQuote(appliedCoupon);
        if (!cancelled && next) {
          setQuote(next);
          setQuoteError("");
        }
      } catch (error) {
        if (!cancelled) {
          setQuoteError(
            error instanceof Error ? error.message : "Unable to price your cart.",
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hydrated, fetchQuote, appliedCoupon]);

  const handleApplyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setCouponMessage("");
    try {
      const next = await fetchQuote(code);
      if (next) {
        setQuote(next);
        setAppliedCoupon(next.couponCode);
        setCouponMessage(`Coupon ${next.couponCode} applied.`);
        setQuoteError("");
      }
    } catch (error) {
      setCouponMessage(
        error instanceof Error ? error.message : "That coupon code is not valid.",
      );
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponMessage("");
  };

  const shipping = quote?.shipping ?? 0;
  const discount = quote?.discount ?? 0;
  const total = quote?.total ?? Math.max(0, subtotal + shipping - discount);

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

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            {customer ? (
              <Link
                href={`/account/orders/${result.order.id}`}
                className="inline-flex min-h-[48px] items-center justify-center border border-maroon px-8 py-3 text-xs font-semibold tracking-[0.18em] text-maroon uppercase transition-colors hover:bg-maroon hover:text-ivory"
              >
                View order in my account
              </Link>
            ) : null}
            <Link
              href="/shop"
              className="inline-flex min-h-[48px] items-center justify-center bg-maroon px-8 py-3 text-xs font-semibold tracking-[0.18em] text-ivory uppercase transition-colors hover:bg-maroon-dark"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const deliveryAddress: CustomerAddressInput | undefined = chosenSaved
      ? chosenSaved
      : { ...address, fullName: address.fullName || name.trim(), phone: address.phone || phone.trim() };

    if (
      !name.trim() ||
      !phone.trim() ||
      !deliveryAddress ||
      !deliveryAddress.line1.trim() ||
      !deliveryAddress.city.trim() ||
      !deliveryAddress.postalCode.trim()
    ) {
      setSubmitError("Please fill in your name, phone, and delivery address.");
      return;
    }

    if (items.length === 0) {
      setSubmitError("Your cart is empty. Add products before placing an order.");
      return;
    }

    if (quoteError) {
      setSubmitError(quoteError);
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
          customerAddress: formatAddress(deliveryAddress),
          notes: notes.trim() || undefined,
          couponCode: appliedCoupon ?? undefined,
          idempotencyKey,
          items: cartPayload,
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

      // Save a newly typed address to the account for next time.
      if (customer && !chosenSaved && saveAddress) {
        const saved = await fetch("/api/account/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...deliveryAddress, isDefault: addresses.length === 0 }),
        });
        if (saved.ok) {
          const refreshed = await fetch("/api/account/addresses");
          const list = (await refreshed.json().catch(() => ({}))) as { addresses?: typeof addresses };
          if (list.addresses) setAddresses(list.addresses);
        }
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

          <div>
            <span className="mb-2 block text-xs tracking-[0.14em] text-charcoal uppercase">
              Delivery address *
            </span>

            {customer && addresses.length ? (
              <div className="mb-4 grid gap-3 sm:grid-cols-2">
                {addresses.map((saved) => (
                  <label
                    key={saved.id}
                    className={`cursor-pointer ${selectedAddressId === saved.id ? "ring-2 ring-maroon/40" : ""}`}
                  >
                    <input
                      type="radio"
                      name="saved-address"
                      className="sr-only"
                      checked={selectedAddressId === saved.id}
                      onChange={() => setSelectedAddressId(saved.id)}
                    />
                    <AddressCard address={saved} />
                  </label>
                ))}
                <label
                  className={`flex cursor-pointer items-center justify-center border border-dashed px-4 py-6 text-xs tracking-[0.14em] uppercase ${
                    selectedAddressId === "new" ? "border-maroon text-maroon" : "border-charcoal/25 text-warm-gray"
                  }`}
                >
                  <input
                    type="radio"
                    name="saved-address"
                    className="sr-only"
                    checked={selectedAddressId === "new"}
                    onChange={() => setSelectedAddressId("new")}
                  />
                  + Use a different address
                </label>
              </div>
            ) : null}

            {!chosenSaved ? (
              <>
                <AddressFields
                  value={{ ...address, fullName: address.fullName || name, phone: address.phone || phone }}
                  onChange={setAddress}
                />
                {customer ? (
                  <label className="mt-3 flex items-center gap-2 text-sm text-charcoal">
                    <input type="checkbox" checked={saveAddress} onChange={(e) => setSaveAddress(e.target.checked)} />
                    Save this address to my account
                  </label>
                ) : null}
              </>
            ) : null}

            {!customer && customerHydrated ? (
              <p className="mt-3 text-xs text-warm-gray">
                <Link href="/account/login?next=%2Fcheckout" className="font-medium text-maroon underline-offset-2 hover:underline">
                  Sign in
                </Link>{" "}
                to use a saved address and track this order in your account.
              </p>
            ) : null}
          </div>

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

          <div className="border border-charcoal/10 bg-ivory/60 px-4 py-3 text-sm text-charcoal">
            <span className="block text-xs tracking-[0.14em] text-warm-gray uppercase">
              Payment method
            </span>
            <span className="mt-1 block font-medium">Cash on Delivery</span>
            <span className="mt-0.5 block text-xs text-warm-gray">
              Pay when your order arrives. We&apos;ll confirm on WhatsApp.
            </span>
          </div>

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
                  {item.variantLabel ? (
                    <p className="mt-0.5 text-xs text-warm-gray">{item.variantLabel}</p>
                  ) : item.size ? (
                    <p className="mt-0.5 text-xs text-warm-gray">Size: {item.size}</p>
                  ) : null}
                  <p className="mt-1 text-xs text-warm-gray">
                    Qty {item.quantity} · {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-5 border-t border-charcoal/10 pt-5">
            <label className="block text-xs tracking-[0.14em] text-charcoal uppercase">
              Coupon code
            </label>
            {appliedCoupon ? (
              <div className="mt-2 flex items-center justify-between gap-3 border border-forest/30 bg-forest/5 px-3 py-2 text-sm">
                <span className="font-medium text-forest">{appliedCoupon}</span>
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="text-xs tracking-[0.12em] text-warm-gray uppercase hover:text-maroon"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="mt-2 flex gap-2">
                <input
                  value={couponInput}
                  onChange={(event) => setCouponInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      void handleApplyCoupon();
                    }
                  }}
                  placeholder="Enter code"
                  className="min-w-0 flex-1 border border-charcoal/15 bg-ivory px-3 py-2 text-sm uppercase outline-none focus:border-maroon"
                />
                <button
                  type="button"
                  onClick={() => void handleApplyCoupon()}
                  className="border border-maroon px-4 py-2 text-xs font-semibold tracking-[0.14em] text-maroon uppercase transition-colors hover:bg-maroon hover:text-ivory"
                >
                  Apply
                </button>
              </div>
            )}
            {couponMessage ? (
              <p
                className={`mt-2 text-xs ${
                  appliedCoupon ? "text-forest" : "text-maroon"
                }`}
              >
                {couponMessage}
              </p>
            ) : null}
          </div>

          <div className="mt-5 space-y-2 border-t border-charcoal/10 pt-5 text-sm">
            <div className="flex justify-between text-warm-gray">
              <span>Subtotal</span>
              <span>{formatPrice(quote?.subtotal ?? subtotal)}</span>
            </div>
            <div className="flex justify-between text-warm-gray">
              <span>Shipping</span>
              <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
            </div>
            {discount > 0 ? (
              <div className="flex justify-between text-forest">
                <span>Discount</span>
                <span>−{formatPrice(discount)}</span>
              </div>
            ) : null}
            <div className="flex justify-between font-medium text-maroon">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
            {quote?.freeShippingThreshold && shipping > 0 ? (
              <p className="pt-1 text-xs text-warm-gray">
                Add {formatPrice(quote.freeShippingThreshold - (quote.subtotal ?? 0))}{" "}
                more for free shipping.
              </p>
            ) : null}
            {quoteError ? (
              <p className="pt-1 text-xs text-maroon">{quoteError}</p>
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  );
}
