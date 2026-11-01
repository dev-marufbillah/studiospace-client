"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { BadgeCheck, Mail, ShieldCheck } from "lucide-react";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { PageLoader } from "@/components/shared/PageLoader";
import { ErrorState } from "@/components/shared/ErrorState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label, FieldError } from "@/components/ui/label";
import { useAuth } from "@/providers/AuthProvider";
import { fetchProfile, updateProfile } from "@/services/user.service";
import { formatDate, getInitials } from "@/lib/utils";
import type { UserProfile } from "@/types";

const profileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  image: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || /^https?:\/\/\S+$/.test(value),
      "Photo URL must start with http:// or https://"
    ),
});

type ProfileValues = z.infer<typeof profileSchema>;

/** Private: profile details with editable display name + avatar URL. */
export default function ProfilePage() {
  const { refresh } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "", image: "" },
  });

  const imageValue = watch("image");
  const nameValue = watch("name");

  useEffect(() => {
    fetchProfile()
      .then((data) => {
        setProfile(data);
        reset({ name: data.name, image: data.image ?? "" });
      })
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Could not load your profile.")
      )
      .finally(() => setLoading(false));
  }, [reset]);

  const onSubmit = async (values: ProfileValues) => {
    setSaving(true);
    try {
      const updated = await updateProfile({
        name: values.name,
        image: values.image.trim(),
      });
      setProfile(updated);
      await refresh();
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update your profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AuthGuard>
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
            Account
          </p>
          <h1 className="mt-2 font-heading text-3xl font-semibold sm:text-4xl">Your Profile</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your identity is managed by Better Auth — email changes and password resets require a
            new sign-in.
          </p>
        </header>

        <div className="mt-8">
          {loading ? (
            <PageLoader label="Loading your profile…" />
          ) : error ? (
            <ErrorState message={error} status={401} />
          ) : profile ? (
            <div className="space-y-6">
              <section className="flex flex-col items-center gap-4 rounded-lg border border-border bg-surface p-6 text-center sm:flex-row sm:text-left">
                {imageValue ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageValue}
                    alt=""
                    className="h-20 w-20 rounded-full object-cover ring-2 ring-border"
                  />
                ) : (
                  <span className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-xl font-semibold text-primary-foreground">
                    {getInitials(nameValue || profile.name)}
                  </span>
                )}
                <div className="min-w-0">
                  <h2 className="font-heading text-2xl font-semibold">{nameValue || profile.name}</h2>
                  <p className="mt-1 flex items-center justify-center gap-1.5 text-sm text-muted-foreground sm:justify-start">
                    <Mail className="h-4 w-4" aria-hidden="true" /> {profile.email}
                  </p>
                  <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-100">
                      <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" /> Email verified by
                      sign-in
                    </span>
                    {profile.createdAt && (
                      <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                        Member since {formatDate(profile.createdAt)}
                      </span>
                    )}
                  </div>
                </div>
              </section>

              <section className="rounded-lg border border-border bg-surface p-6">
                <h2 className="font-heading text-xl font-semibold">Edit details</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4" noValidate>
                  <div className="space-y-1.5">
                    <Label htmlFor="profile-name">Display name</Label>
                    <Input
                      id="profile-name"
                      aria-invalid={Boolean(errors.name)}
                      {...register("name")}
                    />
                    <FieldError id="profile-name-error" message={errors.name?.message} />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="profile-image">Photo URL</Label>
                    <Input
                      id="profile-image"
                      type="url"
                      placeholder="https://…/avatar.jpg"
                      aria-invalid={Boolean(errors.image)}
                      {...register("image")}
                    />
                    <FieldError id="profile-image-error" message={errors.image?.message} />
                    <p className="text-xs text-muted-foreground">
                      Paste a hosted image URL — avatars are not re-uploaded to imgbb.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="profile-email">Email</Label>
                    <Input id="profile-email" value={profile.email} readOnly disabled />
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                      Verified identity — not editable from the dashboard.
                    </p>
                  </div>

                  <Button type="submit" isLoading={saving}>
                    Save changes
                  </Button>
                </form>
              </section>
            </div>
          ) : null}
        </div>
      </div>
    </AuthGuard>
  );
}
