"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Building2, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { StudioImage } from "@/components/studios/StudioImage";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { deleteStudio, fetchMyListings } from "@/services/studio.service";
import { formatDate, formatRate } from "@/lib/utils";
import type { Studio } from "@/types";

function ListingsSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true">
      {[0, 1, 2].map((index) => (
        <div key={index} className="flex gap-4 rounded-lg border border-border bg-surface p-4">
          <Skeleton className="h-24 w-32 rounded-md" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Private: studios owned by the signed-in host. */
export default function MyListingsPage() {
  const [studios, setStudios] = useState<Studio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Studio | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchMyListings()
      .then(setStudios)
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Could not load your listings.")
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteStudio(pendingDelete.id);
      setStudios((current) => current.filter((studio) => studio.id !== pendingDelete.id));
      toast.success("Studio deleted", { description: `${pendingDelete.title} was removed.` });
      setPendingDelete(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete the studio.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AuthGuard>
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
              Host dashboard
            </p>
            <h1 className="mt-2 font-heading text-3xl font-semibold sm:text-4xl">
              My Studio Listings
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {loading ? "Loading your spaces…" : `${studios.length} listing${studios.length === 1 ? "" : "s"} published`}
            </p>
          </div>
          <Link href="/add-studio">
            <Button>
              <Plus className="h-4 w-4" /> Add New Studio
            </Button>
          </Link>
        </header>

        <div className="mt-8">
          {loading ? (
            <ListingsSkeleton />
          ) : error ? (
            <ErrorState message={error} onRetry={load} />
          ) : studios.length === 0 ? (
            <EmptyState
              icon={Building2}
              title="No listings yet"
              description="Publish your first studio to start receiving booking requests from creators."
              actionLabel="Add your first studio"
              actionHref="/add-studio"
            />
          ) : (
            <ul className="space-y-4">
              {studios.map((studio) => (
                <li
                  key={studio.id}
                  className="grid gap-4 rounded-lg border border-border bg-surface p-4 sm:grid-cols-[160px_1fr] sm:items-center"
                >
                  <StudioImage
                    src={studio.imageUrl}
                    alt={studio.title}
                    className="aspect-[4/3] w-full rounded-md"
                  />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h2 className="truncate font-heading text-lg font-semibold">
                          <Link href={`/studios/${studio.id}`} className="hover:text-primary">
                            {studio.title}
                          </Link>
                        </h2>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {studio.category} · {studio.location.city} · listed {formatDate(studio.createdAt)}
                        </p>
                      </div>
                      <span className="flex items-center gap-1 text-sm font-medium">
                        <Star className="h-4 w-4 fill-star text-star" aria-hidden="true" />
                        {studio.rating > 0 ? studio.rating.toFixed(1) : "—"}
                        <span className="text-muted-foreground">({studio.reviewCount})</span>
                      </span>
                    </div>

                    <p className="mt-1 font-medium text-primary">
                      {formatRate(studio.hourlyRate)}
                      <span className="text-sm font-normal text-muted-foreground">/hour</span>
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <Link href={`/studios/${studio.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                      <Link href={`/studios/edit/${studio.id}`}>
                        <Button variant="outline" size="sm">
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => setPendingDelete(studio)}
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <ConfirmDialog
          open={pendingDelete !== null}
          title="Delete this studio?"
          description={
            pendingDelete
              ? `“${pendingDelete.title}” will be permanently removed. Existing bookings stay in the guests' history.`
              : ""
          }
          confirmLabel="Delete studio"
          destructive
          isLoading={deleting}
          onConfirm={() => void handleDelete()}
          onCancel={() => setPendingDelete(null)}
        />
      </div>
    </AuthGuard>
  );
}
