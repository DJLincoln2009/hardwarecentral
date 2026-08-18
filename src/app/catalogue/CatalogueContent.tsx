import Breadcrumb from '@/components/layout/Breadcrumb';
import CatalogFilters from '@/components/catalog/CatalogFilters';
import CatalogSort from '@/components/catalog/CatalogSort';
import CatalogPagination from '@/components/catalog/CatalogPagination';
import CatalogMobileBar from '@/components/catalog/CatalogMobileBar';
import ProductCard from '@/components/product/ProductCard';
import EmptyState from '@/components/ui/EmptyState';
import { filterProducts, PAGE_SIZE, type SortOption } from '@/lib/data/filter-products';

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
  const page = Math.max(1, parseInt(get('page') || '1', 10) || 1);

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
    <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8 lg:px-6">
      <div className="mb-6 sm:mb-8">
        <div className="mb-4">
          <Breadcrumb items={breadcrumbItems} />
        </div>
        <div className="flex flex-wrap items-end justify-between gap-3 sm:gap-4">
          <div className="min-w-0">
            <p className="eyebrow mb-1.5">B2B · IT professionnel</p>
            <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl lg:text-display">
              Catalogue complet
            </h1>
          </div>
          <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-semibold text-muted shadow-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-600" aria-hidden="true" />
            {total} produit{total !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
        <CatalogFilters className="hidden lg:block" />

        <div className="flex-1 min-w-0">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p className="min-w-0 shrink text-sm text-muted">
              {q && (
                <>
                  Résultats pour &laquo;&nbsp;{q}&nbsp;&raquo; ·{' '}
                </>
              )}
              {tri && tri !== 'mix' ? 'Tris personnalisés appliqués' : 'Marques mélangées pour varier les références'}
            </p>
            <div className="flex items-center gap-2">
              <CatalogMobileBar resultCount={total} />
              <CatalogSort />
            </div>
          </div>

          {results.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {results.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <div className="mt-8 flex justify-center border-t border-border pt-6 sm:mt-10 sm:pt-8">
                <CatalogPagination currentPage={currentPage} totalPages={totalPages} />
              </div>
            </>
          ) : (
            <div className="py-8 sm:py-12">
              <EmptyState
                variant="filter"
                title="Aucun produit trouvé"
                description="Essayez de modifier vos filtres ou votre recherche."
                action={{ label: 'Voir tout le catalogue', href: '/catalogue' }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CatalogueContent;
