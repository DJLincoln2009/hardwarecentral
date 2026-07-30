import { create } from 'zustand';

interface UIStore {
  mobileNavOpen: boolean;
  megaMenuOpen: boolean;
  modalOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
  setMegaMenuOpen: (open: boolean) => void;
  setModalOpen: (open: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  mobileNavOpen: false,
  megaMenuOpen: false,
  modalOpen: false,
  setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
  setMegaMenuOpen: (open) => set({ megaMenuOpen: open }),
  setModalOpen: (open) => set({ modalOpen: open }),
}));
