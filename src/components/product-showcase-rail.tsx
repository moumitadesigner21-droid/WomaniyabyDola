"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, type LucideIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { getProductPath } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";

export type ShowcaseRailItem = {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  imagePosition?: string;
  description?: string;
  tag: string;
  accent: string;
};

export function ProductShowcaseRail({
  id,
  eyebrowIcon: EyebrowIcon,
  eyebrow,
  title,
  intro,
  stats,
  items,
  cta,
}: {
  id?: string;
  eyebrowIcon?: LucideIcon;
  eyebrow: string;
  title: string;
  intro: ReactNode;
  stats?: {
    primary: { value: string; label: string };
    secondary: { value: string; label: string };
  };
  items: ShowcaseRailItem[];
  cta?: { href: string; label: string };
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const reducedMotion = useReducedMotion();
  const active = items[activeIndex] ?? items[0];

  if (!items.length || !active) return null;

  return (
    <section
      id={id}
      className="relative scroll-mt-36 overflow-hidden bg-charcoal py-16 lg:scroll-mt-40 lg:py-24"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, #faf7f2 0, #faf7f2 1px, transparent 1px, transparent 28px), repeating-linear-gradient(0deg, #faf7f2 0, #faf7f2 1px, transparent 1px, transparent 28px)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 right-0 h-96 w-96 rounded-full bg-maroon/25 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 rounded-full bg-gold/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 grid gap-8 lg:mb-14 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-ivory/15 bg-ivory/5 px-3 py-1.5 text-[10px] tracking-[0.28em] text-gold-light uppercase">
              {EyebrowIcon ? <EyebrowIcon className="h-3.5 w-3.5" /> : null}
              {eyebrow}
            </div>
            <h2 className="font-serif text-3xl text-ivory sm:text-4xl lg:text-5xl">
              {title}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ivory/70 lg:text-lg">
              {intro}
            </p>
          </div>
          {stats ? (
            <div className="flex items-center gap-6 text-ivory/60">
              <div>
                <p className="font-serif text-3xl text-gold">{stats.primary.value}</p>
                <p className="text-[10px] tracking-[0.2em] uppercase">
                  {stats.primary.label}
                </p>
              </div>
              <div className="h-10 w-px bg-ivory/15" />
              <div>
                <p className="font-serif text-3xl text-gold">
                  {stats.secondary.value}
                </p>
                <p className="text-[10px] tracking-[0.2em] uppercase">
                  {stats.secondary.label}
                </p>
              </div>
            </div>
          ) : null}
        </div>

        <div className="hidden h-[min(600px,72vh)] gap-2 lg:flex">
          {items.map((product, index) => {
            const isActive = activeIndex === index;
            return (
              <motion.button
                key={product.id}
                type="button"
                onMouseEnter={() => setActiveIndex(index)}
                onFocus={() => setActiveIndex(index)}
                onClick={() => setActiveIndex(index)}
                className="group relative min-w-0 overflow-hidden rounded-2xl border border-ivory/10 bg-charcoal/60 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                animate={{
                  flex: isActive ? 4.5 : 1.15,
                }}
                transition={
                  reducedMotion
                    ? { duration: 0.01 }
                    : { type: "spring", stiffness: 220, damping: 28 }
                }
              >
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-contain object-center p-1 transition-transform duration-700"
                  style={{
                    objectPosition: product.imagePosition ?? "center top",
                  }}
                  sizes={isActive ? "50vw" : "12vw"}
                  priority={index === 0}
                />
                <div
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-[30%]"
                  style={{
                    background: isActive
                      ? `linear-gradient(to top, ${product.accent}d9 0%, rgba(44,44,44,0.55) 65%, transparent 100%)`
                      : "linear-gradient(to top, rgba(44,44,44,0.75) 0%, rgba(44,44,44,0.2) 70%, transparent 100%)",
                  }}
                />
                {!isActive && (
                  <div className="pointer-events-none absolute inset-0 bg-charcoal/10" />
                )}

                <div className="absolute inset-x-0 bottom-0 p-4 lg:p-5">
                  <span
                    className="inline-block rounded-full px-2.5 py-1 text-[9px] font-semibold tracking-[0.18em] uppercase"
                    style={{
                      backgroundColor: `${product.accent}33`,
                      color: isActive ? "#faf7f2" : "#e8d48b",
                      border: `1px solid ${product.accent}55`,
                    }}
                  >
                    {product.tag}
                  </span>
                  <h3
                    className={`mt-2 font-serif leading-snug text-ivory ${
                      isActive
                        ? "text-xl lg:text-2xl"
                        : "text-sm [writing-mode:vertical-rl] rotate-180"
                    }`}
                  >
                    {product.name}
                  </h3>
                  {isActive && (
                    <motion.div
                      initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 space-y-3"
                    >
                      {product.description && (
                        <p className="max-w-md text-xs leading-relaxed text-ivory/75">
                          {product.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-lg font-medium text-gold-light">
                          {formatPrice(product.price)}
                        </p>
                        <Link
                          href={getProductPath(product.slug)}
                          className="inline-flex items-center gap-1.5 bg-ivory px-4 py-2 text-[10px] font-semibold tracking-[0.16em] text-charcoal uppercase transition-colors hover:bg-gold-light"
                          onClick={(e) => e.stopPropagation()}
                        >
                          View Product
                          <ArrowUpRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        <div className="lg:hidden">
          <div className="relative mx-auto mb-6 aspect-[9/16] max-h-[min(72vh,640px)] w-full max-w-sm overflow-hidden rounded-2xl border border-ivory/10 bg-charcoal/50">
            <Image
              src={active.image}
              alt={active.name}
              fill
              className="object-contain object-center"
              style={{ objectPosition: active.imagePosition ?? "center top" }}
              sizes="100vw"
              priority
            />
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-[38%]"
              style={{
                background: `linear-gradient(to top, ${active.accent}e6 0%, rgba(44,44,44,0.55) 55%, transparent 100%)`,
              }}
            />
            <div className="absolute right-4 bottom-4 left-4">
              <span className="rounded-full border border-ivory/25 bg-ivory/10 px-2.5 py-1 text-[9px] tracking-[0.18em] text-ivory uppercase">
                {active.tag}
              </span>
              <h3 className="mt-2 font-serif text-2xl text-ivory">{active.name}</h3>
              {active.description && (
                <p className="mt-2 text-xs leading-relaxed text-ivory/80">
                  {active.description}
                </p>
              )}
              <div className="mt-3 flex items-center justify-between">
                <p className="text-lg font-medium text-gold-light">
                  {formatPrice(active.price)}
                </p>
                <Link
                  href={getProductPath(active.slug)}
                  className="inline-flex items-center gap-1 bg-ivory px-4 py-2 text-[10px] font-semibold tracking-[0.16em] text-charcoal uppercase"
                >
                  View Product
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>

          <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
            {items.map((product, index) => (
              <button
                key={product.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`relative h-28 w-[4.5rem] shrink-0 overflow-hidden rounded-lg border-2 bg-charcoal/40 transition-colors ${
                  index === activeIndex
                    ? "border-gold"
                    : "border-ivory/15 opacity-70"
                }`}
              >
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-contain object-top p-0.5"
                  style={{
                    objectPosition: product.imagePosition ?? "center top",
                  }}
                  sizes="72px"
                />
              </button>
            ))}
          </div>
        </div>

        {cta ? (
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4 lg:mt-12">
            <Link
              href={cta.href}
              className="inline-flex min-h-[50px] items-center justify-center gap-2 bg-gold px-8 py-3.5 text-[11px] font-semibold tracking-[0.18em] text-charcoal uppercase transition-colors hover:bg-gold-light"
            >
              {cta.label}
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
