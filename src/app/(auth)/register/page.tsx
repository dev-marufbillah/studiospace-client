"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Aperture, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label, FieldError } from "@/components/ui/label";
import { GoogleButton } from "@/components/auth/SocialButtons";
import { useAuth } from "@/providers/AuthProvider";

/**
 * Registration rules (assignment): at least one uppercase, one
 * lowercase, minimum 6 characters — enforced here for instant feedback
 * and again server-side by Better Auth's password policy.
 */
const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
    email: z.string().min(1, "Email is required").email("Enter a valid email address"),
    photoURL: z
      .string()
      .trim()
      .refine(
        (value) => value === "" || /^https?:\/\/\S+$/.test(value),
        "Photo URL must start with http:// or https://"
      )
      .optional(),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .regex(/[A-Z]/, "Include at least one uppercase letter")
      .regex(/[a-z]/, "Include at least one lowercase letter"),
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { signUpEmail } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", photoURL: "", password: "", confirmPassword: "" },
  });

  const onSubmit = async (values: RegisterValues) => {
    setSubmitting(true);
    try {
      await signUpEmail({
        name: values.name,
        email: values.email,
        password: values.password,
        photoURL: values.photoURL?.trim() || undefined,
      });
      toast.success("Account created!", {
        description: "Please sign in with your new credentials.",
      });
      router.replace("/login");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Registration failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const passwordRules = [
    { label: "At least 6 characters", test: (v: string) => v.length >= 6 },
    { label: "One uppercase letter", test: (v: string) => /[A-Z]/.test(v) },
    { label: "One lowercase letter", test: (v: string) => /[a-z]/.test(v) },
  ];

  return (
    <div className="mx-auto flex min-h-[75vh] max-w-md flex-col justify-center px-4 py-14">
      <div className="rounded-xl border border-border bg-surface p-7 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Aperture className="h-6 w-6" aria-hidden="true" />
          </span>
          <h1 className="mt-4 font-heading text-3xl font-semibold">Create your account</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Book studios in minutes — or list your own space and start earning.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              autoComplete="name"
              placeholder="Your name"
              aria-invalid={Boolean(errors.name)}
              {...register("name")}
            />
            <FieldError id="name-error" message={errors.name?.message} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              aria-invalid={Boolean(errors.email)}
              {...register("email")}
            />
            <FieldError id="email-error" message={errors.email?.message} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="photoURL">
              Photo URL <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="photoURL"
              type="url"
              placeholder="https://…/avatar.jpg"
              aria-invalid={Boolean(errors.photoURL)}
              {...register("photoURL")}
            />
            <FieldError id="photo-error" message={errors.photoURL?.message} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              aria-invalid={Boolean(errors.password)}
              {...register("password")}
            />
            <FieldError id="password-error" message={errors.password?.message} />
            <ul className="mt-2 space-y-1" aria-label="Password requirements">
              {passwordRules.map((rule) => {
                // Live check against the current input value is handled by zod on submit;
                // static requirements are listed here for guidance.
                return (
                  <li key={rule.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Check className="h-3.5 w-3.5 text-secondary" aria-hidden="true" />
                    {rule.label}
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              aria-invalid={Boolean(errors.confirmPassword)}
              {...register("confirmPassword")}
            />
            <FieldError id="confirm-error" message={errors.confirmPassword?.message} />
          </div>

          <Button type="submit" className="w-full" isLoading={submitting}>
            Create Account
          </Button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-wider text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
        </div>

        <GoogleButton mode="register" />

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
