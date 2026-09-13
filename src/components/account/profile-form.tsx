"use client";

import { useState } from "react";
import { useCustomer } from "@/lib/customer";

const inputClass =
  "w-full border border-charcoal/15 bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-maroon";
const labelClass = "mb-2 block text-xs tracking-[0.14em] text-charcoal uppercase";
const buttonClass =
  "inline-flex min-h-[44px] items-center justify-center bg-maroon px-6 py-2.5 text-xs font-semibold tracking-[0.16em] text-ivory uppercase transition-colors hover:bg-maroon-dark disabled:opacity-60";

export function ProfileForm() {
  const { customer, refresh } = useCustomer();
  const [name, setName] = useState(customer?.name ?? "");
  const [phone, setPhone] = useState(customer?.phone ?? "");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const [pw, setPw] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwMessage, setPwMessage] = useState<{ text: string; error: boolean } | null>(null);
  const [pwBusy, setPwBusy] = useState(false);

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          setBusy(true);
          setMessage("");
          const response = await fetch("/api/account/me", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, phone }),
          });
          const payload = (await response.json().catch(() => ({}))) as { error?: string };
          setBusy(false);
          if (!response.ok) {
            setMessage(payload.error ?? "Could not save.");
            return;
          }
          await refresh();
          setMessage("Saved.");
        }}
        className="border border-charcoal/10 bg-white p-6"
      >
        <h2 className="font-serif text-xl text-maroon">Your details</h2>
        <label className="mt-5 block">
          <span className={labelClass}>Full name</span>
          <input required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </label>
        <label className="mt-4 block">
          <span className={labelClass}>Phone (WhatsApp)</span>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
        </label>
        <label className="mt-4 block">
          <span className={labelClass}>Email</span>
          <input value={customer?.email ?? ""} disabled className={`${inputClass} bg-ivory/60 text-warm-gray`} />
        </label>
        <div className="mt-6 flex items-center gap-4">
          <button type="submit" disabled={busy} className={buttonClass}>
            {busy ? "Saving…" : "Save"}
          </button>
          {message ? <span className="text-sm text-forest">{message}</span> : null}
        </div>
      </form>

      <form
        onSubmit={async (event) => {
          event.preventDefault();
          setPwBusy(true);
          setPwMessage(null);
          const response = await fetch("/api/account/password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(pw),
          });
          const payload = (await response.json().catch(() => ({}))) as { error?: string };
          setPwBusy(false);
          if (!response.ok) {
            setPwMessage({ text: payload.error ?? "Could not change password.", error: true });
            return;
          }
          setPw({ currentPassword: "", newPassword: "", confirmPassword: "" });
          setPwMessage({ text: "Password updated.", error: false });
        }}
        className="border border-charcoal/10 bg-white p-6"
      >
        <h2 className="font-serif text-xl text-maroon">Change password</h2>
        {(
          [
            ["currentPassword", "Current password", "current-password"],
            ["newPassword", "New password", "new-password"],
            ["confirmPassword", "Confirm new password", "new-password"],
          ] as const
        ).map(([key, label, autoComplete]) => (
          <label key={key} className="mt-4 block">
            <span className={labelClass}>{label}</span>
            <input
              type="password"
              required
              autoComplete={autoComplete}
              value={pw[key]}
              onChange={(e) => setPw((current) => ({ ...current, [key]: e.target.value }))}
              className={inputClass}
            />
          </label>
        ))}
        <div className="mt-6 flex items-center gap-4">
          <button type="submit" disabled={pwBusy} className={buttonClass}>
            {pwBusy ? "Updating…" : "Update password"}
          </button>
          {pwMessage ? (
            <span className={`text-sm ${pwMessage.error ? "text-maroon" : "text-forest"}`}>{pwMessage.text}</span>
          ) : null}
        </div>
      </form>
    </div>
  );
}
