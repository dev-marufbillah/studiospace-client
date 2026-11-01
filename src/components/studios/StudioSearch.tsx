"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface StudioSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
}

/** Debounced search input synced with the URL by the page. */
export function StudioSearch({ value, onChange, placeholder, id = "studio-search" }: StudioSearchProps) {
  return (
    <div className="relative w-full">
      <label htmlFor={id} className="sr-only">
        Search studios
      </label>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        id={id}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder ?? "Search by studio name, city or category…"}
        className="h-11 pl-9 pr-9"
      />
      {value && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
