import { enforceRateLimit, jsonError, readJson } from "@/lib/api";
import { requireAdmin } from "@/lib/auth/session";
import { couponWriteSchema } from "@/lib/security/validation";
import { listCoupons, upsertCoupon } from "@/lib/data/coupons-repo";

export const dynamic = "force-dynamic";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  return Response.json(
    { coupons: await listCoupons() },
    { headers: { "Cache-Control": "no-store" } },
  );
}

/** Create or update a coupon (keyed by its code). */
export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const limited = enforceRateLimit(request, "admin-coupons", 60, 60_000);
  if (limited) return limited;

  const body = await readJson(request, 10_000);
  const parsed = couponWriteSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid coupon data.", 422);
  }

  const coupon = await upsertCoupon(parsed.data);
  return Response.json({ coupon }, { status: 201 });
}
