import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FavoritesStore {
  productIds: string[];
  hasHydrated: boolean;
  toggle: (productId: string) => void;
  has: (productId: string) => boolean;
  clear: () => void;
}

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      productIds: [],
      hasHydrated: false,
      toggle: (productId) =>
        set((state) => {
          const exists = state.productIds.includes(productId);
          if (exists) return { productIds: state.productIds.filter((id) => id !== productId) };
          return { productIds: [...state.productIds, productId] };
        }),
      has: (productId) => get().productIds.includes(productId),
      clear: () => set({ productIds: [] }),
    }),
    {
      name: 'hc-favorites-storage',
      version: 1,
      onRehydrateStorage: () => () => {
        useFavoritesStore.setState({ hasHydrated: true });
      },
    },
  ),
);
