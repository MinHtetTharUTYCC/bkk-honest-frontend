'use client';

import { MapPin, ChevronDown } from 'lucide-react';
import { useCity } from '@/components/providers/city-provider';
import { useCities } from '@/hooks/use-api';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface CityOption {
    id: string;
    name: string;
}

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
                className="flex items-center gap-2 px-2 md:px-3 py-1.5 md:py-2 rounded-2xl bg-white/5 hover:bg-white/8 border border-white/10 transition-all hover:shadow-sm group active:scale-95"
            >
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-xl bg-amber-400/10 flex items-center justify-center text-amber-400 transition-transform group-hover:scale-110">
                    <MapPin size={14} fill="currentColor" className="text-amber-400" />
                </div>
                <div className="flex items-center gap-1 pr-1">
                    <span className="text-[10px] md:text-xs font-black text-foreground italic tracking-tighter truncate max-w-20 md:max-w-none">
                        {selectedCity?.name || 'Loading...'}
                    </span>
                    <ChevronDown
                        size={12}
                        className={cn(
                            'text-white/20 transition-transform',
                            isOpen && 'rotate-180',
                        )}
                    />
                </div>
            </button>

            {isOpen && (
                <div className="absolute top-full mt-2 left-0 w-48 bg-[#0A0A0B] rounded-[24px] border border-white/10 shadow-2xl shadow-black/50 p-2 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 backdrop-blur-xl">
                    <div className="px-3 py-2 border-b border-white/10 mb-1">
                        <span className="text-[12px] font-black text-white/50 tracking-widest">
                            Switch City
                        </span>
                    </div>
                    <div className="space-y-1">
                        {cities?.map((city: CityOption) => (
                            <button
                                key={city.id}
                                onClick={() => {
                                    setSelectedCityId(city.id);
                                    setIsOpen(false);
                                }}
                                className={cn(
                                    'w-full text-left px-4 py-2.5 rounded-xl text-xs font-black tracking-widest transition-all',
                                    selectedCityId === city.id
                                        ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/20'
                                        : 'text-white/40 hover:bg-white/5 hover:text-foreground',
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
