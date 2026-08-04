'use client';

import { useState } from 'react';
import { Trash2, FileText, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import Breadcrumb from '@/components/layout/Breadcrumb';
import Button from '@/components/ui/Button';
import QuoteRequestForm from '@/components/forms/QuoteRequestForm';
import EmptyState from '@/components/ui/EmptyState';
import { useQuoteStore } from '@/lib/stores/quote-store';
import { getProductById } from '@/lib/data/products';

function DevisContent() {
  const items = useQuoteStore((s) => s.items);
  const removeItem = useQuoteStore((s) => s.removeItem);
  const clearAll = useQuoteStore((s) => s.clearAll);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);

  const products = items
    .map((item) => {
      const p = getProductById(item.productId);
      return p ? { ...item, product: p } : null;
    })
    .filter((p): p is NonNullable<typeof p> => p !== null);

  const breadcrumbItems = [
    { label: 'Accueil', href: '/' },
    { label: 'Liste de devis' },
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
              <p className="eyebrow mb-1.5">Devis</p>
              <h1 className="font-display text-display font-extrabold tracking-tight text-foreground">
                Ma liste de devis
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-semibold text-muted shadow-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-600" aria-hidden="true" />
                {products.length} article{products.length !== 1 ? 's' : ''}
              </span>
              <button
                type="button"
                onClick={clearAll}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm font-medium text-muted transition-colors hover:text-danger-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                Tout vider
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {products.length > 0 ? (
        <>
          <ul className="space-y-3">
            {products.map(({ productId, name, sku, brand, product }) => (
              <li
                key={productId}
                className="group flex items-center gap-4 rounded-2xl border border-border bg-surface p-4 shadow-xs transition-all duration-200 hover:border-border-strong hover:shadow-md"
              >
                <div className="relative flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-surface-muted">
                  {product.primaryImage.url ? (
                    <Image
                      src={product.primaryImage.url}
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
                    href={`/produit/${productId}`}
                    className="text-sm font-semibold text-foreground transition-colors hover:text-accent line-clamp-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
                  >
                    {name}
                  </Link>
                  <p className="mt-0.5 font-mono text-xs text-faint">
                    {brand} &middot; SKU: {sku}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(productId)}
                  aria-label={`Retirer ${name}`}
                  className="rounded-lg p-2.5 text-faint transition-colors hover:bg-surface-muted hover:text-danger-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>

          <Button
            type="button"
            size="lg"
            glow
            icon={<ArrowRight className="h-4 w-4" />}
            onClick={() => setQuoteModalOpen(true)}
            className="mt-8 w-full justify-center"
          >
            Demander un devis pour ces {products.length} articles
          </Button>
        </>
      ) : (
        <EmptyState
          variant="quote"
          title="Votre liste de devis est vide"
          description="Ajoutez des produits depuis le catalogue pour préparer votre demande."
          action={{ label: 'Parcourir le catalogue', href: '/catalogue' }}
        />
      )}

      <QuoteRequestForm open={quoteModalOpen} onClose={() => setQuoteModalOpen(false)} />
    </div>
  );
}

export default DevisContent;
