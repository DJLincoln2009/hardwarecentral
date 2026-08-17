'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import type { SortOption } from '@/lib/data/filter-products';

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'mix', label: 'Mélange de marques' },
  { value: 'newest', label: 'Nouveautés' },
  { value: 'name-asc', label: 'Nom (A-Z)' },
  { value: 'availability', label: 'Disponibilité' },
];

function CatalogSort() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = (searchParams.get('tri') as SortOption) || 'mix';

  return (
    <div className="relative">
      <select
        value={current}
        onChange={(e) => {
          const params = new URLSearchParams(searchParams.toString());
          const value = e.target.value;
          if (value !== 'mix') params.set('tri', value);
          else params.delete('tri');
          router.push(`${pathname}?${params.toString()}`);
        }}
        aria-label="Trier par"
        className="appearance-none rounded-full border border-border bg-surface py-2.5 pl-4 pr-9 text-sm font-medium text-foreground shadow-xs transition-all duration-200 hover:border-border-strong focus:border-accent focus:shadow-focus focus:outline-none"
      >
        {sortOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            Trier : {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint"
        aria-hidden="true"
      />
    </div>
  );
}

export default CatalogSort;
