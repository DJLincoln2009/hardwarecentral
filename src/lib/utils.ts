import type { AvailabilityStatus, BrandCode } from '@/types';

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

export function getAvailabilityDisplay(status: AvailabilityStatus): {
  label: string;
  variant: 'success' | 'warning' | 'danger' | 'neutral' | 'on-order';
} {
  switch (status) {
    case 'available':
      return { label: 'Disponible', variant: 'success' };
    case 'limited':
      return { label: 'Stock limité', variant: 'warning' };
    case 'on-order':
      return { label: 'Sur commande', variant: 'on-order' };
    case 'discontinued':
      return { label: 'Fin de commercialisation', variant: 'danger' };
  }
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Retire le préfixe marque du nom produit si présent (ex. "HIKVISION DeepinView
 * Camera iDS-…" → "DeepinView Camera iDS-…"), pour éviter la redondance quand la
 * marque est déjà affichée juste au-dessus (badge/brandmark). Aucune invention de
 * libellé : le nom reste une donnée brute du modèle, seule la marque est retirée.
 */
export function stripBrandPrefix(name: string, brand: BrandCode): string {
  const prefix = `${brand.toUpperCase()} `;
  if (name.trimStart().toUpperCase().startsWith(prefix)) {
    return name.trimStart().slice(prefix.length).trim();
  }
  return name;
}
