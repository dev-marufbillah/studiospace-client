"use client";

import { X, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { STUDIO_CATEGORIES } from "@/lib/constants";

export interface StudioFilterValues {
  category: string;
  city: string;
  minPrice: string;
  maxPrice: string;
  minRating: string;
  capacity: string;
  amenities: string;
}

export const EMPTY_FILTERS: StudioFilterValues = {
  category: "",
  city: "",
  minPrice: "",
  maxPrice: "",
  minRating: "",
  capacity: "",
  amenities: "",
};

export function countActiveFilters(values: StudioFilterValues): number {
  return Object.values(values).filter((value) => value !== "").length;
}

interface StudioFiltersProps {
  values: StudioFilterValues;
  onChange: (values: StudioFilterValues) => void;
  onClear: () => void;
  resultCount?: number;
}

/**
 * Server-driven filter panel: category, location, price range, rating,
 * capacity and amenities. Values are mirrored into the URL by the page.
 */
export function StudioFilters({ values, onChange, onClear, resultCount }: StudioFiltersProps) {
  const set = (key: keyof StudioFilterValues) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => onChange({ ...values, [key]: event.target.value });

  const activeCount = countActiveFilters(values);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-primary" aria-hidden="true" />
          <h2 className="font-heading text-xl font-semibold">Filters</h2>
          {activeCount > 0 && (
            <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
              {activeCount}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onClear}
          disabled={activeCount === 0}
          className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-destructive disabled:opacity-40"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" /> Clear all
        </button>
      </div>

      <div className="space-y-2">
        <Label htmlFor="filter-category">Category</Label>
        <Select id="filter-category" value={values.category} onChange={set("category")}>
          <option value="">All categories</option>
          {STUDIO_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="filter-city">City / location</Label>
        <Input
          id="filter-city"
          placeholder="e.g. Dhaka"
          value={values.city}
          onChange={set("city")}
        />
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Hourly price (USD)</legend>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={0}
            inputMode="decimal"
            aria-label="Minimum price"
            placeholder="Min"
            value={values.minPrice}
            onChange={set("minPrice")}
          />
          <span className="text-muted-foreground">–</span>
          <Input
            type="number"
            min={0}
            inputMode="decimal"
            aria-label="Maximum price"
            placeholder="Max"
            value={values.maxPrice}
            onChange={set("maxPrice")}
          />
        </div>
      </fieldset>

      <div className="space-y-2">
        <Label htmlFor="filter-rating">Minimum rating</Label>
        <Select id="filter-rating" value={values.minRating} onChange={set("minRating")}>
          <option value="">Any rating</option>
          <option value="3">3.0 &amp; up</option>
          <option value="4">4.0 &amp; up</option>
          <option value="4.5">4.5 &amp; up</option>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="filter-capacity">Minimum capacity</Label>
        <Input
          id="filter-capacity"
          type="number"
          min={1}
          inputMode="numeric"
          placeholder="e.g. 8 guests"
          value={values.capacity}
          onChange={set("capacity")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="filter-amenities">Amenities</Label>
        <Input
          id="filter-amenities"
          placeholder="Wi-Fi, Parking (comma separated)"
          value={values.amenities}
          onChange={set("amenities")}
        />
        <p className="text-xs text-muted-foreground">Matches studios that include every term.</p>
      </div>

      {resultCount !== undefined && (
        <p className="rounded-md bg-surface-muted px-3 py-2 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{resultCount}</span>{" "}
          {resultCount === 1 ? "studio matches" : "studios match"} your filters.
        </p>
      )}
    </div>
  );
}
