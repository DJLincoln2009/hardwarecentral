import Breadcrumb from '@/components/layout/Breadcrumb';
import CatalogFilters from '@/components/catalog/CatalogFilters';
import CatalogSort from '@/components/catalog/CatalogSort';
import CatalogPagination from '@/components/catalog/CatalogPagination';
import CatalogMobileBar from '@/components/catalog/CatalogMobileBar';
import ProductCard from '@/components/product/ProductCard';
import EmptyState from '@/components/ui/EmptyState';
import { filterProducts, type SortOption } from '@/lib/data/filter-products';

const PAGE_SIZE = 12;

interface CatalogueContentProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

async function CatalogueContent({ searchParams }: CatalogueContentProps) {
  const params = await searchParams;

  const get = (key: string): string | undefined => {
    const value = params[key];
    if (Array.isArray(value)) return value[0];
    return value;
  };

  const categorie = get('categorie');
  const marque = get('marque');
  const format = get('format');
  const q = get('q');
  const tri = (get('tri') as SortOption) || undefined;
  const page = parseInt(get('page') || '1', 10) || 1;

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
              <CatalogMobileBar resultCount={total} />
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
    </div>
  );
}

export default CatalogueContent;
