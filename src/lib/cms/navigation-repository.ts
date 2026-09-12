import { getDb } from "@/lib/orders/db";
import type { CmsNavItem } from "@/lib/cms/types";

export function listNavigation(location?: "header" | "footer"): CmsNavItem[] {
  const database = getDb();
  const query = location
    ? "SELECT * FROM navigation_items WHERE location = ? ORDER BY sort_order, label"
    : "SELECT * FROM navigation_items ORDER BY location, sort_order, label";

  const rows = location
    ? (database.prepare(query).all(location) as Record<string, unknown>[])
    : (database.prepare(query).all() as Record<string, unknown>[]);

  return rows.map((row) => ({
    id: String(row.id),
    label: String(row.label),
    href: String(row.href),
    parentId: row.parent_id ? String(row.parent_id) : null,
    sortOrder: Number(row.sort_order),
    enabled: Boolean(row.enabled),
    location: String(row.location) as CmsNavItem["location"],
  }));
}

export function replaceNavigation(
  location: "header" | "footer",
  items: Omit<CmsNavItem, "location">[],
) {
  const database = getDb();
  database
    .prepare("DELETE FROM navigation_items WHERE location = ?")
    .run(location);

  const insert = database.prepare(`
    INSERT INTO navigation_items (id, label, href, parent_id, sort_order, enabled, location)
    VALUES (@id, @label, @href, @parentId, @sortOrder, @enabled, @location)
  `);

  items.forEach((item, index) => {
    insert.run({
      id: item.id,
      label: item.label,
      href: item.href,
      parentId: item.parentId,
      sortOrder: item.sortOrder ?? index,
      enabled: item.enabled ? 1 : 0,
      location,
    });
  });
}
