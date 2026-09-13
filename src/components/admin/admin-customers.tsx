"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { TextField } from "@/components/admin/form/fields";
import type { CustomerSummary } from "@/lib/customers/repository";
import { formatPrice } from "@/lib/format";

export function AdminCustomersPanel() {
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [search, setSearch] = useState("");
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async (term: string) => {
    const response = await fetch(`/api/admin/customers${term ? `?search=${encodeURIComponent(term)}` : ""}`);
    const payload = (await response.json()) as { customers: CustomerSummary[] };
    setCustomers(payload.customers ?? []);
    setLoaded(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => {
      void (async () => {
        if (!cancelled) await load(search);
      })();
    }, 250);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [load, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl text-maroon">Customers</h2>
          <p className="mt-2 text-sm text-warm-gray">Shoppers with an account. Guest orders are not listed here.</p>
        </div>
        <div className="w-full sm:w-72">
          <TextField label="Search" placeholder="Name, email or phone" value={search} onChange={setSearch} />
        </div>
      </div>

      {/* Mobile: cards */}
      <ul className="divide-y divide-charcoal/10 border border-charcoal/10 bg-white md:hidden">
        {customers.map((customer) => (
          <li key={customer.id} className="px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium text-charcoal">{customer.name}</p>
                <p className="truncate text-xs text-warm-gray">{customer.email}</p>
                {customer.phone ? <p className="text-xs text-warm-gray">{customer.phone}</p> : null}
              </div>
              <div className="shrink-0 text-right text-sm">
                <p className="font-medium text-charcoal">{formatPrice(customer.totalSpent)}</p>
                {customer.orderCount ? (
                  <Link href={`/admin/orders?search=${encodeURIComponent(customer.email)}`} className="text-xs text-maroon underline-offset-2 hover:underline">
                    {customer.orderCount} order{customer.orderCount === 1 ? "" : "s"}
                  </Link>
                ) : (
                  <p className="text-xs text-warm-gray">No orders</p>
                )}
              </div>
            </div>
          </li>
        ))}
        {loaded && !customers.length ? <li className="px-4 py-8 text-center text-sm text-warm-gray">No customers yet.</li> : null}
      </ul>

      <div className="hidden overflow-x-auto border border-charcoal/10 bg-white md:block">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-ivory/60 text-[10px] tracking-[0.14em] text-warm-gray uppercase">
            <tr>
              <th className="px-4 py-3 text-left">Customer</th>
              <th className="px-4 py-3 text-left">Phone</th>
              <th className="px-4 py-3 text-left">Joined</th>
              <th className="px-4 py-3 text-right">Orders</th>
              <th className="px-4 py-3 text-right">Spent</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id} className="border-t border-charcoal/10">
                <td className="px-4 py-3">
                  <p className="font-medium text-charcoal">{customer.name}</p>
                  <p className="text-xs text-warm-gray">{customer.email}</p>
                </td>
                <td className="px-4 py-3 text-charcoal/80">{customer.phone ?? "—"}</td>
                <td className="px-4 py-3 text-charcoal/80">
                  {new Date(customer.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </td>
                <td className="px-4 py-3 text-right">
                  {customer.orderCount ? (
                    <Link href={`/admin/orders?search=${encodeURIComponent(customer.email)}`} className="text-maroon underline-offset-2 hover:underline">
                      {customer.orderCount}
                    </Link>
                  ) : (
                    "0"
                  )}
                </td>
                <td className="px-4 py-3 text-right font-medium text-charcoal">{formatPrice(customer.totalSpent)}</td>
              </tr>
            ))}
            {loaded && !customers.length ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-warm-gray">No customers yet.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
