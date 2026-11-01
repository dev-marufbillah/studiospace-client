"use client";

import { useState } from "react";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface StudioImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  imgClassName?: string;
  eager?: boolean;
}

/**
 * Studio photo with graceful loading + error states. Uses a plain img
 * because studio images come from arbitrary hosts (imgbb, seed assets),
 * which avoids constraining next.config remotePatterns.
 */
export function StudioImage({ src, alt, className, imgClassName, eager = false }: StudioImageProps) {
  const [state, setState] = useState<"loading" | "loaded" | "error">(
    src ? "loading" : "error"
  );

  return (
    <div className={cn("relative overflow-hidden bg-muted", className)}>
      {state !== "error" && src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          onLoad={() => setState("loaded")}
          onError={() => setState("error")}
          className={cn(
            "h-full w-full object-cover transition-all duration-500",
            state === "loaded" ? "scale-100 opacity-100" : "scale-105 opacity-0",
            imgClassName
          )}
        />
      )}
      {(state === "loading" || state === "error") && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-surface-muted text-muted-foreground"
          aria-hidden={state === "loading"}
        >
          {state === "error" ? (
            <>
              <ImageOff className="h-6 w-6" />
              <span className="px-3 text-center text-xs">Image unavailable</span>
            </>
          ) : (
            <span className="h-8 w-8 animate-pulse rounded-full bg-muted" />
          )}
        </div>
      )}
    </div>
  );
}
