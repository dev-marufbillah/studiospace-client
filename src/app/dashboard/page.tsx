"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Building2,
  CalendarClock,
  CheckCircle2,
  Heart,
  Inbox,
  Plus,
  Wallet,
} from "lucide-react";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { StatCard } from "@/components/dashboard/StatCard";
import { HostBookingRow } from "@/components/dashboard/HostBookingRow";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/providers/AuthProvider";
import { fetchMyBookings, fetchHostBookings } from "@/services/booking.service";
import { fetchMyListings } from "@/services/studio.service";
import { fetchWishlist } from "@/services/wishlist.service";
import { formatRate, getInitials } from "@/lib/utils";
import type { Booking } from "@/types";

/** Private: renter + host overview with incoming reservation actions. */
export default function DashboardPage() {
  const { user } = useAuth();
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [hostBookings, setHostBookings] = useState<Booking[]>([]);
  const [listingCount, setListingCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [bookings, hosts, listings, wishlist] = await Promise.all([
        fetchMyBookings(),
        fetchHostBookings(),
        fetchMyListings(),
        fetchWishlist(),
      ]);
      setMyBookings(bookings);
      setHostBookings(hosts);
      setListingCount(listings.length);
      setWishlistCount(wishlist.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load your dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const stats = useMemo(() => {
    const confirmed = myBookings.filter((booking) => booking.status === "Confirmed").length;
    const spend = myBookings
      .filter((booking) => booking.status !== "Cancelled")
      .reduce((sum, booking) => sum + booking.totalPrice, 0);
    const pendingHost = hostBookings.filter((booking) => booking.status === "Pending").length;
    const hostRevenue = hostBookings
      .filter((booking) => booking.status === "Confirmed" || booking.status === "Completed")
      .reduce((sum, booking) => sum + booking.totalPrice, 0);
    return { confirmed, spend, pendingHost, hostRevenue };
    }, [myBookings, hostBookings]);

  const handleHostChanged = (updated: Booking) => {
    setHostBookings((current) =>
      current.map((booking) => (booking.id === updated.id ? updated : booking))
    );
  };

  return (
    <AuthGuard>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {user?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.image}
                alt=""
                className="h-14 w-14 rounded-full object-cover ring-2 ring-border"
              />
            ) : (
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground">
                {getInitials(user?.name ?? "StudioSpace")}
              </span>
            )}
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
                Dashboard
              </p>
              <h1 className="font-heading text-3xl font-semibold">Hi, {user?.name ?? "creator"}</h1>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/add-studio">
              <Button size="sm">
                <Plus className="h-4 w-4" /> Add Studio
              </Button>
            </Link>
            <Link href="/my-bookings">
              <Button variant="outline" size="sm">
                <CalendarClock className="h-4 w-4" /> My Bookings
              </Button>
            </Link>
          </div>
        </header>

        {error ? (
          <div className="mt-8">
            <ErrorState message={error} onRetry={() => void load()} />
          </div>
        ) : (
          <>
            <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {loading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-28 rounded-lg" />
                ))
              ) : (
                <>
                  <StatCard
                    icon={CalendarClock}
                    label="My bookings"
                    value={myBookings.length}
                    hint={`${stats.confirmed} confirmed`}
                  />
                  <StatCard
                    icon={Wallet}
                    label="Booking spend"
                    value={formatRate(stats.spend)}
                    hint="Excludes cancelled"
                  />
                  <StatCard
                    icon={Building2}
                    label="My listings"
                    value={listingCount}
                    hint={`${stats.pendingHost} pending requests`}
                  />
                  <StatCard
                    icon={Heart}
                    label="Wishlist"
                    value={wishlistCount}
                    hint="Saved studios"
                  />
                </>
              )}
            </div>

            <section className="mt-10" aria-labelledby="incoming-heading">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <h2 id="incoming-heading" className="font-heading text-2xl font-semibold">
                    Incoming reservations
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Confirm or decline requests on the studios you host.
                  </p>
                </div>
                <Link
                  href="/my-listings"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Manage listings
                </Link>
              </div>

              <div className="mt-4">
                {loading ? (
                  <div className="space-y-3" aria-busy="true">
                    {[0, 1].map((index) => (
                      <Skeleton key={index} className="h-32 rounded-lg" />
                    ))}
                  </div>
                ) : hostBookings.length === 0 ? (
                  <EmptyState
                    icon={Inbox}
                    title="No reservations yet"
                    description="When someone books one of your studios, the request appears here for confirmation."
                    actionLabel="View my listings"
                    actionHref="/my-listings"
                  />
                ) : (
                  <ul className="space-y-3">
                    {hostBookings.map((booking) => (
                      <HostBookingRow
                        key={booking.id}
                        booking={booking}
                        onChanged={handleHostChanged}
                      />
                    ))}
                  </ul>
                )}
              </div>
            </section>

            <section className="mt-10" aria-labelledby="activity-heading">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <h2 id="activity-heading" className="font-heading text-2xl font-semibold">
                  Your latest bookings
                </h2>
                <Link href="/my-bookings" className="text-sm font-medium text-primary hover:underline">
                  View all
                </Link>
              </div>
              <div className="mt-4">
                {loading ? (
                  <Skeleton className="h-24 rounded-lg" />
                ) : myBookings.length === 0 ? (
                  <EmptyState
                    icon={CheckCircle2}
                    title="No bookings yet"
                    description="Find a studio that matches your next shoot and reserve it in a minute."
                    actionLabel="Explore studios"
                    actionHref="/studios"
                  />
                ) : (
                  <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface">
                    {myBookings.slice(0, 4).map((booking) => (
                      <li
                        key={booking.id}
                        className="flex flex-wrap items-center justify-between gap-3 p-4"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium">{booking.studioTitle}</p>
                          <p className="text-xs text-muted-foreground">
                            {booking.bookingDate} · {booking.startTime}–{booking.endTime}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <span className="font-medium text-primary">
                            {formatRate(booking.totalPrice)}
                          </span>
                          <Link
                            href="/my-bookings"
                            className="text-xs font-medium text-muted-foreground hover:text-primary"
                          >
                            Details
                          </Link>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </AuthGuard>
  );
}
