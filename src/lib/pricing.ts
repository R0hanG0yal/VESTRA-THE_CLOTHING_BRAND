import { BANK_OFFERS, COUPONS, getProduct } from "@/lib/data/catalog";
import type { AppliedCoupon, CartItem, Coupon, OrderTotals, Product } from "@/lib/types";
import type { CartItemInput } from "@/lib/security/validation";

/**
 * SERVER-AUTHORITATIVE PRICING.
 *
 * The client never sends prices — only product ids, sizes, colours and
 * quantities. Every rupee is recomputed here from the trusted catalog, so a
 * tampered request cannot buy a ₹4,999 jacket for ₹1.
 */

export const SHIPPING_FEE = 99;
export const FREE_SHIPPING_THRESHOLD = 1499;
export const WALLET_CASHBACK_RATE = 0.05; // 5% back to wallet
export const MEMBER_CASHBACK_RATE = 0.1; // VESTRA One members earn double

/**
 * Member price — ~30% below the normal selling price, floored at ₹99 and
 * rounded to ₹9 so tags stay premium (₹1,259 → ₹879).
 */
export { memberPriceFor } from "./member-pricing";
import { memberPriceFor } from "./member-pricing";

export function repriceItems(
  inputs: CartItemInput[],
  /** Product lookup — defaults to the static catalogue, but server routes pass
   *  an admin-managed (DB-backed) lookup so new products are purchasable. */
  lookup: (id: string) => Product | undefined = getProduct,
): CartItem[] {
  const items: CartItem[] = [];
  for (const input of inputs) {
    const product = lookup(input.productId);
    if (!product) continue; // silently drop unknown ids
    if (product.stock <= 0) continue;
    if (!product.sizes.includes(input.size)) continue;
    const color = product.colors.find(
      (c) => c.name.toLowerCase() === input.color.toLowerCase(),
    );
    items.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      mrp: product.mrp,
      size: input.size,
      color: color?.name ?? product.colors[0].name,
      colorHex: color?.hex ?? product.colors[0].hex,
      kind: product.kind,
      qty: Math.min(input.qty, 10),
      seed: product.seed,
      image: product.image,
    });
  }
  return items;
}

export function resolveCoupon(
  code: string | undefined,
  items: CartItem[],
  coupons: Coupon[] = COUPONS,
): AppliedCoupon | null {
  if (!code) return null;
  const coupon = coupons.find((c) => c.code === code.toUpperCase());
  if (!coupon) return null;
  if ((coupon.active ?? true) === false) return null;
  if (new Date(coupon.expiresAt).getTime() < Date.now()) return null;

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  if (subtotal < coupon.minOrder) return null;

  // Category-restricted coupons only discount (and require) matching items.
  let eligibleSubtotal = subtotal;
  if (coupon.category) {
    const eligible = items.filter(
      (i) => getProduct(i.productId)?.category === coupon.category,
    );
    if (eligible.length === 0) return null;
    eligibleSubtotal = eligible.reduce((s, i) => s + i.price * i.qty, 0);
  }

  let discount = 0;
  if (coupon.type === "percent") {
    discount = (eligibleSubtotal * coupon.value) / 100;
    if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
  } else if (coupon.type === "flat") {
    discount = coupon.value;
  } else if (coupon.type === "shipping") {
    discount = 0; // handled via shipping waiver
  }

  discount = Math.min(discount, subtotal);
  return {
    code: coupon.code,
    label: coupon.label,
    discount: Math.round(discount),
    description: coupon.description,
  };
}

export function resolveBankOffer(
  bank: string | undefined,
  subtotal: number,
): number {
  if (!bank) return 0;
  const offer = BANK_OFFERS.find((b) => b.bank === bank);
  if (!offer) return 0;
  if (subtotal < offer.minSpend) return 0;
  const flat = offer.flat ?? 0;
  const pct = (subtotal * offer.percent) / 100;
  return Math.round(Math.min(Math.max(pct, flat), offer.maxDiscount));
}

export function computeTotals(opts: {
  items: CartItem[];
  couponCode?: string;
  cardBank?: string;
  walletBalance?: number;
  useWallet?: boolean;
  /** VESTRA One active — re-prices every item at member pricing. */
  isMember?: boolean;
  /** Coupons to resolve against — pass the admin-managed set server-side. */
  coupons?: Coupon[];
}): { totals: OrderTotals; coupon: AppliedCoupon | null; freeShipping: boolean } {
  const { items, couponCode, cardBank, walletBalance = 0, useWallet = false, coupons } = opts;
  const isMember = opts.isMember === true;
  const couponList = coupons ?? COUPONS;

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const mrpTotal = items.reduce((s, i) => s + i.mrp * i.qty, 0);
  const memberSubtotal = isMember
    ? items.reduce((s, i) => s + memberPriceFor(i.price) * i.qty, 0)
    : subtotal;
  const memberDiscount = isMember ? Math.max(0, subtotal - memberSubtotal) : 0;
  // Coupons and bank offers evaluate against the price the member actually
  // pays, so min-spend thresholds and percentages stay consistent.
  const payableBase = isMember ? memberSubtotal : subtotal;
  const coupon = resolveCoupon(couponCode, items, couponList);
  const couponIsShipping = couponCode
    ? couponList.find((c) => c.code === couponCode.toUpperCase())?.type === "shipping"
    : false;

  const couponDiscount = coupon?.discount ?? 0;
  const cardDiscount = resolveBankOffer(cardBank, payableBase - couponDiscount);

  const freeShipping =
    couponIsShipping ||
    payableBase - couponDiscount - cardDiscount >= FREE_SHIPPING_THRESHOLD;
  const shipping = items.length === 0 || freeShipping ? 0 : SHIPPING_FEE;

  const afterDiscounts = Math.max(
    0,
    payableBase - couponDiscount - cardDiscount + shipping,
  );

  const walletUsed = useWallet
    ? Math.min(Math.max(0, walletBalance), afterDiscounts)
    : 0;

  const total = Math.max(0, afterDiscounts - walletUsed);
  const cashbackEarned = Math.round(
    total * (isMember ? MEMBER_CASHBACK_RATE : WALLET_CASHBACK_RATE),
  );

  const bankOfferObj = cardDiscount > 0 && cardBank
    ? (() => {
        const offer = BANK_OFFERS.find((b) => b.bank === cardBank);
        return offer
          ? { bank: offer.bank, label: offer.label, discount: cardDiscount }
          : null;
      })()
    : null;

  return {
    coupon,
    freeShipping,
    totals: {
      subtotal,
      mrpTotal,
      productDiscount: mrpTotal - subtotal,
      memberDiscount,
      couponDiscount,
      cardDiscount,
      shipping,
      walletUsed: Math.round(walletUsed),
      total: Math.round(total),
      cashbackEarned,
      mrpDiscount: mrpTotal - subtotal,
      bankOffer: bankOfferObj,
    },
  };
}
