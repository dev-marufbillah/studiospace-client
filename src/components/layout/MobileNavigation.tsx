"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { NAV_LINKS } from "@/lib/constants";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MobileNavigationProps {
  open: boolean;
  onClose: () => void;
}

/** Slide-over drawer for small screens (Escape + scroll lock + focus). */
export function MobileNavigation({ open, onClose }: MobileNavigationProps) {
  const pathname = usePathname();
  const { user, isLoading, signOut } = useAuth();

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
      <div className="absolute inset-0 bg-foreground/40" onClick={onClose} aria-hidden="true" />
      <div className="absolute inset-y-0 right-0 flex w-80 max-w-[85vw] flex-col border-l border-border bg-background shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <span className="font-heading text-xl">Menu</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="rounded-full p-2 text-muted-foreground hover:bg-accent"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-col gap-1 p-4" aria-label="Mobile">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={cn(
                  "rounded-md px-3 py-3 text-base transition-colors",
                  active
                    ? "bg-accent font-semibold text-primary"
                    : "text-foreground hover:bg-accent"
                )}
                aria-current={active ? "page" : undefined}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-border p-4">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Checking session…</p>
          ) : user ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/host"
                  onClick={onClose}
                  className="col-span-2 rounded-md bg-primary px-3 py-2.5 text-center text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
                >
                  Host Panel
                </Link>
                <Link
                  href="/dashboard"
                  onClick={onClose}
                  className="rounded-md border border-border px-3 py-2.5 text-center text-sm font-medium hover:bg-accent"
                >
                  Dashboard
                </Link>
                <Link
                  href="/my-bookings"
                  onClick={onClose}
                  className="rounded-md border border-border px-3 py-2.5 text-center text-sm font-medium hover:bg-accent"
                >
                  My Bookings
                </Link>
                <Link
                  href="/wishlist"
                  onClick={onClose}
                  className="rounded-md border border-border px-3 py-2.5 text-center text-sm font-medium hover:bg-accent"
                >
                  Wishlist
                </Link>
                <Link
                  href="/profile"
                  onClick={onClose}
                  className="rounded-md border border-border px-3 py-2.5 text-center text-sm font-medium hover:bg-accent"
                >
                  Profile
                </Link>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  onClose();
                  void signOut();
                }}
              >
                Logout
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Link href="/login" onClick={onClose} className="block">
                <Button variant="outline" className="w-full">
                  Login
                </Button>
              </Link>
              <Link href="/register" onClick={onClose} className="block">
                <Button className="w-full">Register</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
