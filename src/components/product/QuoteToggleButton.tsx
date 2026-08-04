'use client';

import { Check, Plus } from 'lucide-react';
import { useQuoteStore } from '@/lib/stores/quote-store';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';
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
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200 active:scale-[0.97]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        inQuote
          ? 'border border-border-strong bg-surface text-foreground hover:bg-surface-muted'
          : 'bg-teal-600 text-white shadow-sm hover:bg-teal-700 hover:shadow-md',
        sizeStyles[size],
        className,
      )}
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
