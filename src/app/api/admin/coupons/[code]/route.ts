import { enforceRateLimit, jsonError, readJson } from "@/lib/api";
import { requireAdmin } from "@/lib/auth/session";
import { couponWriteSchema } from "@/lib/security/validation";
import { deleteCoupon, upsertCoupon } from "@/lib/data/coupons-repo";

export const dynamic = "force-dynamic";

const CODE_RE = /^[A-Z0-9]{3,20}$/;

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const limited = enforceRateLimit(request, "admin-coupons", 60, 60_000);
  if (limited) return limited;

  const { code } = await params;
  const normalized = code.toUpperCase();
  if (!CODE_RE.test(normalized)) return jsonError("Invalid coupon code.", 400);

  const body = await readJson(request, 10_000);
  const parsed = couponWriteSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid coupon data.", 422);
  }

  // The URL is authoritative for the code being edited.
  const coupon = await upsertCoupon({ ...parsed.data, code: normalized });
  return Response.json({ coupon });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { code } = await params;
  const normalized = code.toUpperCase();
  if (!CODE_RE.test(normalized)) return jsonError("Invalid coupon code.", 400);

  const ok = await deleteCoupon(normalized);
  if (!ok) return jsonError("Coupon not found.", 404);
  return Response.json({ ok: true });
}
