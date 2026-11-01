"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, Search as SearchIcon } from "lucide-react";
import { StudioGrid } from "@/components/studios/StudioGrid";
import { StudioSearch } from "@/components/studios/StudioSearch";
import {
  EMPTY_FILTERS,
  StudioFilters,
  countActiveFilters,
  type StudioFilterValues,
} from "@/components/studios/StudioFilters";
import { Pagination } from "@/components/studios/Pagination";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Dialog } from "@/components/ui/dialog";
import { useDebounce } from "@/hooks/useDebounce";
import { fetchStudios } from "@/services/studio.service";
import { fetchWishlist } from "@/services/wishlist.service";
import { useAuth } from "@/providers/AuthProvider";
import { SORT_OPTIONS } from "@/lib/constants";
import type { StudioListResult } from "@/types";

const FILTER_KEYS: (keyof StudioFilterValues)[] = [
  "category",
  "city",
  "minPrice",
  "maxPrice",
  "minRating",
  "capacity",
  "amenities",
];

function readFilters(params: URLSearchParams): StudioFilterValues {
  const values = { ...EMPTY_FILTERS };
  for (const key of FILTER_KEYS) values[key] = params.get(key) ?? "";
  return values;
}

/**
 * Explore Studios: server-driven search/filter/sort/pagination with URL
 * query-string synchronization and a mobile filter drawer.
 */
function ExploreStudiosContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const urlSearch = searchParams.get("search") ?? "";
  const urlSort = searchParams.get("sort") ?? "newest";
  const urlPage = Number(searchParams.get("page") ?? "1") || 1;
  const filters = useMemo(() => readFilters(searchParams), [searchParams]);

  const [searchInput, setSearchInput] = useState(urlSearch);
  const debouncedSearch = useDebounce(searchInput, 400);
  const [sort, setSort] = useState(urlSort);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [result, setResult] = useState<StudioListResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());

  const replaceParams = useCallback(
    (patch: Record<string, string | undefined>, resetPage = true) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(patch)) {
        if (value === undefined || value === "") params.delete(key);
        else params.set(key, value);
      }
      if (resetPage && !("page" in patch)) params.delete("page");
      const query = params.toString();
      router.replace(`/studios${query ? `?${query}` : ""}`, { scroll: false });
    },
    [router, searchParams]
  );

  // Debounced search -> URL.
  useEffect(() => {
    if (debouncedSearch === urlSearch) return;
    replaceParams({ search: debouncedSearch });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // Sort -> URL.
  useEffect(() => {
    if (sort === urlSort) return;
    replaceParams({ sort: sort === "newest" ? undefined : sort });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort]);

  // Keep inputs in sync when the URL changes externally (back/forward).
  useEffect(() => {
    setSearchInput(urlSearch);
    setSort(urlSort);
  }, [urlSearch, urlSort]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchStudios({
        search: urlSearch || undefined,
        category: filters.category || undefined,
        city: filters.city || undefined,
        minPrice: filters.minPrice || undefined,
        maxPrice: filters.maxPrice || undefined,
        minRating: filters.minRating || undefined,
        capacity: filters.capacity || undefined,
        amenities: filters.amenities || undefined,
        sort: urlSort,
        page: urlPage,
        limit: 9,
      });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load studios.");
    } finally {
      setLoading(false);
    }
  }, [urlSearch, filters, urlSort, urlPage]);

  useEffect(() => {
    void load();
  }, [load]);

  // Wishlist ids for heart state (only when signed in).
  useEffect(() => {
    if (!user) {
      setWishlistIds(new Set());
      return;
    }
    fetchWishlist()
      .then((items) => setWishlistIds(new Set(items.map((item) => item.studioId))))
      .catch(() => setWishlistIds(new Set()));
  }, [user]);

  const handleFiltersChange = (values: StudioFilterValues) => {
    const patch: Record<string, string | undefined> = {};
    for (const key of FILTER_KEYS) {
      patch[key] = values[key] || undefined;
    }
    replaceParams(patch);
  };

  const handleClear = () => {
    const params = new URLSearchParams();
    if (urlSearch) params.set("search", urlSearch);
    if (urlSort !== "newest") params.set("sort", urlSort);
    const query = params.toString();
    router.replace(`/studios${query ? `?${query}` : ""}`, { scroll: false });
    setMobileFiltersOpen(false);
  };

  const handleWishlistChanged = (studioId: string, saved: boolean) => {
    setWishlistIds((current) => {
      const next = new Set(current);
      if (saved) next.add(studioId);
      else next.delete(studioId);
      return next;
    });
  };

  const activeCount = countActiveFilters(filters);
  const filterPanel = (
    <StudioFilters
      values={filters}
      onChange={handleFiltersChange}
      onClear={handleClear}
      resultCount={result?.pagination.total}
    />
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
          Explore studios
        </p>
        <h1 className="mt-2 text-balance font-heading text-3xl font-semibold sm:text-4xl">
          Find a space that fits the shoot
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
          Real availability, transparent hourly rates and filters that actually narrow things
          down.
        </p>
      </header>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <StudioSearch value={searchInput} onChange={setSearchInput} />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-44">
            <label htmlFor="sort-select" className="sr-only">
              Sort studios
            </label>
            <Select id="sort-select" value={sort} onChange={(event) => setSort(event.target.value)}>
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
          <Button
            variant="outline"
            className="lg:hidden"
            onClick={() => setMobileFiltersOpen(true)}
            aria-label="Open filters"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeCount > 0 && (
              <span className="ml-1 rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground">
                {activeCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block" aria-label="Studio filters">
          <div className="sticky top-24 rounded-lg border border-border bg-surface p-5">
            {filterPanel}
          </div>
        </aside>

        <section aria-label="Studio results" aria-busy={loading}>
          {error ? (
            <ErrorState message={error} status={0} onRetry={() => void load()} />
          ) : result && result.studios.length === 0 && !loading ? (
            <EmptyState
              icon={SearchIcon}
              title="No studios match those filters"
              description="Try widening the price range, clearing the city filter or searching a different category."
              actionLabel="Clear all filters"
              onAction={handleClear}
            />
          ) : (
            <StudioGrid
              studios={result?.studios ?? []}
              loading={loading}
              wishlistedIds={wishlistIds}
              onWishlistChanged={handleWishlistChanged}
              skeletonCount={6}
            />
          )}

          {result && !loading && !error && (
            <Pagination
              pagination={result.pagination}
              onPageChange={(page) =>
                replaceParams({ page: page === 1 ? undefined : String(page) }, false)
              }
            />
          )}
        </section>
      </div>

      <Dialog
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        ariaLabel="Studio filters"
        className="max-h-[88vh] sm:max-w-md"
      >
        <div className="pr-6">{filterPanel}</div>
        <div className="mt-6">
          <Button className="w-full" onClick={() => setMobileFiltersOpen(false)}>
            Show results
          </Button>
        </div>
      </Dialog>
    </div>
  );
}

/** Suspense boundary required by useSearchParams during prerender. */
export default function ExploreStudiosPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8" role="status" aria-live="polite">
          <p className="text-sm text-muted-foreground">Loading studios…</p>
        </div>
      }
    >
      <ExploreStudiosContent />
    </Suspense>
  );
}
