const IMAGEKIT_PREFIX = 'https://ik.imagekit.io/3sihhe4l4/';

export interface ProductImageOptions {
  width?: number;
  height?: number;
  quality?: number;
}

/**
 * Construit l'URL optimisée ImageKit pour une image produit :
 * - `w-N,h-N,cm-pad_resize` : redimensionne en conservant les proportions (padding neutre)
 * - `q-80` / `f-auto` : compression raisonnable + WebP/AVIF selon le navigateur
 *
 * NOTE — détourage `e-bgremove` DÉSACTIVÉ temporairement : l'extension IA d'ImageKit
 * renvoie 403 « Extensions limit exceeded » quand le quota mensuel du compte est épuisé,
 * ce qui casse le chargement des images non mises en cache. Le rendu détouré est à
 * réactiver (rétablir `e-bgremove,` en tête de `transform`) une fois le quota/extension
 * payante rétabli sur le tableau de bord ImageKit — TODO commercial.
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
  const transform = `w-${width},h-${height},cm-pad_resize,q-${quality},f-auto`;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}tr=${transform}`;
}

/** Placeholder neutre (blanc, même teinte que la surface des cartes) affiché pendant le chargement. */
export const PRODUCT_IMAGE_BLUR =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmZmZmZmIi8+PC9zdmc+';
