"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { mintSessionToken } from "@/lib/api";
import type { AuthUser } from "@/types";

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refresh: () => Promise<void>;
  signInEmail: (email: string, password: string) => Promise<void>;
  signUpEmail: (input: {
    name: string;
    email: string;
    password: string;
    photoURL?: string;
  }) => Promise<void>;
  signInGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const mintedRef = useRef(false);

  const refresh = useCallback(async () => {
    try {
      const { data } = await authClient.getSession();
      if (data?.user) {
        setUser({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          image: data.user.image ?? null,
        });
        // Ensure the HTTPOnly application JWT exists for API mutations.
        if (!mintedRef.current) {
          mintedRef.current = true;
          await mintSessionToken();
        }
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const signInEmail = useCallback(
    async (email: string, password: string) => {
      const { error } = await authClient.signIn.email({ email, password });
      if (error) {
        throw new Error(error.message ?? "Sign in failed. Please try again.");
      }
      mintedRef.current = false;
      await refresh();
      await mintSessionToken();
      mintedRef.current = true;
    },
    [refresh]
  );

  const signUpEmail = useCallback(
    async (input: { name: string; email: string; password: string; photoURL?: string }) => {
      const { error } = await authClient.signUp.email({
        name: input.name,
        email: input.email,
        password: input.password,
        ...(input.photoURL ? { image: input.photoURL } : {}),
      });
      if (error) {
        throw new Error(error.message ?? "Registration failed. Please try again.");
      }
      // Better Auth signs the new user in automatically. The assignment
      // requires "registration success -> Login page", so the auto session is
      // cleared to avoid a signed-in navbar sitting on top of the login form.
      try {
        await authClient.signOut();
      } catch {
        /* non-fatal: the login page still works */
      }
      await fetch("/api/session", { method: "DELETE", credentials: "include" });
      mintedRef.current = false;
      setUser(null);
    },
    []
  );

  const signInGoogle = useCallback(async () => {
    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL: "/",
      errorCallbackURL: "/login",
    });
    if (error) {
      // Better Auth answers PROVIDER_NOT_FOUND when the Google credentials are
      // missing from .env.local — translate it into actionable guidance.
      if (error.code === "PROVIDER_NOT_FOUND" || /provider/i.test(error.message ?? "")) {
        throw new Error(
          "Google sign-in is not configured on this deployment. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env.local, or continue with email and password."
        );
      }
      throw new Error(error.message ?? "Google sign-in failed.");
    }
    // On success the browser navigates to Google; session resumes on return.
  }, []);

  const signOut = useCallback(async () => {
    try {
      await authClient.signOut();
    } finally {
      mintedRef.current = false;
      await fetch("/api/session", { method: "DELETE", credentials: "include" });
      setUser(null);
      router.replace("/login");
      router.refresh();
    }
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: user !== null,
      refresh,
      signInEmail,
      signUpEmail,
      signInGoogle,
      signOut,
    }),
    [user, isLoading, refresh, signInEmail, signUpEmail, signInGoogle, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return context;
}
