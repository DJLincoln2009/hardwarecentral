const IMAGEKIT_PREFIX = 'https://ik.imagekit.io/3sihhe4l4/';

export interface ProductImageOptions {
  width?: number;
  height?: number;
  quality?: number;
}

/**
 * Construit l'URL optimisée ImageKit pour une image produit :
 * - `cm-pad_resize` : redimensionne en conservant les proportions et complète le reste par un fond
 * - `bg-FFFFFF` : uniformise le fond en blanc pur quelle que soit la source (transparent, gris…)
 * - `q-80` / `f-auto` : compression raisonnable + WebP/AVIF selon le navigateur
 *
 * Les URLs hors ImageKit sont renvoyées telles quelles (aucune transformation possible).
 */
export function getProductImageUrl(url: string, opts: ProductImageOptions = {}): string {
  if (!url.startsWith(IMAGEKIT_PREFIX)) {
    return url;
  }
  const width = opts.width ?? 600;
  const height = opts.height ?? width;
  const quality = opts.quality ?? 80;
  const transform = `w-${width},h-${height},cm-pad_resize,bg-FFFFFF,q-${quality},f-auto`;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}tr=${transform}`;
}

/** Placeholder neutre (même teinte que `surface-muted`) affiché pendant le chargement. */
export const PRODUCT_IMAGE_BLUR =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjRmMmVjIi8+PC9zdmc+';
