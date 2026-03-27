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
  const [selectedCityId, setSelectedCityId] = useState<string | undefined>(undefined);
  const [isHydrated, setIsHydrated] = useState(false);
  const { data: cities } = useCities();

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('selectedCityId');
    if (saved) {
      setSelectedCityId(saved);
    }
    setIsHydrated(true);
  }, []);

  // Save to localStorage when changed
  useEffect(() => {
    if (!isHydrated) return;
    
    if (selectedCityId) {
      localStorage.setItem('selectedCityId', selectedCityId);
    } else {
      localStorage.removeItem('selectedCityId');
    }
  }, [selectedCityId, isHydrated]);

  // Try to pick a default if none selected (e.g. Bangkok) or if the saved city doesn't exist anymore
  useEffect(() => {
    if (!isHydrated || !cities || cities.length === 0) return;

    const isValid = selectedCityId && (cities as City[]).some((c) => c.id === selectedCityId);
    
    if (!selectedCityId || !isValid) {
      const bangkok = (cities as City[]).find((c) => c.name.toLowerCase() === 'bangkok');
      const fallbackId = bangkok ? bangkok.id : (cities as City[])[0].id;
      
      if (selectedCityId !== fallbackId) {
        // Use functional update or guard to reduce cascading render impact
        setSelectedCityId(fallbackId);
      }
    }
  }, [cities, selectedCityId, isHydrated]);

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
