import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "womania_admin_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function getAdminSecret(): string | null {
  const secret = process.env.ADMIN_PASSWORD?.trim();
  return secret || null;
}

export function createAdminSessionToken(): string {
  const secret = getAdminSecret();
  if (!secret) {
    throw new Error("ADMIN_PASSWORD is not configured");
  }

  const expiresAt = Date.now() + SESSION_TTL_MS;
  const payload = `admin:${expiresAt}`;
  const signature = createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
  return `${payload}.${signature}`;
}

export function verifyAdminSessionToken(token: string | undefined): boolean {
  const secret = getAdminSecret();
  if (!secret || !token) return false;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  const expected = createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  try {
    const validSig = timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expected),
    );
    if (!validSig) return false;
  } catch {
    return false;
  }

  const expiresAt = Number(payload.split(":")[1]);
  return Number.isFinite(expiresAt) && expiresAt > Date.now();
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  return verifyAdminSessionToken(token);
}

export function getAdminSessionCookieOptions() {
  return {
    name: COOKIE_NAME,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  };
}

export { COOKIE_NAME };
