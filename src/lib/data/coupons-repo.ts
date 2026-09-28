import { createClient } from "@/lib/supabase/server";
import { COUPONS } from "@/lib/data/catalog";
import {
  allCoupons,
  putCoupon,
  removeCoupon,
  resetCoupons,
} from "@/lib/server/coupon-store";
import type { Coupon } from "@/lib/types";
import type { CouponWriteInput } from "@/lib/security/validation";

/** Coupon repository — Supabase `coupons` table, or the demo store. */

interface CouponRow {
  code: string;
  label: string;
  type: string;
  value: number;
  min_order: number;
  max_discount: number | null;
  category: string | null;
  bank: string | null;
  description: string;
  expires_at: string;
  active: boolean;
}

const VALID_TYPES = ["percent", "flat", "shipping", "bogo"] as const;

function rowToCoupon(r: CouponRow): Coupon {
  return {
    code: r.code,
    label: r.label,
    type: (VALID_TYPES as readonly string[]).includes(r.type)
      ? (r.type as Coupon["type"])
      : "flat",
    value: Number(r.value),
    minOrder: Number(r.min_order),
    maxDiscount: r.max_discount == null ? undefined : Number(r.max_discount),
    category: r.category ?? undefined,
    bank: r.bank ?? undefined,
    description: r.description,
    expiresAt: String(r.expires_at).slice(0, 10),
    active: r.active,
  };
}

function couponToRow(c: Coupon) {
  return {
    code: c.code,
    label: c.label,
    type: c.type,
    value: c.value,
    min_order: c.minOrder,
    max_discount: c.maxDiscount ?? null,
    category: c.category ?? null,
    bank: c.bank ?? null,
    description: c.description,
    expires_at: c.expiresAt,
    active: c.active ?? true,
  };
}

function isLive(c: Coupon) {
  return (c.active ?? true) && new Date(c.expiresAt).getTime() >= Date.now();
}

export async function listCoupons(): Promise<Coupon[]> {
  const supabase = await createClient();
  if (!supabase) return allCoupons();

  const { data, error } = await supabase.from("coupons").select("*").order("code");
  if (error || !data) return allCoupons();
  return (data as CouponRow[]).map(rowToCoupon);
}

/** Coupons that are currently usable at checkout. */
export async function listActiveCoupons(): Promise<Coupon[]> {
  const all = await listCoupons();
  const live = all.filter(isLive);
  return live.length ? live : COUPONS;
}

export async function upsertCoupon(input: CouponWriteInput): Promise<Coupon> {
  const coupon: Coupon = {
    code: input.code,
    label: input.label,
    type: input.type,
    value: input.value,
    minOrder: input.minOrder,
    maxDiscount: input.maxDiscount,
    category: input.category || undefined,
    bank: input.bank || undefined,
    description: input.description,
    expiresAt: input.expiresAt,
    active: input.active,
  };

  const supabase = await createClient();
  if (!supabase) return putCoupon(coupon);

  const { data, error } = await supabase
    .from("coupons")
    .upsert(couponToRow(coupon), { onConflict: "code" })
    .select("*")
    .single();
  if (error || !data) return putCoupon(coupon);
  return rowToCoupon(data as CouponRow);
}

export async function deleteCoupon(code: string): Promise<boolean> {
  const supabase = await createClient();
  if (!supabase) return removeCoupon(code);

  const { error } = await supabase.from("coupons").delete().eq("code", code.toUpperCase());
  return !error;
}

/** Seed the `coupons` table from the static catalogue. */
export async function seedCoupons(): Promise<number> {
  const supabase = await createClient();
  if (!supabase) return resetCoupons();

  const { error } = await supabase
    .from("coupons")
    .upsert(
      COUPONS.map((c) => couponToRow({ ...c, active: c.active ?? true })),
      { onConflict: "code" },
    );
  if (error) return 0;
  return COUPONS.length;
}
