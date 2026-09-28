import { NextResponse } from "next/server";
import { clientIp, rateLimit } from "@/lib/security/rate-limit";

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, {
    ...init,
    headers: { "Cache-Control": "no-store", ...(init?.headers ?? {}) },
  });
}

export function jsonError(message: string, status = 400, extra?: Record<string, unknown>) {
  return NextResponse.json(
    { error: message, ...extra },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

/**
 * Guard a route with a per-IP rate limit. Returns a 429 response when the
 * caller has exceeded the limit, otherwise null (meaning: continue).
 */
export function enforceRateLimit(
  request: Request,
  bucket: string,
  limit = 30,
  windowMs = 60_000,
): NextResponse | null {
  const ip = clientIp(request.headers);
  const result = rateLimit(`${bucket}:${ip}`, limit, windowMs);
  if (!result.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      {
        status: 429,
        headers: {
          "Cache-Control": "no-store",
          "Retry-After": String(result.retryAfter),
        },
      },
    );
  }
  return null;
}

/** Safely parse a JSON body with a hard size cap. */
export async function readJson<T = unknown>(
  request: Request,
  maxBytes = 100_000,
): Promise<T | null> {
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > maxBytes) return null;
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}
