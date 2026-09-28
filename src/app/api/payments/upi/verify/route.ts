import { z } from "zod";
import { enforceRateLimit, jsonError, readJson } from "@/lib/api";
import { getOrder, markPaid } from "@/lib/server/store";
import { isSupabaseConfigured } from "@/lib/env";

export const dynamic = "force-dynamic";

const schema = z.object({
  orderId: z.string().regex(/^VST-[A-Z0-9]{8}$/),
  txnRef: z.string().trim().min(4).max(40),
  /** Signed value echoed from intent creation — verified server-side. */
  signature: z.string().trim().min(16).max(128),
});

/**
 * Settles an order after the user returns from their UPI app.
 *
 * IMPORTANT: the front-end "success" string is never trusted. In production
 * the only source of truth is the provider webhook (see /api/payments/webhook);
 * this endpoint merely checks our own signed intent and (in a real integration)
 * would query the PSP status API before flipping the order to paid.
 */
export async function POST(request: Request) {
  const limited = enforceRateLimit(request, "upi-verify", 30, 60_000);
  if (limited) return limited;

  const body = await readJson(request);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid verification payload.");

  const order = getOrder(parsed.data.orderId);
  if (!order) return jsonError("Order not found.", 404);

  if (order.intentSignature !== parsed.data.signature) {
    return jsonError("Signature mismatch — payment could not be verified.", 409);
  }

  if (order.status !== "pending") {
    return Response.json({ ok: true, order, alreadySettled: true });
  }

  // SECURITY: the only authoritative settlement source in production is the
  // provider webhook (or a server-side PSP status query). The browser must
  // never be able to mark an order paid on its own — so once a real backend
  // (Supabase) is configured we refuse to settle from this endpoint.
  if (isSupabaseConfigured) {
    return jsonError(
      "Settlement is confirmed by the payment provider, not the client. Awaiting webhook.",
      409,
    );
  }

  // Demo mode only (no backend configured): settle locally so the storefront
  // flow stays walkable end-to-end.
  const settled = markPaid(order.id, parsed.data.txnRef);
  return Response.json({ ok: true, order: settled, demo: true });
}
