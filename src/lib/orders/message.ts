import { formatPrice } from "@/lib/format";
import {
  getCustomerWhatsAppTemplate,
  getWhatsAppTemplate,
} from "@/lib/storefront";
import type { Order } from "@/lib/orders/types";

function paymentLabel(status: string): string {
  switch (status) {
    case "COD":
      return "Cash on Delivery";
    case "paid":
      return "Paid";
    default:
      return "Pending";
  }
}

function buildItemsBlock(order: Order) {
  return order.items
    .map((item, index) => {
      const variant = item.variantLabel ?? (item.size ? `Size: ${item.size}` : "Standard");
      return [
        `${index + 1}. ${item.name}`,
        `   Variant: ${variant}`,
        `   Qty: ${item.quantity} · ${formatPrice(item.price)} each`,
        `   Line total: ${formatPrice(item.price * item.quantity)}`,
        "",
      ].join("\n");
    })
    .join("\n");
}

function applyTemplate(template: string, order: Order) {
  const replacements: Record<string, string> = {
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    customerEmail: order.customerEmail ?? "Not provided",
    customerAddress: order.customerAddress ?? "Not provided",
    items: buildItemsBlock(order),
    subtotal: formatPrice(order.subtotal),
    shipping: formatPrice(order.shipping),
    discount: formatPrice(order.discount),
    total: formatPrice(order.total),
    paymentStatus: paymentLabel(order.paymentStatus),
    couponCode: order.couponCode ?? "",
  };

  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) =>
    replacements[key] ?? "",
  );
}

export async function formatCustomerWhatsAppMessage(order: Order): Promise<string> {
  const { template } = await getCustomerWhatsAppTemplate();

  if (template.trim()) {
    return applyTemplate(template, order);
  }

  const lines: string[] = [
    `Hi ${order.customerName}! 🛍️`,
    "",
    "Thank you for shopping with *Womania by Dola*.",
    "",
    `Your order *#${order.orderNumber}* has been received.`,
    "",
    "Order summary",
    buildItemsBlock(order),
    `Subtotal: ${formatPrice(order.subtotal)}`,
    `Shipping: ${formatPrice(order.shipping)}`,
    order.discount > 0 ? `Discount: ${formatPrice(order.discount)}` : "",
    `*Total: ${formatPrice(order.total)}*`,
    "",
    `Payment: ${paymentLabel(order.paymentStatus)}`,
    "",
    "Delivery address:",
    order.customerAddress || "Not provided",
    "",
    "We will contact you on WhatsApp for delivery updates. For any questions, reply to this message.",
  ].filter(Boolean);

  return lines.join("\n");
}

export async function formatOwnerWhatsAppMessage(order: Order): Promise<string> {
  const { template } = await getWhatsAppTemplate();

  if (template.trim()) {
    return applyTemplate(template, order);
  }

  const lines: string[] = [
    "🛍️ NEW ORDER RECEIVED",
    "",
    `Order ID: #${order.orderNumber}`,
    "",
    "Customer Details",
    `Name: ${order.customerName}`,
    `Phone: ${order.customerPhone}`,
  ];

  if (order.customerEmail) {
    lines.push(`Email: ${order.customerEmail}`);
  }

  lines.push(`Address: ${order.customerAddress || "Not provided"}`);

  if (order.notes) {
    lines.push(`Notes: ${order.notes}`);
  }

  lines.push("", "Order Details");
  lines.push(buildItemsBlock(order));

  lines.push(
    `Subtotal: ${formatPrice(order.subtotal)}`,
    `Shipping: ${formatPrice(order.shipping)}`,
    `Discount: ${formatPrice(order.discount)}`,
    `*Total: ${formatPrice(order.total)}*`,
    "",
    `Payment Status: ${paymentLabel(order.paymentStatus)}`,
  );

  return lines.join("\n");
}

export function formatOwnerEmailHtml(order: Order): string {
  const itemsHtml = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #eee;">${item.name}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;">${item.size ?? "—"}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;">${item.quantity}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;">${formatPrice(item.price * item.quantity)}</td>
      </tr>`,
    )
    .join("");

  return `
    <h2>New Order #${order.orderNumber}</h2>
    <p><strong>Customer:</strong> ${order.customerName}<br/>
    <strong>Phone:</strong> ${order.customerPhone}<br/>
    <strong>Address:</strong> ${order.customerAddress ?? "Not provided"}</p>
    <table style="width:100%;border-collapse:collapse;margin-top:16px;">
      <thead>
        <tr style="background:#faf7f2;">
          <th style="padding:8px;text-align:left;">Product</th>
          <th style="padding:8px;text-align:left;">Size</th>
          <th style="padding:8px;text-align:left;">Qty</th>
          <th style="padding:8px;text-align:left;">Total</th>
        </tr>
      </thead>
      <tbody>${itemsHtml}</tbody>
    </table>
    <p style="margin-top:16px;">
      <strong>Total:</strong> ${formatPrice(order.total)}<br/>
      <strong>Payment:</strong> ${paymentLabel(order.paymentStatus)}
    </p>
  `;
}
