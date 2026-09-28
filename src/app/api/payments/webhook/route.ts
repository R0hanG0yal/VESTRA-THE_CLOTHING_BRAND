import { jsonError, readJson } from "@/lib/api";
import { verifySignature } from "@/lib/security/sign";
import { PAYMENT_SIGNING_SECRET } from "@/lib/env";
import { getOrder, markPaid, markWebhookProcessed } from "@/lib/server/store";

export const dynamic = "force-dynamic";

interface WebhookBody {
  eventId: string;
  orderId: string;
  txnRef: string;
  status: "SUCCESS" | "FAILED" | "PENDING";
  amount: number;
}

/**
 * Server-to-server payment webhook — the ONLY trustworthy source of payment
 * truth. Verifies the HMAC signature and is idempotent per event id.
 */
export async function POST(request: Request) {
  const raw = await readJson<WebhookBody>(request, 20_000);
  if (!raw) return jsonError("Invalid payload.");

  const signature = request.headers.get("x-vestra-signature") ?? "";
  const canonical = JSON.stringify(raw);
  if (!verifySignature(canonical, signature, PAYMENT_SIGNING_SECRET)) {
    return jsonError("Invalid webhook signature.", 401);
  }

  if (!markWebhookProcessed(raw.eventId)) {
    return Response.json({ ok: true, duplicate: true });
  }

  const order = getOrder(raw.orderId);
  if (!order) return jsonError("Unknown order.", 404);

  if (raw.status === "SUCCESS" && Math.round(raw.amount) === Math.round(order.totals.total)) {
    markPaid(order.id, raw.txnRef);
    return Response.json({ ok: true });
  }

  return Response.json({ ok: true, ignored: true });
}
