"use client";

import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useState } from "react";
import { sortOptions, type SortOption } from "@/lib/product-filters";

export function SearchBox({
  value,
  onChange,
  placeholder = "Search products…",
  autoFocus,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  // Local draft so typing is instant; the URL updates after a short pause.
  const [draft, setDraft] = useState(value);
  const [synced, setSynced] = useState(value);
  if (value !== synced) {
    setSynced(value);
    setDraft(value);
  }

  useEffect(() => {
    if (draft === value) return;
    const timer = window.setTimeout(() => onChange(draft), 300);
    return () => window.clearTimeout(timer);
  }, [draft, value, onChange]);

  return (
    <div className="relative flex-1">
      <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-warm-gray" />
      <input
        type="search"
        value={draft}
        autoFocus={autoFocus}
        placeholder={placeholder}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") onChange(draft);
          if (event.key === "Escape") {
            setDraft("");
            onChange("");
          }
        }}
        className="h-11 w-full rounded-full border border-charcoal/15 bg-white pr-10 pl-10 text-sm text-charcoal placeholder:text-warm-gray/70 focus:border-maroon focus:outline-none [&::-webkit-search-cancel-button]:hidden"
        aria-label="Search products"
      />
      {draft ? (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => {
            setDraft("");
            onChange("");
          }}
          className="absolute top-1/2 right-3 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-warm-gray hover:bg-ivory hover:text-maroon"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </div>
  );
}

export function SortSelect({ value, onChange }: { value: SortOption; onChange: (sort: SortOption) => void }) {
  return (
    <label className="relative flex h-11 items-center rounded-full border border-charcoal/15 bg-white pl-4 text-sm text-charcoal focus-within:border-maroon">
      <span className="mr-1 hidden text-warm-gray sm:inline">Sort:</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as SortOption)}
        className="h-full cursor-pointer appearance-none bg-transparent pr-9 font-medium outline-none"
        aria-label="Sort products"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3.5 h-4 w-4 text-warm-gray" />
    </label>
  );
}

export function FiltersButton({ count, onClick }: { count: number; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-11 items-center gap-2 rounded-full border border-charcoal/15 bg-white px-4 text-sm font-medium text-charcoal transition-colors hover:border-maroon hover:text-maroon"
    >
      <SlidersHorizontal className="h-4 w-4" />
      Filters
      {count > 0 ? (
        <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-maroon px-1 text-[10px] font-semibold text-ivory">
          {count}
        </span>
      ) : null}
    </button>
  );
}
