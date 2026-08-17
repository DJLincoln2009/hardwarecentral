'use client';

import Link from 'next/link';
import {
  Cctv,
  Heart,
  Laptop,
  Monitor,
  Network,
  Printer,
  Server,
  ShieldCheck,
  Wifi,
  type LucideIcon,
} from 'lucide-react';
import ProductImage from './ProductImage';
import ProductAvailabilityBadge from './ProductAvailabilityBadge';
import QuoteToggleButton from './QuoteToggleButton';
import { useFavoritesStore } from '@/lib/stores/favorites-store';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';
import type { CategoryId, Product } from '@/types';

interface ProductCardProps {
  product: Product;
}

const categoryIcons: Record<CategoryId, LucideIcon> = {
  'server-storage': Server,
  networking: Network,
  security: ShieldCheck,
  cctv: Cctv,
  laptop: Laptop,
  datacenter: Server,
  wireless: Wifi,
  monitor: Monitor,
  printers: Printer,
};

function ProductCard({ product }: ProductCardProps) {
  const isFav = useFavoritesStore((s) => s.has(product.id));
  const toggleFav = useFavoritesStore((s) => s.toggle);
  const { addToast } = useToast();

  const SpecIcon = categoryIcons[product.category];

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-all duration-300 ease-[var(--ease-out-expo)] hover:-translate-y-1 hover:border-border-strong hover:shadow-lg focus-within:border-border-strong">
      <Link href={`/produit/${product.id}`} className="flex flex-1 flex-col p-3">
        <div className="flex items-center justify-between gap-2">
          <ProductAvailabilityBadge status={product.availability.status} />
          <button
            type="button"
            aria-label={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            aria-pressed={isFav}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleFav(product.id);
              addToast(isFav ? 'Retiré des favoris' : 'Ajouté aux favoris');
            }}
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all duration-200 active:scale-95',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
              isFav
                ? 'border-danger-border bg-danger-bg text-danger-text'
                : 'border-border text-faint hover:border-border-strong hover:bg-surface-muted hover:text-foreground',
            )}
          >
            <Heart className={cn('h-3.5 w-3.5', isFav && 'fill-danger-text')} aria-hidden="true" />
          </button>
        </div>

        <ProductImage
          src={product.primaryImage.url}
          alt={product.primaryImage.alt}
          sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
          className="mt-3 aspect-square w-full bg-surface"
          imageClassName="p-3 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:scale-105"
        />

        <div className="mt-3 flex flex-col gap-1">
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="font-semibold uppercase tracking-[0.12em] text-muted">
              {product.brand}
            </span>
            <span className="font-mono text-muted">
              SKU: <strong className="font-medium text-foreground">{product.sku}</strong>
            </span>
          </div>
          <h3 className="text-sm font-semibold leading-snug text-foreground line-clamp-2">
            {product.name}
          </h3>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {product.specs.slice(0, 3).map((s) => (
              <span
                key={s.label}
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface-muted px-2 py-0.5 text-xs text-muted"
              >
                <SpecIcon className="h-3.5 w-3.5 text-faint" aria-hidden="true" />
                <span>{s.label} :</span>
                <span className="font-medium text-foreground">{s.value}</span>
              </span>
            ))}
          </div>
        </div>
      </Link>

      <div className="mt-3 border-t border-border px-3 pb-3 pt-2.5">
        <QuoteToggleButton product={product} size="md" className="w-full" />
      </div>
    </div>
  );
}

export default ProductCard;
