import type { Category } from '@/types';

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
    isActive: false,
  },
  {
    id: 'wireless',
    name: 'Wi-Fi & Sans-fil',
    icon: 'Wifi',
    isActive: false,
  },
  {
    id: 'monitor',
    name: 'Écrans',
    icon: 'Monitor',
    isActive: false,
  },
  {
    id: 'printers',
    name: 'Imprimantes',
    icon: 'Printer',
    isActive: false,
  },
];

export function getCategoryById(id: string): Category | undefined {
  return categories.find((c) => c.id === id);
}

export function getActiveCategories(): Category[] {
  return categories.filter((c) => c.isActive);
}
