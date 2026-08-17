import { products } from './products';
import type { Product, AvailabilityStatus, FormFactor } from '@/types';

export type SortOption = 'mix' | 'newest' | 'name-asc' | 'availability';

export const PAGE_SIZE = 12;

export interface FilterParams {
  categorie?: string;
  marque?: string;
  format?: string;
  q?: string;
  tri?: SortOption;
  page?: number;
  pageSize?: number;
}

function matchesQuery(p: Product, q: string): boolean {
  const query = q.toLowerCase();
  return (
    p.name.toLowerCase().includes(query) ||
    p.sku.toLowerCase().includes(query) ||
    p.brand.toLowerCase().includes(query) ||
    p.shortDescription.toLowerCase().includes(query) ||
    p.category.toLowerCase().includes(query)
  );
}

const availabilityOrder: Record<AvailabilityStatus, number> = {
  available: 0,
  limited: 1,
  'on-order': 2,
  discontinued: 3,
};

function hashProductId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Mélange déterministe par marque (round-robin) : intercale les marques pour éviter
 * les blocs « marque après marque » dans les listings. Ordre stable entre rendus
 * serveur/client et à travers la pagination (aucune source de hasard, fonction pure
 * du modèle Product — jamais de `Math.random()`).
 */
export function interleaveByBrand(items: Product[]): Product[] {
  const groups = new Map<string, Product[]>();
  for (const p of items) {
    const arr = groups.get(p.brand) ?? [];
    arr.push(p);
    groups.set(p.brand, arr);
  }
  for (const arr of groups.values()) {
    arr.sort((a, b) => hashProductId(a.id) - hashProductId(b.id));
  }
  const brands = [...groups.keys()];
  const result: Product[] = [];
  let remaining = items.length;
  while (remaining > 0) {
    for (const brand of brands) {
      const arr = groups.get(brand);
      if (arr && arr.length > 0) {
        result.push(arr.shift() as Product);
        remaining--;
      }
    }
  }
  return result;
}

export function filterProducts(params: FilterParams): {
  results: Product[];
  total: number;
  page: number;
  totalPages: number;
} {
  const {
    categorie,
    marque,
    format,
    q,
    tri = 'mix',
    page = 1,
    pageSize = 12,
  } = params;

  let filtered = [...products];

  if (categorie) {
    const categories = categorie.split(',');
    filtered = filtered.filter((p) => categories.includes(p.category));
  }

  if (marque) {
    const brands = marque.split(',').map((b) => b.toUpperCase());
    filtered = filtered.filter((p) => brands.includes(p.brand));
  }

  if (format) {
    const formats = format.split(',').map((f) => f.toLowerCase());
    filtered = filtered.filter(
      (p) =>
        (p.attributes.formFactor && formats.includes(p.attributes.formFactor)) ||
        (p.attributes.chassisFormat && formats.includes(p.attributes.chassisFormat.toLowerCase())),
    );
  }

  if (q) {
    filtered = filtered.filter((p) => matchesQuery(p, q));
  }

  switch (tri) {
    case 'mix':
    default:
      filtered = interleaveByBrand(filtered);
      break;
    case 'name-asc':
      filtered.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'availability':
      filtered.sort((a, b) => {
        const aOrder = availabilityOrder[a.availability.status] ?? 99;
        const bOrder = availabilityOrder[b.availability.status] ?? 99;
        return aOrder - bOrder;
      });
      break;
    case 'newest':
      filtered.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
      break;
  }

  const total = filtered.length;
  const totalPages = Math.ceil(total / pageSize);
  const clampedPage = Math.min(Math.max(1, page), totalPages || 1);
  const start = (clampedPage - 1) * pageSize;
  const results = filtered.slice(start, start + pageSize);

  return { results, total, page: clampedPage, totalPages };
}

export function getUniqueAttributeValues(): {
  formFactors: FormFactor[];
  chassisFormats: string[];
} {
  const factors = new Set<FormFactor>();
  const formats = new Set<string>();
  for (const p of products) {
    if (p.attributes.formFactor) factors.add(p.attributes.formFactor);
    if (p.attributes.chassisFormat) formats.add(p.attributes.chassisFormat);
  }
  return {
    formFactors: Array.from(factors).sort(),
    chassisFormats: Array.from(formats).sort(),
  };
}
