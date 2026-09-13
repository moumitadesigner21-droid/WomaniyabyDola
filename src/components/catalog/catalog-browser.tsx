"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CategoryRail, type RailItem } from "@/components/catalog/category-rail";
import { FilterPanel } from "@/components/catalog/filter-panel";
import { FiltersButton, SearchBox, SortSelect } from "@/components/catalog/catalog-toolbar";
import { ProductCard } from "@/components/product-card";
import { ProductPagination } from "@/components/product-pagination";
import {
  categories,
  getCategoryLabel,
  getCategoryPath,
  getProductCountByCategory,
  resolveProductSubcategory,
  type CategorySlug,
} from "@/lib/categories";
import { collections, type Product } from "@/lib/data";
import { resolveGamchaSubcategory } from "@/lib/gamcha";
import {
  applyCatalogFilters,
  countActiveFilters,
  getPriceFilterLabel,
  getSortLabel,
  paginateProducts,
} from "@/lib/product-filters";
import { useCatalogQueryParams } from "@/lib/use-catalog-query";

interface CatalogBrowserProps {
  /** Products shown in this view (all, one category, or one subcategory). */
  products: Product[];
  /** Full catalog, for category counts on the shop page. */
  allProducts?: Product[];
  category?: CategorySlug;
  subcategory?: string;
  /** All products of the category, for subcategory counts. */
  categoryProducts?: Product[];
}

const collectionImages = new Map<string, string>(
  collections.map((item) => [String(item.categoryKey), item.image]),
);

export function CatalogBrowser({ products, allProducts, category, subcategory, categoryProducts }: CatalogBrowserProps) {
  const { filters, page, setSort, setPriceFilter, setInStockOnly, setOnSaleOnly, setQuery, setPage, clearFilters } =
    useCatalogQueryParams();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const results = useMemo(
    () => applyCatalogFilters(products, filters, (product) => getCategoryLabel(product.category)),
    [products, filters],
  );
  const pagination = useMemo(() => paginateProducts(results, page), [results, page]);

  // Category chips (shop) or subcategory chips (category page).
  const rail: RailItem[] = useMemo(() => {
    const suffix = filters.query ? `?q=${encodeURIComponent(filters.query)}` : "";
    if (!category) {
      const pool = allProducts ?? products;
      return [
        { key: "all", label: "All", href: `/shop${suffix}`, count: pool.length, active: true },
        ...categories
          .map((item) => ({
            key: item.slug,
            label: item.name,
            href: `${getCategoryPath(item.slug)}${suffix}`,
            count: getProductCountByCategory(pool, item.slug),
            image: collectionImages.get(item.slug),
          }))
          .filter((item) => item.count > 0),
      ];
    }
    const definition = categories.find((item) => item.slug === category);
    const pool = categoryProducts ?? products;
    const counts = new Map<string, number>();
    for (const product of pool) {
      const slug = category === "gamcha" ? resolveGamchaSubcategory(product) : resolveProductSubcategory(product);
      if (slug) counts.set(slug, (counts.get(slug) ?? 0) + 1);
    }
    const subs = (definition?.subcategories ?? []).filter((item) => (counts.get(item.slug) ?? 0) > 0);
    if (!subs.length) return [];
    return [
      { key: "all", label: `All ${definition?.name ?? ""}`.trim(), href: `${getCategoryPath(category)}${suffix}`, count: pool.length, active: !subcategory },
      ...subs.map((item) => ({
        key: item.slug,
        label: item.name,
        href: `${getCategoryPath(category, item.slug)}${suffix}`,
        count: counts.get(item.slug),
        active: subcategory === item.slug,
      })),
    ];
  }, [allProducts, category, categoryProducts, filters.query, products, subcategory]);

  const activeCount = countActiveFilters(filters);
  const scopeLabel = category ? getCategoryLabel(category) : undefined;
  const chips: { label: string; onClear: () => void }[] = [
    ...(filters.price !== "all" ? [{ label: getPriceFilterLabel(filters.price), onClear: () => setPriceFilter("all") }] : []),
    ...(filters.inStockOnly ? [{ label: "In stock", onClear: () => setInStockOnly(false) }] : []),
    ...(filters.onSaleOnly ? [{ label: "On sale", onClear: () => setOnSaleOnly(false) }] : []),
    ...(filters.sort !== "popularity" ? [{ label: getSortLabel(filters.sort), onClear: () => setSort("popularity") }] : []),
  ];

  const panel = (showSort: boolean, onNavigate?: () => void) => (
    <FilterPanel
      filters={filters}
      onSort={setSort}
      onPrice={setPriceFilter}
      onInStock={setInStockOnly}
      onSale={setOnSaleOnly}
      showSort={showSort}
      onNavigate={onNavigate}
    />
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {rail.length ? (
        <div className="mb-6">
          <CategoryRail items={rail} label={category ? "Browse within category" : "Shop by category"} />
        </div>
      ) : null}

      <div className="mb-6 flex items-center gap-2 sm:gap-3">
        <SearchBox
          value={filters.query}
          onChange={setQuery}
          placeholder={scopeLabel ? `Search in ${scopeLabel}…` : "Search gamcha, sarees, dresses…"}
        />
        <div className="flex shrink-0 gap-2">
          <div className="hidden sm:block">
            <SortSelect value={filters.sort} onChange={setSort} />
          </div>
          <div className="lg:hidden">
            <FiltersButton count={activeCount} onClick={() => setDrawerOpen(true)} />
          </div>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-44">{panel(false)}</div>
        </aside>

        <div className="min-w-0">
          <div className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-charcoal/10 pb-4">
            <p className="text-sm text-charcoal">
              <span className="font-medium">{results.length}</span>{" "}
              <span className="text-warm-gray">
                {results.length === 1 ? "piece" : "pieces"}
                {filters.query ? (
                  <>
                    {" "}for <span className="text-charcoal">“{filters.query}”</span>
                  </>
                ) : null}
                {pagination.totalPages > 1 ? ` · page ${pagination.currentPage} of ${pagination.totalPages}` : ""}
              </span>
            </p>
            {chips.length ? (
              <div className="flex flex-wrap items-center gap-2">
                {chips.map((chip) => (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={chip.onClear}
                    className="inline-flex items-center gap-1.5 rounded-full bg-maroon/[0.07] px-3 py-1 text-xs text-maroon transition-colors hover:bg-maroon hover:text-ivory"
                  >
                    {chip.label}
                    <X className="h-3 w-3" />
                  </button>
                ))}
                <button type="button" onClick={clearFilters} className="text-xs text-warm-gray underline-offset-2 hover:text-maroon hover:underline">
                  Clear all
                </button>
              </div>
            ) : null}
          </div>

          {pagination.items.length ? (
            <>
              <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:gap-x-6 lg:gap-y-10">
                {pagination.items.map((product, index) => (
                  <ProductCard key={product.id} product={product} priority={index < 3 && pagination.currentPage === 1} />
                ))}
              </div>
              <ProductPagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} onPageChange={setPage} />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center border border-dashed border-charcoal/15 bg-white px-6 py-20 text-center">
              <p className="font-serif text-2xl text-maroon">
                {filters.query ? `Nothing matched “${filters.query}”` : "No products match these filters"}
              </p>
              <p className="mt-2 max-w-sm text-sm text-warm-gray">
                Try a different spelling, remove a filter, or browse a category below.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                {filters.query || activeCount ? (
                  <button
                    type="button"
                    onClick={() => {
                      clearFilters();
                      setQuery("");
                    }}
                    className="inline-flex min-h-[44px] items-center justify-center bg-maroon px-6 py-2.5 text-xs font-semibold tracking-[0.18em] text-ivory uppercase transition-colors hover:bg-maroon-dark"
                  >
                    Clear everything
                  </button>
                ) : null}
                {category && filters.query ? (
                  <Link
                    href={`/shop?q=${encodeURIComponent(filters.query)}`}
                    className="inline-flex min-h-[44px] items-center justify-center border border-maroon px-6 py-2.5 text-xs font-semibold tracking-[0.18em] text-maroon uppercase transition-colors hover:bg-maroon hover:text-ivory"
                  >
                    Search all products
                  </Link>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>

      {drawerOpen ? (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <button type="button" aria-label="Close filters" className="absolute inset-0 bg-charcoal/40" onClick={() => setDrawerOpen(false)} />
          <div className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-ivory shadow-2xl">
            <div className="flex items-center justify-between border-b border-charcoal/10 bg-white px-5 py-4">
              <p className="text-xs font-semibold tracking-[0.2em] text-charcoal uppercase">Filter &amp; sort</p>
              <button type="button" aria-label="Close filters" onClick={() => setDrawerOpen(false)} className="flex h-10 w-10 items-center justify-center text-charcoal">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5">{panel(true, () => setDrawerOpen(false))}</div>
            <div className="flex gap-3 border-t border-charcoal/10 bg-white px-5 py-4">
              <button
                type="button"
                onClick={clearFilters}
                className="flex-1 border border-charcoal/15 py-3 text-xs font-semibold tracking-[0.16em] text-charcoal uppercase"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="flex-1 bg-maroon py-3 text-xs font-semibold tracking-[0.16em] text-ivory uppercase"
              >
                Show {results.length} {results.length === 1 ? "piece" : "pieces"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
