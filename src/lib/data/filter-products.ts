import { products } from './products';
import type { Product, AvailabilityStatus, ChassisFormat } from '@/types';

export type SortOption = 'newest' | 'name-asc' | 'availability';

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
    tri = 'newest',
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
    const formats = format.split(',') as ChassisFormat[];
    filtered = filtered.filter((p) => p.attributes.chassisFormat && formats.includes(p.attributes.chassisFormat));
  }

  if (q) {
    filtered = filtered.filter((p) => matchesQuery(p, q));
  }

  switch (tri) {
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
    default:
      filtered.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
      break;
  }

  const total = filtered.length;
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;
  const results = filtered.slice(start, start + pageSize);

  return { results, total, page, totalPages };
}

export function getUniqueAttributeValues(): {
  chassisFormats: ChassisFormat[];
} {
  const formats = new Set<ChassisFormat>();
  for (const p of products) {
    if (p.attributes.chassisFormat) formats.add(p.attributes.chassisFormat);
  }
  return { chassisFormats: Array.from(formats).sort() };
}
