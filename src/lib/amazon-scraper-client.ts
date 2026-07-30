import { createHash } from 'crypto';

export interface AmazonScraperConfig {
  baseUrl?: string;
}

export interface AmazonProductResult {
  asin: string;
  title: string;
  brand: string;
  images: { url: string; width: number; height: number }[];
  bulletPoints: string[];
  mpn?: string;
}

export function createAmazonScraperClient(config?: AmazonScraperConfig) {
  const baseUrl = config?.baseUrl ?? 'http://127.0.0.1:8000';

  async function resolveAsin(
    brand: string,
    mpn: string,
  ): Promise<{ asin: string } | { candidates: string[] }> {
    const query = `${brand} ${mpn}`.replace(/[-\s]+/g, ' ').trim();
    try {
      const res = await fetch(
        `${baseUrl}/search?q=${encodeURIComponent(query)}&domain=fr`,
        { signal: AbortSignal.timeout(30000) },
      );
      if (!res.ok) return { candidates: [] };
      const data = await res.json();
      const results: { asin: string; title: string }[] = data.results ?? [];
      if (results.length > 0) {
        return { asin: results[0].asin };
      }
      return { candidates: results.map((r) => r.asin) };
    } catch {
      return { candidates: [] };
    }
  }

  async function fetchProduct(asin: string): Promise<AmazonProductResult | null> {
    try {
      const res = await fetch(
        `${baseUrl}/scrape?asin=${asin}&domain=fr&use_oxylabs=true`,
        { signal: AbortSignal.timeout(30000) },
      );
      if (!res.ok) return null;

      const data = await res.json();
      return {
        asin: data.asin,
        title: data.title ?? '',
        brand: data.brand ?? '',
        images: (data.images ?? []).map((url: string) => ({
          url,
          width: 1500,
          height: 1500,
        })),
        bulletPoints: data.bullet_points ?? [],
        mpn: undefined,
      };
    } catch {
      return null;
    }
  }

  return { resolveAsin, fetchProduct };
}

export function computeChecksum(buffer: Uint8Array): string {
  return createHash('sha256').update(buffer).digest('hex');
}
