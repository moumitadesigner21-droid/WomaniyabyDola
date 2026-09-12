"use client";

import { ChevronDown } from "lucide-react";
import {
  getPriceFilterLabel,
  getSortLabel,
  priceFilterOptions,
  sortOptions,
  type PriceFilterId,
  type SortOption,
} from "@/lib/product-filters";

interface ProductCatalogControlsProps {
  sort: SortOption;
  priceFilter: PriceFilterId;
  onSortChange: (sort: SortOption) => void;
  onPriceFilterChange: (filter: PriceFilterId) => void;
  layout?: "inline" | "sidebar";
}

function FilterSelect<T extends string>({
  label,
  value,
  options,
  onChange,
  fullWidth,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  fullWidth?: boolean;
}) {
  return (
    <label
      className={`flex flex-col gap-1.5 ${fullWidth ? "w-full" : "min-w-[10rem] flex-1 sm:min-w-[12rem] sm:flex-none"}`}
    >
      <span className="text-[10px] font-medium tracking-[0.18em] text-warm-gray uppercase">
        {label}
      </span>
      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value as T)}
          className="w-full appearance-none border border-charcoal/15 bg-white py-2.5 pr-9 pl-3 text-sm text-charcoal focus:border-maroon focus:outline-none"
          aria-label={label}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-warm-gray"
          aria-hidden
        />
      </div>
    </label>
  );
}

export function ProductCatalogControls({
  sort,
  priceFilter,
  onSortChange,
  onPriceFilterChange,
  layout = "inline",
}: ProductCatalogControlsProps) {
  const isSidebar = layout === "sidebar";

  return (
    <div
      className={
        isSidebar
          ? "space-y-4"
          : "flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end"
      }
    >
      <FilterSelect
        label="Sort by"
        value={sort}
        fullWidth={isSidebar}
        options={sortOptions.map((option) => ({
          value: option.value,
          label: option.label,
        }))}
        onChange={onSortChange}
      />
      <FilterSelect
        label="Price filter"
        value={priceFilter}
        fullWidth={isSidebar}
        options={priceFilterOptions.map((option) => ({
          value: option.id,
          label: option.label,
        }))}
        onChange={onPriceFilterChange}
      />
    </div>
  );
}

export function ActiveCatalogFilters({
  sort,
  priceFilter,
  onClearPrice,
  onClearSort,
  onClearAll,
}: {
  sort: SortOption;
  priceFilter: PriceFilterId;
  onClearPrice: () => void;
  onClearSort: () => void;
  onClearAll?: () => void;
}) {
  if (sort === "popularity" && priceFilter === "all") return null;

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <span className="text-[10px] tracking-[0.16em] text-warm-gray uppercase">
        Active:
      </span>
      {sort !== "popularity" ? (
        <button
          type="button"
          onClick={onClearSort}
          className="inline-flex items-center gap-1.5 rounded-full border border-charcoal/15 bg-white px-3 py-1 text-xs text-charcoal transition-colors hover:border-maroon/40 hover:text-maroon"
        >
          {getSortLabel(sort)}
          <span aria-hidden className="text-warm-gray">×</span>
        </button>
      ) : null}
      {priceFilter !== "all" ? (
        <button
          type="button"
          onClick={onClearPrice}
          className="inline-flex items-center gap-1.5 rounded-full border border-charcoal/15 bg-white px-3 py-1 text-xs text-charcoal transition-colors hover:border-maroon/40 hover:text-maroon"
        >
          {getPriceFilterLabel(priceFilter)}
          <span aria-hidden className="text-warm-gray">×</span>
        </button>
      ) : null}
      {onClearAll ? (
        <button
          type="button"
          onClick={onClearAll}
          className="text-xs text-maroon underline-offset-2 hover:underline"
        >
          Clear all
        </button>
      ) : null}
    </div>
  );
}
