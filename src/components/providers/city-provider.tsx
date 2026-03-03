'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useCities } from '@/hooks/use-api';

interface CityContextType {
  selectedCityId: string | undefined;
  setSelectedCityId: (id: string | undefined) => void;
  selectedCity: any | undefined;
}

const CityContext = createContext<CityContextType | undefined>(undefined);

export function CityProvider({ children }: { children: React.ReactNode }) {
  const [selectedCityId, setSelectedCityId] = useState<string | undefined>(undefined);
  const { data: cities } = useCities();

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('selectedCityId');
    if (saved) {
      setSelectedCityId(saved);
    }
  }, []);

  // Save to localStorage when changed
  useEffect(() => {
    if (selectedCityId) {
      localStorage.setItem('selectedCityId', selectedCityId);
    } else {
      localStorage.removeItem('selectedCityId');
    }
  }, [selectedCityId]);

  // Try to pick a default if none selected (e.g. Bangkok) or if the saved city doesn't exist anymore
  useEffect(() => {
    if (cities && cities.length > 0) {
      const isValid = selectedCityId && cities.some((c: any) => c.id === selectedCityId);
      
      if (!selectedCityId || !isValid) {
        const bangkok = cities.find((c: any) => c.name.toLowerCase() === 'bangkok');
        if (bangkok) {
          setSelectedCityId(bangkok.id);
        } else {
          setSelectedCityId(cities[0].id);
        }
      }
    }
  }, [cities, selectedCityId]);

  const selectedCity = cities?.find((c: any) => c.id === selectedCityId);

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
