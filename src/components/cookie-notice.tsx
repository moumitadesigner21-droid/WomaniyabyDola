"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const KEY = "womania-cookie-notice-v1";

/**
 * Informational notice: the site only sets strictly-necessary cookies (cart,
 * account session) and no trackers, so this is not a consent gate.
 */
export function CookieNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!window.localStorage.getItem(KEY)) {
        // Small delay so it doesn't compete with the hero on first paint.
        const timer = window.setTimeout(() => setVisible(true), 1200);
        return () => window.clearTimeout(timer);
      }
    } catch {
      // storage unavailable — stay hidden rather than nag every load
    }
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    try {
      window.localStorage.setItem(KEY, String(Date.now()));
    } catch {
      // ignore
    }
    setVisible(false);
  };

  return (
    <div
      role="region"
      aria-label="Cookie notice"
      className="fixed inset-x-3 top-3 z-[80] border border-charcoal/10 bg-ivory p-4 text-sm text-charcoal shadow-[0_20px_50px_-20px_rgba(44,44,44,0.35)] sm:inset-x-auto sm:top-auto sm:bottom-4 sm:left-4 sm:max-w-md"
    >
      <p className="leading-relaxed">
        We use only the cookies needed to run your cart and account — no advertising or tracking.{" "}
        <Link href="/policies#privacy" className="font-medium text-maroon underline-offset-2 hover:underline">
          Privacy policy
        </Link>
      </p>
      <button
        type="button"
        onClick={dismiss}
        className="mt-3 inline-flex min-h-[40px] items-center justify-center bg-maroon px-5 py-2 text-[11px] font-semibold tracking-[0.16em] text-ivory uppercase transition-colors hover:bg-maroon-dark"
      >
        Got it
      </button>
    </div>
  );
}
