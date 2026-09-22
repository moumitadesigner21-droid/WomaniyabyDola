import type { Order } from "@/lib/orders/types";
import { cashfreeEnvironment, paymentEnv } from "./config";

const CASHFREE_SANDBOX_URL = "https://sandbox.cashfree.com/pg";
const CASHFREE_PRODUCTION_URL = "https://api.cashfree.com/pg";

export class CashfreeApiError extends Error {
  constructor(message: string, public status: number, public code?: string) { super(message); }
}

function getConfig() {
  const clientId = paymentEnv("CASHFREE_CLIENT_ID");
  const clientSecret = paymentEnv("CASHFREE_CLIENT_SECRET");
  if (!clientId || !clientSecret) {
    throw new Error("Cashfree is not configured. Add CASHFREE_CLIENT_ID and CASHFREE_CLIENT_SECRET.");
  }
  const environment = cashfreeEnvironment();
  return {
    clientId,
    clientSecret,
    environment,
    apiVersion: paymentEnv("CASHFREE_API_VERSION") || "2025-01-01",
    baseUrl: environment === "production" ? CASHFREE_PRODUCTION_URL : CASHFREE_SANDBOX_URL,
  };
}

function headers(config: ReturnType<typeof getConfig>, requestId: string) {
  return {
    "Content-Type": "application/json",
    "x-client-id": config.clientId,
    "x-client-secret": config.clientSecret,
    "x-api-version": config.apiVersion,
    "x-request-id": requestId,
  };
}

export interface CashfreeOrderResponse {
  cf_order_id?: string;
  order_id?: string;
  order_status?: string;
  payment_session_id?: string;
  order_amount?: number;
  order_currency?: string;
  order_expiry_time?: string;
}

export interface CashfreePaymentResponse {
  cf_payment_id?: number | string;
  payment_status?: string;
  payment_amount?: number;
  payment_currency?: string;
  payment_method?: Record<string, unknown>;
  payment_message?: string;
}

export async function createCashfreeOrder(order: Order, returnUrl: string, notifyUrl: string) {
  const config = getConfig();
  const response = await fetch(`${config.baseUrl}/orders`, {
    signal: AbortSignal.timeout(15_000),
    method: "POST",
    headers: {
      ...headers(config, order.id),
      "x-idempotency-key": order.id,
    },
    body: JSON.stringify({
      order_id: order.orderNumber,
      order_amount: order.total,
      order_currency: "INR",
      order_expiry_time: order.inventoryReservedUntil,
      customer_details: {
        customer_id: order.customerId ?? order.id,
        customer_name: order.customerName,
        customer_phone: order.customerPhone.replace(/\D/g, "").slice(-10),
        ...(order.customerEmail ? { customer_email: order.customerEmail } : {}),
      },
      order_meta: {
        return_url: `${returnUrl}?order_id=${encodeURIComponent(order.orderNumber)}&token=${order.id}`,
        notify_url: notifyUrl,
        payment_methods: "cc,dc",
      },
      order_note: `Womania order ${order.orderNumber}`,
    }),
  });
  const payload = (await response.json().catch(() => ({}))) as CashfreeOrderResponse & { message?: string };
  if (!response.ok || !payload.payment_session_id) {
    throw new Error(payload.message || `Cashfree order creation failed (${response.status}).`);
  }
  return payload;
}

export async function getCashfreeOrder(orderId: string) {
  const config = getConfig();
  const response = await fetch(`${config.baseUrl}/orders/${encodeURIComponent(orderId)}`, {
    signal: AbortSignal.timeout(15_000),
    headers: headers(config, `status-${orderId}`),
  });
  const payload = (await response.json().catch(() => ({}))) as CashfreeOrderResponse & { message?: string; code?: string };
  if (!response.ok) throw new CashfreeApiError(payload.message || `Cashfree status lookup failed (${response.status}).`, response.status, payload.code);
  return payload;
}

export async function getCashfreePayments(orderId: string) {
  const config = getConfig();
  const response = await fetch(`${config.baseUrl}/orders/${encodeURIComponent(orderId)}/payments`, {
    signal: AbortSignal.timeout(15_000),
    headers: headers(config, `payments-${orderId}`),
  });
  const payload = (await response.json().catch(() => [])) as CashfreePaymentResponse[] & { message?: string };
  if (!response.ok || !Array.isArray(payload)) throw new Error(payload.message || `Cashfree payment lookup failed (${response.status}).`);
  return payload;
}

export async function verifyCashfreeWebhook(rawBody: string, timestamp: string | null, signature: string | null) {
  // Cashfree PG signs with the merchant API secret, not a separate arbitrary token.
  const secret = paymentEnv("CASHFREE_CLIENT_SECRET");
  if (!secret || !timestamp || !signature) return false;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );
  try {
    const bytes = Uint8Array.from(atob(signature), (c) => c.charCodeAt(0));
    return await crypto.subtle.verify("HMAC", key, bytes, new TextEncoder().encode(timestamp + rawBody));
  } catch { return false; }
}

export function isCashfreeConfigured() {
  return Boolean(paymentEnv("CASHFREE_CLIENT_ID") && paymentEnv("CASHFREE_CLIENT_SECRET"));
}
