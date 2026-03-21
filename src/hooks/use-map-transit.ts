'use client';

import { useState, useEffect } from 'react';
import { useMapStore } from '@/store/use-map-store';

export function useMapTransitVisible() {
  const [hasHydrated, setHasHydrated] = useState(false);
  const transitVisible = useMapStore((state) => state.transitVisible);
  const toggleTransitVisible = useMapStore((state) => state.toggleTransitVisible);

  useEffect(() => {
    // Manually trigger hydration if it hasn't happened yet
    useMapStore.persist.rehydrate();
    setHasHydrated(true);
  }, []);

  return {
    transitVisible: hasHydrated ? transitVisible : false,
    toggleTransitVisible,
    hasHydrated
  };
}
