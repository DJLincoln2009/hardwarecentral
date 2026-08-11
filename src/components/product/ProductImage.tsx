'use client';

import type { ReactNode } from 'react';
import Image from 'next/image';
import { getProductImageUrl, PRODUCT_IMAGE_BLUR } from '@/lib/product-image';
import { cn } from '@/lib/utils';

interface ProductImageProps {
  src: string;
  alt: string;
  sizes: string;
  width?: number;
  height?: number;
  quality?: number;
  priority?: boolean;
  className?: string;
  imageClassName?: string;
  children?: ReactNode;
}

/**
 * Image produit à ratio fixe : fond neutre, `object-contain` avec padding de respiration,
 * transformations ImageKit (fond blanc uniformisé, compression) et blur placeholder au chargement.
 */
function ProductImage({
  src,
  alt,
  sizes,
  width = 600,
  height = 600,
  quality,
  priority = false,
  className,
  imageClassName,
  children,
}: ProductImageProps) {
  return (
    <div className={cn('relative flex items-center justify-center overflow-hidden', className)}>
      <Image
        src={getProductImageUrl(src, { width, height, quality })}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        placeholder="blur"
        blurDataURL={PRODUCT_IMAGE_BLUR}
        className={cn('object-contain', imageClassName)}
      />
      {children}
    </div>
  );
}

export default ProductImage;
