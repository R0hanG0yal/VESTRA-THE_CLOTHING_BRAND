import { requireAdmin } from "@/lib/auth/session";
import { listOrders, publicOrder } from "@/lib/data/orders-repo";

export const dynamic = "force-dynamic";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const orders = await listOrders();
  return Response.json(
    { orders: orders.map(publicOrder) },
    { headers: { "Cache-Control": "no-store" } },
  );
}
