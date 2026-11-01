import { api } from "@/lib/api";
import type { Booking, BookingStatus } from "@/types";

export interface CreateBookingPayload {
  studioId: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
}

export async function createBooking(payload: CreateBookingPayload): Promise<Booking> {
  const data = await api.post<{ booking: Booking }>("/api/bookings", payload);
  return data.booking;
}

export async function fetchMyBookings(): Promise<Booking[]> {
  const data = await api.get<{ bookings: Booking[] }>("/api/my-bookings");
  return data.bookings;
}

export async function fetchBooking(id: string): Promise<Booking> {
  const data = await api.get<{ booking: Booking }>(`/api/bookings/${id}`);
  return data.booking;
}

export async function cancelBooking(id: string): Promise<Booking> {
  const data = await api.patch<{ booking: Booking }>(`/api/bookings/${id}/cancel`);
  return data.booking;
}

export async function fetchHostBookings(status?: BookingStatus): Promise<Booking[]> {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  const data = await api.get<{ bookings: Booking[] }>(`/api/host/bookings${query}`);
  return data.bookings;
}

export async function updateHostBookingStatus(
  id: string,
  status: BookingStatus
): Promise<Booking> {
  const data = await api.patch<{ booking: Booking }>(`/api/host/bookings/${id}/status`, {
    status,
  });
  return data.booking;
}
