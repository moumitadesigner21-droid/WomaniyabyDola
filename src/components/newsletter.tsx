"use client";

import { ArrowRight } from "lucide-react";
import { useState } from "react";

export function Newsletter() {
  const [email, setEmail] = useState("");

  return (
    <section className="py-16 lg:py-20 bg-maroon">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-gold-light text-xs tracking-[0.3em] uppercase mb-3">
          Stay Connected
        </p>
        <h2 className="font-serif text-2xl sm:text-3xl text-ivory mb-3">
          Join the Womania Circle
        </h2>
        <p className="text-ivory/70 text-sm sm:text-base mb-8">
          Early access to new collections &amp; 10% off your first order.
        </p>

        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            className="flex-1 px-4 py-3.5 bg-ivory/10 border border-ivory/20 text-ivory placeholder:text-ivory/50 focus:outline-none focus:border-gold text-sm"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gold text-charcoal text-sm font-medium tracking-wide uppercase hover:bg-gold-light transition-colors shrink-0"
          >
            Subscribe
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
        <p className="text-ivory/40 text-xs mt-4">
          Will be used in accordance with our Privacy Policy.
        </p>
      </div>
    </section>
  );
}
