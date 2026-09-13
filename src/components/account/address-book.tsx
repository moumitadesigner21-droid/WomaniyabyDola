"use client";

import { useState } from "react";
import { useCustomer } from "@/lib/customer";
import type { CustomerAddress, CustomerAddressInput } from "@/lib/customers/types";

const inputClass =
  "w-full border border-charcoal/15 bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-maroon";
const labelClass = "mb-2 block text-xs tracking-[0.14em] text-charcoal uppercase";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
];

export const emptyAddress: CustomerAddressInput = {
  label: "Home",
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "West Bengal",
  postalCode: "",
  landmark: "",
  isDefault: false,
};

export function AddressFields({
  value,
  onChange,
  errors = {},
}: {
  value: CustomerAddressInput;
  onChange: (next: CustomerAddressInput) => void;
  errors?: Record<string, string>;
}) {
  const set = (key: keyof CustomerAddressInput) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    onChange({ ...value, [key]: event.target.value });
  const err = (key: string) => (errors[key] ? <span className="mt-1 block text-xs text-maroon">{errors[key]}</span> : null);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="block">
        <span className={labelClass}>Full name</span>
        <input required value={value.fullName} onChange={set("fullName")} className={inputClass} autoComplete="name" />
        {err("fullName")}
      </label>
      <label className="block">
        <span className={labelClass}>Phone</span>
        <input required type="tel" value={value.phone} onChange={set("phone")} className={inputClass} autoComplete="tel" />
        {err("phone")}
      </label>
      <label className="block sm:col-span-2">
        <span className={labelClass}>Address line 1</span>
        <input required placeholder="House / flat, street" value={value.line1} onChange={set("line1")} className={inputClass} autoComplete="address-line1" />
        {err("line1")}
      </label>
      <label className="block sm:col-span-2">
        <span className={labelClass}>Address line 2 (optional)</span>
        <input placeholder="Area, locality" value={value.line2 ?? ""} onChange={set("line2")} className={inputClass} autoComplete="address-line2" />
      </label>
      <label className="block">
        <span className={labelClass}>City</span>
        <input required value={value.city} onChange={set("city")} className={inputClass} autoComplete="address-level2" />
        {err("city")}
      </label>
      <label className="block">
        <span className={labelClass}>State</span>
        <select required value={value.state} onChange={set("state")} className={inputClass} autoComplete="address-level1">
          {INDIAN_STATES.map((state) => (
            <option key={state} value={state}>{state}</option>
          ))}
        </select>
        {err("state")}
      </label>
      <label className="block">
        <span className={labelClass}>PIN code</span>
        <input required inputMode="numeric" pattern="\\d{6}" maxLength={6} value={value.postalCode} onChange={set("postalCode")} className={inputClass} autoComplete="postal-code" />
        {err("postalCode")}
      </label>
      <label className="block">
        <span className={labelClass}>Landmark (optional)</span>
        <input value={value.landmark ?? ""} onChange={set("landmark")} className={inputClass} />
      </label>
      <label className="block">
        <span className={labelClass}>Label</span>
        <input placeholder="Home, Office…" value={value.label ?? ""} onChange={set("label")} className={inputClass} />
      </label>
    </div>
  );
}

export function AddressCard({
  address,
  onEdit,
  onDelete,
  onMakeDefault,
}: {
  address: CustomerAddress;
  onEdit?: () => void;
  onDelete?: () => void;
  onMakeDefault?: () => void;
}) {
  return (
    <div className={`relative border bg-white p-5 ${address.isDefault ? "border-forest/40" : "border-charcoal/10"}`}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[10px] tracking-[0.18em] text-gold uppercase">{address.label || "Address"}</p>
        {address.isDefault ? (
          <span className="bg-forest/10 px-2 py-0.5 text-[10px] tracking-[0.14em] text-forest uppercase">Default</span>
        ) : null}
      </div>
      <p className="mt-2 font-medium text-charcoal">{address.fullName}</p>
      <p className="mt-1 text-sm leading-relaxed text-charcoal/80">
        {address.line1}
        {address.line2 ? <>, {address.line2}</> : null}
        <br />
        {address.city}, {address.state} {address.postalCode}
        {address.landmark ? <><br />Landmark: {address.landmark}</> : null}
        <br />
        {address.phone}
      </p>
      {onEdit || onDelete || onMakeDefault ? (
        <div className="mt-4 flex flex-wrap gap-4 text-[11px] tracking-[0.14em] uppercase">
          {onEdit ? <button type="button" onClick={onEdit} className="text-maroon hover:text-maroon-dark">Edit</button> : null}
          {!address.isDefault && onMakeDefault ? (
            <button type="button" onClick={onMakeDefault} className="text-charcoal hover:text-maroon">Make default</button>
          ) : null}
          {onDelete ? <button type="button" onClick={onDelete} className="text-warm-gray hover:text-maroon">Delete</button> : null}
        </div>
      ) : null}
    </div>
  );
}

export function AddressBook() {
  const { addresses, setAddresses } = useCustomer();
  const [editing, setEditing] = useState<CustomerAddress | "new" | null>(null);
  const [form, setForm] = useState<CustomerAddressInput>(emptyAddress);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const startNew = () => {
    setForm({ ...emptyAddress, isDefault: addresses.length === 0 });
    setErrors({});
    setEditing("new");
  };
  const startEdit = (address: CustomerAddress) => {
    setForm({
      label: address.label,
      fullName: address.fullName,
      phone: address.phone,
      line1: address.line1,
      line2: address.line2,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      landmark: address.landmark,
      isDefault: address.isDefault,
    });
    setErrors({});
    setEditing(address);
  };

  const reload = async () => {
    const response = await fetch("/api/account/addresses");
    const payload = (await response.json()) as { addresses: CustomerAddress[] };
    if (response.ok) setAddresses(payload.addresses);
  };

  const save = async () => {
    setBusy(true);
    setMessage("");
    setErrors({});
    const isNew = editing === "new";
    const response = await fetch(isNew ? "/api/account/addresses" : `/api/account/addresses/${(editing as CustomerAddress).id}`, {
      method: isNew ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const payload = (await response.json().catch(() => ({}))) as { error?: string; issues?: { path: string; message: string }[] };
    setBusy(false);
    if (!response.ok) {
      setErrors(Object.fromEntries((payload.issues ?? []).map((i) => [i.path, i.message])));
      setMessage(payload.error ?? "Could not save address.");
      return;
    }
    await reload();
    setEditing(null);
  };

  const remove = async (address: CustomerAddress) => {
    if (!confirm("Delete this address?")) return;
    await fetch(`/api/account/addresses/${address.id}`, { method: "DELETE" });
    await reload();
  };

  const makeDefault = async (address: CustomerAddress) => {
    await fetch(`/api/account/addresses/${address.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isDefault: true }),
    });
    await reload();
  };

  return (
    <div className="space-y-6">
      {editing ? (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void save();
          }}
          className="border border-charcoal/10 bg-white p-6"
        >
          <h2 className="font-serif text-xl text-maroon">{editing === "new" ? "New address" : "Edit address"}</h2>
          <div className="mt-5">
            <AddressFields value={form} onChange={setForm} errors={errors} />
          </div>
          <label className="mt-4 flex items-center gap-2 text-sm text-charcoal">
            <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} />
            Use as my default delivery address
          </label>
          {message ? <p className="mt-3 text-sm text-maroon">{message}</p> : null}
          <div className="mt-6 flex gap-3">
            <button type="submit" disabled={busy} className="inline-flex min-h-[44px] items-center justify-center bg-maroon px-6 py-2.5 text-xs font-semibold tracking-[0.16em] text-ivory uppercase transition-colors hover:bg-maroon-dark disabled:opacity-60">
              {busy ? "Saving…" : "Save address"}
            </button>
            <button type="button" onClick={() => setEditing(null)} className="inline-flex min-h-[44px] items-center justify-center border border-charcoal/15 px-6 py-2.5 text-xs font-semibold tracking-[0.16em] text-charcoal uppercase">
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button type="button" onClick={startNew} className="inline-flex min-h-[44px] items-center justify-center border border-maroon px-6 py-2.5 text-xs font-semibold tracking-[0.16em] text-maroon uppercase transition-colors hover:bg-maroon hover:text-ivory">
          + Add address
        </button>
      )}

      {addresses.length ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onEdit={() => startEdit(address)}
              onDelete={() => void remove(address)}
              onMakeDefault={() => void makeDefault(address)}
            />
          ))}
        </div>
      ) : !editing ? (
        <p className="text-sm text-warm-gray">No saved addresses yet. Add one to check out faster.</p>
      ) : null}
    </div>
  );
}
