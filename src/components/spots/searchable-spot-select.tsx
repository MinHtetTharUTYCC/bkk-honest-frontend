'use client';

import { useState, useRef, useEffect } from 'react';
import { useSpotSearch } from '@/hooks/use-api';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchableSpotSelectProps {
  name: string;
  required?: boolean;
  placeholder?: string;
  cityId?: string;
  onSelect?: (spotId: string, spot?: any) => void;
}

export default function SearchableSpotSelect({
  name,
  required = false,
  placeholder = 'Search spots...',
  cityId,
  onSelect,
}: SearchableSpotSelectProps) {
  const [inputValue, setInputValue] = useState('');
  const [selectedSpot, setSelectedSpot] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: spots = [] } = useSpotSearch(inputValue, cityId, 15);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (spot: any) => {
    setSelectedSpot(spot);
    setInputValue(spot.name);
    setIsOpen(false);
    onSelect?.(spot.id, spot);
  };

  const handleClear = () => {
    setSelectedSpot(null);
    setInputValue('');
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="space-y-4">
        <label className="block text-[10px] font-medium uppercase tracking-widest text-white/40 ml-1">
          Location
        </label>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setIsOpen(true);
              setSelectedSpot(null);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            className="w-full bg-white/5 border border-white/10 focus:border-amber-400/50 transition-all rounded-2xl px-5 py-4 text-sm font-medium text-foreground placeholder:text-white/20 outline-none pr-10"
          />
          {selectedSpot && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
            >
              ✕
            </button>
          )}
          {/* Hidden input to store the actual selected value for form submission */}
          <input
            type="hidden"
            name={name}
            value={selectedSpot?.id || ''}
            required={required && !selectedSpot}
          />
        </div>

        {/* Dropdown */}
        {isOpen && inputValue.trim().length >= 1 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-white/10 rounded-2xl shadow-2xl shadow-black/50 z-50 max-h-64 overflow-y-auto">
            {spots.length > 0 ? (
              <ul className="py-2">
                {spots.map((spot: any) => (
                  <li key={spot.id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(spot)}
                      className={cn(
                        "w-full text-left px-5 py-3 hover:bg-white/5 transition-colors flex items-start gap-3",
                        selectedSpot?.id === spot.id && "bg-white/10 border-l-2 border-amber-400"
                      )}
                    >
                      <MapPin size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{spot.name}</p>
                        <p className="text-xs text-white/50 truncate">
                          {spot.address}
                          {spot.city?.name && ` • ${spot.city.name}`}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-5 py-6 text-center">
                <p className="text-xs text-white/40">No spots found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
