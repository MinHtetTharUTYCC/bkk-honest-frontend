'use client';

import { useState, useEffect } from 'react';
import { useSpots, useCategories } from '@/hooks/use-api';
import SpotCard from '@/components/spots/spot-card';
import { Search, Filter, MapPin, Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCity } from '@/components/providers/city-provider';

export default function DiscoveryPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState('');
  const { selectedCityId, selectedCity } = useCity();

  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const { data: categoriesResponse } = useCategories();
  const categories = categoriesResponse?.data || categoriesResponse || [];

  const { data: spotsResponse, isLoading } = useSpots({
    cityId: selectedCityId,
    categoryId: selectedCategory,
    search: search.length >= 3 ? search : undefined,
    sort: 'popular',
  });
  const spots = spotsResponse?.data || spotsResponse || [];

  if (!isClient) return null;

  return (
    <div className="space-y-12 pb-24">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic">Discovery</h1>
          <div className="flex items-center gap-2">
            <MapPin size={12} className="text-cyan-400" />
            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Exploring {selectedCity?.name || 'Thailand'}</p>
          </div>
        </div>
      </header>

      {/* Category Pills */}
      <div className="flex gap-3 overflow-x-auto pb-4 -mx-2 px-2 no-scrollbar">
        <button
          onClick={() => setSelectedCategory(undefined)}
          className={cn(
            "flex-shrink-0 px-8 py-3.5 rounded-[32px] text-xs font-black uppercase tracking-widest transition-all",
            !selectedCategory ? "bg-cyan-400 text-white shadow-xl shadow-cyan-400/30" : "bg-white border border-gray-100 text-gray-400 hover:bg-gray-50"
          )}
        >
          All Pulse
        </button>
        {categories?.map((cat: any) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={cn(
              "flex-shrink-0 px-8 py-3.5 rounded-[32px] text-xs font-black uppercase tracking-widest transition-all",
              selectedCategory === cat.id ? "bg-cyan-400 text-white shadow-xl shadow-cyan-400/30" : "bg-white border border-gray-100 text-gray-400 hover:bg-gray-50"
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Grid of Spots */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[420px] bg-white rounded-[32px] border border-gray-200 shadow-xl shadow-gray-200/20 animate-pulse p-8 space-y-6">
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
          <div className="col-span-full py-40 text-center space-y-6 bg-white rounded-[48px] border border-dashed border-gray-200 shadow-sm shadow-gray-100/50">
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
