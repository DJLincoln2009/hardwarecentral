import type { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/lib/site-config';

const BASE_URL = SITE_CONFIG.domain;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/devis', '/favoris', '/recherche', '/api/'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
