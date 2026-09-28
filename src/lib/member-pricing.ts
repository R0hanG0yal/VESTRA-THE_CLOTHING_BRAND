/**
 * Shared membership pricing — safe to import from server AND client code.
 * (Kept free of `next/headers` / node built-ins; see `lib/membership.ts`
 * for the server-only cookie helpers.)
 */

export const MEMBERSHIP_PRICE = 201;
export const MEMBER_DISCOUNT = 0.3;
export const MEMBER_PRICE_FLOOR = 99;

/** Member price for a product: ~30% off, rounded to ₹9, floored at ₹99. */
export function memberPriceFor(price: number): number {
  return Math.max(
    MEMBER_PRICE_FLOOR,
    Math.round((price * (1 - MEMBER_DISCOUNT)) / 10) * 10 - 1,
  );
}
