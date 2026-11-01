import type { Metadata } from "next";
import Link from "next/link";
import { Aperture, Camera, Handshake, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "StudioSpace is a peer-to-peer marketplace connecting creators with creative studios, stages and production spaces.",
};

const VALUES = [
  {
    icon: Camera,
    title: "Built for working creatives",
    description:
      "Every decision starts with the shoot: real availability, honest rates and listings that answer the questions crews actually ask.",
  },
  {
    icon: Handshake,
    title: "Hosts are partners",
    description:
      "Studio owners set their own hourly rate and deposit, approve requests and keep their calendar conflict-free.",
  },
  {
    icon: Sparkles,
    title: "Quality over volume",
    description:
      "We would rather show fifty excellent spaces than five hundred listings nobody has photographed.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
      <section className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">About StudioSpace</p>
        <h1 className="mt-3 text-balance font-heading text-4xl font-semibold leading-tight sm:text-5xl">
          Great work needs the right room
        </h1>
        <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
          StudioSpace is a peer-to-peer creative workspace marketplace. Photographers, filmmakers,
          podcasters, musicians and artists discover and reserve studios by the hour — and studio
          owners turn empty hours into bookings without building their own booking system.
        </p>
      </section>

      <section className="mt-12 grid gap-6 sm:grid-cols-3">
        {VALUES.map((value) => {
          const Icon = value.icon;
          return (
            <article key={value.title} className="rounded-lg border border-border bg-surface p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="mt-4 font-heading text-xl font-semibold">{value.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {value.description}
              </p>
            </article>
          );
        })}
      </section>

      <section className="mt-12 rounded-xl border border-border bg-surface-muted p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Aperture className="h-6 w-6" aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-heading text-2xl font-semibold">How we work</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Bookings are created as pending requests, hosts confirm the slot, and a
              concurrency-safe reservation layer prevents two confirmed bookings from occupying
              the same studio hours. Prices and deposits are calculated server-side from the
              studio&apos;s stored rate — never from values typed into a form.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/studios">
                <Button>Explore studios</Button>
              </Link>
              <Link href="/how-it-works">
                <Button variant="outline">How booking works</Button>
              </Link>
              <Link href="/add-studio">
                <Button variant="ghost">List your space</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
