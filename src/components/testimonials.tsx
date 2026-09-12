"use client";

import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { testimonials as defaultTestimonials } from "@/lib/data";

export function Testimonials({
  items = defaultTestimonials,
}: {
  items?: typeof defaultTestimonials;
}) {
  const [current, setCurrent] = useState(0);

  const prev = () =>
    setCurrent((c) => (c === 0 ? items.length - 1 : c - 1));
  const next = () =>
    setCurrent((c) => (c === items.length - 1 ? 0 : c + 1));

  const t = items[current];

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-gold text-xs tracking-[0.3em] uppercase mb-3">
          Testimonials
        </p>
        <h2 className="font-serif text-3xl sm:text-4xl text-maroon mb-12">
          Voices of Womania
        </h2>

        <div className="relative">
          <div className="flex justify-center gap-1 mb-6">
            {Array.from({ length: t.rating }).map((_, i) => (
              <Star
                key={i}
                className="w-4 h-4 fill-gold text-gold"
              />
            ))}
          </div>
          <blockquote className="font-serif text-xl sm:text-2xl lg:text-3xl text-charcoal leading-relaxed mb-8 min-h-[120px] sm:min-h-[100px]">
            &ldquo;{t.quote}&rdquo;
          </blockquote>
          <p className="text-maroon font-medium">{t.name}</p>
          <p className="text-warm-gray text-sm mt-1">{t.city}</p>
        </div>

        <div className="flex justify-center gap-4 mt-10">
          <button
            type="button"
            aria-label="Previous testimonial"
            onClick={prev}
            className="w-10 h-10 border border-maroon/20 flex items-center justify-center text-maroon hover:bg-maroon hover:text-ivory transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to testimonial ${i + 1}`}
                onClick={() => setCurrent(i)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === current ? "bg-gold" : "bg-maroon/20"
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            aria-label="Next testimonial"
            onClick={next}
            className="w-10 h-10 border border-maroon/20 flex items-center justify-center text-maroon hover:bg-maroon hover:text-ivory transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <Link
          href="/about-us#voices"
          className="mt-10 inline-flex min-h-[44px] items-center justify-center border border-maroon/20 px-6 py-2.5 text-[11px] font-semibold tracking-[0.16em] text-maroon uppercase transition-colors hover:bg-maroon hover:text-ivory"
        >
          See real photos & stories
        </Link>
      </div>
    </section>
  );
}
