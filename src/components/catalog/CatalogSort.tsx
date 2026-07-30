'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import type { SortOption } from '@/lib/data/filter-products';

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Nouveautés' },
  { value: 'name-asc', label: 'Nom (A-Z)' },
  { value: 'availability', label: 'Disponibilité' },
];

function CatalogSort() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = (searchParams.get('tri') as SortOption) || 'newest';

  return (
    <select
      value={current}
      onChange={(e) => {
        const params = new URLSearchParams(searchParams.toString());
        const value = e.target.value;
        if (value && value !== 'newest') params.set('tri', value);
        else params.delete('tri');
        router.push(`${pathname}?${params.toString()}`);
      }}
      aria-label="Trier par"
      className="rounded-md border border-graphite-200 bg-white px-3 py-1.5 text-sm text-graphite-900 focus:border-teal-600 focus:ring-2 focus:ring-teal-600 focus:outline-none"
    >
      {sortOptions.map((opt) => (
        <option key={opt.value} value={opt.value}>
          Trier : {opt.label}
        </option>
      ))}
    </select>
  );
}

export default CatalogSort;
