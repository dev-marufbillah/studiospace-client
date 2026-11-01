"use client";

import { AlertTriangle, RefreshCw, ShieldAlert, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  title?: string;
  message: string;
  status?: number;
  onRetry?: () => void;
}

/** Consistent error panel for failed API loads. */
export function ErrorState({ title, message, status, onRetry }: ErrorStateProps) {
  // Pick the icon inline: returning a component from a helper would
  // create component identities during render.
  const Icon = status === 401 || status === 403 ? ShieldAlert : status === 0 ? WifiOff : AlertTriangle;
  const heading =
    title ??
    (status === 401
      ? "Please sign in"
      : status === 403
        ? "Access denied"
        : status === 404
          ? "Not found"
          : "Something went wrong");

  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center rounded-lg border border-destructive/30 bg-destructive/5 px-6 py-12 text-center"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <h3 className="mt-4 font-heading text-2xl">{heading}</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">{message}</p>
      {onRetry && (
        <div className="mt-5">
          <Button variant="outline" onClick={onRetry}>
            <RefreshCw className="h-4 w-4" /> Try again
          </Button>
        </div>
      )}
    </div>
  );
}
