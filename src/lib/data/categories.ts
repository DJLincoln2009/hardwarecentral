import type { Category, CategoryId } from '@/types';

export const categories: Category[] = [
  {
    id: 'server-storage',
    name: 'Serveurs & Stockage',
    icon: 'Server',
    isActive: true,
  },
  {
    id: 'networking',
    name: 'Réseau',
    icon: 'Network',
    isActive: true,
  },
  {
    id: 'security',
    name: 'Sécurité & Pare-feu',
    icon: 'Shield',
    isActive: true,
  },
  {
    id: 'cctv',
    name: 'Vidéosurveillance',
    icon: 'Camera',
    isActive: true,
  },
  {
    id: 'laptop',
    name: 'Ordinateurs & Stations de travail',
    icon: 'Monitor',
    isActive: true,
  },
  {
    id: 'datacenter',
    name: 'Datacenter',
    icon: 'Building2',
    isActive: true,
  },
  {
    id: 'wireless',
    name: 'Wi-Fi & Sans-fil',
    icon: 'Wifi',
    isActive: true,
  },
  {
    id: 'monitor',
    name: 'Écrans',
    icon: 'Monitor',
    isActive: true,
  },
  {
    id: 'printers',
    name: 'Imprimantes',
    icon: 'Printer',
    isActive: true,
  },
];

export function getCategoryById(id: string): Category | undefined {
  return categories.find((c) => c.id === id);
}

export function getActiveCategories(): Category[] {
  return categories.filter((c) => c.isActive);
}

const NAVBAR_CATEGORY_ORDER: CategoryId[] = [
  'networking',
  'security',
  'datacenter',
  'server-storage',
  'cctv',
];

/** Catégories affichées dans la navbar (Header, MegaMenu, navigation mobile). */
export function getNavbarCategories(): Category[] {
  return NAVBAR_CATEGORY_ORDER.map((id) => getCategoryById(id)).filter(
    (c): c is Category => c !== undefined,
  );
}
