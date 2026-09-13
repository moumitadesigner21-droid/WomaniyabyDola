/**
 * Client-side image preparation + upload to R2 via /api/admin/media.
 * Photos are downscaled to MAX_EDGE and re-encoded as WebP before upload so
 * phone originals (5–8 MB) never hit the bucket; GIFs and small files pass
 * through unchanged.
 */
const MAX_EDGE = 1600;
const WEBP_QUALITY = 0.85;
const SKIP_RESIZE_BELOW_BYTES = 300 * 1024;

export interface UploadResult {
  url: string;
}

async function downscaleToWebp(file: File): Promise<File> {
  if (file.type === "image/gif" || file.size < SKIP_RESIZE_BELOW_BYTES) {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", WEBP_QUALITY),
    );
    if (!blob || blob.size >= file.size) return file;

    const name = file.name.replace(/\.[a-z0-9]+$/i, "") + ".webp";
    return new File([blob], name, { type: "image/webp" });
  } catch {
    return file;
  }
}

export async function uploadImage(file: File): Promise<UploadResult> {
  const prepared = await downscaleToWebp(file);
  const body = new FormData();
  body.append("file", prepared);

  const response = await fetch("/api/admin/media", { method: "POST", body });
  const payload = (await response.json().catch(() => ({}))) as {
    url?: string;
    error?: string;
  };
  if (!response.ok || !payload.url) {
    throw new Error(payload.error ?? "Upload failed.");
  }
  return { url: payload.url };
}
