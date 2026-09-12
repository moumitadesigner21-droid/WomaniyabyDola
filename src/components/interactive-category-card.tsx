"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import {
  getCategoryPath,
  isCategorySlug,
} from "@/lib/categories";
import { collections, isExternalLink } from "@/lib/data";

export function InteractiveCategoryCard({
  item,
  productCount,
}: {
  item: (typeof collections)[number];
  productCount: number;
}) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const [shine, setShine] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);
  const reducedMotion = useReducedMotion();
  const count = productCount;
  const href = isCategorySlug(item.categoryKey)
    ? getCategoryPath(item.categoryKey)
    : item.href;

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

  return (
    <motion.div
      className="h-full"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      animate={{
        y: isHovered && !reducedMotion ? -10 : 0,
        scale: isHovered && !reducedMotion ? 1.02 : 1,
      }}
      transition={{ type: "spring", stiffness: 320, damping: 24 }}
    >
      <Link
        ref={cardRef}
        href={href}
        onMouseMove={handleMouseMove}
        className="group relative block aspect-[4/5] overflow-hidden rounded-2xl border border-charcoal/10 bg-charcoal/5 shadow-sm ring-1 ring-white/40 backdrop-blur-sm transition-[border-color,box-shadow] duration-500 hover:border-maroon/30 hover:shadow-[0_24px_56px_-16px_rgba(107,30,46,0.28)] sm:aspect-[3/4]"
        {...(isExternalLink(href)
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
      >
        <Image
          src={item.image}
          alt={item.title}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          sizes="(max-width: 640px) 50vw, 25vw"
        />

        {/* Glass tint */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-charcoal/25 transition-opacity duration-500 group-hover:from-white/30" />

        {/* Cursor shine */}
        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: `radial-gradient(circle at ${shine.x}% ${shine.y}%, rgba(255,255,255,0.5) 0%, transparent 55%)`,
          }}
        />

        {/* Bottom gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/35 to-transparent transition-opacity duration-500 group-hover:from-charcoal/95" />

        {/* Hover gold line */}
        <div className="absolute top-0 right-0 left-0 h-0.5 origin-left scale-x-0 bg-gold transition-transform duration-500 group-hover:scale-x-100" />

        <div className="absolute inset-x-0 bottom-0 p-4 transition-transform duration-500 group-hover:-translate-y-1 sm:p-5">
          <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-md transition-all duration-500 group-hover:border-white/35 group-hover:bg-white/20">
            <p className="text-[9px] tracking-[0.26em] text-gold-light uppercase sm:text-[10px]">
              {item.subtitle}
            </p>
            <div className="mt-1 flex items-end justify-between gap-2">
              <h3 className="font-serif text-xl leading-tight text-ivory sm:text-2xl">
                {item.title}
              </h3>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-ivory/30 bg-ivory/15 transition-all duration-300 group-hover:scale-110 group-hover:border-gold group-hover:bg-gold">
                <ArrowUpRight className="h-3.5 w-3.5 text-ivory transition-colors group-hover:text-charcoal" />
              </span>
            </div>
            <p className="mt-2 max-h-0 overflow-hidden text-[10px] tracking-wide text-ivory/75 opacity-0 transition-all duration-500 group-hover:max-h-6 group-hover:opacity-100">
              {count} {count === 1 ? "piece" : "pieces"} · Explore collection
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
