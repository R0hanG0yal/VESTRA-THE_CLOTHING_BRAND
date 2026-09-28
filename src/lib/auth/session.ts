import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/auth/admin";

/** True when the current request carries a valid signed admin session. */
export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  return verifyAdminToken(store.get(ADMIN_COOKIE)?.value);
}

/**
 * Guard for admin API route handlers. Returns a 401 response when the caller
 * is not an authenticated admin, otherwise null (meaning: continue).
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  if (await isAdmin()) return null;
  return NextResponse.json(
    { error: "Admin authentication required." },
    { status: 401, headers: { "Cache-Control": "no-store" } },
  );
}
