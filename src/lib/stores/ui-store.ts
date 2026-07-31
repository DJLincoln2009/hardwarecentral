import { create } from 'zustand';

interface UIStore {
  mobileNavOpen: boolean;
  megaMenuOpen: boolean;
  modalOpen: boolean;
  whatsappMessage: string | null;
  setMobileNavOpen: (open: boolean) => void;
  setMegaMenuOpen: (open: boolean) => void;
  setModalOpen: (open: boolean) => void;
  setWhatsappMessage: (message: string | null) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  mobileNavOpen: false,
  megaMenuOpen: false,
  modalOpen: false,
  whatsappMessage: null,
  setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
  setMegaMenuOpen: (open) => set({ megaMenuOpen: open }),
  setModalOpen: (open) => set({ modalOpen: open }),
  setWhatsappMessage: (message) => set({ whatsappMessage: message }),
}));
