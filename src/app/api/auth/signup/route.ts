import { NextResponse } from "next/server";
import { enforceRateLimit, jsonError, readJson } from "@/lib/api";
import { signupSchema } from "@/lib/security/validation";
import { createSessionToken, SESSION_COOKIE } from "@/lib/auth/token";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const limited = enforceRateLimit(request, "signup", 6, 60_000);
  if (limited) return limited;

  const body = await readJson(request, 4_000);
  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid details.");
  }

  const { name, email, password } = parsed.data;
  const supabase = await createClient();

  if (supabase) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) return jsonError(error.message, 400);
    return NextResponse.json({
      user: {
        id: data.user?.id ?? "",
        email,
        name,
      },
    });
  }

  // ----- Demo mode -------------------------------------------------------
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
