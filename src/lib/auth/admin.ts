import { createHmac, timingSafeEqual } from "crypto";
import { ADMIN_PASSCODE, PAYMENT_SIGNING_SECRET } from "@/lib/env";

/**
 * Admin authentication.
 *
 * Access is granted by a single shared passcode (env `ADMIN_PASSCODE`). On a
 * successful login we issue a short-lived, HMAC-signed cookie that encodes the
 * `admin` role. Every admin page and API route re-verifies that cookie
 * server-side, so the passcode itself is never stored on the client.
 */

export const ADMIN_COOKIE = "vestra_admin";

/** How long an admin session stays valid. */
export const ADMIN_TTL_MS = 1000 * 60 * 60 * 8; // 8 hours

interface AdminPayload {
  role: "admin";
  iat: number;
  exp: number;
}

function b64url(input: string) {
  return Buffer.from(input, "utf8").toString("base64url");
}

function sign(body: string) {
  return createHmac("sha256", PAYMENT_SIGNING_SECRET)
    .update(`admin.${body}`)
    .digest("base64url");
}

export function createAdminToken(): string {
  const now = Date.now();
  const payload: AdminPayload = { role: "admin", iat: now, exp: now + ADMIN_TTL_MS };
  const body = b64url(JSON.stringify(payload));
  return `${body}.${sign(body)}`;
}

/** Verify the signed admin cookie: signature, role and expiry. */
export function verifyAdminToken(token: string | undefined): boolean {
  if (!token) return false;
  const [body, sig] = token.split(".");
  if (!body || !sig) return false;

  const expected = sign(body);
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(sig, "utf8");
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;

  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8"),
    ) as AdminPayload;
    return payload.role === "admin" && payload.exp > Date.now();
  } catch {
    return false;
  }
}

/** Constant-time passcode comparison (avoids timing side-channels). */
export function checkAdminPasscode(input: string): boolean {
  const a = Buffer.from(String(input ?? ""), "utf8");
  const b = Buffer.from(ADMIN_PASSCODE, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
