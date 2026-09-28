import { jsonError } from "@/lib/api";
import { findOrder, publicOrder } from "@/lib/data/orders-repo";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!/^VST-[A-Z0-9]{8}$/.test(id)) return jsonError("Invalid order id.", 400);

  // Reads from Supabase when configured, else the in-memory store.
  const order = await findOrder(id);
  if (!order) return jsonError("Order not found.", 404);

  // Never expose internal signature material to the client.
  return Response.json(
    { order: publicOrder(order) },
    { headers: { "Cache-Control": "no-store" } },
  );
}
