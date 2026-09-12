"use client";

import { Check, Copy, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { formatPrice } from "@/lib/format";
import type { Order, OrderStatus, PaymentStatus } from "@/lib/orders/types";

const statusFilters: Array<{ value: OrderStatus | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export function AdminOrdersPanel() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<OrderStatus | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedPhone, setCopiedPhone] = useState(false);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (status !== "all") params.set("status", status);

    const response = await fetch(`/api/orders?${params.toString()}`);
    const payload = (await response.json()) as { orders?: Order[] };
    setOrders(payload.orders ?? []);
    setLoading(false);
  }, [search, status]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadOrders();
    }, 250);
    return () => window.clearTimeout(timer);
  }, [loadOrders]);

  const selected = orders.find((order) => order.id === selectedId) ?? null;

  const updateOrder = async (
    orderId: string,
    update: { orderStatus?: OrderStatus; paymentStatus?: PaymentStatus },
  ) => {
    const response = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(update),
    });

    if (response.ok) {
      await loadOrders();
    }
  };

  const copyPhone = async (phone: string) => {
    await navigator.clipboard.writeText(phone);
    setCopiedPhone(true);
    window.setTimeout(() => setCopiedPhone(false), 1500);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
      <section>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-warm-gray" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by Order ID, name or phone..."
              className="w-full border border-charcoal/15 bg-white py-2.5 pr-4 pl-10 text-sm outline-none focus:border-maroon"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {statusFilters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setStatus(filter.value)}
                className={`rounded-full border px-3 py-1.5 text-[11px] tracking-[0.12em] uppercase ${
                  status === filter.value
                    ? "border-maroon bg-maroon text-ivory"
                    : "border-charcoal/15 bg-white text-charcoal"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-hidden border border-charcoal/10 bg-white">
          {loading ? (
            <p className="p-8 text-sm text-warm-gray">Loading orders...</p>
          ) : orders.length === 0 ? (
            <p className="p-8 text-sm text-warm-gray">No orders found.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-ivory text-[10px] tracking-[0.16em] text-warm-gray uppercase">
                <tr>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">WhatsApp</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className={`cursor-pointer border-t border-charcoal/8 hover:bg-ivory/60 ${
                      selectedId === order.id ? "bg-ivory" : ""
                    }`}
                    onClick={() => setSelectedId(order.id)}
                  >
                    <td className="px-4 py-3 font-medium text-charcoal">
                      #{order.orderNumber}
                    </td>
                    <td className="px-4 py-3">
                      <p>{order.customerName}</p>
                      <p className="text-xs text-warm-gray">
                        {order.customerPhone}
                      </p>
                    </td>
                    <td className="px-4 py-3">{formatPrice(order.total)}</td>
                    <td className="px-4 py-3 capitalize">{order.orderStatus}</td>
                    <td className="px-4 py-3">
                      {order.whatsappNotified ? (
                        <span className="text-forest">Sent</span>
                      ) : (
                        <span className="text-maroon">Failed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <aside className="h-fit border border-charcoal/10 bg-white p-6">
        {selected ? (
          <>
            <p className="text-[10px] tracking-[0.2em] text-gold uppercase">
              Order Details
            </p>
            <h2 className="mt-2 font-serif text-2xl text-maroon">
              #{selected.orderNumber}
            </h2>
            <p className="mt-1 text-xs text-warm-gray">
              {new Date(selected.createdAt).toLocaleString("en-IN")}
            </p>

            <div className="mt-6 space-y-2 text-sm">
              <p>
                <span className="text-warm-gray">Name:</span>{" "}
                {selected.customerName}
              </p>
              <div className="flex items-center gap-2">
                <p>
                  <span className="text-warm-gray">Phone:</span>{" "}
                  {selected.customerPhone}
                </p>
                <button
                  type="button"
                  aria-label="Copy phone number"
                  onClick={() => copyPhone(selected.customerPhone)}
                  className="text-charcoal hover:text-maroon"
                >
                  {copiedPhone ? (
                    <Check className="h-4 w-4 text-forest" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
              {selected.customerEmail ? (
                <p>
                  <span className="text-warm-gray">Email:</span>{" "}
                  {selected.customerEmail}
                </p>
              ) : null}
              <p>
                <span className="text-warm-gray">Address:</span>{" "}
                {selected.customerAddress || "Not provided"}
              </p>
            </div>

            <ul className="mt-6 space-y-3 border-t border-charcoal/10 pt-6">
              {selected.items.map((item) => (
                <li key={item.id} className="text-sm">
                  <p className="font-medium text-charcoal">{item.name}</p>
                  <p className="text-xs text-warm-gray">
                    {item.size ? `Size: ${item.size} · ` : ""}
                    Qty {item.quantity} · {formatPrice(item.price * item.quantity)}
                  </p>
                </li>
              ))}
            </ul>

            <div className="mt-6 space-y-1 border-t border-charcoal/10 pt-6 text-sm">
              <p>Subtotal: {formatPrice(selected.subtotal)}</p>
              <p>Shipping: {formatPrice(selected.shipping)}</p>
              <p>Discount: {formatPrice(selected.discount)}</p>
              <p className="font-medium text-maroon">
                Total: {formatPrice(selected.total)}
              </p>
            </div>

            <div className="mt-6 grid gap-3">
              <label className="block text-xs tracking-[0.14em] text-charcoal uppercase">
                Order Status
                <select
                  value={selected.orderStatus}
                  onChange={(event) =>
                    updateOrder(selected.id, {
                      orderStatus: event.target.value as OrderStatus,
                    })
                  }
                  className="mt-2 w-full border border-charcoal/15 bg-ivory px-3 py-2 text-sm"
                >
                  <option value="new">New</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </label>

              <label className="block text-xs tracking-[0.14em] text-charcoal uppercase">
                Payment Status
                <select
                  value={selected.paymentStatus}
                  onChange={(event) =>
                    updateOrder(selected.id, {
                      paymentStatus: event.target.value as PaymentStatus,
                    })
                  }
                  className="mt-2 w-full border border-charcoal/15 bg-ivory px-3 py-2 text-sm"
                >
                  <option value="COD">Cash on Delivery</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                </select>
              </label>
            </div>

            <div className="mt-4 space-y-2 text-xs leading-relaxed">
              <p>
                <span className="text-warm-gray">Owner WhatsApp:</span>{" "}
                {selected.whatsappNotified ? (
                  <span className="text-forest">Sent</span>
                ) : (
                  <span className="text-maroon">
                    Failed{selected.whatsappError ? ` — ${selected.whatsappError}` : ""}
                  </span>
                )}
              </p>
              <p>
                <span className="text-warm-gray">Customer WhatsApp:</span>{" "}
                {selected.customerWhatsappNotified ? (
                  <span className="text-forest">Sent</span>
                ) : (
                  <span className="text-maroon">
                    Failed
                    {selected.customerWhatsappError
                      ? ` — ${selected.customerWhatsappError}`
                      : ""}
                  </span>
                )}
              </p>
            </div>
          </>
        ) : (
          <p className="text-sm text-warm-gray">
            Select an order to view full details.
          </p>
        )}
      </aside>
    </div>
  );
}
