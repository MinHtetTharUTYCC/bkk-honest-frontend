"use client";
import {
  Suspense,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";

import { useInfiniteSpots, useCategories } from "@/hooks/use-api";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useQueryClient } from "@tanstack/react-query";
import SpotCard from "@/components/spots/spot-card";
import { SearchInput } from "@/components/ui/search-input";
import { Filter, MapPin, Clock, TrendingUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCity } from "@/components/providers/city-provider";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useInView } from "react-intersection-observer";
import { CategorySelector } from "@/components/ui/category-selector";
import type { SpotCardData } from "@/components/spots/spot-card";

function DiscoveryPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { ref, inView } = useInView();

  // Derived from URL
  const selectedCategory =
    searchParams.get("categoryId") || searchParams.get("category") || undefined;
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [sort, setSort] = useState<"newest" | "popular">(
    (searchParams.get("sort") as "newest" | "popular") || "popular",
  );

  const { selectedCityId, selectedCity } = useCity();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const prefetchCategory = (catId: string | undefined) => {
    // Prefetch is handled by useInfiniteSpots hook itself
    // Just update the URL state
  };

  // Function to update URL params
  const createQueryString = useCallback(
    (params: Record<string, string | null>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString());

      Object.entries(params).forEach(([name, value]) => {
        if (value === null || value === undefined) {
          newSearchParams.delete(name);
        } else {
          newSearchParams.set(name, value);
        }
      });

      return newSearchParams.toString();
    },
    [searchParams],
  );

  // Sync URL when filters change
  const handleCategoryChange = (catId: string | undefined) => {
    router.push(
      pathname +
        "?" +
        createQueryString({
          categoryId: catId || null,
          category: null, // Cleanup old param
        }),
      {
        scroll: false,
      },
    );
  };

  const handleSortChange = (newSort: "newest" | "popular") => {
    setSort(newSort);
    router.push(pathname + "?" + createQueryString({ sort: newSort }), {
      scroll: false,
    });
  };

  // Debounce search URL update
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== (searchParams.get("q") || "")) {
        router.push(
          pathname +
            "?" +
            createQueryString({
              q: search || null,
              category: null, // Cleanup old param
            }),
          {
            scroll: false,
          },
        );
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [search, pathname, createQueryString, searchParams, router]);

  const { data: categoriesResponse } = useCategories();
  const categories = Array.isArray(categoriesResponse)
    ? categoriesResponse
    : [];

  const {
    data: spotsData,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteSpots({
    cityId: selectedCityId,
    categoryId: selectedCategory,
    search: search,
    sort: sort,
  });

  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (
      inView &&
      hasNextPage &&
      !isFetchingNextPage &&
      !hasFetchedRef.current
    ) {
      hasFetchedRef.current = true;
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    if (!inView) {
      hasFetchedRef.current = false;
    }
  }, [inView]);

  const spots: SpotCardData[] = useMemo(() => {
    return (
      spotsData?.pages.flatMap(
        (page) =>
          (page as { data?: { data?: SpotCardData[] } })?.data?.data || [],
      ) || []
    );
  }, [spotsData]);

  return (
    <div className="space-y-6 pb-24">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-0.5">
          <h1 className="font-display text-2xl font-bold text-foreground tracking-tight">
            Discovery
          </h1>
          <div className="flex items-center gap-2">
            <MapPin size={10} className="text-amber-400" />
            <p className="text-white/60 font-bold uppercase tracking-widest text-[11px]">
              Exploring {selectedCity?.name || "Thailand"}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Sort Toggle */}
          <div className="flex bg-white/8 p-1 rounded-2xl w-full sm:w-auto">
            <button
              onClick={() => handleSortChange("newest")}
              className={cn(
                "flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer",
                sort === "newest"
                  ? "bg-white/10 text-foreground shadow-sm"
                  : "text-white/40 hover:text-white/70",
              )}
            >
              <Clock size={12} />
              Newest
            </button>
            <button
              onClick={() => handleSortChange("popular")}
              className={cn(
                "flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer",
                sort === "popular"
                  ? "bg-white/10 text-foreground shadow-sm"
                  : "text-white/40 hover:text-white/70",
              )}
            >
              <TrendingUp size={12} />
              Popular
            </button>
          </div>

          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search spots..."
            className="md:w-60"
          />
        </div>
      </header>

      {/* Category Pills */}
      <CategorySelector
        categories={categories}
        selectedId={selectedCategory}
        onSelect={handleCategoryChange}
        onHover={prefetchCategory}
        countKey="spots"
        className="-mx-2 px-2"
      />

      {/* Grid of Spots */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-105 bg-card rounded-2xl border border-white/8 shadow-xl shadow-black/20 animate-pulse p-8 space-y-6"
            >
              <div className="w-full h-48 bg-white/5 rounded-xl" />
              <div className="h-6 w-3/4 bg-white/5 rounded-full" />
              <div className="h-4 w-1/2 bg-white/5 rounded-full" />
            </div>
          ))
        ) : spots && spots.length > 0 ? (
          <>
            {spots.map((spot) => (
              <SpotCard key={spot.id} spot={spot} />
            ))}

            {/* Load More Trigger */}
            <div ref={ref} className="col-span-full py-8 flex justify-center">
              {isFetchingNextPage ? (
                <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
              ) : hasNextPage ? (
                <div className="h-1" />
              ) : (
                <p className="text-[12px] font-bold text-white/50 uppercase tracking-[0.2em]">
                  — End of Discovery —
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="col-span-full py-40 text-center space-y-6 bg-card rounded-2xl border border-dashed border-white/10 shadow-sm">
            <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mx-auto text-white/15">
              <Filter size={32} />
            </div>
            <div className="space-y-2">
              <h4 className="font-display text-xl font-bold text-foreground tracking-tight">
                No spots found
              </h4>
              <p className="text-xs text-white/50 font-medium">
                Try changing your filters or searching for something else
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DiscoveryPage() {
  return (
    <Suspense
      fallback={
        <div className="animate-pulse h-screen bg-white/5 rounded-2xl m-4" />
      }
    >
      <DiscoveryPageContent />
    </Suspense>
  );
}
