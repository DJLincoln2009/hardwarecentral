'use client';

import { useState } from 'react';
import { Trash2, FileText } from 'lucide-react';
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
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="mb-6">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {products.length > 0 ? (
        <>
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-graphite-900 font-display">
              Ma liste de devis ({products.length})
            </h1>
            <button
              type="button"
              onClick={clearAll}
              className="text-sm text-danger-text hover:underline focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none rounded-sm"
            >
              Tout vider
            </button>
          </div>

          <ul className="space-y-3">
            {products.map(({ productId, name, sku, brand, product }) => (
              <li
                key={productId}
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
                    href={`/produit/${productId}`}
                    className="text-sm font-medium text-graphite-900 hover:text-teal-600 transition-colors line-clamp-1"
                  >
                    {name}
                  </Link>
                  <p className="text-xs text-graphite-500">
                    {brand} &middot; SKU: {sku}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(productId)}
                  aria-label={`Retirer ${name}`}
                  className="p-2.5 text-graphite-400 hover:text-danger-text transition-colors rounded-sm focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>

          <Button
            type="button"
            size="lg"
            onClick={() => setQuoteModalOpen(true)}
            className="mt-6 w-full justify-center"
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
