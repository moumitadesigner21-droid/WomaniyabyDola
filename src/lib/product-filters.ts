import type { Product } from "@/lib/data";

export type SortOption = "popularity" | "newness" | "price-asc" | "price-desc" | "name";

export type PriceFilterId = "all" | "r1" | "r2" | "r3" | "r4";

export const PRODUCTS_PER_PAGE = 12;

export const sortOptions: { value: SortOption; label: string }[] = [
  { value: "popularity", label: "Featured" },
  { value: "newness", label: "Newest first" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name", label: "Name A–Z" },
];

const rupees = (amount: number) => `₹${amount.toLocaleString("en-IN")}`;

export const priceFilterOptions: {
  id: PriceFilterId;
  label: string;
  min: number;
  max: number;
}[] = [
  { id: "all", label: "Any price", min: 0, max: Infinity },
  { id: "r1", label: `Under ${rupees(1000)}`, min: 0, max: 1000 },
  { id: "r2", label: `${rupees(1000)} – ${rupees(2000)}`, min: 1000, max: 2000 },
  { id: "r3", label: `${rupees(2000)} – ${rupees(3500)}`, min: 2000, max: 3500 },
  { id: "r4", label: `Above ${rupees(3500)}`, min: 3500, max: Infinity },
];

export interface CatalogFilters {
  sort: SortOption;
  price: PriceFilterId;
  /** Only products that can be bought right now. */
  inStockOnly: boolean;
  /** Only products with a sale price. */
  onSaleOnly: boolean;
  query: string;
}

export const DEFAULT_FILTERS: CatalogFilters = {
  sort: "popularity",
  price: "all",
  inStockOnly: false,
  onSaleOnly: false,
  query: "",
};

function popularityScore(product: Product) {
  return (product.isBestseller ? 2 : 0) + (product.isNew ? 1 : 0) + (product.inStock === false ? -3 : 0);
}

export function matchesPriceFilter(price: number, filterId: PriceFilterId) {
  const filter = priceFilterOptions.find((item) => item.id === filterId);
  if (!filter || filter.id === "all") return true;
  if (filter.max === Infinity) return price >= filter.min;
  if (filter.id === "r1") return price >= filter.min && price < filter.max;
  return price >= filter.min && price < filter.max;
}

/** Word-based search across name, category, tags, fabric, colour and description. */
export function matchesQuery(product: Product, query: string, categoryLabel?: string) {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  const haystack = [
    product.name,
    product.category,
    categoryLabel ?? "",
    product.subcategory ?? "",
    ...(product.tags ?? []),
    product.fabric ?? "",
    product.color ?? "",
    product.description ?? "",
  ]
    .join(" ")
    .toLowerCase();
  return words.every((word) => haystack.includes(word));
}

export function applyCatalogFilters(
  products: Product[],
  filters: CatalogFilters,
  categoryLabel?: (product: Product) => string,
): Product[] {
  const result = products.filter(
    (product) =>
      matchesPriceFilter(product.price, filters.price) &&
      (!filters.inStockOnly || product.inStock !== false) &&
      (!filters.onSaleOnly || Boolean(product.compareAtPrice)) &&
      matchesQuery(product, filters.query, categoryLabel?.(product)),
  );

  switch (filters.sort) {
    case "price-asc":
      result.sort((a, b) => a.price - b.price || a.name.localeCompare(b.name));
      break;
    case "price-desc":
      result.sort((a, b) => b.price - a.price || a.name.localeCompare(b.name));
      break;
    case "newness":
      result.sort((a, b) => Number(Boolean(b.isNew)) - Number(Boolean(a.isNew)) || a.name.localeCompare(b.name));
      break;
    case "name":
      result.sort((a, b) => a.name.localeCompare(b.name));
      break;
    default:
      result.sort((a, b) => popularityScore(b) - popularityScore(a) || a.name.localeCompare(b.name));
  }

  return result;
}

/** Back-compat wrapper used by older callers. */
export function filterAndSortProducts(
  products: Product[],
  sort: SortOption,
  priceFilter: PriceFilterId,
): Product[] {
  return applyCatalogFilters(products, { ...DEFAULT_FILTERS, sort, price: priceFilter });
}

export function paginateProducts<T>(items: T[], page: number, perPage = PRODUCTS_PER_PAGE) {
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

export function getPaginationItems(currentPage: number, totalPages: number): Array<number | "ellipsis"> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }
  const items: Array<number | "ellipsis"> = [1];
  if (currentPage > 3) items.push("ellipsis");
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);
  for (let page = start; page <= end; page += 1) items.push(page);
  if (currentPage < totalPages - 2) items.push("ellipsis");
  items.push(totalPages);
  return items;
}

export function getPriceFilterLabel(filterId: PriceFilterId) {
  return priceFilterOptions.find((item) => item.id === filterId)?.label ?? "Any price";
}

export function getSortLabel(sort: SortOption) {
  return sortOptions.find((item) => item.value === sort)?.label ?? "Featured";
}

const SORT_VALUES = new Set(sortOptions.map((item) => item.value));
const PRICE_VALUES = new Set(priceFilterOptions.map((item) => item.id));

export function parseSortParam(value: string | null): SortOption {
  return value && SORT_VALUES.has(value as SortOption) ? (value as SortOption) : "popularity";
}

export function parsePriceParam(value: string | null): PriceFilterId {
  return value && PRICE_VALUES.has(value as PriceFilterId) ? (value as PriceFilterId) : "all";
}

export function parsePageParam(value: string | null) {
  const page = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

/** Number of non-default filters, for the "Filters (2)" badge. */
export function countActiveFilters(filters: CatalogFilters) {
  return (
    Number(filters.price !== "all") +
    Number(filters.inStockOnly) +
    Number(filters.onSaleOnly) +
    Number(filters.sort !== "popularity")
  );
}
