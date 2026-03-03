'use client';

import { useState, useEffect } from 'react';
import { useScamAlerts, useCategories } from '@/hooks/use-api';
import ScamAlertCard from '@/components/scams/scam-alert-card';
import { Search, Filter, AlertTriangle, MapPin, Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCity } from '@/components/providers/city-provider';

export default function ScamAlertsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState('');
  const { selectedCityId, selectedCity } = useCity();

  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const { data: categoriesResponse } = useCategories();
  const categories = categoriesResponse?.data || categoriesResponse || [];

  const { data: alertsResponse, isLoading } = useScamAlerts({
    cityId: selectedCityId,
    categoryId: selectedCategory,
  });
  const alerts = alertsResponse?.data || alertsResponse || [];

  if (!isClient) return null;

  return (
    <div className="space-y-12 pb-24">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic">Scam Alerts</h1>
          <div className="flex items-center gap-2">
            <MapPin size={12} className="text-cyan-400" />
            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Real-time Warnings in {selectedCity?.name || 'Thailand'}</p>
          </div>
        </div>
        
        <div className="relative group">
          <Search size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-cyan-400 transition-colors" />
          <input 
            type="text" 
            placeholder="Search scams..." 
            className="w-full md:w-[320px] bg-white border border-gray-100 pl-14 pr-8 py-4 rounded-[32px] text-xs font-bold uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-cyan-400/10 focus:border-cyan-400 transition-all shadow-xl shadow-gray-200/20"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
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
          All Scams
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

      {/* Grid of Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-10">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-[500px] bg-white rounded-[48px] border border-gray-200 shadow-xl shadow-gray-200/20 animate-pulse p-10 space-y-8">
               <div className="w-full h-64 bg-gray-50 rounded-[32px]" />
               <div className="h-8 w-3/4 bg-gray-50 rounded-full" />
               <div className="h-20 w-full bg-gray-50 rounded-[24px]" />
            </div>
          ))
        ) : alerts && alerts.length > 0 ? (
          alerts.map((alert: any) => (
            <ScamAlertCard key={alert.id} alert={alert} />
          ))
        ) : (
          <div className="col-span-full py-40 text-center space-y-6 bg-white rounded-[48px] border border-dashed border-gray-200 shadow-sm shadow-gray-100/50">
            <div className="w-20 h-20 bg-gray-50 rounded-[32px] flex items-center justify-center mx-auto text-gray-200">
               <AlertTriangle size={32} />
            </div>
            <div className="space-y-2">
              <h4 className="text-xl font-black text-gray-900 uppercase italic tracking-tight">Zero alerts reported</h4>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">It's quiet for now. Stay vigilant regardless!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
