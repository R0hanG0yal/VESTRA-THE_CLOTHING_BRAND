import { createHmac, timingSafeEqual } from "crypto";
import { PAYMENT_SIGNING_SECRET } from "@/lib/env";

export interface SessionPayload {
  sub: string;
  email: string;
  name: string;
  iat: number;
  exp: number;
}

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

function b64url(input: string) {
  return Buffer.from(input, "utf8").toString("base64url");
}

/** Create a signed, stateless session token (demo-mode auth). */
export function createSessionToken(user: {
  email: string;
  name: string;
}): string {
  const now = Date.now();
  const payload: SessionPayload = {
    sub: Buffer.from(user.email).toString("base64url").slice(0, 24),
    email: user.email,
    name: user.name,
    iat: now,
    exp: now + SESSION_TTL_MS,
  };
  const body = b64url(JSON.stringify(payload));
  const sig = createHmac("sha256", PAYMENT_SIGNING_SECRET)
    .update(body)
    .digest("base64url");
  return `${body}.${sig}`;
}

/** Verify + decode a session token. Returns null when invalid/expired. */
export function verifySessionToken(token: string | undefined): SessionPayload | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;

  const expected = createHmac("sha256", PAYMENT_SIGNING_SECRET)
    .update(body)
    .digest("base64url");

  const a = Buffer.from(expected);
  const b = Buffer.from(sig);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8"),
    ) as SessionPayload;
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export const SESSION_COOKIE = "vestra_session";
