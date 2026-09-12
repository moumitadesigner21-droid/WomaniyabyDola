"use client";

import { useEffect, useState } from "react";
import type { CmsNavItem } from "@/lib/cms/types";

export function AdminNavigationEditor() {
  const [items, setItems] = useState<CmsNavItem[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    void (async () => {
      const response = await fetch("/api/admin/navigation?location=header");
      const payload = (await response.json()) as { items: CmsNavItem[] };
      setItems(payload.items);
    })();
  }, []);

  const updateItem = (index: number, patch: Partial<CmsNavItem>) => {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    );
  };

  const addItem = () => {
    setItems((current) => [
      ...current,
      {
        id: `nav-${Date.now()}`,
        label: "New Link",
        href: "/",
        parentId: null,
        sortOrder: current.length,
        enabled: true,
        location: "header",
      },
    ]);
  };

  const save = async () => {
    const response = await fetch("/api/admin/navigation", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ location: "header", items }),
    });

    setMessage(response.ok ? "Navigation saved." : "Failed to save navigation.");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl text-maroon">Navigation</h2>
          <p className="mt-2 text-sm text-warm-gray">
            Manage main menu links, order, and visibility.
          </p>
        </div>
        <button
          type="button"
          onClick={addItem}
          className="border border-charcoal/15 bg-white px-4 py-2 text-xs tracking-[0.14em] uppercase"
        >
          Add Menu Item
        </button>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="grid gap-3 border border-charcoal/10 bg-white p-4 md:grid-cols-[1fr_1fr_auto_auto]"
          >
            <input
              value={item.label}
              onChange={(e) => updateItem(index, { label: e.target.value })}
              className="border border-charcoal/15 px-3 py-2 text-sm"
              placeholder="Label"
            />
            <input
              value={item.href}
              onChange={(e) => updateItem(index, { href: e.target.value })}
              className="border border-charcoal/15 px-3 py-2 text-sm"
              placeholder="/path"
            />
            <input
              type="number"
              value={item.sortOrder}
              onChange={(e) =>
                updateItem(index, { sortOrder: Number(e.target.value) })
              }
              className="w-20 border border-charcoal/15 px-3 py-2 text-sm"
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={item.enabled}
                onChange={(e) => updateItem(index, { enabled: e.target.checked })}
              />
              Enabled
            </label>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={save}
        className="border border-maroon bg-maroon px-4 py-2 text-xs tracking-[0.14em] text-ivory uppercase"
      >
        Save Navigation
      </button>

      {message ? <p className="text-sm text-maroon">{message}</p> : null}
    </div>
  );
}
