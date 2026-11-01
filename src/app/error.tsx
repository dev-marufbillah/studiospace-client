"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Route-level error boundary — never leaves a blank screen. */
export default function GlobalRouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Route error:", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-4 py-16 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="h-8 w-8" aria-hidden="true" />
      </span>
      <h1 className="mt-6 font-heading text-3xl font-semibold">Something went wrong</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        This page hit an unexpected error. You can try again — if it keeps happening, head back
        home and retry the action.
      </p>
      {error.digest && (
        <p className="mt-2 text-xs text-muted-foreground">Reference: {error.digest}</p>
      )}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button onClick={reset}>
          <RotateCcw className="h-4 w-4" /> Try again
        </Button>
        <Link href="/">
          <Button variant="outline">
            <Home className="h-4 w-4" /> Back home
          </Button>
        </Link>
      </div>
    </div>
  );
}
