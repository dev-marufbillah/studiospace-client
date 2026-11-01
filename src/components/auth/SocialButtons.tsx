"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/AuthProvider";

/** Google sign-in button with clear configuration-error messaging. */
export function GoogleButton({ mode }: { mode: "login" | "register" }) {
  const { signInGoogle } = useAuth();
  const [busy, setBusy] = useState(false);

  const handleClick = async () => {
    setBusy(true);
    try {
      await signInGoogle();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Google sign-in failed.");
      setBusy(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      isLoading={busy}
      onClick={() => void handleClick()}
      aria-label={`${mode === "login" ? "Sign in" : "Sign up"} with Google`}
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
        <path
          fill="currentColor"
          d="M21.35 11.1H12v2.98h5.35c-.23 1.42-1.66 4.17-5.35 4.17-3.22 0-5.85-2.67-5.85-5.95S8.78 6.35 12 6.35c1.83 0 3.06.78 3.76 1.45l2.56-2.47C16.63 3.75 14.53 2.75 12 2.75 6.9 2.75 2.75 6.9 2.75 12S6.9 21.25 12 21.25c5.75 0 9.55-4.04 9.55-9.7 0-.65-.07-1.15-.2-1.45z"
        />
      </svg>
      {mode === "login" ? "Continue with Google" : "Sign up with Google"}
    </Button>
  );
}
