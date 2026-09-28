import { jsonError, readJson } from "@/lib/api";
import { requireAdmin } from "@/lib/auth/session";
import { orderStatusSchema } from "@/lib/security/validation";
import { publicOrder, updateOrderStatus } from "@/lib/data/orders-repo";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  if (!/^VST-[A-Z0-9]{8}$/.test(id)) return jsonError("Invalid order id.", 400);

  const body = await readJson(request, 2_000);
  const parsed = orderStatusSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid order status.", 422);

  const order = await updateOrderStatus(id, parsed.data.status);
  if (!order) return jsonError("Order not found.", 404);
  return Response.json({ order: publicOrder(order) });
}
