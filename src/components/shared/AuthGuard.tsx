"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { PageLoader } from "@/components/shared/PageLoader";

/**
 * Client-side guard for private pages. Complements src/proxy.ts (which
 * runs before render) with a real session check; while the session is
 * being verified the page shows a branded loader instead of flashing
 * protected content.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isLoading || user) return;
    const callbackUrl = `${pathname}${window.location.search}`;
    router.replace(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }, [isLoading, user, pathname, router]);

  if (isLoading || !user) {
    return <PageLoader label="Checking your session…" />;
  }

  return <>{children}</>;
}
