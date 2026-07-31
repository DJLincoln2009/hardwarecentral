import type { MetadataRoute } from 'next';
import { products } from '@/lib/data/products';
import { getActiveBrands } from '@/lib/data/brands';
import { SITE_CONFIG } from '@/lib/site-config';

const BASE_URL = SITE_CONFIG.domain;

const staticRoutes: { path: string; priority: string }[] = [
  { path: '/', priority: '1.0' },
  { path: '/catalogue', priority: '0.9' },
  { path: '/marques', priority: '0.8' },
  { path: '/a-propos', priority: '0.6' },
  { path: '/contact', priority: '0.6' },
  { path: '/mentions-legales', priority: '0.3' },
  { path: '/cgv', priority: '0.3' },
  { path: '/confidentialite', priority: '0.3' },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${BASE_URL}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.path === '/' ? 'weekly' as const : 'monthly' as const,
    priority: parseFloat(route.priority),
  }));

  const brandEntries: MetadataRoute.Sitemap = getActiveBrands().map((brand) => ({
    url: `${BASE_URL}/marques/${brand.code.toLowerCase()}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const productEntries: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${BASE_URL}/produit/${product.id}`,
    lastModified: new Date(product.publishedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [...staticEntries, ...brandEntries, ...productEntries];
}
