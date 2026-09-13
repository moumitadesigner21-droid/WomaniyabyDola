"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import {
  priceFilterOptions,
  sortOptions,
  type CatalogFilters,
  type PriceFilterId,
  type SortOption,
} from "@/lib/product-filters";

export interface FilterLink {
  key: string;
  label: string;
  href: string;
  count?: number;
  active?: boolean;
}

interface FilterPanelProps {
  filters: CatalogFilters;
  onSort: (sort: SortOption) => void;
  onPrice: (price: PriceFilterId) => void;
  onInStock: (value: boolean) => void;
  onSale: (value: boolean) => void;
  /** Category (shop) or subcategory (category page) links. */
  links?: { title: string; items: FilterLink[] };
  /** Show the sort group (hidden in the desktop sidebar where the toolbar has it). */
  showSort?: boolean;
  onNavigate?: () => void;
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-charcoal/10 pb-5">
      <h3 className="mb-3 text-[10px] font-semibold tracking-[0.22em] text-charcoal uppercase">{title}</h3>
      {children}
    </section>
  );
}

function Radio({
  checked,
  label,
  count,
  onSelect,
}: {
  checked: boolean;
  label: string;
  count?: number;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      onClick={onSelect}
      className="flex w-full items-center gap-3 py-1.5 text-left text-sm text-charcoal transition-colors hover:text-maroon"
    >
      <span
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
          checked ? "border-maroon bg-maroon" : "border-charcoal/30 bg-white"
        }`}
      >
        {checked ? <span className="h-1.5 w-1.5 rounded-full bg-ivory" /> : null}
      </span>
      <span className="flex-1">{label}</span>
      {typeof count === "number" ? <span className="text-xs text-warm-gray">{count}</span> : null}
    </button>
  );
}

function Checkbox({ checked, label, onChange }: { checked: boolean; label: string; onChange: (value: boolean) => void }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center gap-3 py-1.5 text-left text-sm text-charcoal transition-colors hover:text-maroon"
    >
      <span className={`flex h-4 w-4 shrink-0 items-center justify-center border ${checked ? "border-maroon bg-maroon text-ivory" : "border-charcoal/30 bg-white"}`}>
        {checked ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
      </span>
      {label}
    </button>
  );
}

export function FilterPanel({ filters, onSort, onPrice, onInStock, onSale, links, showSort = false, onNavigate }: FilterPanelProps) {
  return (
    <div className="space-y-5">
      {links?.items.length ? (
        <Group title={links.title}>
          <ul className="space-y-0.5">
            {links.items.map((item) => (
              <li key={item.key}>
                <Link
                  href={item.href}
                  scroll={false}
                  prefetch={false}
                  onClick={onNavigate}
                  aria-current={item.active ? "page" : undefined}
                  className={`flex items-center justify-between gap-3 py-1.5 text-sm transition-colors ${
                    item.active ? "font-medium text-maroon" : "text-charcoal hover:text-maroon"
                  }`}
                >
                  <span>{item.label}</span>
                  {typeof item.count === "number" ? <span className="text-xs text-warm-gray">{item.count}</span> : null}
                </Link>
              </li>
            ))}
          </ul>
        </Group>
      ) : null}

      {showSort ? (
        <Group title="Sort by">
          <div role="radiogroup">
            {sortOptions.map((option) => (
              <Radio key={option.value} checked={filters.sort === option.value} label={option.label} onSelect={() => onSort(option.value)} />
            ))}
          </div>
        </Group>
      ) : null}

      <Group title="Price">
        <div role="radiogroup">
          {priceFilterOptions.map((option) => (
            <Radio key={option.id} checked={filters.price === option.id} label={option.label} onSelect={() => onPrice(option.id)} />
          ))}
        </div>
      </Group>

      <Group title="Availability">
        <Checkbox checked={filters.inStockOnly} label="In stock only" onChange={onInStock} />
        <Checkbox checked={filters.onSaleOnly} label="On sale" onChange={onSale} />
      </Group>
    </div>
  );
}
