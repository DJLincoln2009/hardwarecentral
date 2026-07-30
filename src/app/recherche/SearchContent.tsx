'use client';

import { useSearchParams } from 'next/navigation';
import Breadcrumb from '@/components/layout/Breadcrumb';
import ProductCard from '@/components/product/ProductCard';
import EmptyState from '@/components/ui/EmptyState';
import { filterProducts, type SortOption } from '@/lib/data/filter-products';

const PAGE_SIZE = 12;

function SearchContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';
  const tri = (searchParams.get('tri') as SortOption) || undefined;
  const page = parseInt(searchParams.get('page') || '1', 10) || 1;

  const { results, total } = filterProducts({
    q: q || undefined,
    tri,
    page,
    pageSize: PAGE_SIZE,
  });

  const breadcrumbItems = [
    { label: 'Accueil', href: '/' },
    { label: q ? `Recherche : "${q}"` : 'Recherche' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      <div className="flex gap-6">
        <aside className="hidden w-[220px] flex-shrink-0 lg:block" aria-label="Filtres de recherche" />

        <div className="flex-1 min-w-0">
          <div className="mb-4">
            {q ? (
              <p className="text-sm text-graphite-600">
                {total} résultat{total !== 1 ? 's' : ''} pour &laquo;&nbsp;{q}&nbsp;&raquo;
              </p>
            ) : (
              <p className="text-sm text-graphite-600">Saisissez un terme de recherche.</p>
            )}
          </div>

          {results.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <EmptyState
              variant={q ? 'search' : 'empty'}
              title={q ? 'Aucun résultat' : 'Recherchez un produit'}
              description={
                q
                  ? `Aucun produit ne correspond à « ${q} ». Vérifiez l'orthographe ou essayez un autre terme.`
                  : 'Utilisez la barre de recherche pour trouver un produit par nom, marque ou référence.'
              }
              action={q ? { label: 'Voir tout le catalogue', href: '/catalogue' } : undefined}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default SearchContent;
