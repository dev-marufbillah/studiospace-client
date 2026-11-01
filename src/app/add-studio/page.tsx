import type { Metadata } from "next";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { StudioForm } from "@/components/studios/StudioForm";

export const metadata: Metadata = {
  title: "Add New Studio",
  description: "List your creative space on StudioSpace and start taking bookings.",
};

/** Private: create a new studio listing. */
export default function AddStudioPage() {
  return (
    <AuthGuard>
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
            Host your space
          </p>
          <h1 className="mt-2 font-heading text-3xl font-semibold sm:text-4xl">Add New Studio</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            List the details creators ask about most — light, capacity, gear and access. You can
            edit everything later from My Studio Listings.
          </p>
        </header>

        <div className="mt-8">
          <StudioForm mode="create" />
        </div>
      </div>
    </AuthGuard>
  );
}
