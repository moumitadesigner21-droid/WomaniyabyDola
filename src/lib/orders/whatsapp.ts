import {
  formatCustomerWhatsAppMessage,
  formatOwnerWhatsAppMessage,
} from "@/lib/orders/message";
import type { Order } from "@/lib/orders/types";

function normalizeWhatsAppNumber(number: string): string {
  const digits = number.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

function toCallMeBotPhone(number: string): string {
  const digits = normalizeWhatsAppNumber(number);
  return `+${digits}`;
}

export async function sendWhatsAppText(
  recipientNumber: string,
  body: string,
): Promise<{ success: boolean; error: string | null }> {
  const meta = await sendViaMetaCloudApi(recipientNumber, body);
  if (meta.success) return meta;

  const callMeBot = await sendViaCallMeBot(recipientNumber, body);
  if (callMeBot.success) return callMeBot;

  const hasMeta = Boolean(
    process.env.WHATSAPP_API_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID,
  );
  const hasCallMeBot = Boolean(process.env.CALLMEBOT_API_KEY?.trim());

  if (!hasMeta && !hasCallMeBot) {
    return {
      success: false,
      error:
        "WhatsApp not configured. Add Meta Cloud API credentials or CALLMEBOT_API_KEY as a Worker secret.",
    };
  }

  return {
    success: false,
    error: meta.error ?? callMeBot.error ?? "WhatsApp delivery failed.",
  };
}

async function sendViaMetaCloudApi(
  recipientNumber: string,
  body: string,
): Promise<{ success: boolean; error: string | null }> {
  const token = process.env.WHATSAPP_API_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    return { success: false, error: null };
  }

  const to = normalizeWhatsAppNumber(recipientNumber);

  try {
    const response = await fetch(
      `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to,
          type: "text",
          text: { preview_url: false, body },
        }),
      },
    );

    const raw = await response.text();
    let payload: { error?: { message?: string } } = {};

    if (raw) {
      try {
        payload = JSON.parse(raw) as { error?: { message?: string } };
      } catch {
        return {
          success: false,
          error: `WhatsApp API returned an invalid response (${response.status}).`,
        };
      }
    }

    if (!response.ok) {
      return {
        success: false,
        error: payload.error?.message ?? `WhatsApp API error (${response.status})`,
      };
    }

    return { success: true, error: null };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unknown WhatsApp delivery error",
    };
  }
}

async function sendViaCallMeBot(
  recipientNumber: string,
  body: string,
): Promise<{ success: boolean; error: string | null }> {
  const apiKey = process.env.CALLMEBOT_API_KEY?.trim();
  if (!apiKey) {
    return { success: false, error: null };
  }

  const phone = toCallMeBotPhone(recipientNumber);
  const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(phone)}&text=${encodeURIComponent(body)}&apikey=${encodeURIComponent(apiKey)}`;

  try {
    const response = await fetch(url);
    const responseBody = (await response.text()).trim();

    if (!response.ok) {
      return {
        success: false,
        error: responseBody || `CallMeBot error (${response.status})`,
      };
    }

    const lower = responseBody.toLowerCase();
    if (lower.includes("error") || lower.includes("invalid")) {
      return { success: false, error: responseBody };
    }

    return { success: true, error: null };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "CallMeBot delivery error",
    };
  }
}

export async function sendOwnerWhatsAppNotification(
  order: Order,
  ownerNumber: string,
): Promise<{ success: boolean; error: string | null }> {
  return sendWhatsAppText(ownerNumber, await formatOwnerWhatsAppMessage(order));
}

export async function sendCustomerWhatsAppNotification(
  order: Order,
): Promise<{ success: boolean; error: string | null }> {
  if (!order.customerPhone?.trim()) {
    return { success: false, error: "Customer phone number is missing." };
  }

  return sendWhatsAppText(
    order.customerPhone,
    await formatCustomerWhatsAppMessage(order),
  );
}
