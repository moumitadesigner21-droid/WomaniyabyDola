import type { Order } from "@/lib/orders/types";
export function publicPaymentOrder(order: Order) {
  return { orderNumber: order.orderNumber, customerName: order.customerName.split(" ")[0],
    paymentStatus: order.paymentStatus, total: order.total, retryAllowed: order.paymentStatus === "pending" && !!order.paymentFailureReason };
}
export type PublicPaymentOrder = ReturnType<typeof publicPaymentOrder>;
