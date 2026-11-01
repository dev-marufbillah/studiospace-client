"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarClock } from "lucide-react";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { BookingCard } from "@/components/booking/BookingCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchMyBookings } from "@/services/booking.service";
import { cn } from "@/lib/utils";
import type { Booking, BookingStatus } from "@/types";

const FILTERS: { value: BookingStatus | "All"; label: string }[] = [
  { value: "All", label: "All" },
  { value: "Pending", label: "Pending" },
  { value: "Confirmed", label: "Confirmed" },
  { value: "Completed", label: "Completed" },
  { value: "Cancelled", label: "Cancelled" },
];

/** Private: the renter's booking history with status filters. */
export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<BookingStatus | "All">("All");

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchMyBookings()
      .then(setBookings)
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Could not load your bookings.")
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const visible = useMemo(
    () => (filter === "All" ? bookings : bookings.filter((booking) => booking.status === filter)),
    [bookings, filter]
  );

  const handleChanged = (updated: Booking) => {
    setBookings((current) =>
      current.map((booking) => (booking.id === updated.id ? updated : booking))
    );
  };

  return (
    <AuthGuard>
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
            Your reservations
          </p>
          <h1 className="mt-2 font-heading text-3xl font-semibold sm:text-4xl">My Bookings</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Track pending requests, download invoices for confirmed shoots and cancel when plans
            change.
          </p>
        </header>

        <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="Filter bookings by status">
          {FILTERS.map((item) => (
            <button
              key={item.value}
              type="button"
              role="tab"
              aria-selected={filter === item.value}
              onClick={() => setFilter(item.value)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                filter === item.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-surface text-muted-foreground hover:text-foreground"
              )}
            >
              {item.label}
              {item.value !== "All" && (
                <span className="ml-1.5 text-xs opacity-70">
                  {bookings.filter((booking) => booking.status === item.value).length}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="mt-6 space-y-4">
          {loading ? (
            <div className="space-y-4" aria-busy="true">
              {[0, 1].map((index) => (
                <Skeleton key={index} className="h-40 w-full rounded-lg" />
              ))}
            </div>
          ) : error ? (
            <ErrorState message={error} onRetry={load} />
          ) : bookings.length === 0 ? (
            <EmptyState
              icon={CalendarClock}
              title="No bookings yet"
              description="Explore studios and reserve the space your next project needs."
              actionLabel="Explore studios"
              actionHref="/studios"
            />
          ) : visible.length === 0 ? (
            <EmptyState
              icon={CalendarClock}
              title={`No ${filter.toLowerCase()} bookings`}
              description="Switch to another tab to see the rest of your reservations."
              actionLabel="Show all bookings"
              onAction={() => setFilter("All")}
            />
          ) : (
            <>
              {visible.map((booking) => (
                <BookingCard key={booking.id} booking={booking} onChanged={handleChanged} />
              ))}
              <div className="pt-2 text-center">
                <Button variant="outline" onClick={load}>
                  Refresh bookings
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
