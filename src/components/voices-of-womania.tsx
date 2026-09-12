"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { VoiceCategory, VoicesSectionContent } from "@/lib/voices";
import { voiceCategoryLabels } from "@/lib/voices";

const filters: Array<VoiceCategory | "all"> = [
  "all",
  "client",
  "pageant",
  "intern",
  "studio",
];

export function VoicesOfWomania({ content }: { content: VoicesSectionContent }) {
  const [active, setActive] = useState<VoiceCategory | "all">("all");

  const items = useMemo(() => {
    if (active === "all") return content.items;
    return content.items.filter((item) => item.category === active);
  }, [active, content.items]);

  return (
    <section
      id="voices"
      className="scroll-mt-36 border-t border-charcoal/8 bg-ivory py-16 lg:scroll-mt-40 lg:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-xs tracking-[0.3em] text-gold uppercase">
            {content.eyebrow}
          </p>
          <h2 className="font-serif text-3xl text-maroon sm:text-4xl">
            {content.title}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-warm-gray">
            {content.intro}
          </p>
        </div>

        <div
          className="mt-10 flex flex-wrap items-center justify-center gap-2"
          role="tablist"
          aria-label="Filter voices gallery"
        >
          {filters.map((filter) => {
            const isActive = active === filter;
            return (
              <button
                key={filter}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActive(filter)}
                className={`min-h-[40px] rounded-full px-4 py-2 text-[11px] font-semibold tracking-[0.12em] uppercase transition-colors ${
                  isActive
                    ? "bg-maroon text-ivory"
                    : "border border-maroon/15 bg-white text-maroon hover:border-maroon/35"
                }`}
              >
                {voiceCategoryLabels[filter]}
              </button>
            );
          })}
        </div>

        <ul className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <li
              key={item.id}
              className="group relative overflow-hidden rounded-xl border border-charcoal/8 bg-white shadow-sm"
            >
              <div className="relative aspect-[3/4] overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.alt}
                  fill
                  className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-charcoal/75 via-charcoal/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  aria-hidden
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <span className="inline-block rounded-full bg-ivory/95 px-2.5 py-1 text-[10px] font-semibold tracking-[0.1em] text-maroon uppercase">
                    {voiceCategoryLabels[item.category]}
                  </span>
                  {item.caption ? (
                    <p className="mt-2 text-xs leading-snug text-ivory">
                      {item.caption}
                    </p>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>

        {items.length === 0 ? (
          <p className="mt-8 text-center text-sm text-warm-gray">
            No photos in this category yet.
          </p>
        ) : null}
      </div>
    </section>
  );
}
