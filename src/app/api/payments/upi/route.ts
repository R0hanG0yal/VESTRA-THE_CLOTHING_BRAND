import { NextRequest } from "next/server";
import QRCode from "qrcode";
import { enforceRateLimit, jsonError, readJson } from "@/lib/api";
import { requestIsMember } from "@/lib/membership";
import { upiCreateSchema } from "@/lib/security/validation";
import { computeTotals, repriceItems } from "@/lib/pricing";
import { listActiveCoupons } from "@/lib/data/coupons-repo";
import { listProducts } from "@/lib/data/products-repo";
import { createOrder } from "@/lib/server/store";
import { canonicalize, signPayload } from "@/lib/security/sign";
import {
  PAYMENT_SIGNING_SECRET,
  UPI_PAYEE_NAME,
  UPI_PAYEE_VPA,
} from "@/lib/env";

export const dynamic = "force-dynamic";

/**
 * Creates a UPI payment intent.
 *
 * We build the standard NPCI `upi://pay` deep link. On a phone this opens the
 * OS app chooser so the user pays in whichever UPI app they already have
 * (GPay / PhonePe / Paytm / BHIM …) — we never need to know which one. On
 * desktop the same link is rendered as a QR code to scan.
 *
 * The amount is computed server-side and signed, so the intent cannot be
 * tampered with after it leaves the server.
 */
export async function POST(request: NextRequest) {
  const limited = enforceRateLimit(request, "upi-create", 20, 60_000);
  if (limited) return limited;

  const body = await readJson(request);
  const parsed = upiCreateSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid checkout data.");
  }

  const { items: rawItems, couponCode, cardBank, useWallet, walletBalance, address } =
    parsed.data;
  const byId = new Map((await listProducts()).map((p) => [p.id, p]));
  const items = repriceItems(rawItems, (id) => byId.get(id));
  if (items.length === 0) return jsonError("No purchasable items in bag.");

  // Membership is resolved SERVER-SIDE from the signed demo cookie (never from
  // the request body), so member pricing cannot be claimed by a tampered
  // client. Wallet redemption is also applied server-side for the same reason.
  const isMember = requestIsMember(request);
  const { totals } = computeTotals({
    items,
    couponCode: couponCode || undefined,
    cardBank: cardBank || undefined,
    walletBalance: useWallet ? walletBalance : 0,
    useWallet,
    isMember,
    coupons: await listActiveCoupons(),
  });

  const signedParams: Record<string, string> = {
    pa: UPI_PAYEE_VPA,
    pn: UPI_PAYEE_NAME,
    am: totals.total.toFixed(2),
    cu: "INR",
    tn: `VESTRA order payment`,
  };
  const signature = signPayload(canonicalize(signedParams), PAYMENT_SIGNING_SECRET);

  const order = createOrder({
    items,
    totals,
    address,
    paymentMethod: "UPI",
    intentSignature: signature,
  });

  // If the wallet fully covers the order there is nothing to charge — and UPI
  // apps reject zero-amount intents (am=0). Settle as a wallet-only order.
  if (order.totals.total <= 0) {
    return Response.json(
      {
        orderId: order.id,
        walletOnly: true,
        upiLink: null,
        qr: null,
        signature,
        totals: order.totals,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  const upiParams = { ...signedParams, tr: order.id, tn: `VESTRA ${order.id}` };
  const upiLink = `upi://pay?${new URLSearchParams(upiParams).toString()}`;

  const qr = await QRCode.toDataURL(upiLink, {
    width: 360,
    margin: 1,
    color: { dark: "#0b0b12", light: "#ffffff" },
    errorCorrectionLevel: "M",
  });

  return Response.json(
    {
      orderId: order.id,
      walletOnly: false,
      upiLink,
      qr: "/payments/upi-qr.png",
      dynamicQr: qr,
      signature,
      payee: { vpa: UPI_PAYEE_VPA, name: UPI_PAYEE_NAME },
      totals: order.totals,
      expiresIn: 600,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
