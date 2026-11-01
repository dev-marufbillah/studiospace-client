import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";
import { hashPassword, verifyPassword } from "better-auth/crypto";
import { APIError } from "better-auth/api";
import { MongoClient } from "mongodb";

/**
 * Server-side Better Auth instance (source of truth for identities).
 * Runs inside Next.js route handlers; Express never talks to Better Auth
 * directly — it verifies application JWTs minted after session checks.
 */

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  throw new Error(
    "MONGODB_URI is required for Better Auth. Copy .env.example to .env.local and configure it."
  );
}

const client = new MongoClient(mongoUri);
const db = client.db(process.env.DB_NAME || "studiospace");

/**
 * Password policy required by the assignment:
 *  - at least one uppercase character
 *  - at least one lowercase character
 *  - at least 6 characters
 * Enforced server-side inside the custom hash callback (client-side Zod
 * mirrors the same rules for instant feedback). Better Auth stores only
 * the resulting scrypt hash — plaintext passwords are never persisted.
 */
function assertPasswordPolicy(password: string): void {
  if (password.length < 6) {
    throw new APIError("BAD_REQUEST", {
      message: "Password must be at least 6 characters long.",
    });
  }
  if (!/[A-Z]/.test(password)) {
    throw new APIError("BAD_REQUEST", {
      message: "Password must contain at least one uppercase letter.",
    });
  }
  if (!/[a-z]/.test(password)) {
    throw new APIError("BAD_REQUEST", {
      message: "Password must contain at least one lowercase letter.",
    });
  }
}

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

/**
 * Better Auth rejects sign-in requests whose Origin is not trusted with the
 * error "Invalid origin". `BETTER_AUTH_URL` only covers ONE origin, but Next
 * falls back to another port (3000 -> 3001 -> 3002) whenever the previous one
 * is busy. So: trust the configured URL, any extra origins from
 * TRUSTED_ORIGINS (comma separated) and, outside production, the usual local
 * dev ports on both localhost and 127.0.0.1.
 */
const baseUrl = process.env.BETTER_AUTH_URL || "http://localhost:3000";

const configuredOrigins = (process.env.TRUSTED_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const devOrigins =
  process.env.NODE_ENV === "production"
    ? []
    : ["3000", "3001", "3002", "3003"].flatMap((port) => [
        `http://localhost:${port}`,
        `http://127.0.0.1:${port}`,
      ]);

const trustedOrigins = Array.from(
  new Set([baseUrl, ...configuredOrigins, ...devOrigins])
);

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: baseUrl,
  trustedOrigins,
  // Plural collection names: users / sessions / accounts / verifications —
  // the `users` collection is also read by the Express profile endpoints.
  database: mongodbAdapter(db, { client, usePlural: true, transaction: false }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 6,
    maxPasswordLength: 128,
    password: {
      hash: async (password: string) => {
        assertPasswordPolicy(password);
        return hashPassword(password);
      },
      verify: async ({ hash, password }: { hash: string; password: string }) =>
        verifyPassword({ hash, password }),
    },
  },
  /**
   * Google sign-in must attach to an existing account when the email already
   * exists (people register with email/password first, then try the Google
   * button). Without this, Better Auth refuses with `account_not_linked`.
   * Only Google is trusted, and the email must match exactly.
   */
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
      allowDifferentEmails: false,
    },
  },
  ...(googleClientId && googleClientSecret
    ? {
        socialProviders: {
          google: { clientId: googleClientId, clientSecret: googleClientSecret },
        },
      }
    : {}),
  plugins: [nextCookies()],
});

export type Auth = typeof auth;
