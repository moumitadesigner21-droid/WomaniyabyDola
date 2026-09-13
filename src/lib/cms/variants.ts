import type { CmsProductOption } from "@/lib/cms/types";

function slugPart(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Stable variant id from option values in option order, e.g.
 * { Size: "M", Colour: "Red" } → "size-m__colour-red". Re-saving a product
 * keeps ids, so cart lines and order history stay valid.
 */
export function variantIdFor(
  options: CmsProductOption[],
  values: Record<string, string>,
): string {
  return options
    .map((option) => `${slugPart(option.name)}-${slugPart(values[option.name] ?? "")}`)
    .join("__");
}

/** Human label in option order: "M / Red". */
export function variantLabelFor(
  options: CmsProductOption[],
  values: Record<string, string>,
): string {
  return options
    .map((option) => values[option.name])
    .filter(Boolean)
    .join(" / ");
}

/** Every combination of option values, in option order. */
export function cartesianVariants(
  options: CmsProductOption[],
): Record<string, string>[] {
  const usable = options.filter((option) => option.values.length > 0);
  if (!usable.length) return [];
  return usable.reduce<Record<string, string>[]>(
    (combos, option) =>
      combos.flatMap((combo) =>
        option.values.map((value) => ({ ...combo, [option.name]: value })),
      ),
    [{}],
  );
}
