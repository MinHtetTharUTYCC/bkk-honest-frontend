'use client';

import { useState, useEffect } from 'react';
import { useMapStore } from '@/store/use-map-store';

interface MapStoreState {
    transitVisible: boolean;
    toggleTransitVisible: () => void;
}

export function useMapTransitVisible() {
    const [hasHydrated, setHasHydrated] = useState(false);
    const transitVisible = useMapStore((state: MapStoreState) => state.transitVisible);
    const toggleTransitVisible = useMapStore((state: MapStoreState) => state.toggleTransitVisible);

    useEffect(() => {
        // Attempt to rehydrate from localStorage
        // Use a microtask + requestAnimationFrame to ensure hydration completes
        const rehydrateAsync = async () => {
            // First, trigger rehydration
            await useMapStore.persist.rehydrate?.();

            // Use requestAnimationFrame to ensure React has processed hydration
            requestAnimationFrame(() => {
                setHasHydrated(true);
            });
        };

        rehydrateAsync().catch((err) => {
            console.error('Error rehydrating map store:', err);
            // Allow render even if rehydration fails (use default state)
            requestAnimationFrame(() => {
                setHasHydrated(true);
            });
        });
    }, []);

    return {
        // Only return actual transitVisible if hydrated; otherwise false to prevent premature render
        transitVisible: hasHydrated ? transitVisible : false,
        toggleTransitVisible,
        hasHydrated };
}
