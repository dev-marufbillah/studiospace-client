"use client";

import { useState } from "react";
import Link from "next/link";
import { Aperture, Mail, Send } from "lucide-react";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedInIcon,
  XIcon,
} from "@/components/ui/social-icons";
import { FOOTER_CATEGORIES, NAV_LINKS } from "@/lib/constants";
import { api } from "@/lib/api";
import { toast } from "sonner";

/**
 * Quick navigation = the four primary nav links.
 * Deduplicated by href so a duplicate can never produce a repeated React key
 * (the original bug: NAV_LINKS already contained `/studios` and the footer
 * appended it a second time, which React reported as a duplicate key).
 */
const QUICK_LINKS = Array.from(
  new Map(NAV_LINKS.map((link) => [link.href, link])).values()
);

const SOCIAL_LINKS = [
  { href: "https://www.instagram.com/", label: "Instagram", icon: InstagramIcon },
  { href: "https://www.facebook.com/", label: "Facebook", icon: FacebookIcon },
  { href: "https://www.linkedin.com/", label: "LinkedIn", icon: LinkedInIcon },
  { href: "https://x.com/", label: "X", icon: XIcon },
] as const;

/** Shared site footer: brand, navigation, categories, newsletter, socials. */
export function Footer() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleNewsletter = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    try {
      const result = await api.post<{ subscribed: boolean }>("/api/newsletter", {
        email: email.trim(),
      });
      if (result.subscribed) {
        toast.success("You're on the list!", {
          description: "We'll email you when new studios join StudioSpace.",
        });
      } else {
        toast.info("Already subscribed", {
          description: "That email is already on the StudioSpace newsletter.",
        });
      }
      setEmail("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Subscription failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="border-t border-border bg-surface-muted">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div className="space-y-4">
          <Link href="/" className="flex items-center gap-2" aria-label="StudioSpace home">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Aperture className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="font-heading text-2xl font-semibold">
              Studio<span className="text-primary">Space</span>
            </span>
          </Link>
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            A peer-to-peer marketplace where creators discover, inspect and book
            photography studios, sound stages and production spaces by the hour —
            and hosts earn from the rooms they already have.
          </p>
          <div className="flex gap-2">
            {SOCIAL_LINKS.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  <Icon className="h-4 w-4" />
                </a>
              );
            })}
          </div>
        </div>

        <nav aria-label="Footer navigation">
          <h3 className="font-heading text-lg font-semibold">Quick Navigation</h3>
          <ul className="mt-4 space-y-2.5">
            {QUICK_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Studio categories">
          <h3 className="font-heading text-lg font-semibold">Popular Categories</h3>
          <ul className="mt-4 space-y-2.5">
            {FOOTER_CATEGORIES.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h3 className="font-heading text-lg font-semibold">Stay in the loop</h3>
          <p className="mt-4 text-sm text-muted-foreground">
            New studios, city guides and hosting tips — once a week, no noise.
          </p>
          <form onSubmit={handleNewsletter} className="mt-4" aria-label="Newsletter signup">
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="newsletter-email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="h-10 w-full rounded-md border border-input bg-surface pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-ring"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                aria-label="Subscribe to newsletter"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
          <div className="mt-6 space-y-1.5 text-sm text-muted-foreground">
            <p>
              <Link href="/terms" className="transition-colors hover:text-primary">
                Terms of Service
              </Link>
              {" · "}
              <Link href="/privacy" className="transition-colors hover:text-primary">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} StudioSpace. All rights reserved.</p>
          <p>Made for creators, hosts and everything in between.</p>
        </div>
      </div>
    </footer>
  );
}
