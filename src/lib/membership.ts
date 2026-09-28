/**
 * Server-side membership helpers.
 *
 * The membership state itself lives client-side (localStorage) for this demo,
 * but any server-authoritative surface — payment intents especially — must not
 * trust the client. The client mirrors its membership into a signed cookie via
 * `/api/membership/sync`, and server routes read that cookie off the request
 * (`NextRequest.cookies`) — so `next/headers` is never needed here.
 *
 * NOTE: keep this module free of `next/headers` and React so it can never
 * break a client bundle if it is (accidentally) imported from one.
 */
import { createHmac, timingSafeEqual } from "node:crypto";

export const MEMBERSHIP_COOKIE = "vestra_membership";
const SIGNING_KEY = process.env.MEMBERSHIP_SIGNING_SECRET ?? "vestra-demo-membership-key";

// Re-export so server code has one import surface (client code must import
// from `lib/member-pricing` instead — this module is server-only).
export {
  MEMBERSHIP_PRICE,
  MEMBER_DISCOUNT,
  MEMBER_PRICE_FLOOR,
  memberPriceFor,
} from "./member-pricing";

function sign(value: string): string {
  return createHmac("sha256", SIGNING_KEY).update(value).digest("hex");
}

/** Create the signed cookie payload for an active membership term. */
export function membershipCookieValue(validUntil: string): string {
  return `${validUntil}.${sign(validUntil)}`;
}

/** True when the cookie carries a live, correctly-signed term. */
export function memberActiveFromCookie(
  raw: string | undefined,
  now: number = Date.now(),
): boolean {
  if (!raw) return false;
  const dot = raw.lastIndexOf(".");
  if (dot <= 0) return false;
  const validUntil = raw.slice(0, dot);
  const given = raw.slice(dot + 1);
  const expected = sign(validUntil);
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  const t = Date.parse(validUntil);
  return Number.isFinite(t) && t > now;
}

/**
 * True when the membership cookie on a `NextRequest` marks a live term.
 * Convenience wrapper so route handlers read as intent-revealing.
 */
export function requestIsMember(request: { cookies: { get(name: string): { value?: string } | undefined } }): boolean {
  return memberActiveFromCookie(request.cookies.get(MEMBERSHIP_COOKIE)?.value);
}
