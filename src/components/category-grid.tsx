import Image from "next/image";
import Link from "next/link";
import { InteractiveCategoryCard } from "@/components/interactive-category-card";
import {
  getCategoryPath,
  getProductCountByCategory,
  isCategorySlug,
} from "@/lib/categories";
import { collections, isAnchorLink, isExternalLink, type Product } from "@/lib/data";

function getCategoryCount(allProducts: Product[], categoryKey: string) {
  if (!isCategorySlug(categoryKey)) {
    return 0;
  }
  return getProductCountByCategory(allProducts, categoryKey);
}

interface CategoryCardProps {
  item: (typeof collections)[number];
  variant?: "default" | "compact";
  isActive?: boolean;
  onSelect?: (categoryKey: string) => void;
  allProducts: Product[];
}

function CategoryCard({
  item,
  variant = "default",
  isActive,
  onSelect,
  allProducts,
}: CategoryCardProps) {
  const count = getCategoryCount(allProducts, item.categoryKey);
  const isCompact = variant === "compact";
  const filterMode = Boolean(onSelect);
  const useLink = !filterMode || isAnchorLink(item.href);
  const categoryHref = isCategorySlug(item.categoryKey)
    ? getCategoryPath(item.categoryKey)
    : item.href;

  const compactInner = (
    <>
      <div className="relative aspect-[4/5] overflow-hidden">
        <Image
          src={item.image}
          alt={item.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="168px"
        />
      </div>
      <div className="flex flex-1 flex-col justify-between p-3">
        <div>
          <p className="text-[9px] tracking-[0.2em] text-warm-gray uppercase">
            {item.subtitle}
          </p>
          <h3 className="mt-0.5 font-serif text-sm leading-snug text-charcoal">
            {item.title}
          </h3>
        </div>
        <p className="mt-2 text-[10px] text-maroon">{count} pieces</p>
      </div>
    </>
  );

  const compactClass = `group flex w-[148px] shrink-0 snap-start flex-col overflow-hidden rounded-xl border bg-white text-left transition-all sm:w-[168px] ${
    isActive
      ? "border-maroon shadow-[0_8px_24px_-8px_rgba(107,30,46,0.25)]"
      : "border-charcoal/10 hover:border-maroon/30"
  }`;

  if (isCompact) {
    if (!useLink) {
      return (
        <button
          type="button"
          onClick={() => onSelect?.(item.categoryKey)}
          className={compactClass}
        >
          {compactInner}
        </button>
      );
    }

    return (
      <Link
        href={categoryHref}
        className={compactClass}
        {...(isExternalLink(categoryHref)
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
      >
        {compactInner}
      </Link>
    );
  }

  return null;
}

export function CategoryGrid({
  variant = "default",
  activeCategory,
  onSelect,
  allProducts,
}: {
  variant?: "default" | "compact";
  activeCategory?: string;
  onSelect?: (categoryKey: string) => void;
  allProducts: Product[];
}) {
  if (variant === "compact") {
    return (
      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 snap-x snap-mandatory scrollbar-none sm:-mx-6 sm:px-6">
        {collections.map((item) => (
          <CategoryCard
            key={item.title}
            item={item}
            variant="compact"
            isActive={activeCategory === item.categoryKey}
            onSelect={onSelect}
            allProducts={allProducts}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:gap-6">
      {collections.map((item) => (
        <InteractiveCategoryCard
          key={item.title}
          item={item}
          productCount={getCategoryCount(allProducts, item.categoryKey)}
        />
      ))}
    </div>
  );
}

export function CategoryPills({
  activeCategory,
  onSelect,
  linkMode = false,
}: {
  activeCategory?: string;
  onSelect?: (category: string) => void;
  linkMode?: boolean;
}) {
  const pillClass = (active: boolean) =>
    `rounded-full border px-4 py-2 text-[11px] font-medium tracking-[0.12em] uppercase transition-colors ${
      active
        ? "border-maroon bg-maroon text-ivory"
        : "border-charcoal/15 bg-white text-charcoal/80 hover:border-maroon/40 hover:text-maroon"
    }`;

  const categoryItems = collections.filter(
    (item) => item.categoryKey !== "shrug" || item.title === "Shrug",
  );

  return (
    <div className="flex flex-wrap justify-center gap-2 sm:gap-2.5">
      {linkMode ? (
        <Link href="/shop" className={pillClass(!activeCategory || activeCategory === "all")}>
          All
        </Link>
      ) : (
        <button
          type="button"
          onClick={() => onSelect?.("all")}
          className={pillClass(activeCategory === "all" || !activeCategory)}
        >
          All
        </button>
      )}

      {categoryItems.map((item) => {
        const useLink = linkMode || isAnchorLink(item.href);
        const categoryHref = isCategorySlug(item.categoryKey)
          ? getCategoryPath(item.categoryKey)
          : item.href;

        return useLink ? (
          <Link
            key={item.title}
            href={categoryHref}
            className={pillClass(activeCategory === item.categoryKey)}
          >
            {item.title}
          </Link>
        ) : (
          <button
            key={item.title}
            type="button"
            onClick={() => onSelect?.(item.categoryKey)}
            className={pillClass(activeCategory === item.categoryKey)}
          >
            {item.title}
          </button>
        );
      })}
    </div>
  );
}
