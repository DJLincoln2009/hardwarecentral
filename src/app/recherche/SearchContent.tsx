import Breadcrumb from '@/components/layout/Breadcrumb';
import ProductCard from '@/components/product/ProductCard';
import EmptyState from '@/components/ui/EmptyState';
import { filterProducts, type SortOption } from '@/lib/data/filter-products';

const PAGE_SIZE = 12;

interface SearchContentProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

async function SearchContent({ searchParams }: SearchContentProps) {
  const params = await searchParams;

  const get = (key: string): string | undefined => {
    const value = params[key];
    if (Array.isArray(value)) return value[0];
    return value;
  };

  const q = get('q') || '';
  const tri = (get('tri') as SortOption) || undefined;
  const page = parseInt(get('page') || '1', 10) || 1;

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
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <div className="mb-8">
        <div className="mb-4">
          <Breadcrumb items={breadcrumbItems} />
        </div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow mb-1.5">Recherche</p>
            <h1 className="font-display text-display font-extrabold tracking-tight text-foreground">
              {q ? (
                <>
                  Résultats pour&nbsp;
                  <span className="text-gradient">&laquo;&nbsp;{q}&nbsp;&raquo;</span>
                </>
              ) : (
                'Recherchez un produit'
              )}
            </h1>
          </div>
          {q && (
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-semibold text-muted shadow-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-600" aria-hidden="true" />
              {total} résultat{total !== 1 ? 's' : ''}
            </span>
          )}
        </div>
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
  );
}

export default SearchContent;
