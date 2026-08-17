import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface QuoteItem {
  productId: string;
  sku: string;
  name: string;
  brand: string;
  quantity: number;
}

interface QuoteStore {
  items: QuoteItem[];
  hasHydrated: boolean;
  addItem: (item: QuoteItem, quantity?: number) => void;
  removeItem: (productId: string) => void;
  toggleItem: (item: Omit<QuoteItem, 'quantity'>, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearAll: () => void;
}

export const useQuoteStore = create<QuoteStore>()(
  persist(
    (set) => ({
      items: [],
      hasHydrated: false,
      addItem: (item, quantity = 1) =>
        set((state) => {
          if (state.items.some((i) => i.productId === item.productId)) return state;
          return { items: [...state.items, { ...item, quantity }] };
        }),
      removeItem: (productId) =>
        set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),
      toggleItem: (item, quantity = 1) =>
        set((state) => {
          const exists = state.items.some((i) => i.productId === item.productId);
          if (exists) return { items: state.items.filter((i) => i.productId !== item.productId) };
          return { items: [...state.items, { ...item, quantity }] };
        }),
      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, quantity: Math.min(999, Math.max(1, Math.floor(quantity))) } : i,
          ),
        })),
      clearAll: () => set({ items: [] }),
    }),
    {
      name: 'hc-quote-storage',
      version: 2,
      onRehydrateStorage: () => () => {
        useQuoteStore.setState({ hasHydrated: true });
      },
    },
  ),
);
