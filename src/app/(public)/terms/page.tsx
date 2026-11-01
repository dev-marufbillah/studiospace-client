import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that govern use of the StudioSpace marketplace.",
};

const SECTIONS = [
  {
    heading: "1. Using StudioSpace",
    body: "StudioSpace connects studio hosts with creators looking for space. You must provide accurate account information and be legally able to enter into the bookings you create. Accounts created with false details may be suspended.",
  },
  {
    heading: "2. Listings and bookings",
    body: "Hosts are responsible for the accuracy of their listings, including hourly rate, security deposit, capacity, amenities and equipment. A booking request is an offer; it becomes a confirmed reservation only after the host confirms it. Times shown to renters use the studio's local schedule.",
  },
  {
    heading: "3. Payments and deposits",
    body: "Totals are calculated server-side as hours multiplied by the hourly rate, plus the listed security deposit. StudioSpace does not process card payments in this release; settlement arrangements between host and renter are confirmed directly for each booking.",
  },
  {
    heading: "4. Cancellations",
    body: "Renters may cancel pending or confirmed bookings before the reserved window. Hosts may decline pending requests and may cancel confirmed bookings. Cancelled and completed bookings are terminal states and cannot be reopened.",
  },
  {
    heading: "5. Conduct and damage",
    body: "Renters must leave the space as found, follow house rules published by the host, and respect capacity limits. Reported damage is assessed against the security deposit. Hosts must not cancel confirmed bookings to resell the same hours at a higher price.",
  },
  {
    heading: "6. Content and images",
    body: "You retain ownership of the photos you upload. By uploading, you grant StudioSpace a licence to display those images on the platform. Upload only images you have the right to use.",
  },
  {
    heading: "7. Liability",
    body: "StudioSpace provides the booking platform. It is not the operator of any listed studio and is not a party to the on-site agreement between host and renter. To the extent permitted by law, StudioSpace's liability is limited to the platform fees for the booking in question.",
  },
  {
    heading: "8. Changes",
    body: "These terms may be updated as the platform evolves. Material changes are announced on this page with a revised effective date.",
  },
];

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="font-heading text-4xl font-semibold">Terms of Service</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Effective 1 November 2026 · Applies to every account and booking on StudioSpace.
      </p>
      <div className="mt-8 space-y-7">
        {SECTIONS.map((section) => (
          <section key={section.heading}>
            <h2 className="font-heading text-xl font-semibold">{section.heading}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{section.body}</p>
          </section>
        ))}
      </div>
      <p className="mt-10 rounded-lg border border-border bg-surface-muted p-4 text-xs leading-relaxed text-muted-foreground">
        This page documents the platform&apos;s operating rules for the current release. It is not
        legal advice; formal counsel review is recommended before commercial launch.
      </p>
    </div>
  );
}
