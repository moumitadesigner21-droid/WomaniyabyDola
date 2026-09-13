"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useCustomer } from "@/lib/customer";

const inputClass =
  "w-full border border-charcoal/15 bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-maroon";
const labelClass = "mb-2 block text-xs tracking-[0.14em] text-charcoal uppercase";
const buttonClass =
  "inline-flex min-h-[48px] w-full items-center justify-center bg-maroon px-4 py-3 text-xs font-semibold tracking-[0.16em] text-ivory uppercase transition-colors hover:bg-maroon-dark disabled:opacity-60";

function safeNext(value: string | null): string {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/account";
}

function LoginFormInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const { login } = useCustomer();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        setBusy(true);
        setError("");
        const result = await login(email, password);
        setBusy(false);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        router.push(next);
        router.refresh();
      }}
      className="mx-auto max-w-md border border-charcoal/10 bg-white p-8"
    >
      <p className="text-[10px] tracking-[0.28em] text-gold uppercase">Welcome back</p>
      <h1 className="mt-2 font-serif text-3xl text-maroon">Sign in</h1>
      <p className="mt-2 text-sm text-warm-gray">
        See your orders, saved addresses and wishlist.
      </p>

      <label className="mt-8 block">
        <span className={labelClass}>Email</span>
        <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
      </label>
      <label className="mt-5 block">
        <span className={labelClass}>Password</span>
        <input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
      </label>

      {error ? <p className="mt-4 text-sm text-maroon">{error}</p> : null}

      <button type="submit" disabled={busy} className={`${buttonClass} mt-6`}>
        {busy ? "Signing in…" : "Sign in"}
      </button>

      <p className="mt-6 text-center text-sm text-warm-gray">
        New to Womania?{" "}
        <Link href={`/account/register?next=${encodeURIComponent(next)}`} className="font-medium text-maroon underline-offset-2 hover:underline">
          Create an account
        </Link>
      </p>
      <p className="mt-3 text-center text-xs text-warm-gray">
        Forgot your password? Message us on WhatsApp and we&apos;ll help you reset it.
      </p>
    </form>
  );
}

export function LoginForm() {
  return (
    <Suspense fallback={null}>
      <LoginFormInner />
    </Suspense>
  );
}

function RegisterFormInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const { register } = useCustomer();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        if (form.password !== form.confirm) {
          setError("Passwords do not match.");
          return;
        }
        setBusy(true);
        setError("");
        const result = await register({
          name: form.name,
          email: form.email,
          phone: form.phone || undefined,
          password: form.password,
        });
        setBusy(false);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        router.push(next);
        router.refresh();
      }}
      className="mx-auto max-w-md border border-charcoal/10 bg-white p-8"
    >
      <p className="text-[10px] tracking-[0.28em] text-gold uppercase">Join Womania</p>
      <h1 className="mt-2 font-serif text-3xl text-maroon">Create your account</h1>
      <p className="mt-2 text-sm text-warm-gray">
        Faster checkout, order tracking and a wishlist that follows you.
      </p>

      <label className="mt-8 block">
        <span className={labelClass}>Full name</span>
        <input required autoComplete="name" value={form.name} onChange={set("name")} className={inputClass} />
      </label>
      <label className="mt-5 block">
        <span className={labelClass}>Email</span>
        <input type="email" required autoComplete="email" value={form.email} onChange={set("email")} className={inputClass} />
      </label>
      <label className="mt-5 block">
        <span className={labelClass}>Phone (WhatsApp)</span>
        <input type="tel" autoComplete="tel" value={form.phone} onChange={set("phone")} className={inputClass} />
      </label>
      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className={labelClass}>Password</span>
          <input type="password" required minLength={8} autoComplete="new-password" value={form.password} onChange={set("password")} className={inputClass} />
        </label>
        <label className="block">
          <span className={labelClass}>Confirm</span>
          <input type="password" required autoComplete="new-password" value={form.confirm} onChange={set("confirm")} className={inputClass} />
        </label>
      </div>
      <p className="mt-2 text-xs text-warm-gray">At least 8 characters.</p>

      {error ? <p className="mt-4 text-sm text-maroon">{error}</p> : null}

      <button type="submit" disabled={busy} className={`${buttonClass} mt-6`}>
        {busy ? "Creating account…" : "Create account"}
      </button>

      <p className="mt-6 text-center text-sm text-warm-gray">
        Already have an account?{" "}
        <Link href={`/account/login?next=${encodeURIComponent(next)}`} className="font-medium text-maroon underline-offset-2 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}

export function RegisterForm() {
  return (
    <Suspense fallback={null}>
      <RegisterFormInner />
    </Suspense>
  );
}
