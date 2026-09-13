/**
 * Canonical public origin, used for metadataBase, sitemap and JSON-LD.
 * Set SITE_URL (server) or NEXT_PUBLIC_SITE_URL in production; falls back
 * to localhost in dev. SITE_URL is preferred because NEXT_PUBLIC_* values
 * are inlined at build time and may be stale if the build ran elsewhere.
 */
export function getSiteUrl(): URL {
  const raw =
    process.env.SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    "http://localhost:3000";
  return new URL(raw);
}
