'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import { useCallback } from 'react';
import { getActiveCategories } from '@/lib/data/categories';
import { getActiveBrands } from '@/lib/data/brands';
import { getUniqueAttributeValues } from '@/lib/data/filter-products';

interface CatalogFiltersProps {
  className?: string;
}

function CatalogFilters({ className = '' }: CatalogFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const categories = getActiveCategories();
  const brands = getActiveBrands();
  const { chassisFormats } = getUniqueAttributeValues();

  const activeCategorie = searchParams.get('categorie') || '';
  const activeMarque = searchParams.get('marque') || '';
  const activeFormat = searchParams.get('format') || '';

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete('page');
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  const toggleArrayParam = useCallback(
    (key: string, value: string) => {
      const current = searchParams.get(key) || '';
      const values = current ? current.split(',') : [];
      const idx = values.indexOf(value);
      if (idx >= 0) values.splice(idx, 1);
      else values.push(value);
      updateParam(key, values.join(','));
    },
    [searchParams, updateParam],
  );

  const clearAll = useCallback(() => {
    router.push(pathname);
  }, [router, pathname]);

  const hasFilters = activeCategorie || activeMarque || activeFormat;

  return (
    <aside className={`w-full lg:w-[220px] flex-shrink-0 ${className}`}>
      <div className="space-y-5">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-graphite-600">
            Catégorie
          </p>
          <div className="space-y-1">
            {categories.map((cat) => {
              const isActive = activeCategorie === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => updateParam('categorie', isActive ? '' : cat.id)}
                  className={`block w-full text-left min-h-11 px-2 py-2.5 text-sm rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none ${
                    isActive ? 'bg-teal-50 text-teal-600 font-medium' : 'text-graphite-600 hover:bg-graphite-50'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-graphite-600">
            Marque
          </p>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {brands.map((b) => {
              const activeBrands = activeMarque ? activeMarque.split(',') : [];
              const isChecked = activeBrands.includes(b.code);
              return (
                <label
                  key={b.code}
                  className="flex items-center gap-2 px-2 py-3 text-sm text-graphite-600 hover:bg-graphite-50 rounded-md cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleArrayParam('marque', b.code)}
                    className="h-4 w-4 rounded border-graphite-300 text-teal-600 focus:ring-teal-600"
                  />
                  {b.name}
                </label>
              );
            })}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-graphite-600">
            Format châssis
          </p>
          <div className="space-y-1">
            {chassisFormats.map((fmt) => {
              const activeFormats = activeFormat ? activeFormat.split(',') : [];
              const isChecked = activeFormats.includes(fmt);
              return (
                <label
                  key={fmt}
                  className="flex items-center gap-2 px-2 py-3 text-sm text-graphite-600 hover:bg-graphite-50 rounded-md cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleArrayParam('format', fmt)}
                    className="h-4 w-4 rounded border-graphite-300 text-teal-600 focus:ring-teal-600"
                  />
                  {fmt}
                </label>
              );
            })}
          </div>
        </div>

        {hasFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex items-center gap-1 px-2 py-2.5 text-sm text-graphite-600 hover:text-graphite-900 transition-colors focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none rounded-sm"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
            Effacer les filtres
          </button>
        )}
      </div>
    </aside>
  );
}

export default CatalogFilters;
