import { StudioCard } from "@/components/studios/StudioCard";
import { StudioCardSkeleton } from "@/components/ui/skeleton";
import type { Studio } from "@/types";

interface StudioGridProps {
  studios: Studio[];
  loading?: boolean;
  wishlistedIds?: Set<string>;
  onWishlistChanged?: (studioId: string, saved: boolean) => void;
  skeletonCount?: number;
}

/** Responsive 1 / 2 / 3-column studio grid with skeleton loading. */
export function StudioGrid({
  studios,
  loading = false,
  wishlistedIds,
  onWishlistChanged,
  skeletonCount = 6,
}: StudioGridProps) {
  if (loading) {
    return (
      <div
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        aria-busy="true"
        aria-label="Loading studios"
      >
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <StudioCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {studios.map((studio) => (
        <StudioCard
          key={studio.id}
          studio={studio}
          initialWishlisted={wishlistedIds?.has(studio.id)}
          onWishlistChanged={onWishlistChanged}
        />
      ))}
    </div>
  );
}
