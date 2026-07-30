'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { MediaAsset } from '@/types';

interface ProductGalleryProps {
  images: MediaAsset[];
  productName: string;
}

function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selected, setSelected] = useState(0);

  if (images.length === 0) return null;

  const current = images[selected];

  return (
    <div className="flex flex-col gap-2">
      <div className="relative flex items-center justify-center overflow-hidden rounded-lg border border-graphite-200 bg-graphite-50 aspect-[4/3]">
        <Image
          src={current.url}
          alt={current.alt || productName}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-contain p-4"
          priority
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto" role="tablist" aria-label="Sélectionner une image">
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === selected}
              aria-label={`Voir l'image ${i + 1} de ${productName}`}
              onClick={() => setSelected(i)}
              className={`flex-shrink-0 relative w-16 h-16 rounded-md border-2 overflow-hidden transition-colors focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none ${
                i === selected ? 'border-teal-600' : 'border-graphite-200 hover:border-graphite-400'
              }`}
            >
              <Image
                src={img.url}
                alt=""
                fill
                sizes="64px"
                className="object-contain p-1"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductGallery;
