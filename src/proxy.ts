import { NextRequest, NextResponse } from "next/server";
import { AUTH_JWT_COOKIE } from "@/lib/constants";

/**
 * Next.js 16 proxy (formerly middleware.ts) — navigation protection for
 * private routes. It runs on every matched request BEFORE rendering and
 * redirects unauthenticated visitors to /login?callbackUrl=...
 *
 * IMPORTANT: this is a UX guard, not the security boundary. Every API
 * mutation independently verifies the HTTPOnly JWT on Express, and the
 * session cookie itself is validated by Better Auth when pages load.
 */

const PRIVATE_ROUTES = [
  "/dashboard",
  "/profile",
  "/wishlist",
  "/my-bookings",
  "/my-listings",
  "/add-studio",
  "/studios/edit",
];

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPrivate = PRIVATE_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (!isPrivate) return NextResponse.next();

  // Better Auth emits `better-auth.session_token` (dev), may prefix
  // `__Secure-` on HTTPS and may chunk large values into `.0`/`.1`, while the
  // app JWT lives in `studiospace_session`. Any of them means "signed in", so
  // match by substring instead of one exact name (the original bug compared
  // against `better_auth.session_token` and always said "no session").
  const hasSession = request.cookies
    .getAll()
    .some(
      (cookie) =>
        cookie.name.length > 0 &&
        cookie.value.length > 0 &&
        (cookie.name.includes("session_token") || cookie.name === AUTH_JWT_COOKIE)
    );
  if (hasSession) return NextResponse.next();

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("callbackUrl", `${pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/wishlist/:path*",
    "/my-bookings/:path*",
    "/my-listings/:path*",
    "/add-studio/:path*",
    "/studios/edit/:path*",
  ],
};
