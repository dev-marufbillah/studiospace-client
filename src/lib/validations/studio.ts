import { z } from "zod";
import { STUDIO_CATEGORIES } from "@/lib/constants";

/**
 * Client-side mirror of the Express studio validation rules. The server
 * re-validates every field — this only provides instant feedback.
 */
export const studioFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, "Title must be at least 5 characters")
    .max(120, "Title must be 120 characters or fewer"),
  category: z.enum(STUDIO_CATEGORIES, { message: "Choose a category" }),
  description: z
    .string()
    .trim()
    .min(40, "Describe the space in at least 40 characters")
    .max(4000, "Description must be 4000 characters or fewer"),
  hourlyRate: z
    .number({ message: "Enter an hourly rate" })
    .min(1, "Hourly rate must be at least $1")
    .max(10000, "Hourly rate looks too high"),
  securityDeposit: z
    .number({ message: "Enter a security deposit" })
    .min(0, "Security deposit cannot be negative")
    .max(50000, "Security deposit looks too high"),
  maxCapacity: z
    .number({ message: "Enter the maximum capacity" })
    .int("Capacity must be a whole number")
    .min(1, "Capacity must be at least 1")
    .max(500, "Capacity looks too high"),
  address: z.string().trim().min(5, "Address must be at least 5 characters").max(200),
  city: z.string().trim().min(2, "City is required").max(80),
  imageUrl: z
    .string()
    .trim()
    .min(1, "A cover image is required")
    .refine(
      (value) => /^https?:\/\/\S+$/.test(value) || value.startsWith("/images/"),
      "Use an https image URL or upload a file"
    ),
  gallery: z.array(z.string()).max(8, "Up to 8 gallery images"),
  amenities: z.array(z.string().min(1).max(40)).max(20, "Up to 20 amenities"),
  equipment: z.array(z.string().min(1).max(40)).max(20, "Up to 20 equipment items"),
});

export type StudioFormValues = z.infer<typeof studioFormSchema>;
