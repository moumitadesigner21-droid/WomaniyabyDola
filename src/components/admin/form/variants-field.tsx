"use client";

import { useState } from "react";
import { Field, Toggle, inputClass } from "@/components/admin/form/fields";
import { ImageField } from "@/components/admin/form/image-field";
import type { CmsProductOption, CmsProductVariantInput } from "@/lib/cms/types";
import { cartesianVariants, variantIdFor, variantLabelFor } from "@/lib/cms/variants";

const SUGGESTED_OPTIONS = ["Size", "Colour", "Fabric", "Length"];

function OptionRow({
  option,
  onChange,
  onRemove,
}: {
  option: CmsProductOption;
  onChange: (option: CmsProductOption) => void;
  onRemove: () => void;
}) {
  const [draft, setDraft] = useState("");

  const addValues = (raw: string) => {
    const values = raw
      .split(",")
      .map((v) => v.trim())
      .filter((v) => v && !option.values.includes(v));
    if (values.length) onChange({ ...option, values: [...option.values, ...values] });
    setDraft("");
  };

  const isPreset = SUGGESTED_OPTIONS.includes(option.name);
  const [custom, setCustom] = useState(!isPreset && option.name !== "");

  return (
    <div className="grid gap-3 border border-charcoal/10 bg-ivory/40 p-3 md:grid-cols-[220px_1fr_auto]">
      <div className="flex flex-col gap-2">
        <select
          value={custom || !isPreset ? "__custom__" : option.name}
          onChange={(event) => {
            if (event.target.value === "__custom__") {
              setCustom(true);
              onChange({ ...option, name: "" });
            } else {
              setCustom(false);
              onChange({ ...option, name: event.target.value });
            }
          }}
          className={inputClass}
        >
          {option.name === "" && !custom ? <option value="">Choose…</option> : null}
          {SUGGESTED_OPTIONS.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
          <option value="__custom__">Custom…</option>
        </select>
        {custom ? (
          <input
            autoFocus
            value={option.name}
            placeholder="Option name"
            onChange={(event) => onChange({ ...option, name: event.target.value })}
            className={inputClass}
          />
        ) : null}
      </div>
      <div className="flex min-h-[42px] flex-wrap items-center gap-1.5 border border-charcoal/15 bg-white px-2 py-1.5">
        {option.values.map((value) => (
          <span key={value} className="inline-flex items-center gap-1 bg-ivory px-2 py-1 text-xs text-charcoal">
            {value}
            <button
              type="button"
              aria-label={`Remove ${value}`}
              onClick={() => onChange({ ...option, values: option.values.filter((v) => v !== value) })}
              className="text-warm-gray hover:text-maroon"
            >
              ×
            </button>
          </span>
        ))}
        <input
          value={draft}
          placeholder={option.values.length ? "Add value…" : "Values, e.g. S, M, L"}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === ",") {
              event.preventDefault();
              addValues(draft);
            }
            if (event.key === "Backspace" && !draft && option.values.length) {
              onChange({ ...option, values: option.values.slice(0, -1) });
            }
          }}
          onBlur={() => draft.trim() && addValues(draft)}
          className="min-w-[120px] flex-1 bg-transparent text-sm outline-none"
        />
      </div>
      <button type="button" onClick={onRemove} className="self-center text-[11px] tracking-[0.12em] text-maroon uppercase">
        Remove
      </button>
    </div>
  );
}

/**
 * Options (Size, Colour…) + the generated combination table with per-variant
 * stock, price overrides, SKU and photo. Variant ids are derived from the
 * option values so re-saving keeps them stable.
 */
export function VariantsField({
  options,
  variants,
  onChange,
  basePrice,
}: {
  options: CmsProductOption[];
  variants: CmsProductVariantInput[];
  onChange: (next: { options: CmsProductOption[]; variants: CmsProductVariantInput[] }) => void;
  basePrice: number;
}) {
  const [imageFor, setImageFor] = useState<string | null>(null);

  const cleanOptions = options
    .map((o) => ({ name: o.name.trim(), values: o.values.filter(Boolean) }))
    .filter((o) => o.name && o.values.length);
  const expected = cartesianVariants(cleanOptions);
  const existingById = new Map(
    variants.map((v) => [variantIdFor(cleanOptions, v.optionValues), v] as const),
  );
  const missing = expected.filter((values) => !existingById.has(variantIdFor(cleanOptions, values)));
  const stale = variants.filter(
    (v) => !expected.some((values) => variantIdFor(cleanOptions, values) === variantIdFor(cleanOptions, v.optionValues)),
  );

  const setOptions = (next: CmsProductOption[]) => onChange({ options: next, variants });
  const setVariants = (next: CmsProductVariantInput[]) => onChange({ options, variants: next });

  const generate = () => {
    const kept = variants.filter((v) => !stale.includes(v));
    const added: CmsProductVariantInput[] = missing.map((values, index) => ({
      optionValues: values,
      sku: null,
      price: null,
      salePrice: null,
      stockQuantity: 10,
      inStock: true,
      image: null,
      sortOrder: kept.length + index,
    }));
    const ordered = expected
      .map((values) => {
        const id = variantIdFor(cleanOptions, values);
        return [...kept, ...added].find((v) => variantIdFor(cleanOptions, v.optionValues) === id)!;
      })
      .map((v, index) => ({ ...v, sortOrder: index }));
    setVariants(ordered);
  };

  const update = (index: number, patch: Partial<CmsProductVariantInput>) =>
    setVariants(variants.map((v, i) => (i === index ? { ...v, ...patch } : v)));

  const bulk = (patch: Partial<CmsProductVariantInput>) =>
    setVariants(variants.map((v) => ({ ...v, ...patch })));

  return (
    <div className="space-y-5">
      <Field
        label="Options"
        hint="Add up to three options. Each combination becomes a variant with its own stock."
      >
        <div className="space-y-2">
          {options.map((option, index) => (
            <OptionRow
              key={index}
              option={option}
              onChange={(next) => setOptions(options.map((o, i) => (i === index ? next : o)))}
              onRemove={() => setOptions(options.filter((_, i) => i !== index))}
            />
          ))}
          {options.length < 3 ? (
            <button
              type="button"
              onClick={() => setOptions([...options, { name: options.length ? "" : "Size", values: [] }])}
              className="border border-charcoal/20 bg-white px-3 py-1.5 text-[11px] tracking-[0.12em] text-charcoal uppercase hover:border-maroon/40 hover:text-maroon"
            >
              + Add option
            </button>
          ) : null}
        </div>
      </Field>

      {cleanOptions.length ? (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={generate}
              className="border border-maroon px-3 py-1.5 text-[11px] tracking-[0.12em] text-maroon uppercase hover:bg-maroon hover:text-ivory"
            >
              {variants.length ? "Update variants" : "Generate variants"}
            </button>
            <span className="text-xs text-warm-gray">
              {expected.length} combination{expected.length === 1 ? "" : "s"}
              {missing.length ? ` · ${missing.length} not yet added` : ""}
              {stale.length ? ` · ${stale.length} no longer valid` : ""}
            </span>
            {variants.length ? (
              <span className="ml-auto flex items-center gap-2 text-[11px] text-warm-gray">
                Set all stock to
                <input
                  type="number"
                  min={0}
                  defaultValue={10}
                  onBlur={(event) => bulk({ stockQuantity: Math.max(0, Number(event.target.value) || 0), inStock: true })}
                  className="w-16 border border-charcoal/15 px-2 py-1 text-xs"
                />
              </span>
            ) : null}
          </div>

          {variants.length ? (
            <div className="overflow-x-auto border border-charcoal/10">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="bg-ivory/60 text-[10px] tracking-[0.14em] text-warm-gray uppercase">
                  <tr>
                    <th className="px-3 py-2 text-left">Variant</th>
                    <th className="px-3 py-2 text-left">SKU</th>
                    <th className="px-3 py-2 text-left">Price (₹)</th>
                    <th className="px-3 py-2 text-left">Sale (₹)</th>
                    <th className="px-3 py-2 text-left">Stock</th>
                    <th className="px-3 py-2 text-left">Available</th>
                    <th className="px-3 py-2 text-left">Photo</th>
                  </tr>
                </thead>
                <tbody>
                  {variants.map((variant, index) => {
                    const id = variantIdFor(cleanOptions, variant.optionValues);
                    const isStale = stale.includes(variant);
                    return (
                      <tr key={id} className={`border-t border-charcoal/10 ${isStale ? "opacity-50" : ""}`}>
                        <td className="px-3 py-2 font-medium text-charcoal">
                          {variantLabelFor(cleanOptions, variant.optionValues) || "—"}
                          {isStale ? <span className="ml-2 text-[10px] text-maroon">(remove on update)</span> : null}
                        </td>
                        <td className="px-3 py-2">
                          <input value={variant.sku ?? ""} onChange={(e) => update(index, { sku: e.target.value || null })} className="w-28 border border-charcoal/15 px-2 py-1 text-xs" />
                        </td>
                        <td className="px-3 py-2">
                          <input type="number" min={0} placeholder={String(basePrice)} value={variant.price ?? ""} onChange={(e) => update(index, { price: e.target.value === "" ? null : Number(e.target.value) })} className="w-24 border border-charcoal/15 px-2 py-1 text-xs" />
                        </td>
                        <td className="px-3 py-2">
                          <input type="number" min={0} value={variant.salePrice ?? ""} onChange={(e) => update(index, { salePrice: e.target.value === "" ? null : Number(e.target.value) })} className="w-24 border border-charcoal/15 px-2 py-1 text-xs" />
                        </td>
                        <td className="px-3 py-2">
                          <input type="number" min={0} value={variant.stockQuantity} onChange={(e) => update(index, { stockQuantity: Math.max(0, Number(e.target.value) || 0) })} className="w-20 border border-charcoal/15 px-2 py-1 text-xs" />
                        </td>
                        <td className="px-3 py-2">
                          <Toggle label="" checked={variant.inStock !== false} onChange={(inStock) => update(index, { inStock })} />
                        </td>
                        <td className="px-3 py-2">
                          <button
                            type="button"
                            onClick={() => setImageFor(imageFor === id ? null : id)}
                            className="flex items-center gap-2 text-[11px] tracking-[0.12em] text-maroon uppercase"
                          >
                            {variant.image ? (
                              // eslint-disable-next-line @next/next/no-img-element -- admin preview
                              <img src={variant.image} alt="" className="h-8 w-6 object-cover" />
                            ) : null}
                            {variant.image ? "Change" : "Add"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-warm-gray">Click “Generate variants” to create the combination table.</p>
          )}

          {imageFor ? (
            (() => {
              const index = variants.findIndex((v) => variantIdFor(cleanOptions, v.optionValues) === imageFor);
              if (index === -1) return null;
              return (
                <div className="border border-charcoal/10 bg-ivory/40 p-4">
                  <ImageField
                    label={`Photo for ${variantLabelFor(cleanOptions, variants[index].optionValues)}`}
                    hint="Shown when this combination is selected. Leave empty to use the main photo."
                    value={variants[index].image ?? ""}
                    onChange={(image) => update(index, { image: image || null })}
                  />
                </div>
              );
            })()
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
