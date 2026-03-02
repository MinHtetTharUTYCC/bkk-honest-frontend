'use client';

import { useState, useEffect } from 'react';
import { useSpots } from '@/hooks/use-api';
import { useCity } from '@/components/providers/city-provider';
import { MapPin, Navigation, Info, Layers } from 'lucide-react';

export default function MapPage() {
  const [isClient, setIsClient] = useState(false);
  const { selectedCityId, selectedCity } = useCity();
  
  const { data: spotsResponse, isLoading } = useSpots({
    cityId: selectedCityId,
  });
  const spots = spotsResponse?.data || spotsResponse || [];

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  return (
    <div className="h-[calc(100vh-160px)] md:h-[calc(100vh-120px)] flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic">The Map</h1>
        <div className="flex items-center gap-2">
          <MapPin size={12} className="text-cyan-400" />
          <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Real-time pulse of {selectedCity?.name || 'Thailand'}</p>
        </div>
      </header>

      <div className="flex-1 bg-white rounded-[40px] border border-gray-200 shadow-2xl shadow-gray-200/40 overflow-hidden relative group">
        {/* Placeholder for real map */}
        <div className="absolute inset-0 bg-gray-50 flex items-center justify-center flex-col gap-4">
          <div className="w-20 h-20 bg-cyan-100 text-cyan-400 rounded-3xl flex items-center justify-center animate-pulse">
            <MapPin size={40} fill="currentColor" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-xl font-black text-gray-900 uppercase italic tracking-tight">Map Engine Initializing</p>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Rendering {spots.length} verified spots in {selectedCity?.name}</p>
          </div>
        </div>

        {/* Map Controls Overlay */}
        <div className="absolute top-6 right-6 flex flex-col gap-3">
          <button className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg border border-gray-100 text-gray-900 hover:bg-cyan-400 hover:text-white transition-all active:scale-95">
            <Layers size={20} />
          </button>
          <button className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg border border-gray-100 text-gray-900 hover:bg-cyan-400 hover:text-white transition-all active:scale-95">
            <Navigation size={20} />
          </button>
        </div>

        {/* Info Legend Overlay */}
        <div className="absolute bottom-6 left-6 right-6 md:right-auto md:w-80">
          <div className="bg-gray-900/95 backdrop-blur-md p-6 rounded-[32px] border border-gray-800 shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">Map Legend</span>
              <Info size={14} className="text-gray-500" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/40" />
                <span className="text-xs font-bold uppercase italic tracking-tight">Fair Price Reported</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500 shadow-lg shadow-red-500/40" />
                <span className="text-xs font-bold uppercase italic tracking-tight">Active Scam Warning</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/40 animate-pulse" />
                <span className="text-xs font-bold uppercase italic tracking-tight">Live Vibe Update</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
