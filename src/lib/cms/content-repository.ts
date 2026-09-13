import { cache } from "react";
import { execute, nowIso, queryAll, queryOne } from "@/lib/db";

/**
 * Reads a JSON blob from `site_content`. Memoised per request with React
 * `cache()` so Header/Footer/page reading the same key share one D1 query.
 */
export const getSiteContent = cache(async function getSiteContent<T>(
  key: string,
  fallback: T,
): Promise<T> {
  const row = await queryOne<{ value: string }>(
    "SELECT value FROM site_content WHERE key = ?",
    key,
  );

  if (!row?.value) return fallback;

  try {
    return JSON.parse(row.value) as T;
  } catch {
    return fallback;
  }
}) as <T>(key: string, fallback: T) => Promise<T>;

export async function upsertSiteContent(key: string, value: unknown): Promise<void> {
  await execute(
    `INSERT INTO site_content (key, value, updated_at)
     VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
    key,
    JSON.stringify(value),
    nowIso(),
  );
}

export async function listSiteContentKeys() {
  return queryAll<{ key: string; updated_at: string }>(
    "SELECT key, updated_at FROM site_content ORDER BY key",
  );
}
