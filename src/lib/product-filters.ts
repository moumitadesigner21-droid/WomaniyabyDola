import type { Product } from "@/lib/data";

export type SortOption =
  | "popularity"
  | "rating"
  | "newness"
  | "price-asc"
  | "price-desc";

export type PriceFilterId = "all" | "r1" | "r2" | "r3" | "r4";

export const PRODUCTS_PER_PAGE = 12;

export const sortOptions: { value: SortOption; label: string }[] = [
  { value: "popularity", label: "Popularity" },
  { value: "rating", label: "Average rating" },
  { value: "newness", label: "Newness" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];

function formatPriceFilter(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export const priceFilterOptions: {
  id: PriceFilterId;
  label: string;
  min: number;
  max: number;
}[] = [
  { id: "all", label: "All", min: 0, max: Infinity },
  {
    id: "r1",
    label: `${formatPriceFilter(0)} - ${formatPriceFilter(1130)}`,
    min: 0,
    max: 1130,
  },
  {
    id: "r2",
    label: `${formatPriceFilter(1130)} - ${formatPriceFilter(2260)}`,
    min: 1130,
    max: 2260,
  },
  {
    id: "r3",
    label: `${formatPriceFilter(2260)} - ${formatPriceFilter(3390)}`,
    min: 2260,
    max: 3390,
  },
  {
    id: "r4",
    label: `${formatPriceFilter(3390)} +`,
    min: 3390,
    max: Infinity,
  },
];

function productRating(product: Product) {
  if (product.isBestseller) return 5;
  if (product.isNew) return 4;
  return 3.5;
}

function popularityScore(product: Product) {
  return (product.isBestseller ? 2 : 0) + (product.isNew ? 1 : 0);
}

export function matchesPriceFilter(price: number, filterId: PriceFilterId) {
  const filter = priceFilterOptions.find((item) => item.id === filterId);
  if (!filter || filter.id === "all") return true;
  if (filter.max === Infinity) return price >= filter.min;
  if (filter.id === "r1") return price >= filter.min && price <= filter.max;
  return price > filter.min && price <= filter.max;
}

export function filterAndSortProducts(
  products: Product[],
  sort: SortOption,
  priceFilter: PriceFilterId,
): Product[] {
  const result = products.filter((product) =>
    matchesPriceFilter(product.price, priceFilter),
  );

  switch (sort) {
    case "price-asc":
      result.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      result.sort((a, b) => b.price - a.price);
      break;
    case "newness":
      result.sort((a, b) => {
        const newScore = (product: Product) => (product.isNew ? 1 : 0);
        return newScore(b) - newScore(a) || a.name.localeCompare(b.name);
      });
      break;
    case "rating":
      result.sort(
        (a, b) =>
          productRating(b) - productRating(a) || a.name.localeCompare(b.name),
      );
      break;
    default:
      result.sort(
        (a, b) =>
          popularityScore(b) - popularityScore(a) ||
          productRating(b) - productRating(a) ||
          a.name.localeCompare(b.name),
      );
  }

  return result;
}

export function paginateProducts<T>(
  items: T[],
  page: number,
  perPage = PRODUCTS_PER_PAGE,
) {
  const totalPages = Math.max(1, Math.ceil(items.length / perPage));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const start = (currentPage - 1) * perPage;

  return {
    items: items.slice(start, start + perPage),
    currentPage,
    totalPages,
    totalItems: items.length,
    perPage,
  };
}

export function getPaginationItems(
  currentPage: number,
  totalPages: number,
): Array<number | "ellipsis"> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const items: Array<number | "ellipsis"> = [1];

  if (currentPage > 3) {
    items.push("ellipsis");
  }

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  for (let page = start; page <= end; page += 1) {
    items.push(page);
  }

  if (currentPage < totalPages - 2) {
    items.push("ellipsis");
  }

  items.push(totalPages);
  return items;
}

export function getPriceFilterLabel(filterId: PriceFilterId) {
  return priceFilterOptions.find((item) => item.id === filterId)?.label ?? "All";
}

export function getSortLabel(sort: SortOption) {
  return sortOptions.find((item) => item.value === sort)?.label ?? "Popularity";
}

const SORT_VALUES = new Set(sortOptions.map((item) => item.value));
const PRICE_VALUES = new Set(priceFilterOptions.map((item) => item.id));

export function parseSortParam(value: string | null): SortOption {
  if (value && SORT_VALUES.has(value as SortOption)) {
    return value as SortOption;
  }
  return "popularity";
}

export function parsePriceParam(value: string | null): PriceFilterId {
  if (value && PRICE_VALUES.has(value as PriceFilterId)) {
    return value as PriceFilterId;
  }
  return "all";
}

export function parsePageParam(value: string | null) {
  const page = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}
