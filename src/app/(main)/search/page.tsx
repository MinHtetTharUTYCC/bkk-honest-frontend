"use client";
import { Suspense, useState, useEffect } from "react";

import { useRouter, useSearchParams } from "next/navigation";
import { SearchInput } from "@/components/ui/search-input";
import { SearchFilters } from "@/components/search/search-filters";
import { SearchHistoryDropdown } from "@/components/search/search-history-dropdown";
import { SearchResultsTabs } from "@/components/search/search-results-tabs";
import { useSearchHistory, SearchHistoryItem } from "@/hooks/use-search-history";
import { useCity } from "@/components/providers/city-provider";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { selectedCityId, selectedCity } = useCity();

  // URL state
  const q = searchParams.get("q") || "";
  const categoryId = searchParams.get("categoryId");
  const sort = (searchParams.get("sort") as "newest" | "popular") || "popular";
  const tab = (searchParams.get("tab") as "spots" | "scams") || "spots";

  // Local state
  const [search, setSearch] = useState(q);
  const [isClient, setIsClient] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const {
    history,
    addSearch,
    clearHistory,
    removeSearch,
    isClient: isHistoryClient,
  } = useSearchHistory();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Update search when URL changes
  useEffect(() => {
    setSearch(q);
  }, [q]);

  // Debounced URL update
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search || categoryId || sort !== "popular" || tab !== "spots") {
        const params = new URLSearchParams();
        if (search) params.set("q", search);
        if (categoryId) params.set("categoryId", categoryId);
        if (sort && sort !== "popular") params.set("sort", sort);
        if (tab && tab !== "spots") params.set("tab", tab);

        router.push(`/search${params.toString() ? `?${params}` : ""}`);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [search, categoryId, sort, tab, router]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

  const handleSearchFocus = () => {
    if (!search) {
      setIsHistoryOpen(true);
    }
  };

  const handleHistorySelect = (item: SearchHistoryItem) => {
    setSearch(item.q);
    router.push(
      `/search?q=${encodeURIComponent(item.q)}${item.categoryId ? `&categoryId=${item.categoryId}` : ""}${item.sort ? `&sort=${item.sort}` : ""}`,
    );
    setIsHistoryOpen(false);
  };

  const handleSearchSubmit = () => {
    if (search.trim()) {
      addSearch({
        q: search,
        categoryId: categoryId || undefined,
        sort: sort !== "popular" ? sort : undefined,
      });
      setIsHistoryOpen(false);
    }
  };

  const handleCategoryChange = (newCategoryId?: string) => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (newCategoryId) params.set("categoryId", newCategoryId);
    if (sort && sort !== "popular") params.set("sort", sort);
    if (tab && tab !== "spots") params.set("tab", tab);

    router.push(`/search${params.toString() ? `?${params}` : ""}`);
  };

  const handleSortChange = (newSort: "newest" | "popular") => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (categoryId) params.set("categoryId", categoryId);
    if (newSort && newSort !== "popular") params.set("sort", newSort);
    if (tab && tab !== "spots") params.set("tab", tab);

    router.push(`/search${params.toString() ? `?${params}` : ""}`);
  };

  const handleTabChange = (newTab: "spots" | "scams") => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (categoryId) params.set("categoryId", categoryId);
    if (sort && sort !== "popular") params.set("sort", sort);
    if (newTab && newTab !== "spots") params.set("tab", newTab);

    router.push(`/search${params.toString() ? `?${params}` : ""}`);
  };

  if (!isClient) return null;

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <header className="space-y-4">
        <div className="space-y-0.5">
          <h1 className="font-display text-2xl font-bold text-foreground tracking-tight">
            Search
          </h1>
          <div className="flex items-center gap-2">
            <MapPin size={10} className="text-amber-400" />
            <p className="text-white/60 font-bold uppercase tracking-widest text-[11px]">
              Exploring {selectedCity?.name || "Thailand"}
            </p>
          </div>
        </div>

        {/* Search Input with History */}
        <div className="relative">
          <SearchInput
            value={search}
            onChange={handleSearchChange}
            onFocus={handleSearchFocus}
            onBlur={() => {
              setTimeout(() => {
                setIsHistoryOpen(false);
              }, 100);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearchSubmit();
              }
            }}
            placeholder="Search spots, scam alerts..."
          />
          {isHistoryClient && (
            <SearchHistoryDropdown
              history={history}
              isOpen={isHistoryOpen}
              onSelect={handleHistorySelect}
              onRemove={removeSearch}
              onClearAll={clearHistory}
            />
          )}
        </div>
      </header>

      {/* Main Content */}
      {!search && !categoryId ? (
        // Empty state with history
        <div className="space-y-8">
          <div className="text-center py-12">
            <p className="text-white/40 text-sm">
              {isHistoryClient && history.length > 0
                ? "Select a search from history above or start typing"
                : "Start typing to search"}
            </p>
          </div>

          {isHistoryClient && history.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-white/60">
                Recent Searches
              </h2>
              <div className="space-y-2">
                {history.slice(0, 5).map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleHistorySelect(item)}
                    className={cn(
                      "w-full text-left px-4 py-3 rounded-xl bg-white/5 border border-white/10",
                      "hover:bg-white/10 hover:border-white/20 transition-all",
                      "flex items-center justify-between group",
                    )}
                  >
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        {item.q}
                      </div>
                      <div className="text-xs text-white/40 mt-1">
                        {item.categoryId ? "Category filter applied" : ""}
                        {item.sort ? ` • Sort: ${item.sort}` : ""}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        // Results with filters
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <SearchFilters
              categoryId={categoryId || undefined}
              sort={sort}
              onCategoryChange={handleCategoryChange}
              onSortChange={handleSortChange}
              className="sticky top-[100px]"
            />
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            <SearchResultsTabs
              query={search}
              categoryId={categoryId || undefined}
              sort={sort}
              activeTab={tab}
              onTabChange={handleTabChange}
              cityId={selectedCityId}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="animate-pulse h-screen bg-white/5 rounded-2xl m-4" />
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
