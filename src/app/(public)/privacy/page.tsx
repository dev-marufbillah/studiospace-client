import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "What data StudioSpace stores, why it stores it, and the controls you have.",
};

const SECTIONS = [
  {
    heading: "What we store",
    body: "Your account record (name, email, optional photo URL and a hashed password managed by Better Auth), the studios you publish, the bookings you create or receive, wishlist entries and reviews you write. Passwords are never stored in plaintext and are never readable by the application.",
  },
  {
    heading: "How we use it",
    body: "Account data authenticates you and personalises the marketplace. Studio and booking records power search, availability checks and invoices. We do not sell personal data or use it for third-party advertising.",
  },
  {
    heading: "Cookies",
    body: "Two HTTPOnly cookies are used. The Better Auth session cookie proves who you are to the Next.js server. A short-lived signed JWT cookie authorises write operations against the Express API. Neither cookie is readable from JavaScript, and authentication tokens are never written to localStorage.",
  },
  {
    heading: "Images",
    body: "Photos you attach to a studio are uploaded to imgbb through our server, which keeps the API key confidential. The stored URL is saved with the listing. Do not upload images containing personal documents or people who have not consented.",
  },
  {
    heading: "Third parties",
    body: "Google sign-in is optional and only exchanges the identity data Google returns for your account. Email delivery, analytics and payment providers are not enabled in this release.",
  },
  {
    heading: "Your controls",
    body: "You can edit your display name and avatar, remove studios you host, cancel eligible bookings, clear your wishlist and delete your reviews. For account deletion requests, contact the team through the support channel published in the footer.",
  },
  {
    heading: "Retention and security",
    body: "Booking records are kept while your account is active so hosts and renters retain a financial history. Traffic to the API is rate limited, requests are validated, and access to another user's resources is rejected with 403 responses.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="font-heading text-4xl font-semibold">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Effective 1 November 2026</p>
      <div className="mt-8 space-y-7">
        {SECTIONS.map((section) => (
          <section key={section.heading}>
            <h2 className="font-heading text-xl font-semibold">{section.heading}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{section.body}</p>
          </section>
        ))}
      </div>
      <p className="mt-10 rounded-lg border border-border bg-surface-muted p-4 text-xs leading-relaxed text-muted-foreground">
        This policy describes the current implementation of StudioSpace. It is not legal advice;
        formal review is recommended before commercial launch.
      </p>
    </div>
  );
}
