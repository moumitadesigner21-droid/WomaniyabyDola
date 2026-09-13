"use client";

import type { HeroSlide } from "@/lib/data";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

type HeroProps = {
  slides: HeroSlide[];
};

const SLIDE_DURATION = 7000;

const marqueeItems = [
  "Crafted with love in Jalpaiguri",
  "Handloom · Heritage · Modern",
  "Sarees · Gamcha · Dresses",
  "Designed by Dola",
  "Only at Womania",
  "Free shipping above ₹2,999",
];

function getContentVariants(reducedMotion: boolean | null): Variants {
  if (reducedMotion) {
    return {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0.01 } },
      exit: { opacity: 0, transition: { duration: 0.01 } },
    };
  }

  return {
    hidden: { opacity: 0, y: 16 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.15 + i * 0.06,
        duration: 0.55,
        ease: [0.22, 1, 0.36, 1],
      },
    }),
    exit: { opacity: 0, y: -8, transition: { duration: 0.2, ease: "easeIn" } },
  };
}

export function Hero({ slides }: HeroProps) {
  const activeSlides = [...slides]
    .filter((slide) => slide.active)
    .sort((a, b) => a.order - b.order);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  const touchStart = useRef<number | null>(null);
  const contentVariants = getContentVariants(prefersReducedMotion);

  const total = activeSlides.length;
  const current = activeSlides[currentIndex];

  const goTo = useCallback(
    (index: number) => {
      if (total === 0) return;
      setCurrentIndex(((index % total) + total) % total);
      setProgress(0);
    },
    [total],
  );

  const goNext = useCallback(
    () => goTo(currentIndex + 1),
    [currentIndex, goTo],
  );

  const goPrev = useCallback(
    () => goTo(currentIndex - 1),
    [currentIndex, goTo],
  );

  useEffect(() => {
    if (total <= 1 || prefersReducedMotion) return;

    const timer = window.setInterval(goNext, SLIDE_DURATION);
    return () => window.clearInterval(timer);
  }, [goNext, prefersReducedMotion, total]);

  useEffect(() => {
    if (prefersReducedMotion || total <= 1) return;

    // Progress is reset by the first animation frame below rather than a
    // synchronous setState here.
    const start = performance.now();
    let frame: number;

    const tick = (now: number) => {
      const elapsed = now - start;
      setProgress(Math.min((elapsed / SLIDE_DURATION) * 100, 100));
      if (elapsed < SLIDE_DURATION) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [currentIndex, prefersReducedMotion, total]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (total <= 1) return;
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goPrev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        goNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goNext, goPrev, total]);

  const handleTouchStart = (event: React.TouchEvent) => {
    touchStart.current = event.touches[0].clientX;
  };

  const handleTouchEnd = (event: React.TouchEvent) => {
    if (touchStart.current === null || total <= 1) return;
    const diff = touchStart.current - event.changedTouches[0].clientX;
    if (Math.abs(diff) > 48) {
      if (diff > 0) goNext();
      else goPrev();
    }
    touchStart.current = null;
  };

  if (!current) return null;

  const slideNumber = String(currentIndex + 1).padStart(2, "0");
  const totalNumber = String(total).padStart(2, "0");
  const imageAlt = `${current.eyebrow} — ${current.title}`;

  const imageTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.7, ease: [0.4, 0, 0.2, 1] as const };

  return (
    <section
      id="hero"
      aria-roledescription="carousel"
      aria-label="Featured collections"
      className="hero-grain relative overflow-hidden bg-ivory"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Ambient gradient mesh */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        <div className="absolute -top-32 -right-32 h-[480px] w-[480px] rounded-full bg-maroon/6 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-[400px] w-[400px] rounded-full bg-gold/8 blur-3xl" />
        <div className="absolute top-1/2 left-1/3 h-px w-1/2 -translate-y-1/2 rotate-[-8deg] bg-gradient-to-r from-transparent via-maroon/10 to-transparent" />
      </div>

      {/* Progress bar */}
      {total > 1 && (
        <div className="absolute top-0 right-0 left-0 z-20 h-[2px] bg-charcoal/6">
          <motion.div
            className="h-full origin-left bg-maroon"
            style={{ width: `${progress}%` }}
            transition={{ duration: 0.1, ease: "linear" }}
          />
        </div>
      )}

      <div className="relative mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <div className="grid items-center gap-8 py-10 sm:py-12 lg:min-h-[calc(100svh-8.75rem)] lg:grid-cols-[1fr_1.05fr] lg:gap-12 lg:py-16 xl:gap-16">
          {/* Content column */}
          <div className="relative order-2 flex flex-col justify-center lg:order-1">
            {/* Decorative slide number */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -top-6 -left-2 font-serif text-[7rem] leading-none text-maroon/[0.06] select-none sm:text-[9rem] lg:-top-10 lg:-left-4 lg:text-[11rem]"
            >
              {slideNumber}
            </span>

            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={currentIndex}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="relative max-w-xl"
              >
                <motion.p
                  custom={0}
                  variants={contentVariants}
                  className="inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.28em] text-maroon uppercase"
                >
                  <span className="h-px w-6 bg-gold" />
                  {current.eyebrow}
                </motion.p>

                <motion.h1
                  custom={1}
                  variants={contentVariants}
                  className="mt-4 font-serif text-[2.35rem] leading-[1.05] tracking-[-0.02em] text-charcoal sm:text-5xl lg:text-[3.5rem] xl:text-[3.85rem]"
                >
                  {current.title}
                </motion.h1>

                <motion.p
                  custom={2}
                  variants={contentVariants}
                  className="mt-5 max-w-md text-base leading-relaxed text-warm-gray sm:text-[1.05rem]"
                >
                  {current.description}
                </motion.p>

                <motion.div
                  custom={3}
                  variants={contentVariants}
                  className="mt-7 flex flex-wrap items-center gap-4 lg:mt-8"
                >
                  <Link
                    href={current.primaryButtonUrl}
                    className="group inline-flex min-h-[50px] items-center justify-center gap-2 bg-maroon px-7 py-3 text-[11px] font-semibold tracking-[0.18em] text-ivory uppercase transition-colors hover:bg-maroon-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-maroon"
                  >
                    {current.primaryButtonText}
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </Link>
                  <Link
                    href={current.secondaryButtonUrl}
                    className="text-[11px] font-medium tracking-[0.16em] text-charcoal/70 uppercase transition-colors hover:text-maroon"
                  >
                    {current.secondaryButtonText} →
                  </Link>
                </motion.div>

                <motion.p
                  custom={4}
                  variants={contentVariants}
                  className="mt-6 text-[10px] tracking-[0.22em] text-warm-gray/80 uppercase"
                >
                  {current.meta}
                </motion.p>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            {total > 1 && (
              <div
                className="mt-10 flex items-center gap-4 border-t border-charcoal/8 pt-6 lg:mt-12"
                role="group"
                aria-label="Slide navigation"
              >
                <button
                  type="button"
                  onClick={goPrev}
                  aria-label="Previous slide"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-charcoal/15 text-charcoal/60 transition-colors hover:border-maroon hover:text-maroon"
                >
                  <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
                </button>

                <span
                  aria-live="polite"
                  aria-atomic="true"
                  className="text-[11px] tabular-nums tracking-[0.14em] text-warm-gray"
                >
                  {slideNumber}
                  <span className="text-charcoal/25"> / </span>
                  {totalNumber}
                </span>

                <button
                  type="button"
                  onClick={goNext}
                  aria-label="Next slide"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-charcoal/15 text-charcoal/60 transition-colors hover:border-maroon hover:text-maroon"
                >
                  <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
                </button>
              </div>
            )}
          </div>

          {/* Image column */}
          <div className="relative order-1 lg:order-2">
            {/* Vertical brand watermark */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-8 -left-6 hidden origin-center -rotate-90 text-[10px] font-bold tracking-[0.5em] text-charcoal/8 uppercase select-none lg:block"
            >
              Womania by Dola
            </span>

            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Offset gold frame */}
              <div
                aria-hidden="true"
                className="hero-image-shell absolute inset-0 translate-x-3 translate-y-3 border-2 border-gold/50 lg:translate-x-5 lg:translate-y-5"
              />

              {/* Main image */}
              <div className="hero-image-shell relative aspect-[3/4] overflow-hidden bg-charcoal/5 shadow-[0_32px_64px_-16px_rgba(107,30,46,0.18)]">
                <AnimatePresence mode="sync" initial={false}>
                  <motion.div
                    key={currentIndex}
                    className="absolute inset-0"
                    initial={
                      prefersReducedMotion
                        ? false
                        : { opacity: 0, scale: 1.04 }
                    }
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 1, transition: { duration: imageTransition.duration } }}
                    transition={imageTransition}
                  >
                    <Image
                      src={current.desktopImage}
                      alt={imageAlt}
                      fill
                      priority={currentIndex === 0}
                      className="object-cover"
                      style={{
                        objectPosition: current.imagePosition ?? "center",
                      }}
                      sizes="(max-width: 1024px) 90vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal/25 via-transparent to-transparent" />
                  </motion.div>
                </AnimatePresence>

              </div>

              {/* Floating stat badge — top-right, clear of the large bottom-left curve */}
              {current.stat ? (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`stat-${currentIndex}`}
                    initial={prefersReducedMotion ? false : { opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.35 }}
                    className="absolute top-4 right-4 z-10 sm:top-5 sm:right-5 lg:top-6 lg:right-6"
                  >
                    <div className="inline-flex items-center gap-3 border border-ivory/30 bg-ivory/92 px-4 py-2.5 shadow-[0_12px_32px_-12px_rgba(44,44,44,0.35)] backdrop-blur-sm">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                      <span className="text-[11px] font-medium tracking-[0.12em] text-charcoal uppercase">
                        {current.stat}
                      </span>
                    </div>
                  </motion.div>
                </AnimatePresence>
              ) : null}
            </div>
          </div>
        </div>

        {/* Thumbnail filmstrip */}
        {total > 1 && (
          <div className="relative -mx-4 mb-2 sm:-mx-6 lg:mx-0 lg:mb-0">
            <div
              className="flex gap-2.5 overflow-x-auto px-4 pb-6 sm:gap-3 sm:px-6 lg:px-0 lg:pb-10"
              role="tablist"
              aria-label="Choose a look"
            >
              {activeSlides.map((slide, index) => (
                <button
                  key={slide.order}
                  type="button"
                  role="tab"
                  aria-selected={index === currentIndex}
                  aria-label={`Go to slide ${index + 1}: ${slide.title}`}
                  onClick={() => goTo(index)}
                  className={`group relative h-16 w-12 shrink-0 overflow-hidden transition-all duration-300 sm:h-20 sm:w-14 lg:h-24 lg:w-[4.5rem] ${
                    index === currentIndex
                      ? "ring-2 ring-maroon ring-offset-2 ring-offset-ivory"
                      : "opacity-50 hover:opacity-90"
                  }`}
                >
                  <Image
                    src={slide.desktopImage}
                    alt=""
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    style={{
                      objectPosition:
                        slide.thumbnailPosition ?? slide.imagePosition ?? "center",
                    }}
                    sizes="72px"
                  />
                  {index === currentIndex && (
                    <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gold" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Marquee strip */}
      <div className="overflow-hidden border-t border-charcoal/8 bg-charcoal py-3.5">
        <div className="animate-marquee flex w-max items-center gap-10 whitespace-nowrap">
          {[...marqueeItems, ...marqueeItems].map((item, index) => (
            <span
              key={`${item}-${index}`}
              className="flex items-center gap-10 text-[10px] font-medium tracking-[0.24em] text-ivory/50 uppercase"
            >
              {item}
              <span aria-hidden="true" className="text-gold/60">
                ✦
              </span>
            </span>
          ))}
        </div>
      </div>

      <div className="sr-only">
        {activeSlides.map((slide, index) => (
          <p key={slide.order} aria-hidden={index !== currentIndex}>
            {slide.title}
          </p>
        ))}
      </div>
    </section>
  );
}
