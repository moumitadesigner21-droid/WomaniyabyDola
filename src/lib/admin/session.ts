import { cookies } from "next/headers";

const COOKIE_NAME = "womania_admin_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const encoder = new TextEncoder();

export interface AdminSession {
  userId: string;
  username: string;
  expiresAt: number;
}

function getSessionSecret(): string | null {
  // Dedicated signing secret; falls back to ADMIN_PASSWORD for older setups.
  const secret =
    process.env.ADMIN_SESSION_SECRET?.trim() || process.env.ADMIN_PASSWORD?.trim();
  return secret || null;
}

async function hmac(secret: string, payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function encodePayload(session: AdminSession): string {
  return btoa(JSON.stringify(session)).replace(/=+$/, "");
}

function decodePayload(value: string): AdminSession | null {
  try {
    const parsed = JSON.parse(atob(value)) as Partial<AdminSession>;
    if (
      typeof parsed.userId !== "string" ||
      typeof parsed.username !== "string" ||
      typeof parsed.expiresAt !== "number"
    ) {
      return null;
    }
    return parsed as AdminSession;
  } catch {
    return null;
  }
}

export async function createAdminSessionToken(user: {
  id: string;
  username: string;
}): Promise<string> {
  const secret = getSessionSecret();
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET is not configured");
  }

  const payload = encodePayload({
    userId: user.id,
    username: user.username,
    expiresAt: Date.now() + SESSION_TTL_MS,
  });
  const signature = await hmac(secret, payload);
  return `${payload}.${signature}`;
}

export async function verifyAdminSessionToken(
  token: string | undefined,
): Promise<AdminSession | null> {
  const secret = getSessionSecret();
  if (!secret || !token) return null;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = await hmac(secret, payload);
  if (!constantTimeEqual(signature, expected)) return null;

  const session = decodePayload(payload);
  if (!session || session.expiresAt <= Date.now()) return null;
  return session;
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  return verifyAdminSessionToken(cookieStore.get(COOKIE_NAME)?.value);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  return (await getAdminSession()) !== null;
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
