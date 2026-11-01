import { CalendarCheck, Clapperboard, Search, SlidersHorizontal } from "lucide-react";

const STEPS = [
  {
    icon: Search,
    title: "Discover Spaces",
    description:
      "Search studios by category, city, price and amenities — with real photos, rates and host details.",
  },
  {
    icon: SlidersHorizontal,
    title: "Select Shoot Hours",
    description:
      "Pick the date and the exact start and end times your crew needs. Prices update transparently.",
  },
  {
    icon: CalendarCheck,
    title: "Book Instantly",
    description:
      "Confirm the reservation in one step. The host is notified, and your booking appears in My Bookings.",
  },
  {
    icon: Clapperboard,
    title: "Create and Produce",
    description:
      "Arrive, plug in and make the work. Rate the space afterwards so other creators benefit.",
  },
] as const;

/** "How Booking Works" — four approved steps. */
export function HowItWorks() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
          How booking works
        </p>
        <h2 className="mt-2 text-balance font-heading text-3xl font-semibold sm:text-4xl">
          From first search to final take
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          Four simple steps between an idea and a room that is ready for it.
        </p>
      </div>

      <ol className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          return (
            <li
              key={step.title}
              className="relative rounded-lg border border-border bg-surface p-6 transition-shadow hover:shadow-md"
            >
              <span
                aria-hidden="true"
                className="absolute right-5 top-3 font-heading text-5xl font-semibold text-accent"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="relative mt-4 font-heading text-xl font-semibold">{step.title}</h3>
              <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
