"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/format";
import type { DashboardStats } from "@/lib/cms/types";

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    void (async () => {
      const response = await fetch("/api/admin/dashboard");
      const payload = (await response.json()) as { stats: DashboardStats };
      setStats(payload.stats);
    })();
  }, []);

  if (!stats) {
    return <p className="text-sm text-warm-gray">Loading dashboard...</p>;
  }

  const cards = [
    { label: "Total Orders", value: stats.totalOrders },
    { label: "New Orders", value: stats.newOrders },
    { label: "Pending", value: stats.pendingOrders },
    { label: "Completed", value: stats.completedOrders },
    { label: "Revenue", value: formatPrice(stats.revenue) },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-serif text-3xl text-maroon">Dashboard</h2>
        <p className="mt-2 text-sm text-warm-gray">
          Overview of orders, stock, and quick actions.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        {cards.map((card) => (
          <div
            key={card.label}
            className="border border-charcoal/10 bg-white p-4"
          >
            <p className="text-[10px] tracking-[0.18em] text-warm-gray uppercase">
              {card.label}
            </p>
            <p className="mt-2 font-serif text-2xl text-maroon">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin/products/new"
          className="border border-maroon bg-maroon px-4 py-2 text-xs tracking-[0.14em] text-ivory uppercase"
        >
          Add Product
        </Link>
        <Link
          href="/admin/homepage"
          className="border border-charcoal/15 bg-white px-4 py-2 text-xs tracking-[0.14em] text-charcoal uppercase"
        >
          Edit Homepage
        </Link>
        <Link
          href="/admin/orders"
          className="border border-charcoal/15 bg-white px-4 py-2 text-xs tracking-[0.14em] text-charcoal uppercase"
        >
          View Orders
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="border border-charcoal/10 bg-white p-5">
          <h3 className="font-serif text-xl text-maroon">Recent Orders</h3>
          <div className="mt-4 space-y-3">
            {stats.recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between border-b border-charcoal/8 pb-3 text-sm"
              >
                <div>
                  <p className="font-medium text-charcoal">#{order.orderNumber}</p>
                  <p className="text-warm-gray">{order.customerName}</p>
                </div>
                <div className="text-right">
                  <p className="text-maroon">{formatPrice(order.total)}</p>
                  <p className="text-xs text-warm-gray uppercase">{order.orderStatus}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="border border-charcoal/10 bg-white p-5">
          <h3 className="font-serif text-xl text-maroon">Stock Alerts</h3>
          <div className="mt-4 space-y-4">
            <div>
              <p className="text-xs tracking-[0.14em] text-warm-gray uppercase">
                Low Stock
              </p>
              <ul className="mt-2 space-y-2 text-sm">
                {stats.lowStockProducts.length === 0 ? (
                  <li className="text-warm-gray">No low-stock products.</li>
                ) : (
                  stats.lowStockProducts.map((product) => (
                    <li key={product.id}>
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="text-charcoal hover:text-maroon"
                      >
                        {product.name} · {product.stockQuantity} left
                      </Link>
                    </li>
                  ))
                )}
              </ul>
            </div>
            <div>
              <p className="text-xs tracking-[0.14em] text-warm-gray uppercase">
                Out of Stock
              </p>
              <ul className="mt-2 space-y-2 text-sm">
                {stats.outOfStockProducts.length === 0 ? (
                  <li className="text-warm-gray">No out-of-stock products.</li>
                ) : (
                  stats.outOfStockProducts.map((product) => (
                    <li key={product.id}>
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="text-charcoal hover:text-maroon"
                      >
                        {product.name}
                      </Link>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
