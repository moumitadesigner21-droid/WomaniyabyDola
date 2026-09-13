import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderStatusBadge, formatOrderDate } from "@/components/account/order-list";
import { findCmsProducts } from "@/lib/cms/products-repository";
import { getCurrentCustomer } from "@/lib/customers/session";
import { formatPrice } from "@/lib/format";
import { getOrderForCustomer } from "@/lib/orders/repository";

export const metadata = { title: "Order details" };

export default async function AccountOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const customer = (await getCurrentCustomer())!;
  const { id } = await params;
  const order = await getOrderForCustomer(customer.id, id);
  if (!order) notFound();

  const { byId } = await findCmsProducts({
    ids: order.items.map((item) => item.productId ?? ""),
    slugs: [],
  });

  const paymentLabel =
    order.paymentStatus === "COD" ? "Cash on delivery" : order.paymentStatus === "paid" ? "Paid" : "Pending";

  return (
    <div className="space-y-8">
      <div>
        <Link href="/account/orders" className="text-[10px] tracking-[0.18em] text-warm-gray uppercase hover:text-maroon">
          ← All orders
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <h1 className="font-serif text-3xl text-maroon sm:text-4xl">Order #{order.orderNumber}</h1>
          <OrderStatusBadge status={order.orderStatus} />
        </div>
        <p className="mt-1 text-sm text-warm-gray">Placed on {formatOrderDate(order.createdAt)} · {paymentLabel}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <ul className="divide-y divide-charcoal/10 border border-charcoal/10 bg-white">
          {order.items.map((item) => {
            const product = item.productId ? byId.get(item.productId) : undefined;
            const label = item.variantLabel ?? (item.size ? `Size: ${item.size}` : null);
            return (
              <li key={item.id} className="flex gap-4 p-4">
                <div className="relative h-24 w-20 shrink-0 overflow-hidden bg-ivory">
                  {product?.image ? (
                    <Image src={product.image} alt={item.name} fill className="object-cover" sizes="80px" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  {product?.enabled ? (
                    <Link href={`/products/${product.slug}`} className="font-serif text-lg leading-snug text-charcoal hover:text-maroon">
                      {item.name}
                    </Link>
                  ) : (
                    <p className="font-serif text-lg leading-snug text-charcoal">{item.name}</p>
                  )}
                  {label ? <p className="mt-1 text-xs text-warm-gray">{label}</p> : null}
                  <p className="mt-1 text-xs text-warm-gray">Qty {item.quantity} · {formatPrice(item.price)} each</p>
                </div>
                <p className="font-medium text-maroon">{formatPrice(item.price * item.quantity)}</p>
              </li>
            );
          })}
        </ul>

        <div className="space-y-6">
          <div className="border border-charcoal/10 bg-white p-5 text-sm">
            <h2 className="text-xs font-semibold tracking-[0.2em] text-charcoal uppercase">Summary</h2>
            <dl className="mt-4 space-y-2 text-warm-gray">
              <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatPrice(order.subtotal)}</dd></div>
              <div className="flex justify-between"><dt>Shipping</dt><dd>{order.shipping === 0 ? "Free" : formatPrice(order.shipping)}</dd></div>
              {order.discount > 0 ? (
                <div className="flex justify-between text-forest"><dt>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</dt><dd>−{formatPrice(order.discount)}</dd></div>
              ) : null}
              <div className="flex justify-between border-t border-charcoal/10 pt-2 font-medium text-maroon"><dt>Total</dt><dd>{formatPrice(order.total)}</dd></div>
            </dl>
          </div>
          <div className="border border-charcoal/10 bg-white p-5 text-sm">
            <h2 className="text-xs font-semibold tracking-[0.2em] text-charcoal uppercase">Delivery</h2>
            <p className="mt-3 whitespace-pre-line leading-relaxed text-charcoal/80">
              {order.customerName}
              {"\n"}
              {order.customerAddress}
              {"\n"}
              {order.customerPhone}
            </p>
            {order.notes ? <p className="mt-3 text-xs text-warm-gray">Notes: {order.notes}</p> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
