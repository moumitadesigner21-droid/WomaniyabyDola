/**
 * Client-side image preparation + upload to R2 via /api/admin/media.
 * Photos are downscaled to MAX_EDGE and re-encoded as WebP before upload so
 * phone originals never hit the bucket. GIFs and small non-HEIC files pass
 * through unchanged. HEIC (the iPhone camera default) is always converted;
 * the original is never uploaded, because the server cannot display it.
 */
import { sniffImageType } from "@/lib/cms/image-sniff";

const MAX_EDGE = 1600;
const WEBP_QUALITY = 0.85;
const SKIP_RESIZE_BELOW_BYTES = 300 * 1024;

export const HEIC_UPLOAD_ERROR =
  "This iPhone photo could not be converted. Try uploading it again, or send it as a JPEG.";

export const UPLOAD_DROPPED_ERROR =
  "The connection dropped. Check the media library before uploading this photo again — it may already be there.";

let pendingUploads = 0;
const uploadListeners = new Set<() => void>();

function emitUploadCount() {
  for (const listener of uploadListeners) listener();
}

export function subscribeUploadCount(listener: () => void) {
  uploadListeners.add(listener);
  return () => uploadListeners.delete(listener);
}

export function getUploadCount() {
  return pendingUploads;
}

function beginUpload() {
  pendingUploads += 1;
  emitUploadCount();
}

function endUpload() {
  pendingUploads = Math.max(0, pendingUploads - 1);
  emitUploadCount();
}

export interface UploadResult {
  url: string;
}

async function isHeic(file: File) {
  if (/image\/hei[cf]/i.test(file.type) || /\.hei[cf]$/i.test(file.name)) return true;
  const header = new Uint8Array(await file.slice(0, 128).arrayBuffer());
  return sniffImageType(header) === "image/heic";
}

/** WebP file, or null when the browser could not encode one. */
async function downscaleToWebp(file: File): Promise<File | null> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return null;
    }
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", WEBP_QUALITY),
    );
    if (!blob) return null;

    const name = file.name.replace(/\.[a-z0-9]+$/i, "") + ".webp";
    return new File([blob], name, { type: "image/webp" });
  } catch {
    return null;
  }
}

async function prepareImage(file: File): Promise<File> {
  const heic = await isHeic(file);
  if (!heic && (file.type === "image/gif" || file.size < SKIP_RESIZE_BELOW_BYTES)) {
    return file;
  }

  const webp = await downscaleToWebp(file);
  if (webp && (heic || webp.size < file.size)) return webp;
  if (heic) throw new Error(HEIC_UPLOAD_ERROR);
  return file;
}

export async function uploadImage(file: File): Promise<UploadResult> {
  beginUpload();
  try {
    const prepared = await prepareImage(file);
    const body = new FormData();
    body.append("file", prepared);

    let response: Response;
    try {
      response = await fetch("/api/admin/media", { method: "POST", body });
    } catch (error) {
      if (error instanceof TypeError) throw new Error(UPLOAD_DROPPED_ERROR);
      throw error;
    }

    const payload = (await response.json().catch(() => ({}))) as {
      url?: string;
      error?: string;
    };
    if (!response.ok || !payload.url) {
      throw new Error(payload.error ?? "Upload failed.");
    }
    return { url: payload.url };
  } finally {
    endUpload();
  }
}
