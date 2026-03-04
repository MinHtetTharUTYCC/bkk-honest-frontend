'use client';

import { MapPin, ChevronDown } from 'lucide-react';
import { useCity } from '@/components/providers/city-provider';
import { useCities } from '@/hooks/use-api';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

export default function CitySwitcher() {
  const { selectedCityId, setSelectedCityId, selectedCity } = useCity();
  const { data: cities } = useCities();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-gray-50/50 hover:bg-white border border-transparent hover:border-gray-300 transition-all hover:shadow-sm group active:scale-95"
      >
        <div className="w-8 h-8 rounded-xl bg-cyan-100 flex items-center justify-center text-cyan-500 transition-transform group-hover:scale-110">
          <MapPin size={16} fill="currentColor" className="text-cyan-400" />
        </div>
        <div className="flex flex-col items-start leading-none">
          <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">In Town</span>
          <div className="flex items-center gap-1">
            <span className="text-xs font-black text-gray-900 uppercase italic tracking-tighter">
              {selectedCity?.name || 'Loading...'}
            </span>
            <ChevronDown size={14} className={cn("text-gray-300 transition-transform", isOpen && "rotate-180")} />
          </div>
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 left-0 w-48 bg-white rounded-[24px] border border-gray-300 shadow-2xl shadow-gray-200/40 p-2 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-3 py-2 border-b border-gray-300 mb-1">
            <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Switch City</span>
          </div>
          <div className="space-y-1">
            {cities?.map((city: any) => (
              <button
                key={city.id}
                onClick={() => {
                  setSelectedCityId(city.id);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full text-left px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                  selectedCityId === city.id 
                    ? "bg-cyan-400 text-white shadow-lg shadow-cyan-400/20" 
                    : "text-gray-400 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                {city.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
