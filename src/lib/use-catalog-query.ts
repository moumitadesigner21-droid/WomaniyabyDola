"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  parsePageParam,
  parsePriceParam,
  parseSortParam,
  type PriceFilterId,
  type SortOption,
} from "@/lib/product-filters";

export function useCatalogQueryParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const sort = parseSortParam(searchParams.get("sort"));
  const priceFilter = parsePriceParam(searchParams.get("price"));
  const page = parsePageParam(searchParams.get("page"));

  const updateParams = useCallback(
    (updates: {
      sort?: SortOption;
      price?: PriceFilterId;
      page?: number;
      resetPage?: boolean;
    }) => {
      const params = new URLSearchParams(searchParams.toString());

      if (updates.sort !== undefined) {
        if (updates.sort === "popularity") {
          params.delete("sort");
        } else {
          params.set("sort", updates.sort);
        }
      }

      if (updates.price !== undefined) {
        if (updates.price === "all") {
          params.delete("price");
        } else {
          params.set("price", updates.price);
        }
      }

      if (updates.resetPage) {
        params.delete("page");
      } else if (updates.page !== undefined) {
        if (updates.page <= 1) {
          params.delete("page");
        } else {
          params.set("page", String(updates.page));
        }
      }

      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams],
  );

  const setSort = useCallback(
    (next: SortOption) => updateParams({ sort: next, resetPage: true }),
    [updateParams],
  );

  const setPriceFilter = useCallback(
    (next: PriceFilterId) => updateParams({ price: next, resetPage: true }),
    [updateParams],
  );

  const setPage = useCallback(
    (next: number) => updateParams({ page: next }),
    [updateParams],
  );

  return {
    sort,
    priceFilter,
    page,
    setSort,
    setPriceFilter,
    setPage,
    updateParams,
  };
}
