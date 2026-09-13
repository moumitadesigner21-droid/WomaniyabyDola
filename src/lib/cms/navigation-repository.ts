import { batch, queryAll, stmt, type Row } from "@/lib/db";
import type { CmsNavItem } from "@/lib/cms/types";

function rowToNavItem(row: Row): CmsNavItem {
  return {
    id: String(row.id),
    label: String(row.label),
    href: String(row.href),
    parentId: row.parent_id ? String(row.parent_id) : null,
    sortOrder: Number(row.sort_order),
    enabled: Boolean(row.enabled),
    location: String(row.location) as CmsNavItem["location"],
  };
}

export async function listNavigation(
  location?: "header" | "footer",
): Promise<CmsNavItem[]> {
  const rows = location
    ? await queryAll(
        "SELECT * FROM navigation_items WHERE location = ? ORDER BY sort_order, label",
        location,
      )
    : await queryAll(
        "SELECT * FROM navigation_items ORDER BY location, sort_order, label",
      );

  return rows.map(rowToNavItem);
}

export async function replaceNavigation(
  location: "header" | "footer",
  items: Omit<CmsNavItem, "location">[],
): Promise<void> {
  await batch([
    stmt("DELETE FROM navigation_items WHERE location = ?", location),
    ...items.map((item, index) =>
      stmt(
        `INSERT INTO navigation_items (id, label, href, parent_id, sort_order, enabled, location)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        item.id,
        item.label,
        item.href,
        item.parentId,
        item.sortOrder ?? index,
        item.enabled ? 1 : 0,
        location,
      ),
    ),
  ]);
}
