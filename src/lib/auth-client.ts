import { createAuthClient } from "better-auth/react";

/**
 * Better Auth browser client. All calls hit the same-origin
 * /api/auth/* handler implemented in src/app/api/auth/[...all]/route.ts.
 */
export const authClient = createAuthClient();

export const authClientHooks = {
  signUpEmail: authClient.signUp.email,
  signInEmail: authClient.signIn.email,
  signInGoogle: () =>
    authClient.signIn.social({
      provider: "google",
      callbackURL: "/",
      errorCallbackURL: "/login",
    }),
  signOut: authClient.signOut,
  getSession: authClient.getSession,
};
