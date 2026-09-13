import { OrderList } from "@/components/account/order-list";
import { getCurrentCustomer } from "@/lib/customers/session";
import { listOrdersForCustomer } from "@/lib/orders/repository";

export const metadata = { title: "My orders" };

export default async function AccountOrdersPage() {
  const customer = (await getCurrentCustomer())!;
  const orders = await listOrdersForCustomer(customer.id);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] tracking-[0.28em] text-gold uppercase">My account</p>
        <h1 className="mt-2 font-serif text-3xl text-maroon sm:text-4xl">Orders</h1>
      </div>
      <OrderList orders={orders} />
    </div>
  );
}
