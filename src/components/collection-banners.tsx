"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const staggerOffsets = ["lg:translate-y-6", "", "lg:-translate-y-4"] as const;

export type CollectionBanner = {
  title: string;
  subtitle?: string;
  image: string;
  href: string;
  imagePosition?: string;
};

function CollectionBannerCard({
  banner,
  index,
}: {
  banner: CollectionBanner;
  index: number;
}) {
  const reducedMotion = useReducedMotion();
  const offset = staggerOffsets[index] ?? "";

  return (
    <motion.div
      className={`h-full w-[78vw] max-w-[320px] shrink-0 snap-center sm:w-auto sm:max-w-none ${offset}`}
      initial={reducedMotion ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        href={banner.href}
        className="group relative block overflow-hidden rounded-2xl bg-maroon/5 p-2 shadow-[0_8px_30px_-12px_rgba(107,30,46,0.25)] transition-shadow duration-500 hover:shadow-[0_24px_48px_-16px_rgba(107,30,46,0.4)] sm:p-2.5"
      >
        <div className="relative aspect-[4/5] overflow-hidden rounded-xl sm:aspect-[7/8]">
          <Image
            src={banner.image}
            alt={banner.title}
            fill
            className="object-cover transition-[transform,filter] duration-700 ease-out group-hover:scale-[1.06] group-hover:brightness-[1.03]"
            style={
              banner.imagePosition
                ? { objectPosition: banner.imagePosition }
                : undefined
            }
            sizes="(max-width: 640px) 78vw, (max-width: 1024px) 50vw, 33vw"
          />

          <div
            className="absolute inset-0 bg-gradient-to-br from-maroon/55 via-charcoal/15 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-90"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/35 to-transparent"
          />

          <span
            className="absolute top-3 left-3 font-serif text-3xl leading-none text-ivory/25 transition-colors duration-500 group-hover:text-gold/50 sm:top-4 sm:left-4 sm:text-4xl"
            aria-hidden
          >
            {String(index + 1).padStart(2, "0")}
          </span>

          <div className="absolute top-3 right-3 h-10 w-10 rounded-full border border-ivory/20 bg-ivory/10 opacity-0 backdrop-blur-sm transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100 sm:top-4 sm:right-4">
            <span className="flex h-full w-full items-center justify-center">
              <ArrowUpRight className="h-4 w-4 text-ivory" />
            </span>
          </div>

          <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 lg:p-6">
            <p className="mb-1.5 text-[9px] tracking-[0.22em] text-gold-light uppercase opacity-90">
              {banner.subtitle}
            </p>
            <h3 className="font-serif text-xl leading-tight text-ivory sm:text-2xl lg:text-[1.65rem]">
              {banner.title}
            </h3>
            <div className="mt-3 h-px w-0 bg-gold transition-all duration-500 group-hover:w-12" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function CollectionBanners({
  banners,
}: {
  banners: CollectionBanner[];
}) {
  return (
    <section className="relative overflow-hidden bg-ivory py-12 lg:py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, rgba(232,212,139,0.12) 0%, transparent 45%), radial-gradient(circle at 80% 70%, rgba(107,30,46,0.06) 0%, transparent 40%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4 lg:mb-10">
          <div>
            <p className="text-[10px] tracking-[0.28em] text-gold uppercase">
              See Our Collection
            </p>
            <h2 className="mt-2 font-serif text-2xl text-maroon sm:text-3xl">
              Curated for every mood
            </h2>
          </div>
          <Link
            href="/shop"
            className="shrink-0 text-[10px] tracking-[0.18em] text-maroon uppercase transition-colors hover:text-maroon-dark"
          >
            View all →
          </Link>
        </div>

        <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 snap-x snap-mandatory scrollbar-none sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3 lg:items-center lg:gap-6">
          {banners.map((banner, index) => (
            <CollectionBannerCard key={banner.title} banner={banner} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
