/**
 * Identifies a raster image from its header.
 * HEIC (iPhone) and AVIF are both HEIF: both start with an `ftyp` box, so the
 * brand list has to be read. Treating every `ftyp` as AVIF stores HEIC bytes
 * under an `.avif` name, and the photo then fails to display.
 */
const HEIC_BRANDS = new Set(["heic", "heix", "hevc", "hevx", "heim", "heis", "hevm", "hevs"]);
const AVIF_BRANDS = new Set(["avif", "avis"]);

export type SniffedImageType =
  | "image/jpeg"
  | "image/png"
  | "image/gif"
  | "image/webp"
  | "image/avif"
  | "image/heic";

function startsWith(bytes: Uint8Array, magic: number[], offset = 0) {
  if (bytes.length < offset + magic.length) return false;
  return magic.every((byte, index) => bytes[offset + index] === byte);
}

function fourcc(bytes: Uint8Array, offset: number) {
  if (bytes.length < offset + 4) return "";
  return String.fromCharCode(
    bytes[offset],
    bytes[offset + 1],
    bytes[offset + 2],
    bytes[offset + 3],
  ).toLowerCase();
}

function ftypBrands(bytes: Uint8Array): string[] {
  if (fourcc(bytes, 4) !== "ftyp" || bytes.length < 12) return [];
  const size = (bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3];
  const end = Math.min(bytes.length, size > 16 ? size : bytes.length);
  const brands = [fourcc(bytes, 8)];
  for (let offset = 16; offset + 4 <= end; offset += 4) {
    brands.push(fourcc(bytes, offset));
  }
  return brands.filter((brand) => /^[a-z0-9]{4}$/.test(brand));
}

export function sniffImageType(bytes: Uint8Array): SniffedImageType | null {
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return "image/jpeg";
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47])) return "image/png";
  if (startsWith(bytes, [0x47, 0x49, 0x46, 0x38])) return "image/gif";
  if (startsWith(bytes, [0x57, 0x45, 0x42, 0x50], 8)) return "image/webp";

  const brands = ftypBrands(bytes);
  if (!brands.length) return null;
  if (brands.some((brand) => AVIF_BRANDS.has(brand))) return "image/avif";
  if (
    brands.some((brand) => HEIC_BRANDS.has(brand)) ||
    brands.includes("mif1") ||
    brands.includes("msf1")
  ) {
    return "image/heic";
  }
  return null;
}
