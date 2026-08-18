'use client';

import { useState } from 'react';
import { Minus, Plus, Truck, Clock } from 'lucide-react';
import QuoteToggleButton from './QuoteToggleButton';
import { useQuoteStore } from '@/lib/stores/quote-store';
import type { Product } from '@/types';

interface QuotePanelProps {
  product: Pick<Product, 'id' | 'sku' | 'name' | 'brand'>;
}

/**
 * Bloc de conversion de la fiche produit (B2B) : sélecteur de quantité avec
 * logique réelle (persistée dans le store devis), CTA « Ajouter au devis » et
 * ligne de réassurance compacte sous le bouton.
 */
function QuotePanel({ product }: QuotePanelProps) {
  const items = useQuoteStore((s) => s.items);
  const updateQuantity = useQuoteStore((s) => s.updateQuantity);
  const [pending, setPending] = useState(1);

  const inQuote = items.some((i) => i.productId === product.id);
  const storedQty = items.find((i) => i.productId === product.id)?.quantity ?? 1;
  const quantity = inQuote ? storedQty : pending;

  const step = (delta: number) => {
    const next = Math.min(999, Math.max(1, quantity + delta));
    if (inQuote) updateQuantity(product.id, next);
    setPending(next);
  };

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm max-sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center rounded-lg border border-border bg-surface-muted/50">
          <button
            type="button"
            onClick={() => step(-1)}
            aria-label="Diminuer la quantité"
            className="flex h-11 w-11 items-center justify-center rounded-l-lg text-muted transition-colors hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset"
          >
            <Minus className="h-4 w-4" aria-hidden="true" />
          </button>
          <span
            aria-live="polite"
            className="w-14 border-x border-border text-center font-mono text-sm font-semibold text-foreground"
          >
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => step(1)}
            aria-label="Augmenter la quantité"
            className="flex h-11 w-11 items-center justify-center rounded-r-lg text-muted transition-colors hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <QuoteToggleButton
          product={product}
          size="lg"
          className="flex-1 justify-center max-sm:w-full"
          quantity={quantity}
        />
      </div>

      <div className="grid grid-cols-2 gap-2.5 border-t border-border pt-3.5 mt-4 sm:gap-3 sm:pt-4">
        <div className="flex items-center gap-2.5">
          <Truck className="h-4 w-4 shrink-0 text-teal-600 dark:text-teal-300 sm:h-5 sm:w-5" aria-hidden="true" />
          <span className="text-xs leading-snug text-muted max-sm:text-[11px]">
            <span className="block font-semibold text-foreground">Livraison</span>
            Transport sécurisé en CEMAC
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <Clock className="h-4 w-4 shrink-0 text-teal-600 dark:text-teal-300 sm:h-5 sm:w-5" aria-hidden="true" />
          <span className="text-xs leading-snug text-muted max-sm:text-[11px]">
            <span className="block font-semibold text-foreground">Devis</span>
            Réponse sous 48-72h ouvrées
          </span>
        </div>
      </div>
    </div>
  );
}

export default QuotePanel;
