"use client";

import { useCallback, useEffect, useState } from "react";
import { newId } from "@/components/admin/editors/repeater";
import { SaveBar, Tabs, TextField, Toggle } from "@/components/admin/form/fields";
import { LinkField } from "@/components/admin/form/link-field";
import { SortableItem, SortableList } from "@/components/admin/form/sortable";
import type { CmsNavItem } from "@/lib/cms/types";

type Location = "header" | "footer";
type NavItem = Omit<CmsNavItem, "location">;

function NavRow({
  item,
  depth,
  onChange,
  onRemove,
  onAddChild,
}: {
  item: NavItem;
  depth: 0 | 1;
  onChange: (patch: Partial<NavItem>) => void;
  onRemove: () => void;
  onAddChild?: () => void;
}) {
  return (
    <SortableItem id={item.id} className={`border border-charcoal/10 bg-white ${depth ? "ml-10" : ""}`}>
      {(handle) => (
        <div className="grid items-end gap-3 p-3 md:grid-cols-[auto_1fr_1.4fr_auto_auto]">
          <div className="pb-2">{handle}</div>
          <TextField label="Label" value={item.label} onChange={(label) => onChange({ label })} />
          <LinkField label="Link" value={item.href} onChange={(href) => onChange({ href })} />
          <div className="pb-2">
            <Toggle label="Shown" checked={item.enabled} onChange={(enabled) => onChange({ enabled })} />
          </div>
          <div className="flex gap-3 pb-2 text-[11px] tracking-[0.12em] uppercase">
            {onAddChild ? (
              <button type="button" onClick={onAddChild} className="text-charcoal hover:text-maroon">
                + Sub-link
              </button>
            ) : null}
            <button type="button" onClick={onRemove} className="text-maroon">
              Remove
            </button>
          </div>
        </div>
      )}
    </SortableItem>
  );
}

export function AdminNavigationEditor() {
  const [location, setLocation] = useState<Location>("header");
  const [items, setItems] = useState<NavItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const load = useCallback(async (loc: Location) => {
    setLoaded(false);
    const response = await fetch(`/api/admin/navigation?location=${loc}`);
    const payload = (await response.json()) as { items: CmsNavItem[] };
    setItems(payload.items.map((item) => ({ id: item.id, label: item.label, href: item.href, parentId: item.parentId, sortOrder: item.sortOrder, enabled: item.enabled })));
    setLoaded(true);
    setMessage("");
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (!cancelled) await load(location);
    })();
    return () => {
      cancelled = true;
    };
  }, [load, location]);

  const roots = items.filter((item) => !item.parentId).sort((a, b) => a.sortOrder - b.sortOrder);
  const childrenOf = (id: string) =>
    items.filter((item) => item.parentId === id).sort((a, b) => a.sortOrder - b.sortOrder);

  const patch = (id: string, changes: Partial<NavItem>) =>
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...changes } : item)));

  const remove = (id: string) =>
    setItems((current) => current.filter((item) => item.id !== id && item.parentId !== id));

  const add = (parentId: string | null) =>
    setItems((current) => [
      ...current,
      {
        id: newId("nav"),
        label: parentId ? "New sub-link" : "New link",
        href: "/shop",
        parentId,
        sortOrder: current.filter((i) => i.parentId === parentId).length,
        enabled: true,
      },
    ]);

  const reorder = (parentId: string | null, ordered: NavItem[]) =>
    setItems((current) => {
      const ids = ordered.map((item) => item.id);
      return current.map((item) =>
        item.parentId === parentId && ids.includes(item.id)
          ? { ...item, sortOrder: ids.indexOf(item.id) }
          : item,
      );
    });

  const save = async () => {
    setSaving(true);
    setMessage("");
    const response = await fetch("/api/admin/navigation", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ location, items }),
    });
    const payload = (await response.json().catch(() => ({}))) as { error?: string };
    setIsError(!response.ok);
    setMessage(response.ok ? "Navigation saved." : payload.error ?? "Failed to save navigation.");
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-3xl text-maroon">Navigation</h2>
        <p className="mt-2 text-sm text-warm-gray">
          Menu links for the header and the footer “Quick Links” column. Drag to reorder;
          header links can have one level of sub-links shown as a dropdown.
        </p>
      </div>

      <Tabs
        tabs={[
          { id: "header", label: "Header menu" },
          { id: "footer", label: "Footer links" },
        ]}
        active={location}
        onChange={setLocation}
      />

      {!loaded ? (
        <p className="text-sm text-warm-gray">Loading…</p>
      ) : (
        <SortableList items={roots} getId={(item) => item.id} onReorder={(ordered) => reorder(null, ordered)}>
          <div className="space-y-3">
            {roots.map((root) => {
              const children = childrenOf(root.id);
              return (
                <div key={root.id} className="space-y-2">
                  <NavRow
                    item={root}
                    depth={0}
                    onChange={(changes) => patch(root.id, changes)}
                    onRemove={() => remove(root.id)}
                    onAddChild={location === "header" ? () => add(root.id) : undefined}
                  />
                  {children.length ? (
                    <SortableList items={children} getId={(item) => item.id} onReorder={(ordered) => reorder(root.id, ordered)}>
                      <div className="space-y-2">
                        {children.map((child) => (
                          <NavRow
                            key={child.id}
                            item={child}
                            depth={1}
                            onChange={(changes) => patch(child.id, changes)}
                            onRemove={() => remove(child.id)}
                          />
                        ))}
                      </div>
                    </SortableList>
                  ) : null}
                </div>
              );
            })}
          </div>
        </SortableList>
      )}

      <button
        type="button"
        onClick={() => add(null)}
        className="border border-charcoal/20 bg-white px-4 py-2 text-xs tracking-[0.14em] text-charcoal uppercase hover:border-maroon/40 hover:text-maroon"
      >
        + Add link
      </button>

      <SaveBar saving={saving} message={message} isError={isError} onSave={() => void save()} label="Save Navigation" />
    </div>
  );
}
