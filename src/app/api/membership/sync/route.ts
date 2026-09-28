import { jsonError, enforceRateLimit } from "@/lib/api";
import { MEMBERSHIP_COOKIE, membershipCookieValue } from "@/lib/membership";
import { z } from "zod";

export const dynamic = "force-dynamic";

const schema = z.object({
  /** ISO timestamp the membership term ends, or null to clear. */
  validUntil: z.string().datetime().nullable(),
});

/**
 * Mirrors the client-side membership into a signed, httpOnly cookie so
 * server-authoritative surfaces (UPI intents) can verify member pricing
 * without trusting the request body.
 */
export async function POST(request: Request) {
  const limited = enforceRateLimit(request, "membership-sync", 30, 60_000);
  if (limited) return limited;

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid membership payload.");

  const response = Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });

  if (parsed.data.validUntil) {
    response.headers.append(
      "Set-Cookie",
      `${MEMBERSHIP_COOKIE}=${membershipCookieValue(parsed.data.validUntil)}; Path=/; Max-Age=31536000; HttpOnly; SameSite=Lax`,
    );
  } else {
    response.headers.append(
      "Set-Cookie",
      `${MEMBERSHIP_COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`,
    );
  }
  return response;
}
