'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import { useCallback } from 'react';
import { getActiveCategories } from '@/lib/data/categories';
import { getActiveBrands } from '@/lib/data/brands';
import { getUniqueAttributeValues } from '@/lib/data/filter-products';
import { cn } from '@/lib/utils';

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
    <aside
      className={cn('w-full flex-shrink-0 lg:sticky lg:top-24 lg:w-[240px]', className)}
      aria-label="Filtres du catalogue"
    >
      <div className="space-y-6 rounded-2xl border border-border bg-surface p-5 shadow-xs">
        <div>
          <p className="eyebrow mb-3">Catégorie</p>
          <div className="space-y-1">
            {categories.map((cat) => {
              const isActive = activeCategorie === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => updateParam('categorie', isActive ? '' : cat.id)}
                  aria-pressed={isActive}
                  className={cn(
                    'flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                    isActive
                      ? 'bg-teal-50 font-medium text-teal-700 dark:bg-teal-500/15 dark:text-teal-300'
                      : 'text-muted hover:bg-surface-muted hover:text-foreground',
                  )}
                >
                  <span>{cat.name}</span>
                  {isActive && (
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-teal-600" aria-hidden="true" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="eyebrow mb-3">Marque</p>
          <div className="max-h-48 space-y-0.5 overflow-y-auto no-scrollbar pr-1">
            {brands.map((b) => {
              const activeBrands = activeMarque ? activeMarque.split(',') : [];
              const isChecked = activeBrands.includes(b.code);
              return (
                <label
                  key={b.code}
                  className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-muted transition-colors duration-150 hover:bg-surface-muted hover:text-foreground"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleArrayParam('marque', b.code)}
                    className="h-4 w-4 rounded border-border-strong accent-teal-600 focus:ring-2 focus:ring-accent"
                  />
                  {b.name}
                </label>
              );
            })}
          </div>
        </div>

        <div>
          <p className="eyebrow mb-3">Format châssis</p>
          <div className="space-y-0.5">
            {chassisFormats.map((fmt) => {
              const activeFormats = activeFormat ? activeFormat.split(',') : [];
              const isChecked = activeFormats.includes(fmt);
              return (
                <label
                  key={fmt}
                  className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-muted transition-colors duration-150 hover:bg-surface-muted hover:text-foreground"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleArrayParam('format', fmt)}
                    className="h-4 w-4 rounded border-border-strong accent-teal-600 focus:ring-2 focus:ring-accent"
                  />
                  {fmt}
                </label>
              );
            })}
          </div>
        </div>

        {hasFilters && (
          <div className="border-t border-border pt-4">
            <button
              type="button"
              onClick={clearAll}
              className="inline-flex items-center gap-1.5 rounded-lg px-1 py-1.5 text-sm font-medium text-muted transition-colors duration-150 hover:text-danger-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
              Effacer les filtres
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

export default CatalogFilters;
