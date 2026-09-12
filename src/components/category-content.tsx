"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ProductCard } from "@/components/product-card";
import {
  ActiveCatalogFilters,
  ProductCatalogControls,
} from "@/components/product-catalog-controls";
import { ProductPagination } from "@/components/product-pagination";
import {
  categories,
  getCategoryLabel,
  getCategoryPath,
  getSubcategoryLabel,
  resolveProductSubcategory,
  type CategorySlug,
} from "@/lib/categories";
import type { Product } from "@/lib/data";
import { resolveGamchaSubcategory } from "@/lib/gamcha";
import {
  filterAndSortProducts,
  paginateProducts,
} from "@/lib/product-filters";
import { useCatalogQueryParams } from "@/lib/use-catalog-query";

interface CategoryContentProps {
  category: CategorySlug;
  subcategory?: string;
  initialProducts: Product[];
  categoryProducts: Product[];
}

export function CategoryContent({
  category,
  subcategory,
  initialProducts,
  categoryProducts,
}: CategoryContentProps) {
  const categoryDef = categories.find((item) => item.slug === category);
  const { sort, priceFilter, page, setSort, setPriceFilter, setPage } =
    useCatalogQueryParams();
  const [search, setSearch] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const baseProducts = useMemo(() => initialProducts, [initialProducts]);

  const filteredProducts = useMemo(() => {
    let result = baseProducts;

    if (search.trim()) {
      const query = search.trim().toLowerCase();
      result = result.filter((product) =>
        product.name.toLowerCase().includes(query),
      );
    }

    return filterAndSortProducts(result, sort, priceFilter);
  }, [baseProducts, search, sort, priceFilter]);

  const pagination = useMemo(
    () => paginateProducts(filteredProducts, page),
    [filteredProducts, page],
  );

  const subcategoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const product of categoryProducts) {
      const slug =
        category === "gamcha"
          ? resolveGamchaSubcategory(product)
          : resolveProductSubcategory(product);
      if (!slug) continue;
      counts.set(slug, (counts.get(slug) ?? 0) + 1);
    }
    return counts;
  }, [category, categoryProducts]);

  const subcategoryControls = categoryDef?.subcategories.length ? (
    <div>
      <p className="mb-3 text-[10px] tracking-[0.25em] text-warm-gray uppercase">
        Subcategory
      </p>
      <div className="flex flex-wrap gap-2">
        <Link
          href={getCategoryPath(category)}
          className={`rounded-full border px-4 py-2 text-[11px] font-medium tracking-[0.12em] uppercase transition-colors ${
            !subcategory
              ? "border-maroon bg-maroon text-ivory"
              : "border-charcoal/15 bg-white text-charcoal/80 hover:border-maroon/40 hover:text-maroon"
          }`}
        >
          All
        </Link>
        {categoryDef.subcategories
          .filter((item) => (subcategoryCounts.get(item.slug) ?? 0) > 0)
          .map((item) => (
            <Link
              key={item.slug}
              href={getCategoryPath(category, item.slug)}
              className={`rounded-full border px-4 py-2 text-[11px] font-medium tracking-[0.12em] uppercase transition-colors ${
                subcategory === item.slug
                  ? "border-maroon bg-maroon text-ivory"
                  : "border-charcoal/15 bg-white text-charcoal/80 hover:border-maroon/40 hover:text-maroon"
              }`}
            >
              {item.name}
            </Link>
          ))}
      </div>
    </div>
  ) : null;

  const drawerCatalogControls = (
    <ProductCatalogControls
      layout="sidebar"
      sort={sort}
      priceFilter={priceFilter}
      onSortChange={setSort}
      onPriceFilterChange={setPriceFilter}
    />
  );

  const categoryLabel = getCategoryLabel(category);
  const subcategoryLabel = subcategory
    ? getSubcategoryLabel(category, subcategory)
    : null;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <nav
        aria-label="Breadcrumb"
        className="mb-8 flex flex-wrap items-center gap-2 text-xs tracking-[0.14em] text-warm-gray uppercase"
      >
        <Link href="/" className="transition-colors hover:text-maroon">
          Home
        </Link>
        <span aria-hidden="true">→</span>
        <Link href="/shop" className="transition-colors hover:text-maroon">
          Shop
        </Link>
        <span aria-hidden="true">→</span>
        {subcategoryLabel ? (
          <>
            <Link
              href={getCategoryPath(category)}
              className="transition-colors hover:text-maroon"
            >
              {categoryLabel}
            </Link>
            <span aria-hidden="true">→</span>
            <span className="text-charcoal">{subcategoryLabel}</span>
          </>
        ) : (
          <span className="text-charcoal">{categoryLabel}</span>
        )}
      </nav>

      <div className="mb-8 flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-warm-gray" />
            <input
              type="search"
              placeholder={`Search ${categoryLabel.toLowerCase()}...`}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full border border-charcoal/15 bg-white py-2.5 pr-4 pl-10 text-sm text-charcoal placeholder:text-warm-gray/70 focus:border-maroon focus:outline-none"
            />
          </div>

          <div className="hidden sm:flex sm:items-end sm:gap-3 lg:hidden">
            <ProductCatalogControls
              sort={sort}
              priceFilter={priceFilter}
              onSortChange={setSort}
              onPriceFilterChange={setPriceFilter}
            />
          </div>

          <button
            type="button"
            onClick={() => setMobileFiltersOpen(true)}
            className="flex items-center justify-center gap-2 border border-charcoal/15 px-4 py-2.5 text-sm tracking-wide text-charcoal transition-colors hover:border-maroon hover:text-maroon sm:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </button>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
        <aside className="hidden space-y-8 lg:block">
          {subcategoryControls}
          <div>
            <p className="mb-3 text-[10px] tracking-[0.25em] text-warm-gray uppercase">
              Filter
            </p>
            <ProductCatalogControls
              layout="sidebar"
              sort={sort}
              priceFilter={priceFilter}
              onSortChange={setSort}
              onPriceFilterChange={setPriceFilter}
            />
          </div>
        </aside>

        <div>
          <div className="mb-6 space-y-6 lg:hidden">{subcategoryControls}</div>

          <ActiveCatalogFilters
            sort={sort}
            priceFilter={priceFilter}
            onClearSort={() => setSort("popularity")}
            onClearPrice={() => setPriceFilter("all")}
            onClearAll={() => {
              setSort("popularity");
              setPriceFilter("all");
              setPage(1);
            }}
          />

          <div className="mb-6 flex items-center justify-between border-b border-charcoal/8 pb-4">
            <p className="text-sm text-warm-gray">
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1 ? "product" : "products"}
              {subcategoryLabel ? (
                <span className="text-charcoal"> in {subcategoryLabel}</span>
              ) : (
                <span className="text-charcoal"> in {categoryLabel}</span>
              )}
              {pagination.totalPages > 1 ? (
                <span className="text-charcoal/70">
                  {" "}
                  · Page {pagination.currentPage} of {pagination.totalPages}
                </span>
              ) : null}
            </p>
          </div>

          {pagination.items.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:gap-8">
                {pagination.items.map((product: Product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                ))}
              </div>

              <ProductPagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={setPage}
              />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="font-serif text-2xl text-maroon">No products found</p>
              <p className="mt-2 max-w-sm text-sm text-warm-gray">
                Try adjusting your search, sort, or price filter to find more in
                this collection.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setSort("popularity");
                  setPriceFilter("all");
                  setPage(1);
                }}
                className="mt-6 border-b border-maroon pb-0.5 text-sm tracking-widest text-maroon uppercase transition-colors hover:text-maroon-dark"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>

      {mobileFiltersOpen ? (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <button
            type="button"
            aria-label="Close filters overlay"
            className="absolute inset-0 bg-charcoal/30"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-ivory shadow-2xl">
            <div className="flex items-center justify-between border-b border-charcoal/8 px-5 py-4">
              <p className="text-sm font-medium tracking-wide text-charcoal uppercase">
                Filters
              </p>
              <button
                type="button"
                aria-label="Close filters"
                onClick={() => setMobileFiltersOpen(false)}
                className="flex h-10 w-10 items-center justify-center text-charcoal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 space-y-8 overflow-y-auto px-5 py-6">
              {subcategoryControls}
              {drawerCatalogControls}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
