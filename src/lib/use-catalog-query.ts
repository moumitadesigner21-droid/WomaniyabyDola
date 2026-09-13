"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  parsePageParam,
  parsePriceParam,
  parseSortParam,
  type CatalogFilters,
  type PriceFilterId,
  type SortOption,
} from "@/lib/product-filters";

/**
 * Catalog state lives in the URL (?q=&sort=&price=&stock=1&sale=1&page=) so
 * links are shareable, the header search can land on any catalog page, and
 * back/forward behaves.
 */
export function useCatalogQueryParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters: CatalogFilters = {
    sort: parseSortParam(searchParams.get("sort")),
    price: parsePriceParam(searchParams.get("price")),
    inStockOnly: searchParams.get("stock") === "1",
    onSaleOnly: searchParams.get("sale") === "1",
    query: searchParams.get("q") ?? "",
  };
  const page = parsePageParam(searchParams.get("page"));

  const updateParams = useCallback(
    (updates: Partial<CatalogFilters> & { page?: number; resetPage?: boolean }) => {
      const params = new URLSearchParams(searchParams.toString());
      const setOrDelete = (key: string, value: string | null) => {
        if (value) params.set(key, value);
        else params.delete(key);
      };

      if (updates.sort !== undefined) setOrDelete("sort", updates.sort === "popularity" ? null : updates.sort);
      if (updates.price !== undefined) setOrDelete("price", updates.price === "all" ? null : updates.price);
      if (updates.inStockOnly !== undefined) setOrDelete("stock", updates.inStockOnly ? "1" : null);
      if (updates.onSaleOnly !== undefined) setOrDelete("sale", updates.onSaleOnly ? "1" : null);
      if (updates.query !== undefined) setOrDelete("q", updates.query.trim() || null);

      if (updates.resetPage) params.delete("page");
      else if (updates.page !== undefined) setOrDelete("page", updates.page <= 1 ? null : String(updates.page));

      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const setSort = useCallback((sort: SortOption) => updateParams({ sort, resetPage: true }), [updateParams]);
  const setPriceFilter = useCallback((price: PriceFilterId) => updateParams({ price, resetPage: true }), [updateParams]);
  const setInStockOnly = useCallback((inStockOnly: boolean) => updateParams({ inStockOnly, resetPage: true }), [updateParams]);
  const setOnSaleOnly = useCallback((onSaleOnly: boolean) => updateParams({ onSaleOnly, resetPage: true }), [updateParams]);
  const setQuery = useCallback((query: string) => updateParams({ query, resetPage: true }), [updateParams]);
  const setPage = useCallback((next: number) => updateParams({ page: next }), [updateParams]);
  const clearFilters = useCallback(
    () => updateParams({ sort: "popularity", price: "all", inStockOnly: false, onSaleOnly: false, resetPage: true }),
    [updateParams],
  );

  return {
    filters,
    page,
    setSort,
    setPriceFilter,
    setInStockOnly,
    setOnSaleOnly,
    setQuery,
    setPage,
    clearFilters,
    updateParams,
  };
}
