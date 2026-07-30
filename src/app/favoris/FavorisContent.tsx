'use client';

import { Trash2, FileText } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import Breadcrumb from '@/components/layout/Breadcrumb';
import QuoteToggleButton from '@/components/product/QuoteToggleButton';
import EmptyState from '@/components/ui/EmptyState';
import { useFavoritesStore } from '@/lib/stores/favorites-store';
import { getProductById } from '@/lib/data/products';

function FavorisContent() {
  const productIds = useFavoritesStore((s) => s.productIds);
  const toggle = useFavoritesStore((s) => s.toggle);

  const products = productIds
    .map((id) => ({ id, product: getProductById(id) }))
    .filter((p): p is { id: string; product: NonNullable<ReturnType<typeof getProductById>> } => p.product !== undefined);

  const breadcrumbItems = [
    { label: 'Accueil', href: '/' },
    { label: 'Favoris' },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="mb-6">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {products.length > 0 ? (
        <>
          <h1 className="mb-4 text-2xl font-bold text-graphite-900 font-display">
            Mes favoris ({products.length})
          </h1>
          <p className="mb-6 text-sm text-graphite-500">
            Ces produits sont sauvegardés localement dans votre navigateur.
          </p>

          <ul className="space-y-3">
            {products.map(({ id, product }) => (
              <li
                key={id}
                className="flex items-center gap-4 rounded-lg border border-graphite-200 bg-white p-4"
              >
                <div className="relative h-14 w-14 flex-shrink-0 rounded-md border border-graphite-100 bg-graphite-50 flex items-center justify-center overflow-hidden">
                  {product.primaryImage.url ? (
                    <Image
                      src={product.primaryImage.url}
                      alt={product.primaryImage.alt}
                      fill
                      sizes="56px"
                      className="object-contain"
                    />
                  ) : (
                    <FileText className="h-6 w-6 text-graphite-400" aria-hidden="true" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/produit/${id}`}
                    className="text-sm font-medium text-graphite-900 hover:text-teal-600 transition-colors line-clamp-1"
                  >
                    {product.name}
                  </Link>
                  <p className="text-xs text-graphite-500">
                    {product.brand} &middot; SKU: {product.sku}
                  </p>
                </div>
                <QuoteToggleButton product={product} size="sm" />
                <button
                  type="button"
                  onClick={() => toggle(id)}
                  aria-label={`Retirer ${product.name} des favoris`}
                  className="p-2.5 text-graphite-400 hover:text-danger-text transition-colors rounded-sm focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <EmptyState
          variant="favorites"
          title="Aucun favori pour le moment"
          description="Ajoutez des produits en favoris pour les retrouver facilement."
          action={{ label: 'Parcourir le catalogue', href: '/catalogue' }}
        />
      )}
    </div>
  );
}

export default FavorisContent;
