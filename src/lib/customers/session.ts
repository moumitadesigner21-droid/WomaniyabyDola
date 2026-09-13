import { cookies } from "next/headers";
import { cache } from "react";
import { getCustomerById } from "@/lib/customers/repository";
import type { Customer } from "@/lib/customers/types";

const COOKIE_NAME = "womania_customer_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const encoder = new TextEncoder();

interface CustomerSession {
  customerId: string;
  expiresAt: number;
}

function getSecret(): string | null {
  // Separate key space from the admin cookie even if the same secret is reused.
  const base =
    process.env.CUSTOMER_SESSION_SECRET?.trim() ||
    process.env.ADMIN_SESSION_SECRET?.trim() ||
    process.env.ADMIN_PASSWORD?.trim();
  return base ? `customer:${base}` : null;
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

export async function createCustomerSessionToken(customerId: string): Promise<string> {
  const secret = getSecret();
  if (!secret) throw new Error("Session secret is not configured");
  const payload = btoa(
    JSON.stringify({ customerId, expiresAt: Date.now() + SESSION_TTL_MS } satisfies CustomerSession),
  ).replace(/=+$/, "");
  return `${payload}.${await hmac(secret, payload)}`;
}

export async function verifyCustomerSessionToken(
  token: string | undefined,
): Promise<CustomerSession | null> {
  const secret = getSecret();
  if (!secret || !token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  if (!constantTimeEqual(signature, await hmac(secret, payload))) return null;
  try {
    const session = JSON.parse(atob(payload)) as Partial<CustomerSession>;
    if (typeof session.customerId !== "string" || typeof session.expiresAt !== "number") return null;
    if (session.expiresAt <= Date.now()) return null;
    return session as CustomerSession;
  } catch {
    return null;
  }
}

/** The signed-in customer for this request, or null. Memoised per request. */
export const getCurrentCustomer = cache(async (): Promise<Customer | null> => {
  const cookieStore = await cookies();
  const session = await verifyCustomerSessionToken(cookieStore.get(COOKIE_NAME)?.value);
  if (!session) return null;
  return getCustomerById(session.customerId);
});

export function getCustomerCookieOptions() {
  return {
    name: COOKIE_NAME,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  };
}

export { COOKIE_NAME as CUSTOMER_COOKIE_NAME };
