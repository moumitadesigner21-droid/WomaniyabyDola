"use client";

import Image from "next/image";
import Link from "next/link";

export interface RailItem {
  key: string;
  label: string;
  href: string;
  count?: number;
  image?: string;
  active?: boolean;
}

/** Horizontally scrollable chips with round thumbnails; wraps on wide screens. */
export function CategoryRail({ items, label }: { items: RailItem[]; label: string }) {
  if (!items.length) return null;
  return (
    <nav aria-label={label} className="-mx-4 px-4 sm:mx-0 sm:px-0">
      <ul className="flex gap-2 overflow-x-auto pb-2 scrollbar-none sm:flex-wrap sm:overflow-visible sm:pb-0">
        {items.map((item) => (
          <li key={item.key} className="shrink-0">
            <Link
              href={item.href}
              scroll={false}
              prefetch={false}
              aria-current={item.active ? "page" : undefined}
              className={`flex items-center gap-2.5 rounded-full border py-1.5 pr-4 text-xs tracking-wide transition-colors ${
                item.image ? "pl-1.5" : "pl-4"
              } ${
                item.active
                  ? "border-maroon bg-maroon text-ivory"
                  : "border-charcoal/15 bg-white text-charcoal hover:border-maroon/50 hover:text-maroon"
              }`}
            >
              {item.image ? (
                <span className="relative h-8 w-8 overflow-hidden rounded-full bg-ivory">
                  <Image src={item.image} alt="" fill className="object-cover" sizes="32px" />
                </span>
              ) : null}
              <span className="font-medium">{item.label}</span>
              {typeof item.count === "number" ? (
                <span className={`text-[10px] ${item.active ? "text-ivory/70" : "text-warm-gray"}`}>{item.count}</span>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
