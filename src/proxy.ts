import { NextRequest, NextResponse } from "next/server";
import { BETTER_AUTH_SESSION_COOKIE } from "@/lib/constants";

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

  const hasSession = request.cookies.has(BETTER_AUTH_SESSION_COOKIE);
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
