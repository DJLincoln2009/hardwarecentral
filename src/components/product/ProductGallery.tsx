'use client';

import { useState } from 'react';
import { ZoomIn } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import ProductImage from './ProductImage';
import type { MediaAsset } from '@/types';
import { cn } from '@/lib/utils';

interface ProductGalleryProps {
  images: MediaAsset[];
  productName: string;
}

function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selected, setSelected] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (images.length === 0) return null;

  const current = images[selected];

  return (
    <div className="flex flex-col gap-3">
      <ProductImage
        src={current.url}
        alt={current.alt || productName}
        sizes="(max-width: 1024px) 100vw, 50vw"
        width={900}
        height={900}
        priority
        className="aspect-square w-full rounded-2xl border border-border bg-surface shadow-xs"
        imageClassName="p-3"
      >
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          aria-label="Agrandir l'image"
          className="absolute right-2.5 top-2.5 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface/90 text-muted shadow-sm backdrop-blur-sm transition-all duration-150 hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:right-3 sm:top-3 sm:h-11 sm:w-11"
        >
          <ZoomIn className="h-4.5 w-4.5" aria-hidden="true" />
        </button>
      </ProductImage>
      {images.length > 1 && (
        <div
          className="flex gap-2 overflow-x-auto no-scrollbar sm:gap-2.5"
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
                'relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border-2 bg-surface transition-all duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                i === selected
                  ? 'border-teal-600 shadow-sm'
                  : 'border-border opacity-70 hover:opacity-100',
              )}
            >
              <ProductImage
                src={img.url}
                alt=""
                sizes="64px"
                width={128}
                height={128}
                className="h-full w-full"
                imageClassName="p-1.5"
              />
            </button>
          ))}
        </div>
      )}

      <Modal
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        title={productName}
        size="lg"
      >
        <ProductImage
          src={current.url}
          alt={current.alt || productName}
          sizes="(max-width: 640px) 100vw, 80vw"
          width={1200}
          height={1200}
          className="aspect-square w-full rounded-xl border border-border bg-surface"
          imageClassName="p-4"
        />
        <p className="mt-3 text-center text-xs text-muted">
          {current.alt || productName}
        </p>
      </Modal>
    </div>
  );
}

export default ProductGallery;
