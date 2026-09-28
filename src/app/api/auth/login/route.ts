import { NextResponse } from "next/server";
import { enforceRateLimit, jsonError, readJson } from "@/lib/api";
import { loginSchema } from "@/lib/security/validation";
import { createSessionToken, SESSION_COOKIE } from "@/lib/auth/token";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const limited = enforceRateLimit(request, "login", 10, 60_000);
  if (limited) return limited;

  const body = await readJson(request, 4_000);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return jsonError("Enter a valid email and password.");

  const { email, password } = parsed.data;
  const supabase = await createClient();

  if (supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      return jsonError("Invalid email or password.", 401);
    }
    return NextResponse.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        name: (data.user.user_metadata?.name as string) ?? "Shopper",
      },
    });
  }

  // ----- Demo mode (no Supabase configured) ------------------------------
  if (password.length < 6) {
    return jsonError("Password must be at least 6 characters.", 401);
  }
  const name = email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const token = createSessionToken({ email, name });
  const res = NextResponse.json({ user: { id: token.slice(0, 16), email, name } });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
