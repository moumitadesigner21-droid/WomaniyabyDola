"use client";

import type { ReactNode } from "react";
import { SortableItem, SortableList } from "@/components/admin/form/sortable";

/**
 * Sortable list of cards. `getId` must be stable per item; `create` returns
 * a fresh item for the Add button.
 */
export function Repeater<T>({
  items,
  onChange,
  getId,
  create,
  addLabel = "Add item",
  summary,
  children,
  max,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  getId: (item: T, index: number) => string;
  create: () => T;
  addLabel?: string;
  summary?: (item: T, index: number) => ReactNode;
  children: (item: T, update: (patch: Partial<T>) => void, index: number) => ReactNode;
  max?: number;
}) {
  const update = (index: number, patch: Partial<T>) =>
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  const remove = (index: number) => onChange(items.filter((_, i) => i !== index));
  const duplicate = (index: number) =>
    onChange([...items.slice(0, index + 1), { ...items[index] }, ...items.slice(index + 1)]);

  return (
    <div className="space-y-3">
      <SortableList items={items} getId={getId} onReorder={onChange}>
        <div className="space-y-3">
          {items.map((item, index) => (
            <SortableItem
              key={getId(item, index)}
              id={getId(item, index)}
              className="border border-charcoal/10 bg-ivory/40"
            >
              {(handle) => (
                <details open className="group">
                  <summary className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm">
                    {handle}
                    <span className="min-w-0 flex-1 truncate font-medium text-charcoal">
                      {summary ? summary(item, index) : `Item ${index + 1}`}
                    </span>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.preventDefault();
                        duplicate(index);
                      }}
                      className="text-[11px] tracking-[0.12em] text-warm-gray uppercase hover:text-charcoal"
                    >
                      Duplicate
                    </button>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.preventDefault();
                        if (confirm("Remove this item?")) remove(index);
                      }}
                      className="text-[11px] tracking-[0.12em] text-maroon uppercase"
                    >
                      Remove
                    </button>
                  </summary>
                  <div className="space-y-4 border-t border-charcoal/10 bg-white p-4">
                    {children(item, (patch) => update(index, patch), index)}
                  </div>
                </details>
              )}
            </SortableItem>
          ))}
        </div>
      </SortableList>

      {max === undefined || items.length < max ? (
        <button
          type="button"
          onClick={() => onChange([...items, create()])}
          className="border border-charcoal/20 bg-white px-4 py-2 text-xs tracking-[0.14em] text-charcoal uppercase hover:border-maroon/40 hover:text-maroon"
        >
          + {addLabel}
        </button>
      ) : null}
    </div>
  );
}

export function newId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

/** Strips the client-only `_id` used for drag keys before saving. */
export function withoutId<T extends { _id: string }>(item: T): Omit<T, "_id"> {
  const copy: Partial<T> = { ...item };
  delete copy._id;
  return copy as Omit<T, "_id">;
}
