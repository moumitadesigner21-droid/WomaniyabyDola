"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { testimonials as defaultTestimonials } from "@/lib/data";

type Testimonial = { quote: string; name: string; city?: string; rating: number };

const AUTOPLAY_MS = 7000;
const ease = [0.22, 1, 0.36, 1] as const;

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex gap-1" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i < rating ? "fill-gold text-gold" : "text-ivory/25"}`}
        />
      ))}
    </span>
  );
}

export function Testimonials({
  items = defaultTestimonials,
}: {
  items?: readonly Testimonial[];
}) {
  const reducedMotion = useReducedMotion() ?? false;
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);
  const total = items.length;

  const go = useCallback(
    (index: number, dir: number) => {
      if (!total) return;
      setDirection(dir);
      setCurrent(((index % total) + total) % total);
    },
    [total],
  );

  useEffect(() => {
    if (paused || reducedMotion || total <= 1) return;
    const timer = window.setInterval(() => go(current + 1, 1), AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [current, go, paused, reducedMotion, total]);

  if (!total) return null;

  const t = items[current];
  const average =
    Math.round((items.reduce((sum, item) => sum + item.rating, 0) / total) * 10) / 10;

  const variants = {
    enter: (dir: number) => ({ opacity: 0, x: reducedMotion ? 0 : dir * 40 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: reducedMotion ? 0 : dir * -40 }),
  };

  return (
    <section
      id="testimonials"
      className="relative overflow-hidden bg-maroon-dark py-16 text-ivory lg:py-24"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, transparent 0 14px, rgba(250,247,242,0.9) 14px 15px), repeating-linear-gradient(-45deg, transparent 0 14px, rgba(250,247,242,0.9) 14px 15px)",
        }}
      />
      <div aria-hidden className="pointer-events-none absolute -left-24 top-1/3 h-80 w-80 rounded-full bg-gold/15 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-maroon/60 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center lg:gap-16 lg:px-8">
        <div>
          <p className="text-[10px] tracking-[0.28em] text-gold-light uppercase">Testimonials</p>
          <h2 className="mt-3 font-serif text-3xl leading-tight sm:text-4xl lg:text-5xl">
            Voices of Womania
          </h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-ivory/70">
            Real women, real occasions — from pandal evenings to pageant stages,
            wearing pieces made just for them.
          </p>

          <div className="mt-8 flex items-center gap-4">
            <span className="font-serif text-4xl text-gold-light">{average.toFixed(1)}</span>
            <span className="flex flex-col gap-1">
              <Stars rating={Math.round(average)} />
              <span className="text-xs text-ivory/60">
                average from {total} {total === 1 ? "story" : "stories"}
              </span>
            </span>
          </div>

          <Link
            href="/about-us#voices"
            className="mt-8 inline-flex min-h-[44px] items-center justify-center border border-gold/60 px-6 py-2.5 text-[11px] font-semibold tracking-[0.18em] text-gold-light uppercase transition-colors hover:bg-gold hover:text-charcoal"
          >
            See real photos &amp; stories
          </Link>
        </div>

        <div>
          <div className="relative border border-ivory/10 bg-ivory/[0.04] p-7 backdrop-blur-[2px] sm:p-10">
            <Quote
              aria-hidden
              className="absolute -top-5 left-7 h-10 w-10 fill-gold text-gold sm:left-10"
              strokeWidth={0}
            />

            <div className="relative min-h-[220px] sm:min-h-[200px]">
              <AnimatePresence mode="wait" custom={direction} initial={false}>
                <motion.figure
                  key={current}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.45, ease }}
                >
                  <Stars rating={t.rating} />
                  <blockquote className="mt-5 font-serif text-xl leading-relaxed text-ivory sm:text-2xl lg:text-[1.7rem] lg:leading-snug">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <figcaption className="mt-7 flex items-center gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold font-serif text-base text-charcoal">
                      {initials(t.name)}
                    </span>
                    <span>
                      <span className="block text-sm font-medium text-ivory">{t.name}</span>
                      {t.city ? (
                        <span className="block text-xs tracking-wide text-ivory/60">{t.city}</span>
                      ) : null}
                    </span>
                  </figcaption>
                </motion.figure>
              </AnimatePresence>
            </div>
          </div>

          {total > 1 ? (
            <div className="mt-6 flex items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                {items.map((item, i) => (
                  <button
                    key={item.name + i}
                    type="button"
                    aria-label={`Show story from ${item.name}`}
                    aria-current={i === current}
                    onClick={() => go(i, i > current ? 1 : -1)}
                    className={`flex h-9 w-9 items-center justify-center rounded-full border font-serif text-xs transition-all ${
                      i === current
                        ? "border-gold bg-gold text-charcoal"
                        : "border-ivory/20 text-ivory/70 hover:border-gold/60 hover:text-gold-light"
                    }`}
                  >
                    {initials(item.name)}
                  </button>
                ))}
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  aria-label="Previous testimonial"
                  onClick={() => go(current - 1, -1)}
                  className="flex h-10 w-10 items-center justify-center border border-ivory/20 text-ivory/80 transition-colors hover:border-gold hover:text-gold-light"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="Next testimonial"
                  onClick={() => go(current + 1, 1)}
                  className="flex h-10 w-10 items-center justify-center border border-ivory/20 text-ivory/80 transition-colors hover:border-gold hover:text-gold-light"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
