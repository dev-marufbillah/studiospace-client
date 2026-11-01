import { api } from "@/lib/api";
import type { WishlistItem } from "@/types";

export async function fetchWishlist(): Promise<WishlistItem[]> {
  const data = await api.get<{ items: WishlistItem[] }>("/api/wishlist");
  return data.items;
}

export async function addToWishlist(studioId: string): Promise<{ added: boolean }> {
  return api.post<{ added: boolean }>("/api/wishlist", { studioId });
}

export async function removeFromWishlist(studioId: string): Promise<void> {
  await api.delete(`/api/wishlist/${studioId}`);
}
