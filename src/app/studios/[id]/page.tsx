"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Award,
  Heart,
  MapPin,
  Maximize2,
  Star,
  Users,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { StudioImage } from "@/components/studios/StudioImage";
import { ReviewSection } from "@/components/studios/ReviewSection";
import { BookingModal } from "@/components/booking/BookingModal";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/shared/ErrorState";
import { PageLoader } from "@/components/shared/PageLoader";
import { useAuth } from "@/providers/AuthProvider";
import { fetchStudio } from "@/services/studio.service";
import { addToWishlist, fetchWishlist, removeFromWishlist } from "@/services/wishlist.service";
import { cn, formatRate } from "@/lib/utils";
import type { Studio } from "@/types";

/** Studio detail: gallery, specs, host info, reviews, booking modal. */
export default function StudioDetailPage() {
  const params = useParams<{ id: string }>();
  const studioId = params.id;
  const { user } = useAuth();

  const [studio, setStudio] = useState<Studio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [reviewsVersion, setReviewsVersion] = useState(0);

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

  useEffect(() => {
    if (!user || !studioId) {
      setSaved(false);
      return;
    }
    fetchWishlist()
      .then((items) => setSaved(items.some((item) => item.studioId === studioId)))
      .catch(() => setSaved(false));
  }, [user, studioId]);

  const handleWishlist = async () => {
    if (!studio) return;
    if (!user) {
      toast.info("Sign in to save studios");
      return;
    }
    const next = !saved;
    setSaved(next);
    try {
      if (next) {
        await addToWishlist(studio.id);
        toast.success("Saved to wishlist");
      } else {
        await removeFromWishlist(studio.id);
        toast.success("Removed from wishlist");
      }
    } catch (error) {
      setSaved(!next);
      toast.error(error instanceof Error ? error.message : "Could not update wishlist.");
    }
  };

  if (loading) return <PageLoader label="Loading studio…" />;

  if (error || !studio) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <ErrorState
          message={error ?? "Studio not found."}
          status={error?.toLowerCase().includes("not found") ? 404 : 0}
          onRetry={load}
        />
        <div className="mt-6 text-center">
          <Link href="/studios">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4" /> Back to studios
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const images = studio.gallery.length > 0 ? [studio.imageUrl, ...studio.gallery] : [studio.imageUrl];
  const currentImage = images[Math.min(activeImage, images.length - 1)] ?? studio.imageUrl;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="mb-5">
        <Link
          href="/studios"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All studios
        </Link>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        {/* Gallery */}
        <div>
          <div className="relative overflow-hidden rounded-lg border border-border">
            <StudioImage
              src={currentImage}
              alt={`${studio.title} — photo ${activeImage + 1}`}
              className="aspect-[4/3] w-full"
              eager
            />
            <span className="absolute bottom-3 left-3 rounded-full bg-black/55 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
              {studio.category}
            </span>
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar" role="tablist" aria-label="Studio photos">
              {images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  role="tab"
                  aria-selected={index === activeImage}
                  aria-label={`Show photo ${index + 1}`}
                  onClick={() => setActiveImage(index)}
                  className={cn(
                    "h-16 w-20 shrink-0 overflow-hidden rounded-md border-2 transition-colors",
                    index === activeImage ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"
                  )}
                >
                  <StudioImage src={image} alt="" className="h-full w-full" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info panel */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                {studio.category}
              </p>
              <h1 className="mt-1.5 text-balance font-heading text-3xl font-semibold leading-tight sm:text-4xl">
                {studio.title}
              </h1>
            </div>
            <button
              type="button"
              onClick={() => void handleWishlist()}
              aria-pressed={saved}
              aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-surface transition-colors hover:border-primary"
            >
              <Heart className={cn("h-5 w-5", saved && "fill-primary text-primary")} />
            </button>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {studio.rating > 0 ? (
              <span className="flex items-center gap-1 font-medium text-foreground">
                <Star className="h-4 w-4 fill-star text-star" aria-hidden="true" />
                {studio.rating.toFixed(1)}
                <span className="font-normal text-muted-foreground">({studio.reviewCount} reviews)</span>
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 text-border" aria-hidden="true" /> No reviews yet
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-primary" aria-hidden="true" />
              {studio.location.address}, {studio.location.city}
            </span>
          </div>

          <p className="mt-5 leading-relaxed text-muted-foreground">{studio.description}</p>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-border bg-surface p-3 text-center">
              <Wallet className="mx-auto h-4 w-4 text-primary" aria-hidden="true" />
              <p className="mt-1.5 font-heading text-lg font-semibold text-primary">
                {formatRate(studio.hourlyRate)}
              </p>
              <p className="text-xs text-muted-foreground">per hour</p>
            </div>
            <div className="rounded-lg border border-border bg-surface p-3 text-center">
              <Users className="mx-auto h-4 w-4 text-primary" aria-hidden="true" />
              <p className="mt-1.5 font-heading text-lg font-semibold">{studio.maxCapacity}</p>
              <p className="text-xs text-muted-foreground">max capacity</p>
            </div>
            <div className="rounded-lg border border-border bg-surface p-3 text-center">
              <Maximize2 className="mx-auto h-4 w-4 text-primary" aria-hidden="true" />
              <p className="mt-1.5 font-heading text-lg font-semibold">
                {formatRate(studio.securityDeposit)}
              </p>
              <p className="text-xs text-muted-foreground">deposit</p>
            </div>
          </div>

          <div className="mt-6">
            <Button size="lg" className="w-full" onClick={() => setBookingOpen(true)}>
              Book Workspace Now
            </Button>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Instant request · host confirms your slot · price locked at booking
            </p>
          </div>

          <div className="mt-6 rounded-lg border border-border bg-surface-muted p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {studio.ownerName.charAt(0).toUpperCase()}
              </span>
              <div>
                <p className="flex items-center gap-1.5 text-sm font-semibold">
                  Hosted by {studio.ownerName}
                  <Award className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                </p>
                <p className="text-xs text-muted-foreground">Responds through StudioSpace messaging</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Specs */}
      <div className="mt-12 grid gap-8 md:grid-cols-2">
        <section aria-labelledby="amenities-heading">
          <h2 id="amenities-heading" className="font-heading text-2xl font-semibold">
            Amenities
          </h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {studio.amenities.length > 0 ? (
              studio.amenities.map((amenity) => (
                <li
                  key={amenity}
                  className="rounded-full border border-border bg-surface px-3.5 py-1.5 text-sm"
                >
                  {amenity}
                </li>
              ))
            ) : (
              <li className="text-sm text-muted-foreground">No amenities listed yet.</li>
            )}
          </ul>
        </section>
        <section aria-labelledby="equipment-heading">
          <h2 id="equipment-heading" className="font-heading text-2xl font-semibold">
            Equipment included
          </h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {studio.equipment.length > 0 ? (
              studio.equipment.map((item) => (
                <li
                  key={item}
                  className="rounded-full border border-border bg-accent px-3.5 py-1.5 text-sm text-accent-foreground"
                >
                  {item}
                </li>
              ))
            ) : (
              <li className="text-sm text-muted-foreground">Bring your own gear.</li>
            )}
          </ul>
        </section>
      </div>

      <div className="mt-12">
        <ReviewSection
          studioId={studio.id}
          studioOwnerId={studio.ownerId}
          onReviewsChanged={() => {
            setReviewsVersion((value) => value + 1);
            load();
          }}
        />
        <span hidden data-reviews-version={reviewsVersion} />
      </div>

      <BookingModal
        studio={studio}
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        onBooked={() => load()}
      />
    </div>
  );
}
