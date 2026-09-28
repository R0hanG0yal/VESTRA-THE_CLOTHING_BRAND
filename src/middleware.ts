import { NextResponse, type NextRequest } from "next/server";

/**
 * Middleware responsibilities:
 *  1. Generate a per-request nonce and a strict, nonce-based Content-Security-Policy.
 *  2. Refresh the Supabase auth session (if Supabase is configured).
 *  3. Gate protected routes (checkout / account / wallet / refer).
 *
 * We deliberately avoid importing heavy modules here: middleware runs on the
 * edge for every request and must stay fast.
 */

const PROTECTED_PREFIXES = ["/account", "/checkout", "/wallet", "/orders"];

function buildCsp(nonce: string, isLocalHost: boolean) {
  const isDev = process.env.NODE_ENV !== "production";
  return [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' ${isDev ? "'unsafe-eval'" : ""} https:`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: blob: https:`,
    `font-src 'self' data:`,
    `connect-src 'self' https:`,
    `media-src 'self' blob:`,
    `worker-src 'self' blob:`,
    `frame-src 'self' https:`,
    `frame-ancestors 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `object-src 'none'`,
    // Upgrade plain http to https on real deployments. Skipped locally (dev
    // AND `next start` on localhost) — there is no TLS on localhost, so the
    // upgrade would just break the app with https://localhost attempts.
    isDev || isLocalHost ? "" : `upgrade-insecure-requests`,
  ]
    .filter(Boolean)
    .join("; ");
}

export function middleware(request: NextRequest) {
  const nonce = crypto.randomUUID().replace(/-/g, "");
  const isLocalHost = ["localhost", "127.0.0.1", "[::1]", "::1"].includes(
    request.nextUrl.hostname,
  );
  const isDev = process.env.NODE_ENV !== "production";

  // Enforce HTTPS on external environments
  if (!isLocalHost && !isDev && request.headers.get("x-forwarded-proto") === "http") {
    const secureUrl = new URL(request.url);
    secureUrl.protocol = "https:";
    return NextResponse.redirect(secureUrl, 301);
  }

  const csp = buildCsp(nonce, isLocalHost);

  // Only the nonce travels on the request headers (Next reads it to stamp its
  // own scripts); the CSP itself goes on the response.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);

  // --- Auth gate -----------------------------------------------------------
  // A demo session cookie is set on login. Real deployments use the Supabase
  // session (also cookie based) — either way we only check for presence here.
  const path = request.nextUrl.pathname;

  // --- Admin area ----------------------------------------------------------
  // Gate on presence of the signed admin cookie; the authoritative signature /
  // role check happens server-side in the admin layout and every admin route.
  if ((path === "/admin" || path.startsWith("/admin/")) && path !== "/admin/login") {
    if (!request.cookies.has("vestra_admin")) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = "";
      const redirect = NextResponse.redirect(url);
      redirect.headers.set("Content-Security-Policy", csp);
      return redirect;
    }
  }

  const isProtected = PROTECTED_PREFIXES.some(
    (p) => path === p || path.startsWith(`${p}/`),
  );

  if (isProtected) {
    const hasSession =
      request.cookies.has("vestra_session") ||
      request.cookies.has("sb-access-token") ||
      request.cookies.has("sb-refresh-token");

    if (!hasSession) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", path);
      const redirect = NextResponse.redirect(url);
      redirect.headers.set("Content-Security-Policy", csp);
      return redirect;
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all paths except static assets and image optimisation so we do not
     * waste edge invocations or break asset delivery.
     */
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|woff2?)$).*)",
  ],
};
