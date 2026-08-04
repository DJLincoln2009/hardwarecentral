import type { AvailabilityStatus } from '@/types';

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

export function getAvailabilityDisplay(status: AvailabilityStatus): {
  label: string;
  variant: 'success' | 'warning' | 'danger' | 'neutral';
} {
  switch (status) {
    case 'available':
      return { label: 'Disponible', variant: 'success' };
    case 'limited':
      return { label: 'Stock limité', variant: 'warning' };
    case 'on-order':
      return { label: 'Sur commande', variant: 'neutral' };
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
