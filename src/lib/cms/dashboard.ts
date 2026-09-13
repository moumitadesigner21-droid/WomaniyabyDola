import { listOrders } from "@/lib/orders/repository";
import {
  listLowStockProducts,
  listOutOfStockProducts,
} from "@/lib/cms/products-repository";
import type { DashboardStats } from "@/lib/cms/types";

export async function getDashboardStats(): Promise<DashboardStats> {
  const [orders, lowStockProducts, outOfStockProducts] = await Promise.all([
    listOrders(),
    listLowStockProducts(),
    listOutOfStockProducts(),
  ]);

  const totalOrders = orders.length;
  const newOrders = orders.filter((order) => order.orderStatus === "new").length;
  const pendingOrders = orders.filter(
    (order) => order.orderStatus === "pending" || order.orderStatus === "new",
  ).length;
  const completedOrders = orders.filter(
    (order) => order.orderStatus === "completed",
  ).length;
  const revenue = orders
    .filter((order) => order.orderStatus !== "cancelled")
    .reduce((sum, order) => sum + order.total, 0);

  return {
    totalOrders,
    newOrders,
    pendingOrders,
    completedOrders,
    revenue,
    lowStockProducts,
    outOfStockProducts,
    recentOrders: orders.slice(0, 8).map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      total: order.total,
      orderStatus: order.orderStatus,
      createdAt: order.createdAt,
    })),
  };
}
