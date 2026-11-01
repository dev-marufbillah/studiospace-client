"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Building2,
  CalendarCheck,
  CalendarClock,
  Eye,
  Inbox,
  Pencil,
  Plus,
  Star,
  Trash2,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { StatCard } from "@/components/dashboard/StatCard";
import { HostBookingRow } from "@/components/dashboard/HostBookingRow";
import { StudioImage } from "@/components/studios/StudioImage";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/providers/AuthProvider";
import { deleteStudio, fetchMyListings } from "@/services/studio.service";
import { fetchHostBookings, fetchMyBookings } from "@/services/booking.service";
import { formatRate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Booking, BookingStatus, Studio } from "@/types";

const TABS: { value: BookingStatus | "All"; label: string }[] = [
  { value: "All", label: "All requests" },
  { value: "Pending", label: "Pending" },
  { value: "Confirmed", label: "Confirmed" },
  { value: "Completed", label: "Completed" },
  { value: "Cancelled", label: "Cancelled" },
];

/**
 * Host Panel — the control centre for accounts that rent out space:
 * incoming reservations (confirm / decline / complete), listing management
 * and host-level metrics. Reached from the navbar's host icon or the account
 * dropdown.
 */
export default function HostPanelPage() {
  const { user } = useAuth();
  const [listings, setListings] = useState<Studio[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [guestBookings, setGuestBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<BookingStatus | "All">("Pending");
  const [pendingDelete, setPendingDelete] = useState<Studio | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [myListings, hostBookings, myBookings] = await Promise.all([
        fetchMyListings(),
        fetchHostBookings(),
        fetchMyBookings(),
      ]);
      setListings(myListings);
      setBookings(hostBookings);
      setGuestBookings(myBookings);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load the host panel.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const metrics = useMemo(() => {
    const pending = bookings.filter((booking) => booking.status === "Pending").length;
    const confirmed = bookings.filter((booking) => booking.status === "Confirmed").length;
    const revenue = bookings
      .filter((booking) => booking.status === "Confirmed" || booking.status === "Completed")
      .reduce((sum, booking) => sum + booking.totalPrice, 0);
    return { pending, confirmed, revenue };
  }, [bookings]);

  const visibleBookings = useMemo(
    () => (tab === "All" ? bookings : bookings.filter((booking) => booking.status === tab)),
    [bookings, tab]
  );

  const handleBookingChanged = (updated: Booking) => {
    setBookings((current) =>
      current.map((booking) => (booking.id === updated.id ? updated : booking))
    );
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteStudio(pendingDelete.id);
      setListings((current) => current.filter((studio) => studio.id !== pendingDelete.id));
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
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
              Host panel
            </p>
            <h1 className="mt-2 font-heading text-3xl font-semibold sm:text-4xl">
              Manage your studios
            </h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              {user ? `${user.name} · ` : ""}Confirm reservation requests, keep listings current and
              track what your spaces are earning.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/add-studio">
              <Button size="sm">
                <Plus className="h-4 w-4" /> Add Studio
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <CalendarClock className="h-4 w-4" /> Renter dashboard
              </Button>
            </Link>
          </div>
        </header>

        <div className="mt-6 flex flex-col gap-3 rounded-lg border border-border bg-muted/50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">This panel is for hosting.</span>{" "}
            Requests for studios <span className="font-medium text-foreground">you own</span> land
            below. Bookings you make as a guest stay in My Bookings
            {loading ? "" : ` (${guestBookings.length} so far)`} and never appear here.
          </p>
          <Link href="/my-bookings" className="shrink-0">
            <Button variant="outline" size="sm">
              <CalendarClock className="h-4 w-4" /> My Bookings
              {!loading && guestBookings.length > 0 ? ` (${guestBookings.length})` : ""}
            </Button>
          </Link>
        </div>

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
                    icon={Building2}
                    label="Active listings"
                    value={listings.length}
                    hint="Studios you host"
                  />
                  <StatCard
                    icon={Inbox}
                    label="Pending requests"
                    value={metrics.pending}
                    hint="Awaiting your decision"
                  />
                  <StatCard
                    icon={CalendarCheck}
                    label="Confirmed"
                    value={metrics.confirmed}
                    hint="Upcoming shoots"
                  />
                  <StatCard
                    icon={Wallet}
                    label="Booked value"
                    value={formatRate(metrics.revenue)}
                    hint="Confirmed + completed"
                  />
                </>
              )}
            </div>

            <section className="mt-10" aria-labelledby="requests-heading">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <h2 id="requests-heading" className="font-heading text-2xl font-semibold">
                    Incoming reservations
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Only you can confirm a request for your own studio.
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2" role="tablist" aria-label="Filter requests">
                {TABS.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    role="tab"
                    aria-selected={tab === item.value}
                    onClick={() => setTab(item.value)}
                    className={cn(
                      "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                      tab === item.value
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

              <div className="mt-4">
                {loading ? (
                  <div className="space-y-3" aria-busy="true">
                    {[0, 1, 2].map((index) => (
                      <Skeleton key={index} className="h-32 rounded-lg" />
                    ))}
                  </div>
                ) : bookings.length === 0 ? (
                  <EmptyState
                    icon={Inbox}
                    title="No reservation requests yet"
                    description="When a creator books one of your studios, the request lands here for approval."
                    actionLabel="View my listings"
                    actionHref="/my-listings"
                  />
                ) : visibleBookings.length === 0 ? (
                  <EmptyState
                    icon={CalendarClock}
                    title={`No ${tab.toLowerCase()} requests`}
                    description="Switch tabs to see the rest of your reservations."
                    actionLabel="Show all requests"
                    onAction={() => setTab("All")}
                  />
                ) : (
                  <ul className="space-y-3">
                    {visibleBookings.map((booking) => (
                      <HostBookingRow
                        key={booking.id}
                        booking={booking}
                        onChanged={handleBookingChanged}
                      />
                    ))}
                  </ul>
                )}
              </div>
            </section>

            <section className="mt-10" aria-labelledby="listings-heading">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <h2 id="listings-heading" className="font-heading text-2xl font-semibold">
                  Your listings
                </h2>
                <Link href="/my-listings" className="text-sm font-medium text-primary hover:underline">
                  Full listing manager
                </Link>
              </div>

              <div className="mt-4">
                {loading ? (
                  <Skeleton className="h-40 rounded-lg" />
                ) : listings.length === 0 ? (
                  <EmptyState
                    icon={Building2}
                    title="You are not hosting yet"
                    description="Publish your first studio to start receiving reservation requests. Bookings you made on other hosts' studios are in My Bookings, not here."
                    actionLabel="Add your first studio"
                    actionHref="/add-studio"
                  />
                ) : (
                  <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface">
                    {listings.map((studio) => (
                      <li key={studio.id} className="flex flex-wrap items-center gap-4 p-4">
                        <StudioImage
                          src={studio.imageUrl}
                          alt={studio.title}
                          className="h-16 w-24 shrink-0 rounded-md"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{studio.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {studio.category} · {studio.location.city} ·{" "}
                            {formatRate(studio.hourlyRate)}/hr
                          </p>
                        </div>
                        <span className="flex items-center gap-1 text-sm">
                          <Star className="h-4 w-4 fill-star text-star" aria-hidden="true" />
                          {studio.rating > 0 ? studio.rating.toFixed(1) : "—"}
                          <span className="text-muted-foreground">({studio.reviewCount})</span>
                        </span>
                        <div className="flex gap-1.5">
                          <Link href={`/studios/${studio.id}`} aria-label={`View ${studio.title}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-3.5 w-3.5" /> View
                            </Button>
                          </Link>
                          <Link href={`/studios/edit/${studio.id}`} aria-label={`Edit ${studio.title}`}>
                            <Button variant="outline" size="sm">
                              <Pencil className="h-3.5 w-3.5" /> Edit
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:bg-destructive/10"
                            aria-label={`Delete ${studio.title}`}
                            onClick={() => setPendingDelete(studio)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          </>
        )}

        <ConfirmDialog
          open={pendingDelete !== null}
          title="Delete this studio?"
          description={
            pendingDelete
              ? `“${pendingDelete.title}” will be permanently removed. Existing bookings stay in the renters' history.`
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
