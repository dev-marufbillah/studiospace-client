import { api } from "@/lib/api";
import { buildQuery } from "@/lib/utils";
import type { Review, Studio, StudioListResult, StudioQuery } from "@/types";

export async function fetchStudios(query: StudioQuery = {}): Promise<StudioListResult> {
  const data = await api.get<StudioListResult>(`/api/studios${buildQuery({ ...query })}`);
  return data;
}

export async function fetchFeaturedStudios(): Promise<Studio[]> {
  const data = await api.get<{ studios: Studio[] }>("/api/studios/featured");
  return data.studios;
}

export async function fetchStudio(id: string): Promise<Studio> {
  const data = await api.get<{ studio: Studio }>(`/api/studios/${id}`);
  return data.studio;
}

export async function fetchMyListings(): Promise<Studio[]> {
  const data = await api.get<{ studios: Studio[] }>("/api/my-listings");
  return data.studios;
}

export interface StudioPayload {
  title: string;
  category: string;
  description: string;
  hourlyRate: number;
  securityDeposit: number;
  maxCapacity: number;
  address: string;
  city: string;
  imageUrl: string;
  gallery: string[];
  amenities: string[];
  equipment: string[];
}

export async function createStudio(payload: StudioPayload): Promise<Studio> {
  const data = await api.post<{ studio: Studio }>("/api/studios", payload);
  return data.studio;
}

export async function updateStudio(id: string, payload: Partial<StudioPayload>): Promise<Studio> {
  const data = await api.put<{ studio: Studio }>(`/api/studios/${id}`, payload);
  return data.studio;
}

export async function deleteStudio(id: string): Promise<void> {
  await api.delete(`/api/studios/${id}`);
}

export async function fetchStudioReviews(id: string): Promise<Review[]> {
  const data = await api.get<{ reviews: Review[] }>(`/api/studios/${id}/reviews`);
  return data.reviews;
}

export async function submitStudioReview(
  id: string,
  payload: { rating: number; comment: string }
): Promise<Review> {
  const data = await api.post<{ review: Review }>(`/api/studios/${id}/reviews`, payload);
  return data.review;
}

export async function deleteStudioReview(id: string): Promise<void> {
  await api.delete(`/api/studios/${id}/reviews`);
}
