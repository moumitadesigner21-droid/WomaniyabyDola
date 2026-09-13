"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Customer, CustomerAddress } from "@/lib/customers/types";

const GUEST_WISHLIST_KEY = "womania-wishlist-v1";

interface CustomerContextValue {
  customer: Customer | null;
  addresses: CustomerAddress[];
  wishlist: string[];
  hydrated: boolean;
  refresh: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  register: (input: {
    name: string;
    email: string;
    phone?: string;
    password: string;
  }) => Promise<{ ok: true } | { ok: false; error: string }>;
  logout: () => Promise<void>;
  isWishlisted: (productId: string) => boolean;
  toggleWishlist: (productId: string) => Promise<void>;
  setAddresses: (addresses: CustomerAddress[]) => void;
}

const CustomerContext = createContext<CustomerContextValue | null>(null);

function readGuestWishlist(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(GUEST_WISHLIST_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function writeGuestWishlist(ids: string[]) {
  try {
    window.localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(ids));
  } catch {
    // storage unavailable (private mode) — wishlist is session-only
  }
}

async function readJson<T>(response: Response): Promise<T & { error?: string }> {
  return (await response.json().catch(() => ({}))) as T & { error?: string };
}

export function CustomerProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  /** Loads session + server wishlist; merges any guest wishlist into the account. */
  const refresh = useCallback(async () => {
    const guest = readGuestWishlist();
    try {
      const response = await fetch("/api/account/me", { cache: "no-store" });
      const payload = await readJson<{
        customer: Customer | null;
        wishlist: string[];
        addresses: CustomerAddress[];
      }>(response);

      if (payload.customer) {
        let ids = payload.wishlist ?? [];
        const missing = guest.filter((id) => !ids.includes(id));
        if (missing.length) {
          const merged = await fetch("/api/account/wishlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productIds: missing }),
          });
          const mergedPayload = await readJson<{ productIds: string[] }>(merged);
          if (merged.ok) ids = mergedPayload.productIds;
          writeGuestWishlist([]);
        }
        setCustomer(payload.customer);
        setAddresses(payload.addresses ?? []);
        setWishlist(ids);
      } else {
        setCustomer(null);
        setAddresses([]);
        setWishlist(guest);
      }
    } catch {
      setWishlist(guest);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (!cancelled) await refresh();
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await fetch("/api/account/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const payload = await readJson<{ customer: Customer }>(response);
      if (!response.ok) return { ok: false as const, error: payload.error ?? "Sign in failed." };
      await refresh();
      return { ok: true as const };
    },
    [refresh],
  );

  const register = useCallback(
    async (input: { name: string; email: string; phone?: string; password: string }) => {
      const response = await fetch("/api/account/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const payload = await readJson<{ customer: Customer }>(response);
      if (!response.ok) return { ok: false as const, error: payload.error ?? "Could not create account." };
      await refresh();
      return { ok: true as const };
    },
    [refresh],
  );

  const logout = useCallback(async () => {
    await fetch("/api/account/logout", { method: "POST" });
    setCustomer(null);
    setAddresses([]);
    setWishlist(readGuestWishlist());
  }, []);

  const isWishlisted = useCallback((productId: string) => wishlist.includes(productId), [wishlist]);

  const toggleWishlist = useCallback(
    async (productId: string) => {
      const adding = !wishlist.includes(productId);
      const next = adding ? [productId, ...wishlist] : wishlist.filter((id) => id !== productId);
      setWishlist(next);

      if (!customer) {
        writeGuestWishlist(next);
        return;
      }

      const response = adding
        ? await fetch("/api/account/wishlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productIds: [productId] }),
          })
        : await fetch(`/api/account/wishlist?productId=${encodeURIComponent(productId)}`, {
            method: "DELETE",
          });
      const payload = await readJson<{ productIds: string[] }>(response);
      if (response.ok && payload.productIds) setWishlist(payload.productIds);
    },
    [customer, wishlist],
  );

  const value = useMemo<CustomerContextValue>(
    () => ({
      customer,
      addresses,
      wishlist,
      hydrated,
      refresh,
      login,
      register,
      logout,
      isWishlisted,
      toggleWishlist,
      setAddresses,
    }),
    [customer, addresses, wishlist, hydrated, refresh, login, register, logout, isWishlisted, toggleWishlist],
  );

  return <CustomerContext.Provider value={value}>{children}</CustomerContext.Provider>;
}

export function useCustomer() {
  const context = useContext(CustomerContext);
  if (!context) throw new Error("useCustomer must be used within CustomerProvider");
  return context;
}
