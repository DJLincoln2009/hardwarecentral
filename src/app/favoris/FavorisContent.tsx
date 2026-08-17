'use client';

import { Trash2, FileText, Heart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import Breadcrumb from '@/components/layout/Breadcrumb';
import QuoteToggleButton from '@/components/product/QuoteToggleButton';
import EmptyState from '@/components/ui/EmptyState';
import { useFavoritesStore } from '@/lib/stores/favorites-store';
import { getProductById } from '@/lib/data/products';
import { getProductImageUrl } from '@/lib/product-image';

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
    <div className="mx-auto max-w-3xl px-4 py-8 lg:px-6">
      <div className="mb-8">
        <div className="mb-4">
          <Breadcrumb items={breadcrumbItems} />
        </div>
        {products.length > 0 ? (
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow mb-1.5">Favoris</p>
              <h1 className="font-display text-display font-extrabold tracking-tight text-foreground">
                Mes favoris
              </h1>
              <p className="mt-3 text-sm text-muted">
                Ces produits sont sauvegardés localement dans votre navigateur.
              </p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-semibold text-muted shadow-xs">
              <Heart className="h-3.5 w-3.5 fill-danger-text text-danger-text" aria-hidden="true" />
              {products.length} article{products.length !== 1 ? 's' : ''}
            </span>
          </div>
        ) : null}
      </div>

      {products.length > 0 ? (
        <ul className="space-y-3">
          {products.map(({ id, product }) => (
            <li
              key={id}
              className="group flex items-center gap-4 rounded-2xl border border-border bg-surface p-4 shadow-xs transition-all duration-200 hover:border-border-strong hover:shadow-md"
            >
              <div className="relative flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-surface">
                {product.primaryImage.url ? (
                  <Image
                    src={getProductImageUrl(product.primaryImage.url, { width: 128, height: 128 })}
                    alt={product.primaryImage.alt}
                    fill
                    sizes="64px"
                    className="object-contain p-1.5"
                  />
                ) : (
                  <FileText className="h-6 w-6 text-faint" aria-hidden="true" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/produit/${id}`}
                  className="text-sm font-semibold text-foreground transition-colors hover:text-accent line-clamp-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
                >
                  {product.name}
                </Link>
                <p className="mt-0.5 font-mono text-xs text-muted">
                  {product.brand} &middot; SKU: {product.sku}
                </p>
              </div>
              <QuoteToggleButton product={product} size="sm" />
              <button
                type="button"
                onClick={() => toggle(id)}
                aria-label={`Retirer ${product.name} des favoris`}
                className="rounded-lg p-2.5 text-faint transition-colors hover:bg-surface-muted hover:text-danger-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
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
