"use client";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatDate, formatLongDate, formatRate } from "@/lib/utils";
import type { Booking } from "@/types";

interface BookingInvoiceProps {
  booking: Booking;
  studioImage?: string;
}

/**
 * Generates a branded PDF invoice for a confirmed booking entirely
 * client-side (jsPDF) — no server round trip.
 */
export function generateInvoicePdf(booking: Booking): void {
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  // Brand header
  doc.setFillColor(183, 93, 66);
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), 92, "F");
  doc.setTextColor(253, 251, 247);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.text("StudioSpace", 40, 44);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("Creative Workspace Marketplace · Booking Invoice", 40, 66);

  doc.setTextColor(42, 37, 33);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", 40, 130);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(110, 99, 90);
  doc.text(`Invoice no: SS-${booking.id.slice(-10).toUpperCase()}`, 40, 150);
  doc.text(`Issued: ${formatDate(new Date())}`, 40, 166);

  autoTable(doc, {
    startY: 190,
    theme: "grid",
    styles: { font: "helvetica", fontSize: 10, cellPadding: 8, textColor: [42, 37, 33] },
    headStyles: { fillColor: [237, 228, 211], textColor: [42, 37, 33], fontStyle: "bold" },
    columnStyles: { 0: { cellWidth: 150, fontStyle: "bold" } },
    margin: { left: 40, right: 40 },
    body: [
      ["Studio", booking.studioTitle],
      ["Booking ID", booking.id],
      ["Booking date", formatLongDate(booking.bookingDate)],
      ["Time slot", `${booking.startTime} – ${booking.endTime}`],
      ["Duration", `${booking.duration} hour${booking.duration === 1 ? "" : "s"}`],
      ["Status", booking.status],
    ],
  });

  const afterTable = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable
    ?.finalY ?? 360;

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(42, 37, 33);
  doc.text("Customer", 40, afterTable + 34);
  doc.text("Host", 320, afterTable + 34);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(110, 99, 90);
  doc.text([booking.userName, booking.userEmail], 40, afterTable + 52);
  doc.text("StudioSpace Host", 320, afterTable + 52);
  doc.text(`Host ID: ${booking.hostId}`, 320, afterTable + 66);

  autoTable(doc, {
    startY: afterTable + 96,
    theme: "plain",
    styles: { font: "helvetica", fontSize: 11, cellPadding: 6, textColor: [42, 37, 33] },
    margin: { left: 260, right: 40 },
    columnStyles: { 0: { cellWidth: 140, fontStyle: "bold" }, 1: { halign: "right" } },
    body: [
      [`Hourly rate (${booking.duration}h)`, formatRate(booking.hourlyRate * booking.duration)],
      ["Security deposit", formatRate(booking.securityDeposit)],
      ["Total paid at confirmation", formatRate(booking.totalPrice)],
    ],
  });

  const totalY =
    (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ??
    afterTable + 200;

  doc.setDrawColor(183, 93, 66);
  doc.setLineWidth(1.5);
  doc.line(260, totalY + 14, doc.internal.pageSize.getWidth() - 40, totalY + 14);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(183, 93, 66);
  doc.text(`TOTAL: ${formatRate(booking.totalPrice)}`, doc.internal.pageSize.getWidth() - 40, totalY + 34, {
    align: "right",
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(110, 99, 90);
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.text(
    "Thank you for booking with StudioSpace. Present this invoice at check-in.",
    40,
    doc.internal.pageSize.getHeight() - 40
  );
  doc.text(`studiospace · ${booking.studioTitle}`, pageWidth - 40, doc.internal.pageSize.getHeight() - 40, {
    align: "right",
  });

  doc.save(`studiospace-invoice-${booking.id.slice(-8)}.pdf`);
}

/** Download button — only offered for confirmed bookings. */
export function BookingInvoice({ booking }: BookingInvoiceProps) {
  const eligible = booking.status === "Confirmed";

  const handleDownload = () => {
    try {
      generateInvoicePdf(booking);
      toast.success("Invoice downloaded");
    } catch {
      toast.error("Could not generate the invoice PDF.");
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDownload}
      disabled={!eligible}
      title={eligible ? "Download PDF invoice" : "Invoices are available for confirmed bookings"}
    >
      <Download className="h-4 w-4" aria-hidden="true" />
      Invoice
    </Button>
  );
}
