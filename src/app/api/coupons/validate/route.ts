import { enforceRateLimit, jsonError, readJson } from "@/lib/api";
import { couponApplySchema } from "@/lib/security/validation";
import { computeTotals, repriceItems } from "@/lib/pricing";
import { listActiveCoupons } from "@/lib/data/coupons-repo";
import { listProducts } from "@/lib/data/products-repo";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const limited = enforceRateLimit(request, "coupon", 40, 60_000);
  if (limited) return limited;

  const body = await readJson(request);
  const parsed = couponApplySchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid coupon request.");

  const byId = new Map((await listProducts()).map((p) => [p.id, p]));
  const items = repriceItems(parsed.data.items, (id) => byId.get(id));
  if (items.length === 0) return jsonError("Your bag is empty.");

  const { coupon, totals, freeShipping } = computeTotals({
    items,
    couponCode: parsed.data.code,
    coupons: await listActiveCoupons(),
  });

  if (!coupon) {
    return NextResponse.json(
      { applied: false, error: "This code isn't valid for your bag." },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  }

  return NextResponse.json(
    { applied: true, coupon, totals, freeShipping },
    { headers: { "Cache-Control": "no-store" } },
  );
}
