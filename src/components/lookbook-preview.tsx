"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { VoicesGalleryContent } from "@/lib/cms/content-schemas";

const ease = [0.22, 1, 0.36, 1] as const;

/** Photo wall of real customers, pulled from the About Us "Voices" gallery. */
export function LookbookPreview({ content }: { content: VoicesGalleryContent }) {
  const reducedMotion = useReducedMotion() ?? false;
  const photos = content.items.filter((item) => item.image).slice(0, 6);
  if (photos.length < 3) return null;

  // First photo gets the tall slot; the rest tile around it.
  // 4-col grid: tall tile spans two rows; the last tile is double-wide so
  // six photos fill both rows without a gap. On mobile (2 cols) the tall
  // tile is full width.
  const spans = ["row-span-2 col-span-2 sm:col-span-1", "", "", "", "", "col-span-2"];

  return (
    <section id="lookbook" className="relative overflow-hidden bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6 lg:mb-14">
          <div className="max-w-xl">
            <p className="text-[10px] tracking-[0.28em] text-gold uppercase">{content.eyebrow || "Voices of Womania"}</p>
            <h2 className="mt-3 font-serif text-3xl leading-tight text-maroon sm:text-4xl lg:text-5xl">
              {content.title || "Real women. Real stories."}
            </h2>
            {content.intro ? (
              <p className="mt-3 text-base leading-relaxed text-warm-gray">{content.intro}</p>
            ) : null}
          </div>
          <Link
            href="/about-us#voices"
            className="inline-flex items-center gap-2 border border-maroon/25 px-5 py-2.5 text-[10px] font-semibold tracking-[0.2em] text-maroon uppercase transition-colors hover:border-maroon hover:bg-maroon hover:text-ivory"
          >
            View the gallery
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid auto-rows-[180px] grid-cols-2 gap-3 sm:auto-rows-[220px] sm:grid-cols-4 lg:auto-rows-[260px]">
          {photos.map((photo, index) => (
            <motion.figure
              key={photo.id}
              initial={reducedMotion ? false : { opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: index * 0.07, ease }}
              className={`group relative overflow-hidden bg-ivory ${spans[index] ?? ""}`}
            >
              <Image
                src={photo.image}
                alt={photo.alt}
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, 25vw"
              />
              {photo.caption ? (
                <figcaption className="absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-charcoal/70 to-transparent px-4 pb-3 pt-10 text-xs tracking-wide text-ivory opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                  {photo.caption}
                </figcaption>
              ) : null}
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
