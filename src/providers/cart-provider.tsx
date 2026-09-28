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
import type { CartItem } from "@/lib/types";

const STORAGE_KEY = "vestra_cart_v1";

interface CartCtx {
  items: CartItem[];
  ready: boolean;
  count: number;
  subtotal: number;
  mrpTotal: number;
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  remove: (productId: string, size: string, color: string) => void;
  updateQty: (productId: string, size: string, color: string, qty: number) => void;
  clear: () => void;
}

const Ctx = createContext<CartCtx | null>(null);

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

const keyOf = (i: Pick<CartItem, "productId" | "size" | "color">) =>
  `${i.productId}__${i.size}__${i.color}`;

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch {
      /* ignore corrupt storage */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, ready]);

  const add = useCallback((item: Omit<CartItem, "qty">, qty = 1) => {
    setItems((prev) => {
      const k = keyOf(item);
      const existing = prev.find((p) => keyOf(p) === k);
      if (existing) {
        return prev.map((p) =>
          keyOf(p) === k ? { ...p, qty: Math.min(p.qty + qty, 10) } : p,
        );
      }
      return [...prev, { ...item, qty }];
    });
  }, []);

  const remove = useCallback(
    (productId: string, size: string, color: string) => {
      const k = keyOf({ productId, size, color });
      setItems((prev) => prev.filter((p) => keyOf(p) !== k));
    },
    [],
  );

  const updateQty = useCallback(
    (productId: string, size: string, color: string, qty: number) => {
      const k = keyOf({ productId, size, color });
      setItems((prev) =>
        qty <= 0
          ? prev.filter((p) => keyOf(p) !== k)
          : prev.map((p) =>
              keyOf(p) === k ? { ...p, qty: Math.min(qty, 10) } : p,
            ),
      );
    },
    [],
  );

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartCtx>(() => {
    const count = items.reduce((s, i) => s + i.qty, 0);
    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    const mrpTotal = items.reduce((s, i) => s + i.mrp * i.qty, 0);
    return { items, ready, count, subtotal, mrpTotal, add, remove, updateQty, clear };
  }, [items, ready, add, remove, updateQty, clear]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
