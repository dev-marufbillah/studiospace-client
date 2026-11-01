import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Tailwind-aware class merger used by every UI primitive. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** "$45" / "$45.50" — hourly rates are USD. */
export function formatRate(rate: number): string {
  const rounded = Math.round(rate * 100) / 100;
  const value = Number.isInteger(rounded) ? rounded.toFixed(0) : rounded.toFixed(2);
  return `$${value}`;
}

/** "20 May 2030" */
export function formatDate(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

/** "Thursday, 20 May 2030" */
export function formatLongDate(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

/**
 * "2h 35m" — bookings store fractional hours (10:25–13:00 = 2.5833…h),
 * which must never be rendered raw.
 */
export function formatDuration(hours: number): string {
  if (!Number.isFinite(hours) || hours <= 0) return "0h";
  const totalMinutes = Math.round(hours * 60);
  const wholeHours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (wholeHours === 0) return `${minutes}m`;
  return minutes === 0 ? `${wholeHours}h` : `${wholeHours}h ${minutes}m`;
}

/** "10:00" -> 600 (minutes since midnight). */
export function timeToMinutes(value: string): number {
  const [hoursRaw, minutesRaw] = value.split(":");
  const hours = Number(hoursRaw);
  const minutes = Number(minutesRaw);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return Number.NaN;
  return hours * 60 + minutes;
}

/** Builds a query string, dropping empty/undefined values. */
export function buildQuery(
  params: Record<string, string | number | undefined | null>
): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return (parts[0] ?? "?").slice(0, 2).toUpperCase();
  return `${(parts[0] ?? "")[0] ?? ""}${(parts[parts.length - 1] ?? "")[0] ?? ""}`.toUpperCase();
}

/** Safe image src: absolute URLs and app-relative paths both work. */
export function resolveImageUrl(src: string | null | undefined): string {
  if (!src) return "/images/placeholder-studio.jpg";
  return src;
}
