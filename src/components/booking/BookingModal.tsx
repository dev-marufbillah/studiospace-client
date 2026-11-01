"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Clock, Info } from "lucide-react";
import { toast } from "sonner";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/providers/AuthProvider";
import { createBooking } from "@/services/booking.service";
import { formatDuration, formatRate, timeToMinutes } from "@/lib/utils";
import type { Booking, Studio } from "@/types";

interface BookingModalProps {
  studio: Studio;
  open: boolean;
  onClose: () => void;
  onBooked?: (booking: Booking) => void;
}

function todayIso(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

/**
 * Booking modal: date + start/end time, transparent price preview
 * (server recalculates and is authoritative), confirm action.
 */
export function BookingModal({ studio, open, onClose, onBooked }: BookingModalProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [bookingDate, setBookingDate] = useState(todayIso());
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("13:00");
  const [submitting, setSubmitting] = useState(false);

  const pricing = useMemo(() => {
    const start = timeToMinutes(startTime);
    const end = timeToMinutes(endTime);
    if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return null;
    const duration = (end - start) / 60;
    const subtotal = duration * studio.hourlyRate;
    return {
      duration,
      subtotal,
      total: Math.round((subtotal + studio.securityDeposit) * 100) / 100,
    };
  }, [startTime, endTime, studio]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isLoading) return;
    if (!user) {
      toast.info("Sign in to book this studio", {
        description: "You'll come right back to this page after login.",
      });
      router.push(`/login?callbackUrl=${encodeURIComponent(`/studios/${studio.id}`)}`);
      return;
    }

    if (!pricing) {
      toast.error("End time must be after start time.");
      return;
    }

    setSubmitting(true);
    try {
      const booking = await createBooking({
        studioId: studio.id,
        bookingDate,
        startTime,
        endTime,
      });
      toast.success("Booking requested!", {
        description: "Your reservation is pending host confirmation.",
      });
      onBooked?.(booking);
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Booking failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} ariaLabel={`Book ${studio.title}`}>
      <div className="pr-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Reserve this space
        </p>
        <h2 className="mt-1 font-heading text-2xl font-semibold">{studio.title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {studio.location.city} · {studio.category}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="booking-date">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4 text-primary" aria-hidden="true" /> Booking date
              </span>
            </Label>
            <Input
              id="booking-date"
              type="date"
              required
              min={todayIso()}
              value={bookingDate}
              onChange={(event) => setBookingDate(event.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="booking-start">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-primary" aria-hidden="true" /> Start
                </span>
              </Label>
              <Input
                id="booking-start"
                type="time"
                required
                step={300}
                value={startTime}
                onChange={(event) => setStartTime(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="booking-end">End</Label>
              <Input
                id="booking-end"
                type="time"
                required
                step={300}
                value={endTime}
                onChange={(event) => setEndTime(event.target.value)}
              />
            </div>
          </div>

          <div className="rounded-lg border border-border bg-surface-muted p-4 text-sm">
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Hourly rate</dt>
                <dd className="font-medium">{formatRate(studio.hourlyRate)}/hour</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Duration</dt>
                <dd className="font-medium">
                  {pricing ? formatDuration(pricing.duration) : "—"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Security deposit</dt>
                <dd className="font-medium">{formatRate(studio.securityDeposit)}</dd>
              </div>
              <div className="flex justify-between border-t border-border pt-2 text-base">
                <dt className="font-semibold">Total</dt>
                <dd className="font-heading font-semibold text-primary">
                  {pricing ? formatRate(pricing.total) : "—"}
                </dd>
              </div>
            </dl>
          </div>

          {!pricing && (
            <p className="flex items-start gap-1.5 text-xs text-destructive">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              Choose an end time later than the start time to see the total.
            </p>
          )}

          <p className="text-xs leading-relaxed text-muted-foreground">
            Your booking starts as <strong>Pending</strong> until the host confirms the slot.
            The final price is recalculated on the server.
          </p>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting}>
              Confirm Booking
            </Button>
          </div>
        </form>
      </div>
    </Dialog>
  );
}
