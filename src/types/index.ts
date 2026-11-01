import type { StudioCategory } from "@/lib/constants";

/** Shared JSON envelope produced by the Express API. */
export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data?: T;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface StudioLocation {
  address: string;
  city: string;
}

export interface Studio {
  id: string;
  title: string;
  category: StudioCategory | string;
  description: string;
  hourlyRate: number;
  securityDeposit: number;
  maxCapacity: number;
  location: StudioLocation;
  imageUrl: string;
  gallery: string[];
  amenities: string[];
  equipment: string[];
  ownerId: string;
  ownerEmail: string;
  ownerName: string;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface StudioListResult {
  studios: Studio[];
  pagination: Pagination;
}

export type BookingStatus = "Pending" | "Confirmed" | "Completed" | "Cancelled";

export interface Booking {
  id: string;
  studioId: string;
  studioTitle: string;
  userId: string;
  userEmail: string;
  userName: string;
  hostId: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  startMinute: number;
  endMinute: number;
  duration: number;
  hourlyRate: number;
  securityDeposit: number;
  totalPrice: number;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  studioId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface WishlistItem {
  id: string;
  studioId: string;
  createdAt: string;
  studio: Studio;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  image: string | null;
  createdAt: string | null;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

export interface StudioQuery {
  search?: string;
  category?: string;
  city?: string;
  minPrice?: number | string;
  maxPrice?: number | string;
  minRating?: number | string;
  capacity?: number | string;
  amenities?: string;
  sort?: string;
  page?: number;
  limit?: number;
}
