export function formatPrice(price: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

const WHATSAPP_NUMBER = "919775301488";

export const storePhoneDisplay = "9775301488";
export const storeEmail = "womaniadesignstudio@gmail.com";

export function getWhatsAppContactUrl(params: {
  name: string;
  email: string;
  phone: string;
  company?: string;
  message: string;
}) {
  const lines = [
    "Hi Womania, I have a question:",
    "",
    `Name: ${params.name}`,
    `Email: ${params.email}`,
    `Phone: ${params.phone}`,
  ];
  if (params.company?.trim()) lines.push(`Company: ${params.company.trim()}`);
  lines.push("", params.message.trim());

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`;
}

export function getWhatsAppOrderUrl(
  productName: string,
  size?: string,
  details?: string,
) {
  const lines = [`Hi, I'd like to order: ${productName}`];
  if (size) lines.push(`Size: ${size}`);
  if (details) lines.push(details);

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`;
}

export function getWhatsAppCartOrderUrl(params: {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
  items: Array<{
    name: string;
    price: number;
    quantity: number;
    size?: string;
  }>;
  subtotal: number;
}) {
  const lines = [
    "Hi Womania, I'd like to place an order:",
    "",
    `Name: ${params.name}`,
    `Phone: ${params.phone}`,
  ];

  if (params.email?.trim()) lines.push(`Email: ${params.email.trim()}`);
  if (params.address?.trim()) lines.push(`Address: ${params.address.trim()}`);
  lines.push("", "Order details:");

  params.items.forEach((item, index) => {
    const sizeSuffix = item.size ? ` (${item.size})` : "";
    lines.push(
      `${index + 1}. ${item.name}${sizeSuffix} x ${item.quantity} — ${formatPrice(item.price * item.quantity)}`,
    );
  });

  lines.push("", `Estimated total: ${formatPrice(params.subtotal)}`);
  if (params.notes?.trim()) {
    lines.push("", `Notes: ${params.notes.trim()}`);
  }

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`;
}
