import { enforceRateLimit } from "@/lib/api";
import { requireAdmin } from "@/lib/auth/session";
import { seedCatalog } from "@/lib/data/products-repo";
import { seedCoupons } from "@/lib/data/coupons-repo";
import { isSupabaseConfigured } from "@/lib/env";

export const dynamic = "force-dynamic";

/**
 * Seeds the Supabase `products` and `coupons` tables from the static catalogue.
 * Idempotent: existing rows are left untouched. In demo mode this simply resets
 * the in-memory stores.
 */
export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const limited = enforceRateLimit(request, "admin-seed", 5, 60_000);
  if (limited) return limited;

  const [products, coupons] = await Promise.all([seedCatalog(), seedCoupons()]);

  return Response.json({
    ok: true,
    supabase: isSupabaseConfigured,
    productsSeeded: products,
    couponsSeeded: coupons,
  });
}
