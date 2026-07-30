'use client';

import { Check, Plus } from 'lucide-react';
import { useQuoteStore } from '@/lib/stores/quote-store';
import { useToast } from '@/components/ui/Toast';
import type { Product } from '@/types';

interface QuoteToggleButtonProps {
  product: Pick<Product, 'id' | 'sku' | 'name' | 'brand'>;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

function QuoteToggleButton({ product, size = 'md', className = '' }: QuoteToggleButtonProps) {
  const items = useQuoteStore((s) => s.items);
  const toggleItem = useQuoteStore((s) => s.toggleItem);
  const { addToast } = useToast();
  const inQuote = items.some((i) => i.productId === product.id);

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5',
  };

  return (
    <button
      type="button"
      onClick={() => {
        toggleItem({ productId: product.id, sku: product.sku, name: product.name, brand: product.brand });
        addToast(inQuote ? 'Retiré de la liste de devis' : 'Ajouté à la liste de devis');
      }}
      className={`inline-flex items-center justify-center rounded-md font-medium transition-all duration-150 focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 focus-visible:outline-none ${
        inQuote
          ? 'border border-graphite-200 text-graphite-900 hover:bg-graphite-50'
          : 'bg-teal-600 text-white hover:bg-teal-800'
      } ${sizeStyles[size]} ${className}`}
    >
      {inQuote ? (
        <>
          <Check className="h-4 w-4" aria-hidden="true" />
          Ajouté ✓
        </>
      ) : (
        <>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Ajouter au devis
        </>
      )}
    </button>
  );
}

export default QuoteToggleButton;
