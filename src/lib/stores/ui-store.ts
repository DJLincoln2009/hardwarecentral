import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemePreference = 'light' | 'dark' | 'system';

export const THEME_STORAGE_KEY = 'hc-theme';

interface UIStore {
  themePreference: ThemePreference;
  mobileNavOpen: boolean;
  megaMenuOpen: boolean;
  modalOpen: boolean;
  whatsappMessage: string | null;
  setThemePreference: (theme: ThemePreference) => void;
  setMobileNavOpen: (open: boolean) => void;
  setMegaMenuOpen: (open: boolean) => void;
  setModalOpen: (open: boolean) => void;
  setWhatsappMessage: (message: string | null) => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      themePreference: 'system',
      mobileNavOpen: false,
      megaMenuOpen: false,
      modalOpen: false,
      whatsappMessage: null,
      setThemePreference: (theme) => set({ themePreference: theme }),
      setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
      setMegaMenuOpen: (open) => set({ megaMenuOpen: open }),
      setModalOpen: (open) => set({ modalOpen: open }),
      setWhatsappMessage: (message) => set({ whatsappMessage: message }),
    }),
    {
      name: THEME_STORAGE_KEY,
      partialize: (state) => ({ themePreference: state.themePreference }),
    },
  ),
);
