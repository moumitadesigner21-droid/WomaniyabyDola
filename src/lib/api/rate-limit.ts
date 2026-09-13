import { execute, getEnv, queryOne } from "@/lib/db";

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

export type LimiterName = "LOGIN_LIMITER" | "ORDER_LIMITER" | "QUOTE_LIMITER";

/** Fallback windows (per key) used when a limiter binding is unavailable. */
const FALLBACK: Record<LimiterName, { limit: number; windowMs: number }> = {
  LOGIN_LIMITER: { limit: 5, windowMs: 15 * 60 * 1000 },
  ORDER_LIMITER: { limit: 10, windowMs: 10 * 60 * 1000 },
  QUOTE_LIMITER: { limit: 60, windowMs: 60 * 1000 },
};

/**
 * Throttles by key using the Workers rate-limit binding when present
 * (edge-local, no storage cost) and a small D1 table otherwise (e.g. local
 * `next dev` without the binding, or if the binding is removed).
 */
export async function rateLimit(
  limiter: LimiterName,
  key: string,
): Promise<RateLimitResult> {
  const binding = getEnv()[limiter] as RateLimit | undefined;
  if (binding && typeof binding.limit === "function") {
    const { success } = await binding.limit({ key });
    return { allowed: success, retryAfterSeconds: success ? 0 : 60 };
  }

  return rateLimitInD1(`${limiter}:${key}`, FALLBACK[limiter]);
}

async function rateLimitInD1(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number },
): Promise<RateLimitResult> {
  const now = Date.now();
  const cutoff = now - windowMs;

  const row = await queryOne<{ hits: string }>(
    "SELECT hits FROM rate_limits WHERE key = ?",
    key,
  );
  let hits: number[] = [];
  try {
    hits = row ? (JSON.parse(row.hits) as number[]).filter((ts) => ts > cutoff) : [];
  } catch {
    hits = [];
  }

  if (hits.length >= limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((hits[0] + windowMs - now) / 1000)),
    };
  }

  hits.push(now);
  await execute(
    `INSERT INTO rate_limits (key, hits, updated_at) VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET hits = excluded.hits, updated_at = excluded.updated_at`,
    key,
    JSON.stringify(hits),
    now,
  );
  return { allowed: true, retryAfterSeconds: 0 };
}

export function getClientIp(request: Request): string {
  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}
