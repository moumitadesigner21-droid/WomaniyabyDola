import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Cloudflare bindings for the current request (D1, R2, rate limiters, vars).
 * In `next dev` these are provided by `initOpenNextCloudflareForDev()` in
 * next.config.ts (local Miniflare D1/R2 under .wrangler/state).
 */
export function getEnv(): CloudflareEnv {
  return getCloudflareContext().env;
}

export function getDb(): D1Database {
  return getEnv().DB;
}

export function getMediaBucket(): R2Bucket {
  return getEnv().MEDIA;
}

export type Row = Record<string, unknown>;

/** `SELECT` helper returning typed rows. */
export async function queryAll<T = Row>(
  sql: string,
  ...params: unknown[]
): Promise<T[]> {
  const { results } = await getDb().prepare(sql).bind(...params).all<T>();
  return results;
}

/** `SELECT` helper returning the first row or null. */
export async function queryOne<T = Row>(
  sql: string,
  ...params: unknown[]
): Promise<T | null> {
  return getDb().prepare(sql).bind(...params).first<T>();
}

/** `INSERT`/`UPDATE`/`DELETE` helper returning affected-row count. */
export async function execute(
  sql: string,
  ...params: unknown[]
): Promise<{ changes: number; lastRowId: number }> {
  const result = await getDb().prepare(sql).bind(...params).run();
  return {
    changes: result.meta.changes ?? 0,
    lastRowId: result.meta.last_row_id ?? 0,
  };
}

/**
 * Runs statements atomically. D1 has no interactive transactions; `batch`
 * is the supported all-or-nothing primitive.
 */
export function batch(statements: D1PreparedStatement[]) {
  return getDb().batch(statements);
}

export function stmt(sql: string, ...params: unknown[]): D1PreparedStatement {
  return getDb().prepare(sql).bind(...params);
}

/** Generates a v4 UUID with Web Crypto (works in Workers and Node). */
export function uuid(): string {
  return crypto.randomUUID();
}

export function nowIso(): string {
  return new Date().toISOString();
}
