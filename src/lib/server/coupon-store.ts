import { COUPONS } from "@/lib/data/catalog";
import type { Coupon } from "@/lib/types";

/** Demo-mode mutable coupon store (see product-store for the rationale). */

const store = new Map<string, Coupon>();
let seeded = false;

function ensureSeeded() {
  if (seeded) return;
  for (const coupon of COUPONS) store.set(coupon.code, structuredClone(coupon));
  seeded = true;
}

export function allCoupons(): Coupon[] {
  ensureSeeded();
  return [...store.values()];
}

export function putCoupon(coupon: Coupon): Coupon {
  ensureSeeded();
  store.set(coupon.code, coupon);
  return coupon;
}

export function removeCoupon(code: string): boolean {
  ensureSeeded();
  return store.delete(code.toUpperCase());
}

export function resetCoupons(): number {
  store.clear();
  seeded = false;
  ensureSeeded();
  return store.size;
}
