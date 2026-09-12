"use client";

import { useEffect, useState } from "react";
import type { StoreSettings } from "@/lib/orders/types";

export function AdminSettingsPanel() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    void (async () => {
      const response = await fetch("/api/admin/settings");
      const payload = (await response.json()) as { settings: StoreSettings };
      setSettings(payload.settings);
    })();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!settings) return;

    setSaving(true);
    setMessage("");

    const response = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });

    if (response.ok) {
      setMessage("Settings saved successfully.");
    } else {
      setMessage("Failed to save settings.");
    }

    setSaving(false);
  };

  if (!settings) {
    return <p className="text-sm text-warm-gray">Loading settings...</p>;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl border border-charcoal/10 bg-white p-6"
    >
      <h2 className="font-serif text-2xl text-maroon">Notification Settings</h2>
      <p className="mt-2 text-sm text-warm-gray">
        Configure where new order alerts are sent. API keys stay in{" "}
        <code className="text-xs">.env.local</code> — never in this panel.
      </p>

      <div className="mt-6 rounded border border-charcoal/10 bg-ivory/60 p-4 text-xs leading-relaxed text-warm-gray">
        <p className="font-medium text-charcoal">Quick WhatsApp setup (CallMeBot)</p>
        <ol className="mt-2 list-decimal space-y-1 pl-4">
          <li>
            On the owner phone, message CallMeBot on WhatsApp: send{" "}
            <span className="font-mono text-charcoal">
              I allow callmebot to send me messages
            </span>
          </li>
          <li>Copy the API key CallMeBot replies with</li>
          <li>
            Add <span className="font-mono text-charcoal">CALLMEBOT_API_KEY=...</span>{" "}
            to <span className="font-mono text-charcoal">.env.local</span> and restart
            the dev server
          </li>
        </ol>
      </div>

      <label className="mt-8 block">
        <span className="mb-2 block text-xs tracking-[0.14em] text-charcoal uppercase">
          Owner WhatsApp Number
        </span>
        <input
          required
          value={settings.ownerWhatsappNumber}
          onChange={(event) =>
            setSettings({
              ...settings,
              ownerWhatsappNumber: event.target.value,
            })
          }
          placeholder="919775301488"
          className="w-full border border-charcoal/15 bg-ivory px-4 py-3 text-sm outline-none focus:border-maroon"
        />
        <span className="mt-2 block text-xs text-warm-gray">
          Include country code without + (e.g. 919775301488 for India).
        </span>
      </label>

      <label className="mt-6 block">
        <span className="mb-2 block text-xs tracking-[0.14em] text-charcoal uppercase">
          Backup Order Email
        </span>
        <input
          type="email"
          required
          value={settings.orderEmail}
          onChange={(event) =>
            setSettings({ ...settings, orderEmail: event.target.value })
          }
          className="w-full border border-charcoal/15 bg-ivory px-4 py-3 text-sm outline-none focus:border-maroon"
        />
      </label>

      <label className="mt-6 block">
        <span className="mb-2 block text-xs tracking-[0.14em] text-charcoal uppercase">
          Flat Shipping Rate (₹)
        </span>
        <input
          type="number"
          min={0}
          value={settings.flatShippingRate}
          onChange={(event) =>
            setSettings({
              ...settings,
              flatShippingRate: Number(event.target.value) || 0,
            })
          }
          className="w-full border border-charcoal/15 bg-ivory px-4 py-3 text-sm outline-none focus:border-maroon"
        />
      </label>

      {message ? <p className="mt-4 text-sm text-forest">{message}</p> : null}

      <button
        type="submit"
        disabled={saving}
        className="mt-8 inline-flex min-h-[48px] items-center justify-center bg-maroon px-6 py-3 text-xs font-semibold tracking-[0.16em] text-ivory uppercase hover:bg-maroon-dark disabled:opacity-60"
      >
        {saving ? "Saving..." : "Save Settings"}
      </button>
    </form>
  );
}
