import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemePreference = 'light' | 'dark' | 'system';

export const THEME_STORAGE_KEY = 'hc-theme';

interface UIStore {
  themePreference: ThemePreference;
  whatsappMessage: string | null;
  setThemePreference: (theme: ThemePreference) => void;
  setWhatsappMessage: (message: string | null) => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      themePreference: 'system',
      whatsappMessage: null,
      setThemePreference: (theme) => set({ themePreference: theme }),
      setWhatsappMessage: (message) => set({ whatsappMessage: message }),
    }),
    {
      name: THEME_STORAGE_KEY,
      partialize: (state) => ({ themePreference: state.themePreference }),
    },
  ),
);
