import { createHmac, timingSafeEqual } from "crypto";

/**
 * Sign an arbitrary payload with HMAC-SHA256. Used to create tamper-proof UPI
 * payment intents (so a user cannot alter the amount or payee mid-redirect) and
 * to verify provider webhooks.
 */
export function signPayload(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

/** Constant-time verification to avoid timing side channels. */
export function verifySignature(
  payload: string,
  signature: string,
  secret: string,
): boolean {
  const expected = signPayload(payload, secret);
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature ?? "", "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/** Build a canonical, order-independent string from a params object. */
export function canonicalize(params: Record<string, string>): string {
  return Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
}
