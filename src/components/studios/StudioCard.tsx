"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Heart, MapPin, Star } from "lucide-react";
import { toast } from "sonner";
import { StudioImage } from "@/components/studios/StudioImage";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/AuthProvider";
import { addToWishlist, removeFromWishlist } from "@/services/wishlist.service";
import { cn, formatRate } from "@/lib/utils";
import type { Studio } from "@/types";

interface StudioCardProps {
  studio: Studio;
  initialWishlisted?: boolean;
  onWishlistChanged?: (studioId: string, saved: boolean) => void;
}

/** Featured/listing card: image, category badge, price, rating, wishlist. */
export function StudioCard({ studio, initialWishlisted = false, onWishlistChanged }: StudioCardProps) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [saved, setSaved] = useState(initialWishlisted);
  const [busy, setBusy] = useState(false);

  const handleWishlist = async () => {
    if (!user) {
      toast.info("Sign in to save studios", {
        description: "Your wishlist follows your account across devices.",
      });
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
      return;
    }
    if (busy) return;

    const next = !saved;
    setSaved(next);
    setBusy(true);
    try {
      if (next) {
        await addToWishlist(studio.id);
        toast.success("Saved to wishlist");
      } else {
        await removeFromWishlist(studio.id);
        toast.success("Removed from wishlist");
      }
      onWishlistChanged?.(studio.id, next);
    } catch (error) {
      setSaved(!next);
      toast.error(error instanceof Error ? error.message : "Could not update wishlist.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-surface transition-shadow duration-300 hover:shadow-lg">
      <div className="relative">
        <StudioImage
          src={studio.imageUrl}
          alt={studio.title}
          className="aspect-[4/3] w-full"
          imgClassName="group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full border border-white/40 bg-black/55 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
          {studio.category}
        </span>
        <button
          type="button"
          onClick={() => void handleWishlist()}
          aria-pressed={saved}
          aria-label={saved ? `Remove ${studio.title} from wishlist` : `Save ${studio.title} to wishlist`}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-black/45 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
        >
          <Heart
            className={cn("h-4 w-4 transition-transform", saved && "fill-primary text-primary scale-110")}
            aria-hidden="true"
          />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-heading text-lg font-semibold leading-snug">
            <Link
              href={`/studios/${studio.id}`}
              className="transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-ring"
            >
              {studio.title}
            </Link>
          </h3>
          {studio.rating > 0 && (
            <span className="flex shrink-0 items-center gap-1 text-sm font-medium">
              <Star className="h-4 w-4 fill-star text-star" aria-hidden="true" />
              {studio.rating.toFixed(1)}
              <span className="text-muted-foreground">({studio.reviewCount})</span>
            </span>
          )}
        </div>

        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="truncate">
            {studio.location.city}, {studio.location.address}
          </span>
        </p>

        <div className="mt-auto flex items-end justify-between gap-3 pt-2">
          <p className="font-heading text-xl font-semibold text-primary">
            {formatRate(studio.hourlyRate)}
            <span className="text-sm font-normal text-muted-foreground">/hour</span>
          </p>
          <Link href={`/studios/${studio.id}`}>
            <Button variant="outline" size="sm">
              View Details
            </Button>
          </Link>
        </div>
      </div>
    </article>
  );
}
