import Link from "next/link";
import { formatPrice } from "@/lib/format";
import type { Order } from "@/lib/orders/types";

const STATUS_LABEL: Record<Order["orderStatus"], { label: string; className: string }> = {
  new: { label: "Received", className: "bg-gold/20 text-charcoal" },
  pending: { label: "In progress", className: "bg-forest/10 text-forest" },
  completed: { label: "Delivered", className: "bg-forest text-ivory" },
  cancelled: { label: "Cancelled", className: "bg-charcoal/10 text-warm-gray" },
};

export function OrderStatusBadge({ status }: { status: Order["orderStatus"] }) {
  const meta = STATUS_LABEL[status] ?? STATUS_LABEL.new;
  return (
    <span className={`inline-block px-2.5 py-1 text-[10px] font-semibold tracking-[0.14em] uppercase ${meta.className}`}>
      {meta.label}
    </span>
  );
}

export function formatOrderDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function OrderList({ orders, compact = false }: { orders: Order[]; compact?: boolean }) {
  if (!orders.length) {
    return (
      <div className="border border-dashed border-charcoal/20 bg-white px-6 py-10 text-center">
        <p className="font-serif text-xl text-charcoal">No orders yet</p>
        <p className="mt-2 text-sm text-warm-gray">Orders you place while signed in will appear here.</p>
        <Link href="/shop" className="mt-6 inline-flex min-h-[44px] items-center justify-center bg-maroon px-8 py-3 text-xs font-semibold tracking-[0.18em] text-ivory uppercase transition-colors hover:bg-maroon-dark">
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-charcoal/10 border border-charcoal/10 bg-white">
      {orders.map((order) => (
        <li key={order.id}>
          <Link href={`/account/orders/${order.id}`} className="flex flex-wrap items-center gap-x-6 gap-y-2 px-5 py-4 transition-colors hover:bg-ivory/60">
            <div className="min-w-[140px]">
              <p className="font-serif text-lg text-charcoal">#{order.orderNumber}</p>
              <p className="text-xs text-warm-gray">{formatOrderDate(order.createdAt)}</p>
            </div>
            {!compact ? (
              <p className="min-w-0 flex-1 truncate text-sm text-charcoal/80">
                {order.items.map((item) => `${item.name}${item.quantity > 1 ? ` ×${item.quantity}` : ""}`).join(", ")}
              </p>
            ) : null}
            <OrderStatusBadge status={order.orderStatus} />
            <p className="ml-auto font-medium text-maroon">{formatPrice(order.total)}</p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
