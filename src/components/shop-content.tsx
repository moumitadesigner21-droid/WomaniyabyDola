"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CategoryGrid, CategoryPills } from "@/components/category-grid";
import { ProductCard } from "@/components/product-card";
import {
  ActiveCatalogFilters,
  ProductCatalogControls,
} from "@/components/product-catalog-controls";
import { ProductPagination } from "@/components/product-pagination";
import {
  getCategoryPath,
  getCategoryLabel,
  normalizeCategorySlug,
  type CategorySlug,
} from "@/lib/categories";
import type { Product, ShopCategory } from "@/lib/data";
import { shopCategories } from "@/lib/data";
import { filterGamchaProducts } from "@/lib/gamcha";
import {
  filterAndSortProducts,
  paginateProducts,
} from "@/lib/product-filters";
import { useCatalogQueryParams } from "@/lib/use-catalog-query";

function getInitialCategory(searchParams: URLSearchParams): ShopCategory {
  const category = searchParams.get("category");
  if (!category) return "all";

  const normalized = normalizeCategorySlug(category);
  if (normalized && shopCategories.includes(normalized)) {
    return normalized;
  }

  return "all";
}

export function ShopContent({
  initialProducts,
}: {
  initialProducts: Product[];
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { sort, priceFilter, page, setSort, setPriceFilter, setPage } =
    useCatalogQueryParams();
  const [category, setCategory] = useState<ShopCategory>(() =>
    getInitialCategory(searchParams),
  );
  const [search, setSearch] = useState(() => searchParams.get("q") ?? "");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Re-sync local filter state when the URL changes (back/forward, header
  // search). Done during render per React's "adjusting state on prop change"
  // pattern instead of an effect.
  const paramsKey = searchParams.toString();
  const [syncedParamsKey, setSyncedParamsKey] = useState(paramsKey);
  if (paramsKey !== syncedParamsKey) {
    setSyncedParamsKey(paramsKey);
    setCategory(getInitialCategory(searchParams));
    setSearch(searchParams.get("q") ?? "");
  }

  useEffect(() => {
    // Legacy `?category=` links redirect to the canonical category route.
    const legacyCategory = searchParams.get("category");
    if (!legacyCategory) return;

    const normalized = normalizeCategorySlug(legacyCategory);
    if (!normalized) return;

    const params = new URLSearchParams(searchParams.toString());
    params.delete("category");
    const query = params.toString();
    router.replace(
      query
        ? `${getCategoryPath(normalized)}?${query}`
        : getCategoryPath(normalized),
    );
  }, [searchParams, router]);

  const handleCategorySelect = (next: string) => {
    if (next === "shrug") {
      router.push("/category/shrug");
      return;
    }

    if (next === "all") {
      setCategory("all");
      const params = new URLSearchParams(searchParams.toString());
      params.delete("category");
      const query = params.toString();
      router.replace(query ? `/shop?${query}` : "/shop", { scroll: false });
      return;
    }

    const nextCategory = next as CategorySlug;
    const params = new URLSearchParams(searchParams.toString());
    params.delete("category");
    const query = params.toString();
    router.push(
      query
        ? `${getCategoryPath(nextCategory)}?${query}`
        : getCategoryPath(nextCategory),
    );
  };

  const filteredProducts = useMemo(() => {
    let result = initialProducts;

    if (category !== "all") {
      result =
        category === "gamcha"
          ? filterGamchaProducts(result)
          : result.filter((product) => product.category === category);
    }

    if (search.trim()) {
      const query = search.trim().toLowerCase();
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query),
      );
    }

    return filterAndSortProducts(result, sort, priceFilter);
  }, [category, search, sort, priceFilter, initialProducts]);

  const pagination = useMemo(
    () => paginateProducts(filteredProducts, page),
    [filteredProducts, page],
  );

  const totalProducts = initialProducts.length;

  const categoryControls = (
    <div>
      <p className="mb-3 text-[10px] tracking-[0.25em] text-warm-gray uppercase">
        Category
      </p>
      <CategoryPills
        activeCategory={category === "all" ? undefined : category}
        onSelect={handleCategorySelect}
      />
    </div>
  );

  const drawerCatalogControls = (
    <ProductCatalogControls
      layout="sidebar"
      sort={sort}
      priceFilter={priceFilter}
      onSortChange={setSort}
      onPriceFilterChange={setPriceFilter}
    />
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mb-10 rounded-2xl border border-charcoal/8 bg-white p-4 sm:p-6 lg:mb-12">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] tracking-[0.25em] text-gold uppercase">
              Shop by Category
            </p>
            <h2 className="font-serif text-2xl text-maroon sm:text-3xl">
              Find your style
            </h2>
          </div>
          <p className="text-sm text-warm-gray">
            {totalProducts} handcrafted pieces across{" "}
            {shopCategories.length - 1} categories
          </p>
        </div>

        <div className="mb-5 lg:hidden">
          <CategoryPills
            activeCategory={category === "all" ? undefined : category}
            onSelect={handleCategorySelect}
          />
        </div>

        <CategoryGrid
          variant="compact"
          activeCategory={category === "all" ? undefined : category}
          onSelect={handleCategorySelect}
          allProducts={initialProducts}
        />
      </div>

      <div className="mb-8 flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-warm-gray" />
            <input
              type="search"
              placeholder="Search gamcha, sarees, dresses..."
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
          {categoryControls}
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
          <div className="mb-6 space-y-6 lg:hidden">{categoryControls}</div>

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
              {category !== "all" && (
                <span className="text-charcoal">
                  {" "}
                  in {getCategoryLabel(category)}
                </span>
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
                {pagination.items.map((product) => (
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
              <p className="font-serif text-2xl text-maroon">
                No products found
              </p>
              <p className="mt-2 max-w-sm text-sm text-warm-gray">
                Try adjusting your search, sort, or price filter to discover
                more from our collection.
              </p>
              <button
                type="button"
                onClick={() => {
                  handleCategorySelect("all");
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
              {categoryControls}
              {drawerCatalogControls}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
