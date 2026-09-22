import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin/session";
import { withErrorHandling } from "@/lib/api/validation";
import { sniffImageType } from "@/lib/cms/image-sniff";
import { UPLOAD_PREFIX, uploadKeyFromUrl } from "@/lib/cms/media";
import { isImageUrlReferenced } from "@/lib/cms/products-repository";
import { getMediaBucket, uuid } from "@/lib/db";

export const runtime = "nodejs";

const MAX_BYTES = 8 * 1024 * 1024;

/** Only raster images are accepted — SVG/HTML would execute same-origin. */
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/avif": ".avif",
  "image/gif": ".gif",
};

export const POST = withErrorHandling(async (request: Request) => {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `Image must be under ${MAX_BYTES / 1024 / 1024} MB.` },
      { status: 413 },
    );
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const sniffed = sniffImageType(bytes);

  if (sniffed === "image/heic") {
    return NextResponse.json(
      {
        error:
          "This iPhone photo (HEIC) could not be converted. Upload it again, or send a JPEG.",
      },
      { status: 415 },
    );
  }

  const ext = sniffed ? ALLOWED_TYPES[sniffed] : undefined;

  if (!sniffed || !ext) {
    return NextResponse.json(
      { error: "Only JPEG, PNG, WebP, AVIF or GIF images are allowed." },
      { status: 415 },
    );
  }

  const key = `${uuid()}${ext}`;
  await getMediaBucket().put(key, bytes, {
    httpMetadata: {
      contentType: sniffed,
      cacheControl: "public, max-age=31536000, immutable",
    },
  });

  return NextResponse.json({ url: `${UPLOAD_PREFIX}${key}` });
});

export interface MediaItem {
  key: string;
  url: string;
  size: number;
  uploaded: string;
  contentType: string | null;
}

/** Lists uploads in R2, newest first within each page. */
export const GET = withErrorHandling(async (request: Request) => {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor") ?? undefined;

  const listed = await getMediaBucket().list({
    limit: 60,
    cursor,
    include: ["httpMetadata"],
  });

  const items: MediaItem[] = listed.objects
    .map((object) => ({
      key: object.key,
      url: `${UPLOAD_PREFIX}${object.key}`,
      size: object.size,
      uploaded: object.uploaded.toISOString(),
      contentType: object.httpMetadata?.contentType ?? null,
    }))
    .sort((a, b) => b.uploaded.localeCompare(a.uploaded));

  return NextResponse.json({
    items,
    cursor: listed.truncated ? listed.cursor : null,
  });
});

/** Deletes an upload unless a product or content blob still references it. */
export const DELETE = withErrorHandling(async (request: Request) => {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url") ?? "";
  const key = uploadKeyFromUrl(url);
  if (!key) {
    return NextResponse.json({ error: "Invalid media URL." }, { status: 400 });
  }

  if (await isImageUrlReferenced(url)) {
    return NextResponse.json(
      { error: "This image is still used by a product or page. Remove it there first." },
      { status: 409 },
    );
  }

  await getMediaBucket().delete(key);
  return NextResponse.json({ success: true });
});
