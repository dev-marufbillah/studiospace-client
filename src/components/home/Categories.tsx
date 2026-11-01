import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CATEGORY_TILES } from "@/lib/constants";

/**
 * Browse Categories — the five approved tiles. Each navigates to the
 * explore page with the exact category query value.
 */
export function Categories() {
  return (
    <section className="border-y border-border bg-surface-muted">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
            Browse by craft
          </p>
          <h2 className="mt-2 text-balance font-heading text-3xl font-semibold sm:text-4xl">
            Spaces built for the way you create
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
            From daylight photo rooms to treated podcast booths — start with the category that
            matches your next project.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {CATEGORY_TILES.map((tile) => (
            <Link
              key={tile.value}
              href={`/studios?category=${encodeURIComponent(tile.value)}`}
              className="group relative flex min-h-56 flex-col justify-end overflow-hidden rounded-lg border border-border p-5 text-white transition-transform duration-300 hover:-translate-y-1"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={tile.image}
                alt=""
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/10"
              />
              <div className="relative">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm transition-colors group-hover:bg-primary">
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </span>
                <h3 className="mt-3 font-heading text-xl font-semibold">{tile.label}</h3>
                <p className="mt-1 text-xs leading-relaxed text-white/80">{tile.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
