"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

/**
 * Light/Dark theme provider. Light is the approved default; the
 * preference persists in localStorage and is applied before paint by
 * next-themes (no flash / hydration mismatch).
 */
export function ThemeProvider({ children, ...props }: ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
