import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/token";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();

  if (supabase) {
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      return NextResponse.json({
        user: {
          id: data.user.id,
          email: data.user.email,
          name: (data.user.user_metadata?.name as string) ?? "Shopper",
        },
      });
    }
  }

  const cookieStore = await cookies();
  const payload = verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
  if (!payload) return NextResponse.json({ user: null });

  return NextResponse.json({
    user: { id: payload.sub, email: payload.email, name: payload.name },
  });
}
