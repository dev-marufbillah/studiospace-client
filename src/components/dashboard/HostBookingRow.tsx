"use client";

import { useState } from "react";
import { Check, CalendarDays, Clock, User, X } from "lucide-react";
import { toast } from "sonner";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";
import { updateHostBookingStatus } from "@/services/booking.service";
import { formatDate, formatRate } from "@/lib/utils";
import type { Booking, BookingStatus } from "@/types";

interface HostBookingRowProps {
  booking: Booking;
  onChanged: (booking: Booking) => void;
}

type Action = { label: string; status: BookingStatus; destructive?: boolean; icon: typeof Check };

function actionsFor(status: BookingStatus): Action[] {
  if (status === "Pending") {
    return [
      { label: "Confirm", status: "Confirmed", icon: Check },
      { label: "Decline", status: "Cancelled", destructive: true, icon: X },
    ];
  }
  if (status === "Confirmed") {
    return [
      { label: "Mark completed", status: "Completed", icon: Check },
      { label: "Cancel", status: "Cancelled", destructive: true, icon: X },
    ];
  }
  return [];
}

/** Incoming reservation row with host status transitions. */
export function HostBookingRow({ booking, onChanged }: HostBookingRowProps) {
  const [busyStatus, setBusyStatus] = useState<BookingStatus | null>(null);
  const [pendingAction, setPendingAction] = useState<Action | null>(null);

  const apply = async (status: BookingStatus) => {
    setBusyStatus(status);
    try {
      const updated = await updateHostBookingStatus(booking.id, status);
      onChanged(updated);
      toast.success(`Booking marked ${status.toLowerCase()}`);
      setPendingAction(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update the booking.");
    } finally {
      setBusyStatus(null);
    }
  };

  return (
    <li className="rounded-lg border border-border bg-surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-semibold">{booking.studioTitle}</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <User className="h-3.5 w-3.5" aria-hidden="true" />
            {booking.userName || booking.userEmail}
          </p>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      <dl className="mt-3 grid gap-1.5 text-sm text-muted-foreground sm:grid-cols-2">
        <div className="flex items-center gap-1.5">
          <CalendarDays className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
          <dt className="sr-only">Date</dt>
          <dd>{formatDate(booking.bookingDate)}</dd>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
          <dt className="sr-only">Time</dt>
          <dd>
            {booking.startTime}–{booking.endTime} · {booking.duration}h
          </dd>
        </div>
      </dl>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="font-heading text-lg font-semibold text-primary">
          {formatRate(booking.totalPrice)}
        </p>
        <div className="flex flex-wrap gap-2">
          {actionsFor(booking.status).map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.status + action.label}
                size="sm"
                variant={action.destructive ? "ghost" : "outline"}
                className={action.destructive ? "text-destructive hover:bg-destructive/10" : undefined}
                isLoading={busyStatus === action.status}
                onClick={() => setPendingAction(action)}
              >
                <Icon className="h-3.5 w-3.5" /> {action.label}
              </Button>
            );
          })}
        </div>
      </div>

      <ConfirmDialog
        open={pendingAction !== null}
        title={pendingAction ? `${pendingAction.label} this booking?` : ""}
        description={
          pendingAction
            ? `${booking.studioTitle} · ${formatDate(booking.bookingDate)} (${booking.startTime}–${booking.endTime}) will move to ${pendingAction.status}.`
            : ""
        }
        confirmLabel={pendingAction?.label ?? "Confirm"}
        destructive={pendingAction?.destructive}
        isLoading={busyStatus !== null}
        onConfirm={() => {
          if (pendingAction) void apply(pendingAction.status);
        }}
        onCancel={() => setPendingAction(null)}
      />
    </li>
  );
}
