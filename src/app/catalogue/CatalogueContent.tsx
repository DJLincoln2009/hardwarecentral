'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { SlidersHorizontal } from 'lucide-react';
import Breadcrumb from '@/components/layout/Breadcrumb';
import CatalogFilters from '@/components/catalog/CatalogFilters';
import CatalogSort from '@/components/catalog/CatalogSort';
import CatalogPagination from '@/components/catalog/CatalogPagination';
import MobileFilterDrawer from '@/components/catalog/MobileFilterDrawer';
import ProductCard from '@/components/product/ProductCard';
import EmptyState from '@/components/ui/EmptyState';
import { filterProducts, type SortOption } from '@/lib/data/filter-products';

const PAGE_SIZE = 12;

function CatalogueContent() {
  const searchParams = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const categorie = searchParams.get('categorie') || undefined;
  const marque = searchParams.get('marque') || undefined;
  const format = searchParams.get('format') || undefined;
  const q = searchParams.get('q') || undefined;
  const tri = (searchParams.get('tri') as SortOption) || undefined;
  const page = parseInt(searchParams.get('page') || '1', 10) || 1;

  const { results, total, page: currentPage, totalPages } = filterProducts({
    categorie,
    marque,
    format,
    q,
    tri,
    page,
    pageSize: PAGE_SIZE,
  });

  const breadcrumbItems = [
    { label: 'Accueil', href: '/' },
    { label: 'Catalogue complet' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-4">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      <div className="flex gap-6">
        <CatalogFilters className="hidden lg:block" />

        <div className="flex-1 min-w-0">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h1 className="sr-only text-2xl font-bold text-graphite-900 font-display">Catalogue complet</h1>
            <p className="text-sm text-graphite-600">
              {total} produit{total !== 1 ? 's' : ''} trouvé{total !== 1 ? 's' : ''}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-md border border-graphite-200 px-3 py-1.5 text-sm text-graphite-600 hover:bg-graphite-50 transition-colors lg:hidden focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none"
              >
                <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                Filtrer
              </button>
              <CatalogSort />
            </div>
          </div>

          {results.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {results.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <div className="mt-8">
                <CatalogPagination currentPage={currentPage} totalPages={totalPages} />
              </div>
            </>
          ) : (
            <EmptyState
              variant="filter"
              title="Aucun produit trouvé"
              description="Essayez de modifier vos filtres ou votre recherche."
              action={{ label: 'Voir tout le catalogue', href: '/catalogue' }}
            />
          )}
        </div>
      </div>

      <MobileFilterDrawer
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        resultCount={total}
      />
    </div>
  );
}

export default CatalogueContent;
