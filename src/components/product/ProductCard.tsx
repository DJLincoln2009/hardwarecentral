'use client';

import Image from 'next/image';
import { Heart } from 'lucide-react';
import Link from 'next/link';
import ProductAvailabilityBadge from './ProductAvailabilityBadge';
import { useQuoteStore } from '@/lib/stores/quote-store';
import { useFavoritesStore } from '@/lib/stores/favorites-store';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
}

function ProductCard({ product }: ProductCardProps) {
  const toggleQuote = useQuoteStore((s) => s.toggleItem);
  const isFav = useFavoritesStore((s) => s.has(product.id));
  const toggleFav = useFavoritesStore((s) => s.toggle);
  const { addToast } = useToast();

  const slug = product.id;
  const inQuote = useQuoteStore((s) => s.items.some((i) => i.productId === product.id));

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-border-strong hover:shadow-lg focus-within:border-border-strong">
      <Link href={`/produit/${slug}`} className="flex flex-1 flex-col">
        <div className="relative m-3 mb-2 flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-surface-muted">
          <Image
            src={product.primaryImage.url}
            alt={product.primaryImage.alt}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className="object-contain p-4 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:scale-105"
          />
          <div className="absolute left-2.5 top-2.5">
            <ProductAvailabilityBadge status={product.availability.status} />
          </div>
        </div>

        <div className="flex flex-1 flex-col px-4 pb-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
            {product.brand}
          </p>
          <p className="mt-1 text-sm font-semibold leading-snug text-foreground line-clamp-2">
            {product.name}
          </p>
          <p className="mt-1 font-mono text-[11px] text-muted">SKU: {product.sku}</p>
          <div className="mt-2.5 space-y-1 border-t border-border pt-2.5">
            {product.specs.slice(0, 3).map((s) => (
              <p key={s.label} className="text-xs text-muted">
                <span className="font-medium text-foreground">{s.label} :</span> {s.value}
              </p>
            ))}
          </div>
          {product.availability.status !== 'available' && (
            <p className="mt-2 text-xs font-medium text-muted">
              Délai : {product.availability.leadTimeDays} jours
            </p>
          )}
        </div>
      </Link>

      <div className="mt-3 flex items-center gap-2 border-t border-border px-4 py-3">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            toggleQuote({ productId: product.id, sku: product.sku, name: product.name, brand: product.brand });
            addToast(inQuote ? 'Retiré de la liste de devis' : 'Ajouté à la liste de devis');
          }}
          className={cn(
            'flex-1 min-h-10 rounded-full px-3 py-2 text-xs font-semibold transition-all duration-200 active:scale-[0.97]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
            inQuote
              ? 'bg-surface-muted text-muted hover:bg-surface-strong'
              : 'bg-teal-600 text-white shadow-sm hover:bg-teal-700 hover:shadow-md',
          )}
        >
          {inQuote ? 'Retirer du devis' : 'Ajouter au devis'}
        </button>
        <button
          type="button"
          aria-label={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          aria-pressed={isFav}
          onClick={(e) => {
            e.preventDefault();
            toggleFav(product.id);
            addToast(isFav ? 'Retiré des favoris' : 'Ajouté aux favoris');
          }}
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-all duration-200 active:scale-95',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
            isFav
              ? 'border-danger-border bg-danger-bg text-danger-text'
              : 'border-border text-faint hover:border-border-strong hover:bg-surface-muted hover:text-foreground',
          )}
        >
          <Heart
            className={cn('h-4 w-4', isFav && 'fill-danger-text')}
            aria-hidden="true"
          />
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
