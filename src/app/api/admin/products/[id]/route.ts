import { enforceRateLimit, jsonError, readJson } from "@/lib/api";
import { requireAdmin } from "@/lib/auth/session";
import { productWriteSchema } from "@/lib/security/validation";
import { deleteProduct, updateProduct } from "@/lib/data/products-repo";

export const dynamic = "force-dynamic";

const ID_RE = /^p\d{3,6}$/;

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const limited = enforceRateLimit(request, "admin-products", 60, 60_000);
  if (limited) return limited;

  const { id } = await params;
  if (!ID_RE.test(id)) return jsonError("Invalid product id.", 400);

  const body = await readJson(request, 20_000);
  const parsed = productWriteSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid product data.", 422);
  }

  const product = await updateProduct(id, parsed.data);
  if (!product) return jsonError("Product not found.", 404);
  return Response.json({ product });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  if (!ID_RE.test(id)) return jsonError("Invalid product id.", 400);

  const ok = await deleteProduct(id);
  if (!ok) return jsonError("Product not found.", 404);
  return Response.json({ ok: true });
}
