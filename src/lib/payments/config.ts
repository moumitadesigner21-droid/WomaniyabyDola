import { getCloudflareContext } from "@opennextjs/cloudflare";

/** Read request-time bindings in Workers and next dev, never client bundles. */
export function paymentEnv(name: string): string {
  if (process.env.NODE_ENV === "development" && process.env[name]) return process.env[name]!.trim();
  try {
    const env = getCloudflareContext().env as unknown as Record<string, unknown>;
    if (typeof env[name] === "string") return (env[name] as string).trim();
  } catch { /* CLI/unit tests may not have Cloudflare context. */ }
  return process.env[name]?.trim() ?? "";
}

export function cashfreeEnvironment(): "sandbox" | "production" {
  const value = paymentEnv("CASHFREE_ENV") || "sandbox";
  if (value !== "sandbox" && value !== "production") throw new Error("Invalid CASHFREE_ENV.");
  return value;
}
