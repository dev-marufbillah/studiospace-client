"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { StudioForm } from "@/components/studios/StudioForm";
import { ErrorState } from "@/components/shared/ErrorState";
import { PageLoader } from "@/components/shared/PageLoader";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/AuthProvider";
import { fetchStudio } from "@/services/studio.service";
import type { Studio } from "@/types";

/** Private: edit an existing studio (server enforces ownership). */
export default function EditStudioPage() {
  const params = useParams<{ id: string }>();
  const studioId = params.id;
  const { user } = useAuth();
  const [studio, setStudio] = useState<Studio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!studioId) return;
    setLoading(true);
    setError(null);
    fetchStudio(studioId)
      .then(setStudio)
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Could not load this studio.")
      )
      .finally(() => setLoading(false));
  }, [studioId]);

  useEffect(load, [load]);

  return (
    <AuthGuard>
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <Link
          href="/my-listings"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> My Studio Listings
        </Link>

        <header className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
            Edit listing
          </p>
          <h1 className="mt-2 font-heading text-3xl font-semibold sm:text-4xl">
            {studio ? studio.title : "Edit Studio"}
          </h1>
        </header>

        <div className="mt-8">
          {loading ? (
            <PageLoader label="Loading studio details…" />
          ) : error ? (
            <ErrorState message={error} status={403} onRetry={load} />
          ) : studio && user && studio.ownerId !== user.id ? (
            <ErrorState
              title="Not your listing"
              message="Only the host who created this studio can edit it."
              status={403}
            />
          ) : studio ? (
            <StudioForm mode="edit" studio={studio} />
          ) : (
            <div className="text-center">
              <ErrorState title="Studio not found" message="This listing no longer exists." status={404} />
              <div className="mt-6">
                <Link href="/my-listings">
                  <Button variant="outline">Back to my listings</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
