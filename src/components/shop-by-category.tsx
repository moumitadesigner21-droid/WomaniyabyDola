"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { collections as defaultCollections, isExternalLink } from "@/lib/data";

export type ShopCollectionItem = (typeof defaultCollections)[number];

const CARD_WIDTH = 260;
const CARD_GAP = 32;

function GlassCategoryCard({
  item,
  index,
  focusedIndex,
  total,
  onFocus,
  onBlur,
  reducedMotion,
}: {
  item: ShopCollectionItem;
  index: number;
  focusedIndex: number | null;
  total: number;
  onFocus: (index: number) => void;
  onBlur: () => void;
  reducedMotion: boolean | null;
}) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const [shine, setShine] = useState({ x: 50, y: 50 });

  const isFocused = focusedIndex === index;
  const hasFocus = focusedIndex !== null;
  const center = (total - 1) / 2;
  const offsetFromCenter = index - center;
  const focusedOffset = focusedIndex !== null ? index - focusedIndex : 0;

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      setShine({
        x: ((event.clientX - rect.left) / rect.width) * 100,
        y: ((event.clientY - rect.top) / rect.height) * 100,
      });
    },
    [],
  );

  const baseX = offsetFromCenter * (CARD_WIDTH * 0.55 + CARD_GAP * 0.4);
  const spreadX = hasFocus && !isFocused ? focusedOffset * 72 : 0;
  const baseRotate = offsetFromCenter * 4;
  const spreadRotate = hasFocus && !isFocused ? focusedOffset * 2.5 : 0;

  return (
    <motion.div
      className="absolute top-1/2 left-1/2"
      style={{
        width: CARD_WIDTH,
        zIndex: isFocused ? 50 : index + 1,
        marginLeft: -CARD_WIDTH / 2,
        marginTop: -CARD_WIDTH * 0.66,
      }}
      animate={{
        x: baseX + spreadX,
        y: isFocused ? -48 : hasFocus ? 12 + Math.abs(focusedOffset) * 6 : index * 6,
        rotate: isFocused ? 0 : baseRotate + spreadRotate,
        scale: isFocused ? 1.1 : hasFocus ? 0.88 : 1 - index * 0.02,
        filter: hasFocus && !isFocused ? "blur(3px)" : "blur(0px)",
        opacity: hasFocus && !isFocused ? 0.55 : 1,
      }}
      transition={
        reducedMotion
          ? { duration: 0.01 }
          : { type: "spring", stiffness: 260, damping: 26, mass: 0.8 }
      }
    >
      <Link
        ref={cardRef}
        href={item.href}
        onMouseEnter={() => onFocus(index)}
        onMouseLeave={onBlur}
        onFocus={() => onFocus(index)}
        onBlur={onBlur}
        onMouseMove={handleMouseMove}
        className="group relative block aspect-[3/4] overflow-hidden rounded-2xl border border-white/50 bg-white/15 shadow-[0_8px_32px_rgba(44,44,44,0.12)] ring-1 ring-white/30 backdrop-blur-xl transition-shadow duration-500 hover:shadow-[0_24px_64px_rgba(107,30,46,0.22)]"
        {...(isExternalLink(item.href)
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
      >
        <Image
          src={item.image}
          alt={item.title}
          fill
          className={`transition-transform duration-700 group-hover:scale-110 ${
            "portrait" in item && item.portrait
              ? "object-contain object-top p-1"
              : "object-cover"
          }`}
          style={
            "imagePosition" in item && item.imagePosition
              ? { objectPosition: item.imagePosition }
              : undefined
          }
          sizes="280px"
        />

        <div className="absolute inset-0 bg-gradient-to-br from-white/25 via-white/5 to-charcoal/30" />

        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: `radial-gradient(circle at ${shine.x}% ${shine.y}%, rgba(255,255,255,0.45) 0%, transparent 55%)`,
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/25 to-transparent" />

        <div className="absolute top-0 right-0 left-0 h-0.5 origin-left scale-x-0 bg-gold transition-transform duration-500 group-hover:scale-x-100" />

        <div className="absolute right-4 bottom-4 left-4">
          <div className="rounded-xl border border-white/25 bg-white/15 px-4 py-3 backdrop-blur-md transition-all duration-500 group-hover:border-white/40 group-hover:bg-white/25">
            <p className="text-[9px] tracking-[0.28em] text-gold-light uppercase">
              {item.subtitle}
            </p>
            <div className="mt-1 flex items-end justify-between gap-2">
              <h3 className="font-serif text-xl leading-tight text-ivory">
                {item.title}
              </h3>
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/20 transition-all duration-300 ${
                  isFocused
                    ? "scale-110 border-gold bg-gold"
                    : "scale-75 opacity-60"
                }`}
              >
                <ArrowUpRight
                  className={`h-3.5 w-3.5 transition-colors ${
                    isFocused ? "text-charcoal" : "text-ivory"
                  }`}
                />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function MobileCategoryCard({
  item,
}: {
  item: ShopCollectionItem;
}) {
  const isPortrait = "portrait" in item && item.portrait;

  return (
    <Link
      href={item.href}
      className={`group relative w-[72vw] max-w-[280px] shrink-0 snap-center overflow-hidden rounded-2xl border border-white/40 bg-white/10 shadow-lg ring-1 ring-white/20 backdrop-blur-lg ${
        isPortrait ? "aspect-[9/16]" : "aspect-[3/4]"
      }`}
      {...(isExternalLink(item.href)
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
    >
      <Image
        src={item.image}
        alt={item.title}
        fill
        className={
          isPortrait
            ? "object-contain object-top p-1"
            : "object-cover transition-transform duration-500 group-active:scale-105"
        }
        style={
          "imagePosition" in item && item.imagePosition
            ? { objectPosition: item.imagePosition }
            : undefined
        }
        sizes="80vw"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-charcoal/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/30 to-transparent" />
      <div className="absolute right-4 bottom-4 left-4">
        <div className="rounded-xl border border-white/20 bg-white/15 px-4 py-3 backdrop-blur-md">
          <p className="text-[9px] tracking-[0.25em] text-gold-light uppercase">
            {item.subtitle}
          </p>
          <h3 className="mt-1 font-serif text-xl text-ivory">{item.title}</h3>
        </div>
      </div>
    </Link>
  );
}

export function ShopByCategory({
  collections = defaultCollections,
}: {
  collections?: readonly ShopCollectionItem[];
}) {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const reducedMotion = useReducedMotion();

  return (
    <section id="collections" className="overflow-hidden bg-ivory py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center lg:mb-14">
          <p className="mb-3 text-xs tracking-[0.3em] text-gold uppercase">
            Browse Collections
          </p>
          <h2 className="font-serif text-3xl text-maroon sm:text-4xl">
            Shop by Category
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-warm-gray">
            Hover to explore — each category opens a world of handcrafted ethnic
            wear.
          </p>
        </div>

        <div
          className="relative mx-auto hidden h-[min(520px,58vh)] max-w-5xl lg:block"
          style={{ perspective: "1400px" }}
          onMouseLeave={() => setFocusedIndex(null)}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-maroon/8 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/3 rounded-full bg-gold/10 blur-3xl"
          />

          {collections.map((item, index) => (
            <GlassCategoryCard
              key={item.title}
              item={item}
              index={index}
              focusedIndex={focusedIndex}
              total={collections.length}
              onFocus={setFocusedIndex}
              onBlur={() => setFocusedIndex(null)}
              reducedMotion={reducedMotion}
            />
          ))}
        </div>

        <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-4 snap-x snap-mandatory scrollbar-none sm:-mx-6 sm:px-6 lg:hidden">
          {collections.map((item) => (
            <MobileCategoryCard key={item.title} item={item} />
          ))}
        </div>

        <p className="mt-6 hidden text-center text-[10px] tracking-[0.2em] text-warm-gray uppercase lg:block">
          Hover a card to bring it forward
        </p>

        <div className="mt-10 flex justify-center">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 border-b border-maroon pb-0.5 text-sm tracking-widest text-maroon uppercase transition-colors hover:text-maroon-dark"
          >
            View full shop
          </Link>
        </div>
      </div>
    </section>
  );
}
