'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useCities } from '@/hooks/use-api';

interface City {
  id: string;
  name: string;
}

interface CityContextType {
  selectedCityId: string | undefined;
  setSelectedCityId: (id: string | undefined) => void;
  selectedCity: City | undefined;
}

const CityContext = createContext<CityContextType | undefined>(undefined);

export function CityProvider({ children }: { children: React.ReactNode }) {
  const [selectedCityId, setSelectedCityId] = useState<string | undefined>(() => {
    // Initialize from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('selectedCityId');
      return saved || undefined;
    }
    return undefined;
  });
  const [isHydrated, setIsHydrated] = useState(false);
  const { data: cities } = useCities();

  // Mark as hydrated after initial mount
  useEffect(() => {
    requestAnimationFrame(() => setIsHydrated(true));
  }, []);

  // Save to localStorage when changed (only after hydration)
  useEffect(() => {
    if (!isHydrated) return;
    
    if (selectedCityId) {
      localStorage.setItem('selectedCityId', selectedCityId);
    } else {
      localStorage.removeItem('selectedCityId');
    }
  }, [selectedCityId, isHydrated]);

  // Derive fallback city based on current state
  const fallbackCityId = React.useMemo(() => {
    if (!isHydrated || !cities || cities.length === 0) return undefined;
    
    const isValid = selectedCityId && cities.some((c) => c.id === selectedCityId);
    if (isValid) return undefined; // Current selection is valid
    
    const bangkok = cities.find((c) => c.name.toLowerCase() === 'bangkok');
    return bangkok ? bangkok.id : cities[0].id;
  }, [cities, selectedCityId, isHydrated]);

  // Apply fallback if needed (outside of render)
  useEffect(() => {
    if (fallbackCityId) {
      requestAnimationFrame(() => setSelectedCityId(fallbackCityId));
    }
  }, [fallbackCityId]);

  const selectedCity = (cities as City[] | undefined)?.find((c) => c.id === selectedCityId);

  return (
    <CityContext.Provider value={{ selectedCityId, setSelectedCityId, selectedCity }}>
      {children}
    </CityContext.Provider>
  );
}

export function useCity() {
  const context = useContext(CityContext);
  if (context === undefined) {
    throw new Error('useCity must be used within a CityProvider');
  }
  return context;
}
