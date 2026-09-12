import { getDb } from "@/lib/orders/db";

export function getSiteContent<T>(key: string, fallback: T): T {
  const database = getDb();
  const row = database
    .prepare("SELECT value FROM site_content WHERE key = ?")
    .get(key) as { value: string } | undefined;

  if (!row?.value) return fallback;

  try {
    return JSON.parse(row.value) as T;
  } catch {
    return fallback;
  }
}

export function upsertSiteContent(key: string, value: unknown) {
  const database = getDb();
  database
    .prepare(
      `INSERT INTO site_content (key, value, updated_at)
       VALUES (?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
    )
    .run(key, JSON.stringify(value), new Date().toISOString());
}

export function listSiteContentKeys() {
  const database = getDb();
  const rows = database
    .prepare("SELECT key, updated_at FROM site_content ORDER BY key")
    .all() as { key: string; updated_at: string }[];

  return rows;
}
