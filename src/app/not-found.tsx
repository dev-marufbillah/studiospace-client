import Link from "next/link";
import { Aperture, Compass, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Global 404 — branded, with recovery links. */
export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-4 py-16 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Aperture className="h-8 w-8" aria-hidden="true" />
      </span>
      <p className="mt-6 font-heading text-6xl font-semibold text-primary">404</p>
      <h1 className="mt-2 font-heading text-3xl font-semibold">This room is out of frame</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        The page you were looking for has moved, been renamed, or never existed. Let&apos;s get
        you back to the studios.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/">
          <Button>
            <Home className="h-4 w-4" /> Back home
          </Button>
        </Link>
        <Link href="/studios">
          <Button variant="outline">
            <Compass className="h-4 w-4" /> Explore studios
          </Button>
        </Link>
      </div>
    </div>
  );
}
