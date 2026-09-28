import { NextResponse } from "next/server";
import { enforceRateLimit, jsonError, readJson } from "@/lib/api";
import { adminLoginSchema } from "@/lib/security/validation";
import {
  ADMIN_COOKIE,
  ADMIN_TTL_MS,
  checkAdminPasscode,
  createAdminToken,
} from "@/lib/auth/admin";
import { isDefaultAdminPasscode, isDefaultSigningSecret } from "@/lib/env";

export const dynamic = "force-dynamic";

const isProd = process.env.NODE_ENV === "production";

/** Exchange the shared admin passcode for a short-lived signed cookie. */
export async function POST(request: Request) {
  const limited = enforceRateLimit(request, "admin-login", 5, 60_000);
  if (limited) return limited;

  const body = await readJson(request, 2_000);
  const parsed = adminLoginSchema.safeParse(body);
  if (!parsed.success) return jsonError("Enter the admin passcode.", 422);

  // Never allow placeholder secrets to secure a real deployment: with the
  // default signing secret an attacker could forge the admin cookie outright.
  if (isProd && (isDefaultAdminPasscode || isDefaultSigningSecret)) {
    return jsonError(
      "Admin authentication is not securely configured on the server.",
      503,
    );
  }

  if (!checkAdminPasscode(parsed.data.passcode)) {
    return jsonError("Incorrect passcode.", 401);
  }

  const res = NextResponse.json({ ok: true, role: "admin" });
  res.cookies.set(ADMIN_COOKIE, createAdminToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    path: "/",
    maxAge: Math.floor(ADMIN_TTL_MS / 1000),
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    path: "/",
    maxAge: 0,
  });
  return res;
}
