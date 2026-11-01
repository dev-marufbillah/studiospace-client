import { api } from "@/lib/api";
import type { UserProfile } from "@/types";

export async function fetchProfile(): Promise<UserProfile> {
  const data = await api.get<{ user: UserProfile }>("/api/users/me");
  return data.user;
}

export async function updateProfile(payload: {
  name?: string;
  image?: string;
}): Promise<UserProfile> {
  const data = await api.patch<{ user: UserProfile }>("/api/users/me", payload);
  return data.user;
}
