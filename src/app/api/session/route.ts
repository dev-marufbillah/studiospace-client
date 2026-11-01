import { headers } from "next/headers";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { AUTH_JWT_COOKIE } from "@/lib/constants";

/**
 * JWT exchange endpoint (stays on Next.js — NOT rewritten to Express).
 *
 * POST: verifies the real Better Auth session server-side, then asks the
 *       Express API (server-to-server, shared INTERNAL_API_SECRET) to mint
 *       the application JWT and stores it in an HTTPOnly cookie.
 * DELETE: clears the application JWT cookie (logout cleanup).
 */

const API_ORIGIN =
  process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

const isProduction = process.env.NODE_ENV === "production";

async function readSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session;
}

/**
 * GET: diagnostics. Open http://localhost:3000/api/session in the browser to
 * see whether Better Auth really sees a session and which cookies arrived —
 * the fastest way to debug "signed in but redirected to /login".
 */
export async function GET(): Promise<NextResponse> {
  const session = await readSession();
  const cookieStore = await cookies();
  return NextResponse.json({
    success: true,
    message: session?.user ? "Session is active." : "No active session.",
    data: {
      authenticated: Boolean(session?.user),
      user: session?.user
        ? { id: session.user.id, email: session.user.email, name: session.user.name }
        : null,
      hasJwtCookie: cookieStore.has(AUTH_JWT_COOKIE),
      cookieNames: cookieStore.getAll().map((cookie) => cookie.name),
    },
  });
}

export async function POST(): Promise<NextResponse> {
  const session = await readSession();
  if (!session?.user) {
    return NextResponse.json(
      { success: false, message: "No active session." },
      { status: 401 }
    );
  }

  const internalSecret = process.env.INTERNAL_API_SECRET;
  if (!internalSecret) {
    return NextResponse.json(
      { success: false, message: "INTERNAL_API_SECRET is not configured." },
      { status: 500 }
    );
  }

  let exchangeResponse: Response;
  try {
    exchangeResponse = await fetch(`${API_ORIGIN}/api/auth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-Secret": internalSecret,
      },
      body: JSON.stringify({
        userId: session.user.id,
        email: session.user.email,
        name: session.user.name ?? "",
      }),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Could not reach the StudioSpace API." },
      { status: 502 }
    );
  }

  const payload = (await exchangeResponse.json().catch(() => null)) as {
    success?: boolean;
    message?: string;
    data?: { token?: string; expiresInSeconds?: number };
  } | null;

  const token = payload?.data?.token;
  if (!exchangeResponse.ok || !payload?.success || !token) {
    return NextResponse.json(
      { success: false, message: payload?.message ?? "Token exchange failed." },
      { status: 502 }
    );
  }

  const expiresInSeconds = payload.data?.expiresInSeconds ?? 7 * 24 * 60 * 60;

  const cookieStore = await cookies();
  cookieStore.set(AUTH_JWT_COOKIE, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: expiresInSeconds,
  });

  return NextResponse.json({ success: true, message: "Session token issued." });
}

export async function DELETE(): Promise<NextResponse> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_JWT_COOKIE);
  return NextResponse.json({ success: true, message: "Session token cleared." });
}
