"use client";

import { useCallback, useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { StudioGrid } from "@/components/studios/StudioGrid";
import { fetchWishlist, removeFromWishlist } from "@/services/wishlist.service";
import { toast } from "sonner";
import type { Studio, WishlistItem } from "@/types";

/** Private: saved studios, heart state stays in sync with the API. */
export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchWishlist()
      .then(setItems)
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Could not load your wishlist.")
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleWishlistChanged = async (studioId: string, saved: boolean) => {
    if (!saved) {
      // Card already removed the entry server-side; mirror it locally.
      setItems((current) => current.filter((item) => item.studioId !== studioId));
      return;
    }
    try {
      await removeFromWishlist(studioId);
      setItems((current) => current.filter((item) => item.studioId !== studioId));
      toast.success("Removed from wishlist");
    } catch {
      load();
    }
  };

  const studios: Studio[] = items.map((item) => item.studio).filter(Boolean);
  const savedIds = new Set(items.map((item) => item.studioId));

  return (
    <AuthGuard>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
            Saved for later
          </p>
          <h1 className="mt-2 font-heading text-3xl font-semibold sm:text-4xl">Saved Studios</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {loading
              ? "Loading your saved spaces…"
              : `${studios.length} studio${studios.length === 1 ? "" : "s"} in your wishlist`}
          </p>
        </header>

        <div className="mt-8">
          {loading ? (
            <StudioGrid studios={[]} loading skeletonCount={3} />
          ) : error ? (
            <ErrorState message={error} onRetry={load} />
          ) : studios.length === 0 ? (
            <EmptyState
              icon={Heart}
              title="Your wishlist is empty"
              description="Tap the heart on any studio card to keep it here for your next shoot."
              actionLabel="Explore studios"
              actionHref="/studios"
            />
          ) : (
            <StudioGrid
              studios={studios}
              wishlistedIds={savedIds}
              onWishlistChanged={(studioId, saved) => void handleWishlistChanged(studioId, saved)}
            />
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
