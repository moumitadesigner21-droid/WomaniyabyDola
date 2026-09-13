"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminLoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        setError(payload.error ?? "Login failed.");
        return;
      }

      router.push("/admin/orders");
      router.refresh();
    } catch {
      setError("Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-md border border-charcoal/10 bg-white p-8"
    >
      <h1 className="font-serif text-3xl text-maroon">Admin Login</h1>
      <p className="mt-2 text-sm text-warm-gray">
        Sign in to manage orders and notification settings.
      </p>

      <label className="mt-8 block">
        <span className="mb-2 block text-xs tracking-[0.14em] text-charcoal uppercase">
          Username
        </span>
        <input
          type="text"
          required
          autoComplete="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          className="w-full border border-charcoal/15 bg-ivory px-4 py-3 text-sm outline-none focus:border-maroon"
        />
      </label>

      <label className="mt-5 block">
        <span className="mb-2 block text-xs tracking-[0.14em] text-charcoal uppercase">
          Password
        </span>
        <input
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full border border-charcoal/15 bg-ivory px-4 py-3 text-sm outline-none focus:border-maroon"
        />
      </label>

      {error ? <p className="mt-4 text-sm text-maroon">{error}</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="mt-6 inline-flex min-h-[48px] w-full items-center justify-center bg-maroon px-4 py-3 text-xs font-semibold tracking-[0.16em] text-ivory uppercase transition-colors hover:bg-maroon-dark disabled:opacity-60"
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}
