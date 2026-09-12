import { formatOwnerEmailHtml } from "@/lib/orders/message";
import type { Order } from "@/lib/orders/types";

export async function sendOwnerEmailNotification(
  order: Order,
  toEmail: string,
): Promise<{ success: boolean; error: string | null }> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail =
    process.env.ORDER_EMAIL_FROM ?? "orders@womaniabydola.com";

  if (!apiKey) {
    return {
      success: false,
      error: "Email backup not configured (RESEND_API_KEY missing).",
    };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `Womania Orders <${fromEmail}>`,
        to: [toEmail],
        subject: `New Order #${order.orderNumber} — ${order.customerName}`,
        html: formatOwnerEmailHtml(order),
      }),
    });

    const payload = (await response.json()) as { message?: string };

    if (!response.ok) {
      return {
        success: false,
        error: payload.message ?? `Email API error (${response.status})`,
      };
    }

    return { success: true, error: null };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Unknown email delivery error",
    };
  }
}
