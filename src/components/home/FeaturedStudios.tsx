"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { StudioGrid } from "@/components/studios/StudioGrid";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { fetchFeaturedStudios } from "@/services/studio.service";
import type { Studio } from "@/types";

/** Homepage section: up to 6 featured studios from the API. */
export function FeaturedStudios() {
  const [studios, setStudios] = useState<Studio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    fetchFeaturedStudios()
      .then(setStudios)
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Could not load featured studios.")
      )
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
            Handpicked for you
          </p>
          <h2 className="mt-2 text-balance font-heading text-3xl font-semibold sm:text-4xl">
            Featured Studios
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Top-rated spaces our community keeps coming back to — inspected, reviewed and ready
            to shoot.
          </p>
        </div>
        <Link
          href="/studios"
          className="group flex items-center gap-1.5 text-sm font-semibold text-primary"
        >
          View all studios
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </Link>
      </div>

      <div className="mt-10">
        {error ? (
          <ErrorState message={error} onRetry={load} />
        ) : (
          <StudioGrid studios={studios} loading={loading} skeletonCount={6} />
        )}
        {!loading && !error && studios.length === 0 && (
          <EmptyState
            title="No studios yet"
            description="Featured listings will appear here as soon as hosts publish their spaces."
            actionLabel="Explore all studios"
            actionHref="/studios"
          />
        )}
      </div>
    </section>
  );
}
