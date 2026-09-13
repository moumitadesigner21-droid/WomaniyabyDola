"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-ivory px-4">
      <div className="max-w-md text-center">
        <p className="text-xs tracking-[0.3em] text-gold uppercase">
          Something went wrong
        </p>
        <h1 className="mt-4 font-serif text-3xl text-maroon">
          We hit a snag loading this page
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-warm-gray">
          Please try again. If it keeps happening, message us on WhatsApp and
          we&apos;ll sort it out.
        </p>
        {error.digest ? (
          <p className="mt-2 font-mono text-[10px] text-warm-gray/70">
            Ref: {error.digest}
          </p>
        ) : null}
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-[44px] items-center justify-center bg-maroon px-8 py-3 text-xs font-semibold tracking-[0.18em] text-ivory uppercase transition-colors hover:bg-maroon-dark"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex min-h-[44px] items-center justify-center border border-charcoal/15 px-8 py-3 text-xs font-semibold tracking-[0.18em] text-charcoal uppercase transition-colors hover:border-maroon/40 hover:text-maroon"
          >
            Back Home
          </Link>
        </div>
      </div>
    </main>
  );
}
