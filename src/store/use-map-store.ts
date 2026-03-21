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
      storage: createJSONStorage(() => localStorage),
    }
  )
);
