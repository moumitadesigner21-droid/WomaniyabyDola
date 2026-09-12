"use client";

import { useEffect, useState } from "react";
import type { CmsCoupon } from "@/lib/cms/types";

export function AdminOffersPanel() {
  const [coupons, setCoupons] = useState<CmsCoupon[]>([]);
  const [form, setForm] = useState({
    code: "",
    discountType: "percentage" as CmsCoupon["discountType"],
    discountValue: 10,
    minOrderValue: 0,
    freeShipping: false,
    enabled: true,
  });
  const [message, setMessage] = useState("");

  const load = async () => {
    const response = await fetch("/api/admin/coupons");
    const payload = (await response.json()) as { coupons: CmsCoupon[] };
    setCoupons(payload.coupons);
  };

  useEffect(() => {
    void load();
  }, []);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    const response = await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        validFrom: null,
        validUntil: null,
        categorySlug: null,
        productId: null,
      }),
    });

    if (response.ok) {
      setMessage("Coupon created.");
      setForm({ ...form, code: "" });
      await load();
    } else {
      setMessage("Failed to create coupon.");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-serif text-3xl text-maroon">Offers & Promotions</h2>
        <p className="mt-2 text-sm text-warm-gray">
          Create discount codes, sale rules, and free-shipping offers.
        </p>
      </div>

      <form onSubmit={handleCreate} className="grid gap-4 border border-charcoal/10 bg-white p-5 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-xs uppercase tracking-[0.14em]">Coupon Code</span>
          <input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="w-full border border-charcoal/15 px-3 py-2.5 text-sm uppercase" />
        </label>
        <label className="block">
          <span className="mb-2 block text-xs uppercase tracking-[0.14em]">Discount Type</span>
          <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value as CmsCoupon["discountType"] })} className="w-full border border-charcoal/15 px-3 py-2.5 text-sm">
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed Amount</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-xs uppercase tracking-[0.14em]">Discount Value</span>
          <input type="number" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })} className="w-full border border-charcoal/15 px-3 py-2.5 text-sm" />
        </label>
        <label className="block">
          <span className="mb-2 block text-xs uppercase tracking-[0.14em]">Minimum Order Value</span>
          <input type="number" value={form.minOrderValue} onChange={(e) => setForm({ ...form, minOrderValue: Number(e.target.value) })} className="w-full border border-charcoal/15 px-3 py-2.5 text-sm" />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.freeShipping} onChange={(e) => setForm({ ...form, freeShipping: e.target.checked })} />
          Free Shipping
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.enabled} onChange={(e) => setForm({ ...form, enabled: e.target.checked })} />
          Enabled
        </label>
        <button type="submit" className="border border-maroon bg-maroon px-4 py-2 text-xs tracking-[0.14em] text-ivory uppercase md:col-span-2 md:w-fit">
          Create Coupon
        </button>
      </form>

      {message ? <p className="text-sm text-maroon">{message}</p> : null}

      <div className="overflow-x-auto border border-charcoal/10 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-charcoal/10 bg-ivory/60 text-xs uppercase tracking-[0.12em] text-warm-gray">
            <tr>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Discount</th>
              <th className="px-4 py-3">Min Order</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((coupon) => (
              <tr key={coupon.id} className="border-b border-charcoal/8">
                <td className="px-4 py-3 font-medium">{coupon.code}</td>
                <td className="px-4 py-3">
                  {coupon.discountType === "percentage"
                    ? `${coupon.discountValue}%`
                    : `₹${coupon.discountValue}`}
                </td>
                <td className="px-4 py-3">₹{coupon.minOrderValue}</td>
                <td className="px-4 py-3">{coupon.enabled ? "Active" : "Disabled"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
