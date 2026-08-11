'use client';

import { useState } from 'react';
import ProductImage from './ProductImage';
import type { MediaAsset } from '@/types';
import { cn } from '@/lib/utils';

interface ProductGalleryProps {
  images: MediaAsset[];
  productName: string;
}

function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selected, setSelected] = useState(0);

  if (images.length === 0) return null;

  const current = images[selected];

  return (
    <div className="flex flex-col gap-3">
      <ProductImage
        src={current.url}
        alt={current.alt || productName}
        sizes="(max-width: 1024px) 100vw, 50vw"
        width={1200}
        height={900}
        priority
        className="aspect-[4/3] rounded-2xl border border-border bg-surface-muted shadow-xs"
        imageClassName="p-6"
      />
      {images.length > 1 && (
        <div
          className="flex gap-2.5 overflow-x-auto no-scrollbar"
          role="tablist"
          aria-label="Sélectionner une image"
        >
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === selected}
              aria-label={`Voir l'image ${i + 1} de ${productName}`}
              onClick={() => setSelected(i)}
              className={cn(
                'relative h-18 w-18 flex-shrink-0 overflow-hidden rounded-xl border-2 bg-surface-muted transition-all duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                i === selected
                  ? 'border-teal-600 shadow-sm'
                  : 'border-border opacity-70 hover:opacity-100',
              )}
            >
              <ProductImage
                src={img.url}
                alt=""
                sizes="72px"
                width={144}
                height={144}
                className="h-full w-full"
                imageClassName="p-1.5"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductGallery;
