import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HowItWorks } from "@/components/home/HowItWorks";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "How creators book studios on StudioSpace and how hosts manage listings, requests and payouts.",
};

const CREATOR_STEPS = [
  {
    title: "Create an account",
    detail:
      "Register with email and password (or Google). You choose a display name and can add a photo URL.",
  },
  {
    title: "Find the right space",
    detail:
      "Filter by category, city, price, rating, amenities and capacity. Results come straight from the database.",
  },
  {
    title: "Pick your hours",
    detail:
      "The booking modal shows the hourly rate, the security deposit and the calculated total before you confirm.",
  },
  {
    title: "Wait for confirmation",
    detail:
      "Your request is saved as Pending. When the host confirms it, you can download a PDF invoice for the shoot.",
  },
];

const HOST_STEPS = [
  {
    title: "Publish a listing",
    detail:
      "Add a cover image, gallery, amenities, equipment, capacity and your hourly rate. Your host identity is taken from your account.",
  },
  {
    title: "Review requests",
    detail:
      "Incoming reservations appear on your dashboard with the renter, date and total. Confirm or decline in one click.",
  },
  {
    title: "Keep your calendar clean",
    detail:
      "Confirmed bookings lock their time window — overlapping requests are rejected automatically with a clear conflict message.",
  },
  {
    title: "Complete the booking",
    detail:
      "After the shoot, mark the reservation as completed. Renters can then leave a review on your studio.",
  },
];

export default function HowItWorksPage() {
  return (
    <div>
      <HowItWorks />

      <div className="mx-auto max-w-5xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <section className="rounded-lg border border-border bg-surface p-6">
            <h2 className="font-heading text-2xl font-semibold">For creators</h2>
            <ol className="mt-5 space-y-4">
              {CREATOR_STEPS.map((step, index) => (
                <li key={step.title} className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold">{step.title}</h3>
                    <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                      {step.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="rounded-lg border border-border bg-surface p-6">
            <h2 className="font-heading text-2xl font-semibold">For hosts</h2>
            <ol className="mt-5 space-y-4">
              {HOST_STEPS.map((step, index) => (
                <li key={step.title} className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold">{step.title}</h3>
                    <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                      {step.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <section className="mt-10 rounded-xl border border-border bg-surface-muted p-6 text-center sm:p-8">
          <h2 className="font-heading text-2xl font-semibold">Booking rules, in plain words</h2>
          <ul className="mx-auto mt-4 max-w-2xl space-y-2 text-left text-sm leading-relaxed text-muted-foreground">
            <li>• End time must be later than start time, and the slot cannot be in the past.</li>
            <li>• Only Confirmed bookings block a time window for other renters.</li>
            <li>• Total = (hours × hourly rate) + security deposit, calculated on the server.</li>
            <li>• Renters can cancel Pending or Confirmed bookings; hosts can confirm or decline.</li>
          </ul>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/studios">
              <Button>Explore studios</Button>
            </Link>
            <Link href="/register">
              <Button variant="outline">Create an account</Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
