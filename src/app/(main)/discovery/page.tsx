'use client';

import { useState, useEffect } from 'react';
import { useSpots, useCategories } from '@/hooks/use-api';
import SpotCard from '@/components/spots/spot-card';
import { SearchInput } from '@/components/ui/search-input';
import { Filter, MapPin, Clock, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCity } from '@/components/providers/city-provider';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function DiscoveryPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [sort, setSort] = useState<'newest' | 'popular'>('popular');
  const { selectedCityId, selectedCity } = useCity();

  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const { data: categoriesResponse } = useCategories();
  // @ts-ignore
  const categories = categoriesResponse?.data || categoriesResponse || [];

  const { data: spotsResponse, isLoading } = useSpots({
    cityId: selectedCityId,
    categoryId: selectedCategory,
    search: debouncedSearch,
    sort: sort,
  });
  // @ts-ignore - API response structure varies during transition
  const spots = spotsResponse?.data || spotsResponse || [];

  if (!isClient) return null;

  return (
    <div className="space-y-6 pb-24">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-0.5">
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">Discovery</h1>
          <div className="flex items-center gap-2">
            <MapPin size={10} className="text-cyan-400" />
            <p className="text-gray-400 font-bold uppercase tracking-widest text-[9px]">Exploring {selectedCity?.name || 'Thailand'}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Sort Toggle */}
          <div className="flex bg-gray-100 p-1 rounded-2xl w-full sm:w-auto">
            <button
              onClick={() => setSort('newest')}
              className={cn(
                "flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                sort === 'newest' ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"
              )}
            >
              <Clock size={12} />
              Newest
            </button>
            <button
              onClick={() => setSort('popular')}
              className={cn(
                "flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                sort === 'popular' ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"
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
            className="md:w-[240px]"
          />
        </div>
      </header>

      {/* Category Pills */}
      <ScrollArea className="w-full whitespace-nowrap -mx-2 px-2">
        <div className="flex gap-2 pb-2">
          <button
            onClick={() => setSelectedCategory(undefined)}
            className={cn(
              "flex-shrink-0 px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
              !selectedCategory ? "bg-cyan-400 text-white shadow-lg shadow-cyan-400/20" : "bg-white border border-gray-300 text-gray-400 hover:bg-gray-50"
            )}
          >
            All Pulse
          </button>
          {categories?.map((cat: any) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "flex-shrink-0 px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                selectedCategory === cat.id ? "bg-cyan-400 text-white shadow-lg shadow-cyan-400/20" : "bg-white border border-gray-300 text-gray-400 hover:bg-gray-50"
              )}
            >
              {cat.name}
              {cat._count?.spots > 0 && (
                <span className={cn(
                  "px-1.5 py-0.5 rounded-md text-[9px]",
                  selectedCategory === cat.id ? "bg-white/20 text-white" : "bg-gray-100 text-gray-400"
                )}>
                  {cat._count.spots}
                </span>
              )}
            </button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="hidden" />
      </ScrollArea>

      {/* Grid of Spots */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[420px] bg-white rounded-[32px] border border-gray-300 shadow-xl shadow-gray-200/20 animate-pulse p-8 space-y-6">
               <div className="w-full h-48 bg-gray-50 rounded-[24px]" />
               <div className="h-6 w-3/4 bg-gray-50 rounded-full" />
               <div className="h-4 w-1/2 bg-gray-50 rounded-full" />
            </div>
          ))
        ) : spots && spots.length > 0 ? (
          spots.map((spot: any) => (
            <SpotCard key={spot.id} spot={spot} />
          ))
        ) : (
          <div className="col-span-full py-40 text-center space-y-6 bg-white rounded-[48px] border border-dashed border-gray-300 shadow-sm shadow-gray-100/50">
            <div className="w-20 h-20 bg-gray-50 rounded-[32px] flex items-center justify-center mx-auto text-gray-200">
               <Filter size={32} />
            </div>
            <div className="space-y-2">
              <h4 className="text-xl font-black text-gray-900 uppercase italic tracking-tight">No spots found</h4>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Try changing your filters or searching for something else</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
