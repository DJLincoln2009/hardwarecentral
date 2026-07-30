'use client';

import Image from 'next/image';
import { Heart } from 'lucide-react';
import Link from 'next/link';
import ProductAvailabilityBadge from './ProductAvailabilityBadge';
import { useQuoteStore } from '@/lib/stores/quote-store';
import { useFavoritesStore } from '@/lib/stores/favorites-store';
import { useToast } from '@/components/ui/Toast';
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
    <div className="group relative flex flex-col rounded-lg border border-graphite-200 bg-white p-3 transition-shadow hover:shadow-md">
      <Link href={`/produit/${slug}`} className="flex flex-col flex-1">
        <div className="relative mb-2 flex items-center justify-center overflow-hidden rounded-md bg-graphite-50 aspect-square">
          <Image
            src={product.primaryImage.url}
            alt={product.primaryImage.alt}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className="object-contain p-2 transition-transform group-hover:scale-105"
          />
        </div>
        <ProductAvailabilityBadge status={product.availability.status} />
        <p className="mt-1.5 text-xs font-medium text-graphite-600 uppercase tracking-wide">
          {product.brand}
        </p>
        <p className="mt-0.5 text-sm font-semibold text-graphite-900 line-clamp-2">
          {product.name}
        </p>
        <p className="mt-0.5 text-xs font-mono text-graphite-400">SKU: {product.sku}</p>
        <div className="mt-1.5 space-y-0.5">
          {product.specs.slice(0, 4).map((s) => (
            <p key={s.label} className="text-xs text-graphite-600">
              <span className="font-medium">{s.label} :</span> {s.value}
            </p>
          ))}
        </div>
        {product.availability.status !== 'available' && (
          <p className="mt-1 text-xs text-graphite-500">
            Délai : {product.availability.leadTimeDays} jours
          </p>
        )}
      </Link>

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            toggleQuote({ productId: product.id, sku: product.sku, name: product.name, brand: product.brand });
            addToast(inQuote ? 'Retiré de la liste de devis' : 'Ajouté à la liste de devis');
          }}
          className={`flex-1 rounded-md min-h-11 px-3 py-2.5 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-1 focus-visible:outline-none ${
            inQuote
              ? 'bg-graphite-100 text-graphite-600 hover:bg-graphite-200'
              : 'bg-teal-600 text-white hover:bg-teal-800'
          }`}
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
          className="flex h-11 w-11 items-center justify-center rounded-md border border-graphite-200 transition-colors hover:bg-graphite-50 focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none"
        >
          <Heart
            className={`h-4 w-4 ${isFav ? 'fill-danger-text text-danger-text' : 'text-graphite-400'}`}
            aria-hidden="true"
          />
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
