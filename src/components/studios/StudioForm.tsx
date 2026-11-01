"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label, FieldError } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploader, GalleryUploader } from "@/components/studios/ImageUploader";
import { TagInput } from "@/components/studios/TagInput";
import { useAuth } from "@/providers/AuthProvider";
import { createStudio, updateStudio, type StudioPayload } from "@/services/studio.service";
import { studioFormSchema, type StudioFormValues } from "@/lib/validations/studio";
import { STUDIO_CATEGORIES } from "@/lib/constants";
import type { Studio } from "@/types";

interface StudioFormProps {
  mode: "create" | "edit";
  studio?: Studio;
}

const AMENITY_SUGGESTIONS = ["Wi-Fi", "Parking", "Changing room", "Makeup station", "Green room", "Kitchen"];
const EQUIPMENT_SUGGESTIONS = ["Strobes", "Softboxes", "C-stands", "Backdrops", "Tripods", "Audio recorder"];

/** Shared Add/Edit studio form (RHF + Zod, server re-validates). */
export function StudioForm({ mode, studio }: StudioFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<StudioFormValues>({
    resolver: zodResolver(studioFormSchema),
    defaultValues: {
      title: studio?.title ?? "",
      category: (studio?.category as StudioFormValues["category"]) ?? "Photo Studio",
      description: studio?.description ?? "",
      hourlyRate: studio?.hourlyRate ?? 50,
      securityDeposit: studio?.securityDeposit ?? 100,
      maxCapacity: studio?.maxCapacity ?? 10,
      address: studio?.location.address ?? "",
      city: studio?.location.city ?? "",
      imageUrl: studio?.imageUrl ?? "",
      gallery: studio?.gallery ?? [],
      amenities: studio?.amenities ?? [],
      equipment: studio?.equipment ?? [],
    },
  });

  const imageUrl = watch("imageUrl");
  const gallery = watch("gallery");
  const amenities = watch("amenities");
  const equipment = watch("equipment");

  const onSubmit = async (values: StudioFormValues) => {
    setSubmitting(true);
    const payload: StudioPayload = {
      title: values.title,
      category: values.category,
      description: values.description,
      hourlyRate: values.hourlyRate,
      securityDeposit: values.securityDeposit,
      maxCapacity: values.maxCapacity,
      address: values.address,
      city: values.city,
      imageUrl: values.imageUrl,
      gallery: values.gallery,
      amenities: values.amenities,
      equipment: values.equipment,
    };

    try {
      if (mode === "create") {
        await createStudio(payload);
        toast.success("Studio published!", {
          description: "Your listing is live and visible to creators.",
        });
      } else if (studio) {
        await updateStudio(studio.id, payload);
        toast.success("Studio updated", { description: "Your changes are live." });
      }
      router.push("/my-listings");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save the studio.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
      <section className="rounded-lg border border-border bg-surface p-5 sm:p-6">
        <h2 className="font-heading text-xl font-semibold">Space details</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Clear titles and honest descriptions get booked faster.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="title">Studio title</Label>
            <Input
              id="title"
              placeholder="e.g. Daylight Loft Photo Studio"
              aria-invalid={Boolean(errors.title)}
              {...register("title")}
            />
            <FieldError id="title-error" message={errors.title?.message} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="category">Category</Label>
            <Select id="category" aria-invalid={Boolean(errors.category)} {...register("category")}>
              {STUDIO_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Select>
            <FieldError id="category-error" message={errors.category?.message} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="maxCapacity">Maximum capacity</Label>
            <Input
              id="maxCapacity"
              type="number"
              min={1}
              aria-invalid={Boolean(errors.maxCapacity)}
              {...register("maxCapacity", { valueAsNumber: true })}
            />
            <FieldError id="capacity-error" message={errors.maxCapacity?.message} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="hourlyRate">Hourly rate (USD)</Label>
            <Input
              id="hourlyRate"
              type="number"
              min={1}
              step="0.01"
              aria-invalid={Boolean(errors.hourlyRate)}
              {...register("hourlyRate", { valueAsNumber: true })}
            />
            <FieldError id="rate-error" message={errors.hourlyRate?.message} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="securityDeposit">Security deposit (USD)</Label>
            <Input
              id="securityDeposit"
              type="number"
              min={0}
              step="0.01"
              aria-invalid={Boolean(errors.securityDeposit)}
              {...register("securityDeposit", { valueAsNumber: true })}
            />
            <FieldError id="deposit-error" message={errors.securityDeposit?.message} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="address">Street address</Label>
            <Input
              id="address"
              placeholder="House 12, Road 5, Dhanmondi"
              aria-invalid={Boolean(errors.address)}
              {...register("address")}
            />
            <FieldError id="address-error" message={errors.address?.message} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              placeholder="Dhaka"
              aria-invalid={Boolean(errors.city)}
              {...register("city")}
            />
            <FieldError id="city-error" message={errors.city?.message} />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="description">Detailed overview</Label>
            <Textarea
              id="description"
              rows={6}
              placeholder="Describe the space, light, acoustics, access and house rules."
              aria-invalid={Boolean(errors.description)}
              {...register("description")}
            />
            <FieldError id="description-error" message={errors.description?.message} />
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-surface p-5 sm:p-6">
        <h2 className="font-heading text-xl font-semibold">Photos</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          A strong cover image plus two or three angles converts best.
        </p>
        <div className="mt-5 space-y-5">
          <div>
            <ImageUploader
              value={imageUrl ?? ""}
              onChange={(url) => setValue("imageUrl", url, { shouldValidate: true })}
            />
            <FieldError id="image-error" message={errors.imageUrl?.message} />
          </div>
          <GalleryUploader value={gallery ?? []} onChange={(urls) => setValue("gallery", urls)} />
        </div>
      </section>

      <section className="rounded-lg border border-border bg-surface p-5 sm:p-6">
        <h2 className="font-heading text-xl font-semibold">What&apos;s included</h2>
        <div className="mt-5 grid gap-6 sm:grid-cols-2">
          <TagInput
            id="amenities"
            label="Amenities"
            value={amenities ?? []}
            onChange={(values) => setValue("amenities", values)}
            placeholder="Wi-Fi"
            hint={`Ideas: ${AMENITY_SUGGESTIONS.join(", ")}`}
          />
          <TagInput
            id="equipment"
            label="Equipment"
            value={equipment ?? []}
            onChange={(values) => setValue("equipment", values)}
            placeholder="Softboxes"
            hint={`Ideas: ${EQUIPMENT_SUGGESTIONS.join(", ")}`}
          />
        </div>
      </section>

      <section className="rounded-lg border border-border bg-surface-muted p-5 sm:p-6">
        <h2 className="font-heading text-xl font-semibold">Host information</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Taken from your verified StudioSpace session — not editable here.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="ownerName">Host name</Label>
            <Input id="ownerName" value={user?.name ?? ""} readOnly disabled />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ownerEmail">Host email</Label>
            <Input id="ownerEmail" value={user?.email ?? ""} readOnly disabled />
          </div>
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" isLoading={submitting}>
          <Save className="h-4 w-4" />
          {mode === "create" ? "Publish Studio" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
