"use client";

import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { getProductPath } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";

export function CartContent() {
  const { items, subtotal, itemCount, updateQuantity, removeItem } = useCart();

  if (itemCount === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <ShoppingBag className="mx-auto h-10 w-10 text-maroon/60" />
        <h1 className="mt-6 font-serif text-3xl text-maroon">Your cart is empty</h1>
        <p className="mt-3 text-warm-gray">
          Browse the collection and add pieces you love.
        </p>
        <Link
          href="/shop"
          className="mt-8 inline-flex min-h-[44px] items-center justify-center bg-maroon px-8 py-3 text-xs font-semibold tracking-[0.18em] text-ivory uppercase transition-colors hover:bg-maroon-dark"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-serif text-3xl text-maroon sm:text-4xl">Shopping Cart</h1>
      <p className="mt-2 text-sm text-warm-gray">
        {itemCount} item{itemCount === 1 ? "" : "s"} in your bag
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_320px]">
        <ul className="space-y-5">
          {items.map((item) => (
            <li
              key={item.lineId}
              className="flex gap-4 border border-charcoal/10 bg-white p-4 sm:gap-5 sm:p-5"
            >
              <Link
                href={getProductPath(item.slug)}
                className="relative h-28 w-24 shrink-0 overflow-hidden bg-ivory sm:h-32 sm:w-28"
              >
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-contain object-center p-1"
                  sizes="112px"
                />
              </Link>

              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] tracking-[0.2em] text-warm-gray uppercase">
                      {item.category}
                    </p>
                    <Link
                      href={getProductPath(item.slug)}
                      className="mt-1 block font-serif text-lg leading-snug text-charcoal transition-colors hover:text-maroon"
                    >
                      {item.name}
                    </Link>
                    {item.size ? (
                      <p className="mt-1 text-xs text-warm-gray">Size: {item.size}</p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    aria-label={`Remove ${item.name} from cart`}
                    onClick={() => removeItem(item.lineId)}
                    className="text-charcoal/50 transition-colors hover:text-maroon"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-auto flex items-end justify-between pt-4">
                  <div className="inline-flex items-center border border-charcoal/15">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      onClick={() => updateQuantity(item.lineId, item.quantity - 1)}
                      className="flex h-9 w-9 items-center justify-center text-charcoal hover:bg-ivory"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="min-w-[2rem] text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      aria-label="Increase quantity"
                      onClick={() => updateQuantity(item.lineId, item.quantity + 1)}
                      className="flex h-9 w-9 items-center justify-center text-charcoal hover:bg-ivory"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="font-medium text-maroon">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="h-fit border border-charcoal/10 bg-white p-6">
          <h2 className="text-xs font-semibold tracking-[0.2em] text-charcoal uppercase">
            Order Summary
          </h2>
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-warm-gray">Subtotal</span>
            <span className="font-medium text-charcoal">{formatPrice(subtotal)}</span>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-warm-gray">
            Shipping and payment details are confirmed on checkout.
          </p>
          <Link
            href="/checkout"
            className="mt-6 inline-flex min-h-[46px] w-full items-center justify-center gap-2 bg-maroon px-4 py-3 text-xs font-semibold tracking-[0.16em] text-ivory uppercase transition-colors hover:bg-maroon-dark"
          >
            <ShoppingBag className="h-4 w-4" />
            Proceed to Checkout
          </Link>
          <Link
            href="/shop"
            className="mt-3 inline-flex min-h-[44px] w-full items-center justify-center border border-charcoal/15 px-4 py-3 text-xs font-semibold tracking-[0.16em] text-charcoal uppercase transition-colors hover:border-maroon/40 hover:text-maroon"
          >
            Continue Shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}
