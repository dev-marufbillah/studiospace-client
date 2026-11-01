"use client";

import { Toaster } from "sonner";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/** Sonner toast host, themed to follow the active light/dark theme. */
export function AppToaster() {
  const { resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      theme={mounted && resolvedTheme === "dark" ? "dark" : "light"}
      toastOptions={{
        style: {
          fontFamily: "var(--font-dm-sans), sans-serif",
        },
      }}
    />
  );
}
