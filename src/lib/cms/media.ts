import { getMediaBucket } from "@/lib/db";
import { isImageUrlReferenced } from "@/lib/cms/products-repository";

export const UPLOAD_PREFIX = "/uploads/cms/";

/** R2 object key for a public upload URL, or null if it isn't one of ours. */
export function uploadKeyFromUrl(url: string): string | null {
  if (!url.startsWith(UPLOAD_PREFIX)) return null;
  const key = url.slice(UPLOAD_PREFIX.length);
  // Keys are `<uuid>.<ext>`; reject anything else (traversal, nested paths).
  return /^[a-f0-9-]{36}\.[a-z0-9]{2,5}$/i.test(key) ? key : null;
}

/**
 * Removes uploaded objects that nothing references any more. Call after the
 * owning row has been deleted. Silently skips non-upload URLs and any object
 * still referenced elsewhere.
 */
export async function deleteOrphanedUploads(
  urls: (string | null | undefined)[],
): Promise<void> {
  const bucket = getMediaBucket();
  const candidates = [...new Set(urls.filter((u): u is string => Boolean(u)))];

  for (const url of candidates) {
    const key = uploadKeyFromUrl(url);
    if (!key) continue;
    if (await isImageUrlReferenced(url)) continue;

    try {
      await bucket.delete(key);
    } catch (error) {
      console.warn(`Could not remove upload ${url}:`, error);
    }
  }
}
