import { getMediaBucket } from "@/lib/db";

export const runtime = "nodejs";

const KEY_PATTERN = /^[a-f0-9-]{36}\.[a-z0-9]{2,5}$/i;

/**
 * Serves admin uploads from R2 at the same `/uploads/cms/<key>` URLs the
 * filesystem version used, so nothing stored in D1 had to change. Objects are
 * immutable (UUID keys) so the edge cache can hold them for a year.
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ key: string }> },
) {
  const { key } = await context.params;
  if (!KEY_PATTERN.test(key)) {
    return new Response("Not found", { status: 404 });
  }

  const object = await getMediaBucket().get(key);
  if (!object) {
    return new Response("Not found", { status: 404 });
  }

  const etag = object.httpEtag;
  if (request.headers.get("if-none-match") === etag) {
    return new Response(null, { status: 304, headers: { ETag: etag } });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("ETag", etag);
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/octet-stream");

  return new Response(object.body, { headers });
}
