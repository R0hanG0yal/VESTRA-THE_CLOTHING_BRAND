import { enforceRateLimit, jsonError, readJson } from "@/lib/api";
import { referralSchema } from "@/lib/security/validation";

export const dynamic = "force-dynamic";

const REFERRAL_REWARD = 250;

export async function POST(request: Request) {
  const limited = enforceRateLimit(request, "referral", 20, 60_000);
  if (limited) return limited;

  const body = await readJson(request, 2_000);
  const parsed = referralSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("That referral code doesn't look right.", 422);
  }

  // In production: look the code up in the `referrals` table, reject
  // self-referrals and already-redeemed codes, then credit both wallets.
  const code = parsed.data.code;
  const isSelfLikeCode = code.endsWith("XXXXXX");

  if (isSelfLikeCode) {
    return jsonError("This code isn't active yet.", 409);
  }

  return Response.json({
    valid: true,
    code,
    reward: REFERRAL_REWARD,
    message: `Code applied! ₹${REFERRAL_REWARD} will land in your wallet after your friend's first order.`,
  });
}
