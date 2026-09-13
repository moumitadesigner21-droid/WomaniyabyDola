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
import type { Product } from "@/lib/data";

export interface CartItem {
  lineId: string;
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  category: string;
  size?: string;
  /** Set when the product has options; label like "M / Red". */
  variantId?: string;
  variantLabel?: string;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  hydrated: boolean;
  addItem: (
    product: Product,
    options?: { size?: string; variantId?: string; quantity?: number },
  ) => void;
  removeItem: (lineId: string) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  clearCart: () => void;
}

const STORAGE_KEY = "womania-cart-v1";

const CartContext = createContext<CartContextValue | null>(null);

function makeLineId(slug: string, variantId?: string, size?: string) {
  if (variantId) return `${slug}::v:${variantId}`;
  return size ? `${slug}::${size}` : slug;
}

function readStoredCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Hydrate from localStorage after mount so server and first client render
    // match (an initializer would read storage during SSR-mismatch territory).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(readStoredCart());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const addItem = useCallback(
    (
      product: Product,
      options?: { size?: string; variantId?: string; quantity?: number },
    ) => {
      const variant = options?.variantId
        ? product.variants?.find((v) => v.id === options.variantId)
        : undefined;
      const size = variant ? undefined : options?.size?.trim() || undefined;
      const quantity = Math.max(1, options?.quantity ?? 1);
      const lineId = makeLineId(product.slug, variant?.id, size);

      setItems((current) => {
        const existing = current.find((item) => item.lineId === lineId);
        if (existing) {
          return current.map((item) =>
            item.lineId === lineId
              ? { ...item, quantity: item.quantity + quantity }
              : item,
          );
        }

        return [
          ...current,
          {
            lineId,
            productId: product.id,
            slug: product.slug,
            name: product.name,
            price: variant?.price ?? product.price,
            image: variant?.image ?? product.image,
            category: product.category,
            size,
            variantId: variant?.id,
            variantLabel: variant?.label,
            quantity,
          },
        ];
      });
    },
    [],
  );

  const removeItem = useCallback((lineId: string) => {
    setItems((current) => current.filter((item) => item.lineId !== lineId));
  }, []);

  const updateQuantity = useCallback((lineId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((current) => current.filter((item) => item.lineId !== lineId));
      return;
    }

    setItems((current) =>
      current.map((item) =>
        item.lineId === lineId ? { ...item, quantity } : item,
      ),
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const value = useMemo(() => {
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    return {
      items,
      itemCount,
      subtotal,
      hydrated,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
    };
  }, [items, hydrated, addItem, removeItem, updateQuantity, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
