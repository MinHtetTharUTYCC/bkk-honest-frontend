import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface MapState {
  transitVisible: boolean;
  setTransitVisible: (visible: boolean) => void;
  toggleTransitVisible: () => void;
}

export const useMapStore = create<MapState>()(
  persist(
    (set) => ({
      transitVisible: false,
      setTransitVisible: (visible) => set({ transitVisible: visible }),
      toggleTransitVisible: () => set((state) => ({ transitVisible: !state.transitVisible })),
    }),
    {
      name: 'bkk-honest-map-storage',
      storage: createJSONStorage(() => 
        typeof window !== 'undefined' ? window.localStorage : {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        }
      ),
      // Prevent automatic hydration on mount to avoid Next.js hydration mismatch.
      // We will handle hydration manually or via a hook.
      skipHydration: true,
    }
  )
);
