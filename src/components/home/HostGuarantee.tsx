import {
  BadgeCheck,
  Headphones,
  ShieldCheck,
  Wrench,
} from "lucide-react";

const GUARANTEES = [
  {
    icon: ShieldCheck,
    title: "Liability Protection",
    description:
      "Booking terms require renters to cover accidental damage that happens during reserved hours, with deposits held against claims.",
  },
  {
    icon: BadgeCheck,
    title: "Verified Profiles",
    description:
      "Hosts and renters build trust through account verification, completed bookings and public reviews from the community.",
  },
  {
    icon: Wrench,
    title: "Equipment Safety",
    description:
      "Listings state exactly which gear is included. Confirm condition at check-in and report issues through your booking.",
  },
  {
    icon: Headphones,
    title: "Host Support",
    description:
      "Booking disputes, cancellations and no-shows are handled through our support channel with a written response promise.",
  },
] as const;

/**
 * Host guarantee & creator support. The wording describes the policy
 * framework of the marketplace — it does not claim active insurance
 * policies or 24/7 staffing that are not implemented in this release.
 */
export function HostGuarantee() {
  return (
    <section className="border-t border-border bg-surface-muted">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
              Host guarantee &amp; creator support
            </p>
            <h2 className="mt-2 text-balance font-heading text-3xl font-semibold sm:text-4xl">
              Book with confidence. Host with clarity.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
              StudioSpace is built around four commitments that keep shoots predictable — for
              the people booking rooms and the people opening them.
            </p>
            <p className="mt-4 rounded-md border border-border bg-surface px-4 py-3 text-xs leading-relaxed text-muted-foreground">
              These pillars describe StudioSpace&apos;s current booking policies and community
              standards. Specific coverage and response details are defined in our Terms of
              Service and confirmed with each booking.
            </p>
          </div>

          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {GUARANTEES.map((item) => {
              const Icon = item.icon;
              return (
                <li
                  key={item.title}
                  className="rounded-lg border border-border bg-surface p-5 transition-colors hover:border-primary/40"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-3 font-heading text-lg font-semibold">{item.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
