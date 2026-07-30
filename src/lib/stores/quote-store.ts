import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface QuoteItem {
  productId: string;
  sku: string;
  name: string;
  brand: string;
}

interface QuoteStore {
  items: QuoteItem[];
  hasHydrated: boolean;
  addItem: (item: QuoteItem) => void;
  removeItem: (productId: string) => void;
  toggleItem: (item: QuoteItem) => void;
  clearAll: () => void;
}

export const useQuoteStore = create<QuoteStore>()(
  persist(
    (set) => ({
      items: [],
      hasHydrated: false,
      addItem: (item) =>
        set((state) => {
          if (state.items.some((i) => i.productId === item.productId)) return state;
          return { items: [...state.items, item] };
        }),
      removeItem: (productId) =>
        set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),
      toggleItem: (item) =>
        set((state) => {
          const exists = state.items.some((i) => i.productId === item.productId);
          if (exists) return { items: state.items.filter((i) => i.productId !== item.productId) };
          return { items: [...state.items, item] };
        }),
      clearAll: () => set({ items: [] }),
    }),
    {
      name: 'hc-quote-storage',
      version: 1,
      onRehydrateStorage: () => () => {
        useQuoteStore.setState({ hasHydrated: true });
      },
    },
  ),
);
