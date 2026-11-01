import { Aperture } from "lucide-react";

/** Full-page branded loading state (route transitions / session checks). */
export function PageLoader({ label = "Loading…" }: { label?: string }) {
  return (
    <div
      className="flex min-h-[55vh] flex-col items-center justify-center gap-4"
      role="status"
      aria-live="polite"
    >
      <span className="relative flex h-14 w-14 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-primary/20" aria-hidden="true" />
        <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Aperture className="h-6 w-6 animate-spin" aria-hidden="true" />
        </span>
      </span>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
