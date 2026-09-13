"use client";

import { useState } from "react";

export function AdminPasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      const payload = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        setIsError(true);
        setMessage(payload.error ?? "Could not change password.");
        return;
      }

      setIsError(false);
      setMessage("Password updated. Use the new password next time you sign in.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setIsError(true);
      setMessage("Could not change password. Check your connection.");
    } finally {
      setSaving(false);
    }
  };

  const field = (
    label: string,
    value: string,
    onChange: (value: string) => void,
    autoComplete: string,
  ) => (
    <label className="mt-5 block">
      <span className="mb-2 block text-xs tracking-[0.14em] text-charcoal uppercase">
        {label}
      </span>
      <input
        type="password"
        required
        autoComplete={autoComplete}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full border border-charcoal/15 bg-ivory px-4 py-3 text-sm outline-none focus:border-maroon"
      />
    </label>
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 max-w-xl border border-charcoal/10 bg-white p-6"
    >
      <h2 className="font-serif text-2xl text-maroon">Admin Password</h2>
      <p className="mt-2 text-sm text-warm-gray">
        Change the password used to sign in to this panel. Minimum 10 characters.
      </p>

      {field("Current password", currentPassword, setCurrentPassword, "current-password")}
      {field("New password", newPassword, setNewPassword, "new-password")}
      {field("Confirm new password", confirmPassword, setConfirmPassword, "new-password")}

      {message ? (
        <p className={`mt-4 text-sm ${isError ? "text-maroon" : "text-forest"}`}>
          {message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={saving}
        className="mt-8 inline-flex min-h-[48px] items-center justify-center bg-maroon px-6 py-3 text-xs font-semibold tracking-[0.16em] text-ivory uppercase transition-colors hover:bg-maroon-dark disabled:opacity-60"
      >
        {saving ? "Updating..." : "Update Password"}
      </button>
    </form>
  );
}
