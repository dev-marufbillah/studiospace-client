"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/shared/EmptyState";
import { useAuth } from "@/providers/AuthProvider";
import {
  deleteStudioReview,
  fetchStudioReviews,
  submitStudioReview,
} from "@/services/studio.service";
import { formatDate, getInitials } from "@/lib/utils";
import type { Review } from "@/types";

interface ReviewSectionProps {
  studioId: string;
  studioOwnerId: string;
  onReviewsChanged?: () => void;
}

/** Reviews list + write form on the studio detail page. */
export function ReviewSection({ studioId, studioOwnerId, onReviewsChanged }: ReviewSectionProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [hoveredStar, setHoveredStar] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    fetchStudioReviews(studioId)
      .then(setReviews)
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, [studioId]);

  const myReview = user ? reviews.find((review) => review.userId === user.id) : undefined;
  const isOwner = user?.id === studioOwnerId;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) {
      toast.info("Sign in to leave a review");
      return;
    }
    setSubmitting(true);
    try {
      await submitStudioReview(studioId, { rating, comment: comment.trim() });
      toast.success("Review saved — thank you!");
      setComment("");
      setRating(5);
      load();
      onReviewsChanged?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save the review.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    setDeletingId(reviewId);
    try {
      await deleteStudioReview(studioId);
      toast.success("Review removed");
      load();
      onReviewsChanged?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not remove the review.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section aria-labelledby="reviews-heading" className="border-t border-border pt-8">
      <div className="flex items-center justify-between">
        <h2 id="reviews-heading" className="font-heading text-2xl font-semibold">
          Reviews
        </h2>
        {!loading && reviews.length > 0 && (
          <span className="text-sm text-muted-foreground">{reviews.length} total</span>
        )}
      </div>

      {loading ? (
        <div className="mt-4 space-y-3" aria-busy="true">
          {[0, 1].map((index) => (
            <div key={index} className="h-20 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            icon={Star}
            title="No reviews yet"
            description="Be the first to share what the space was like — your review helps the next creator."
          />
        </div>
      ) : (
        <ul className="mt-5 space-y-4">
          {reviews.map((review) => (
            <li key={review.id} className="rounded-lg border border-border bg-surface p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
                    {getInitials(review.userName)}
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{review.userName}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</p>
                  </div>
                </div>
                <div
                  className="flex items-center gap-0.5"
                  aria-label={`Rated ${review.rating} out of 5`}
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= review.rating ? "fill-star text-star" : "text-border"
                      }`}
                      aria-hidden="true"
                    />
                  ))}
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{review.comment}</p>
              {review.userId === user?.id && (
                <div className="mt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-destructive hover:bg-destructive/10"
                    disabled={deletingId === review.id}
                    onClick={() => void handleDelete(review.id)}
                  >
                    {deletingId === review.id ? "Removing…" : "Delete my review"}
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-8 rounded-lg border border-border bg-surface-muted p-5">
        <h3 className="font-heading text-xl font-semibold">
          {myReview ? "Update your review" : "Leave a review"}
        </h3>
        {isOwner ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Hosts cannot review their own studios — feedback comes from the people who book
            them.
          </p>
        ) : !user ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in with your StudioSpace account to share your experience.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label id="rating-label">Your rating</Label>
              <div
                role="radiogroup"
                aria-labelledby="rating-label"
                className="flex items-center gap-1"
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    role="radio"
                    aria-checked={rating === star}
                    aria-label={`${star} star${star === 1 ? "" : "s"}`}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                    onClick={() => setRating(star)}
                    className="p-0.5"
                  >
                    <Star
                      className={`h-6 w-6 transition-colors ${
                        star <= (hoveredStar || rating) ? "fill-star text-star" : "text-border"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="review-comment">Comment</Label>
              <Textarea
                id="review-comment"
                required
                minLength={3}
                maxLength={1000}
                placeholder="Light, acoustics, host communication…"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
              />
            </div>
            <Button type="submit" isLoading={submitting}>
              {myReview ? "Update review" : "Post review"}
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}
