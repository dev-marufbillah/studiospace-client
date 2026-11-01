import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-accent text-accent-foreground",
        outline: "border-border bg-surface/80 text-foreground backdrop-blur",
        muted: "border-transparent bg-muted text-muted-foreground",
        success: "border-transparent bg-emerald-600/90 text-white",
        warning: "border-transparent bg-amber-600/90 text-white",
        destructive: "border-transparent bg-destructive text-destructive-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

/** Booking status pill with consistent brand mapping. */
const STATUS_VARIANTS: Record<
  string,
  { label: string; className: string }
> = {
  Pending: { label: "Pending", className: "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-100" },
  Confirmed: { label: "Confirmed", className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-100" },
  Completed: { label: "Completed", className: "bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-100" },
  Cancelled: { label: "Cancelled", className: "bg-muted text-muted-foreground" },
};

export function StatusBadge({ status }: { status: string }) {
  const config = STATUS_VARIANTS[status] ?? { label: status, className: "bg-muted text-muted-foreground" };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        config.className
      )}
    >
      {config.label}
    </span>
  );
}
