"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Package, ShieldCheck, Sparkles, Truck } from "lucide-react";
import Link from "next/link";
import { howWeWorkSteps as defaultSteps } from "@/lib/data";

const icons = [Sparkles, ShieldCheck, Truck, Package];
const ease = [0.22, 1, 0.36, 1] as const;

type Step = { step: string; title: string; description: string; href: string };

function StepCard({
  step,
  index,
  total,
  reducedMotion,
}: {
  step: Step;
  index: number;
  total: number;
  reducedMotion: boolean;
}) {
  const Icon = icons[index % icons.length];
  const isLast = index === total - 1;

  return (
    <motion.li
      initial={reducedMotion ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay: index * 0.12, ease }}
      className="group relative flex gap-5 lg:block lg:pt-12"
    >
      {/* Vertical rail (mobile) */}
      {!isLast ? (
        <span
          aria-hidden
          className="absolute left-[23px] top-12 bottom-[-2.5rem] w-px bg-gradient-to-b from-gold/60 to-gold/0 lg:hidden"
        />
      ) : null}

      {/* Numbered medallion */}
      <span className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gold/50 bg-ivory font-serif text-lg text-maroon shadow-[0_0_0_6px_rgba(250,247,242,1)] transition-colors duration-500 group-hover:border-maroon group-hover:bg-maroon group-hover:text-ivory lg:absolute lg:left-0 lg:top-0">
        {step.step}
      </span>

      <div className="flex-1 lg:pl-1">
        <span className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-sm bg-maroon/[0.06] text-maroon transition-colors duration-500 group-hover:bg-gold/20">
          <Icon className="h-5 w-5" strokeWidth={1.5} />
        </span>
        <h3 className="font-serif text-xl text-charcoal lg:text-[1.35rem]">
          {step.title}
        </h3>
        <p className="mt-3 max-w-xs text-sm leading-relaxed text-warm-gray">
          {step.description}
        </p>
        {step.href ? (
          <Link
            href={step.href}
            className="mt-5 inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.2em] text-maroon uppercase transition-colors hover:text-gold"
          >
            Learn more
            <ArrowUpRight className="h-3 w-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        ) : null}
      </div>
    </motion.li>
  );
}

export function HowWeWork({
  steps = defaultSteps,
}: {
  steps?: readonly Step[];
}) {
  const reducedMotion = useReducedMotion() ?? false;
  const items = steps.slice(0, 4);

  return (
    <section className="relative overflow-hidden bg-ivory py-16 lg:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 20%, rgba(232,212,139,0.14) 0%, transparent 40%), radial-gradient(circle at 85% 80%, rgba(107,30,46,0.05) 0%, transparent 42%)",
        }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -right-10 top-10 select-none font-serif text-[11rem] leading-none text-maroon/[0.035] lg:text-[16rem]"
      >
        &amp;
      </span>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 grid gap-6 lg:mb-16 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-2xl">
            <p className="text-[10px] tracking-[0.28em] text-gold uppercase">How We Work</p>
            <h2 className="mt-3 font-serif text-3xl leading-tight text-maroon sm:text-4xl lg:text-5xl">
              From our studio in Jalpaiguri
              <span className="block italic text-charcoal/80">to your doorstep.</span>
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-warm-gray">
              Every piece is handpicked, checked by hand and packed with care — a
              simple, personal way to shop heritage wear.
            </p>
          </div>
          <Link
            href="/shop"
            className="inline-flex w-fit items-center gap-2 border border-maroon/25 px-5 py-2.5 text-[10px] font-semibold tracking-[0.2em] text-maroon uppercase transition-colors hover:border-maroon hover:bg-maroon hover:text-ivory"
          >
            Start shopping
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="relative">
          {/* Horizontal rail (desktop) */}
          <span
            aria-hidden
            className="pointer-events-none absolute left-6 right-6 top-6 hidden h-px bg-gradient-to-r from-gold/0 via-gold/60 to-gold/0 lg:block"
          />
          <ol
            className={`grid gap-10 lg:gap-8 ${
              items.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"
            }`}
          >
            {items.map((step, index) => (
              <StepCard
                key={step.step + step.title}
                step={step}
                index={index}
                total={items.length}
                reducedMotion={reducedMotion}
              />
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
