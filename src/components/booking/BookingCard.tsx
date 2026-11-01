"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarDays, Clock, MapPin } from "lucide-react";
import { toast } from "sonner";
import { StudioImage } from "@/components/studios/StudioImage";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";
import { BookingInvoice } from "@/components/booking/BookingInvoice";
import { cancelBooking } from "@/services/booking.service";
import { formatDate, formatDuration, formatRate } from "@/lib/utils";
import type { Booking } from "@/types";

interface BookingCardProps {
  booking: Booking;
  onChanged?: (booking: Booking) => void;
  studioImageUrl?: string;
}

const canCancel = (status: Booking["status"]) => status === "Pending" || status === "Confirmed";

/** Booking row/card for My Bookings with cancel + invoice actions. */
export function BookingCard({ booking, onChanged, studioImageUrl }: BookingCardProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleCancel = async () => {
    setBusy(true);
    try {
      const updated = await cancelBooking(booking.id);
      toast.success("Booking cancelled");
      onChanged?.(updated);
      setConfirmOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not cancel the booking.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className="overflow-hidden rounded-lg border border-border bg-surface">
      <div className="grid gap-4 p-4 sm:grid-cols-[120px_1fr] sm:p-5">
        <StudioImage
          src={studioImageUrl ?? "/images/studios/photo-studio.jpg"}
          alt={booking.studioTitle}
          className="aspect-[4/3] w-full rounded-md sm:aspect-square"
        />

        <div className="min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate font-heading text-lg font-semibold">
                <Link
                  href={`/studios/${booking.studioId}`}
                  className="transition-colors hover:text-primary"
                >
                  {booking.studioTitle}
                </Link>
              </h3>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                Booking ID · {booking.id}
              </p>
            </div>
            <StatusBadge status={booking.status} />
          </div>

          <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarDays className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <dt className="sr-only">Date</dt>
              <dd>{formatDate(booking.bookingDate)}</dd>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <dt className="sr-only">Time</dt>
              <dd>
                {booking.startTime} – {booking.endTime} · {formatDuration(booking.duration)}
              </dd>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <dt className="sr-only">Rate</dt>
              <dd>
                {formatRate(booking.hourlyRate)}/hr · deposit {formatRate(booking.securityDeposit)}
              </dd>
            </div>
            <div className="flex items-center gap-2">
              <dt className="sr-only">Total</dt>
              <dd className="font-heading text-lg font-semibold text-primary">
                {formatRate(booking.totalPrice)} total
              </dd>
            </div>
          </dl>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link href={`/studios/${booking.studioId}`}>
              <Button variant="outline" size="sm">
                View Studio
              </Button>
            </Link>
            <BookingInvoice booking={booking} />
            {canCancel(booking.status) && (
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:bg-destructive/10"
                onClick={() => setConfirmOpen(true)}
              >
                Cancel Booking
              </Button>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Cancel this booking?"
        description={`${booking.studioTitle} on ${formatDate(booking.bookingDate)} (${booking.startTime}–${booking.endTime}) will be released. This cannot be undone.`}
        confirmLabel="Yes, cancel booking"
        cancelLabel="Keep booking"
        destructive
        isLoading={busy}
        onConfirm={() => void handleCancel()}
        onCancel={() => setConfirmOpen(false)}
      />
    </article>
  );
}
