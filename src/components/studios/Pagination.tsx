"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Pagination as PaginationMeta } from "@/types";

interface PaginationProps {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
}

function pageWindow(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
  const pages = new Set<number>([1, total, current, current - 1, current + 1]);
  const sorted = [...pages].filter((page) => page >= 1 && page <= total).sort((a, b) => a - b);
  const output: (number | "…")[] = [];
  let previous = 0;
  for (const page of sorted) {
    if (previous && page - previous > 1) output.push("…");
    output.push(page);
    previous = page;
  }
  return output;
}

/** Accessible pagination control (server-driven page changes). */
export function Pagination({ pagination, onPageChange }: PaginationProps) {
  const { page, totalPages, total } = pagination;
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="Studio results pagination" className="mt-10 flex flex-col items-center gap-3">
      <p className="text-sm text-muted-foreground">
        Page <span className="font-semibold text-foreground">{page}</span> of {totalPages} ·{" "}
        {total} studios
      </p>
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface transition-colors hover:bg-accent disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {pageWindow(page, totalPages).map((entry, index) =>
          entry === "…" ? (
            <span key={`gap-${index}`} className="px-1 text-muted-foreground" aria-hidden="true">
              …
            </span>
          ) : (
            <button
              key={entry}
              type="button"
              onClick={() => onPageChange(entry)}
              aria-current={entry === page ? "page" : undefined}
              aria-label={`Page ${entry}`}
              className={cn(
                "flex h-9 min-w-9 items-center justify-center rounded-md border px-2 text-sm transition-colors",
                entry === page
                  ? "border-primary bg-primary font-semibold text-primary-foreground"
                  : "border-border bg-surface hover:bg-accent"
              )}
            >
              {entry}
            </button>
          )
        )}
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
          className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface transition-colors hover:bg-accent disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </nav>
  );
}
