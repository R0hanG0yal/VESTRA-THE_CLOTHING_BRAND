import { enforceRateLimit, jsonError, readJson } from "@/lib/api";
import { requireAdmin } from "@/lib/auth/session";
import { productWriteSchema } from "@/lib/security/validation";
import { createProduct, listProductsForAdmin } from "@/lib/data/products-repo";

export const dynamic = "force-dynamic";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  return Response.json(
    { products: await listProductsForAdmin() },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const limited = enforceRateLimit(request, "admin-products", 60, 60_000);
  if (limited) return limited;

  const body = await readJson(request, 20_000);
  const parsed = productWriteSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid product data.", 422);
  }
  if (!parsed.data.name) return jsonError("A product name is required.", 422);

  const product = await createProduct(parsed.data);
  return Response.json({ product }, { status: 201 });
}
