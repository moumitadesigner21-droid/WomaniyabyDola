import Link from "next/link";
import { ProfileForm } from "@/components/account/profile-form";
import { OrderList } from "@/components/account/order-list";
import { getCurrentCustomer } from "@/lib/customers/session";
import { listOrdersForCustomer } from "@/lib/orders/repository";

export const metadata = { title: "My account" };

export default async function AccountOverviewPage() {
  const customer = (await getCurrentCustomer())!;
  const orders = await listOrdersForCustomer(customer.id);

  return (
    <div className="space-y-10">
      <div>
        <p className="text-[10px] tracking-[0.28em] text-gold uppercase">My account</p>
        <h1 className="mt-2 font-serif text-3xl text-maroon sm:text-4xl">
          Hello, {customer.name.split(" ")[0]}
        </h1>
      </div>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-serif text-xl text-charcoal">Recent orders</h2>
          {orders.length > 3 ? (
            <Link href="/account/orders" className="text-[10px] tracking-[0.18em] text-maroon uppercase hover:text-maroon-dark">
              View all →
            </Link>
          ) : null}
        </div>
        <OrderList orders={orders.slice(0, 3)} compact />
      </section>

      <ProfileForm />
    </div>
  );
}
