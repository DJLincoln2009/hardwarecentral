export const RATE_LIMIT_MAX = 5;
export const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
export const NEWSLETTER_RATE_LIMIT_MAX = 3;

const UPSTASH_REST_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

const memoryStore = new Map<string, { count: number; resetAt: number }>();

export async function checkRateLimit(
  key: string,
  max: number,
  windowMs: number,
): Promise<boolean> {
  if (UPSTASH_REST_URL && UPSTASH_REST_TOKEN) {
    return checkRateLimitUpstash(key, max, windowMs);
  }

  // Repli mémoire locale — non fiable en serverless (Vercel cold start).
  // Configurer UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN en prod.
  const now = Date.now();
  const entry = memoryStore.get(key);
  if (!entry || now > entry.resetAt) {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= max) return false;
  entry.count += 1;
  return true;
}

async function checkRateLimitUpstash(key: string, max: number, windowMs: number): Promise<boolean> {
  const windowSeconds = Math.max(1, Math.ceil(windowMs / 1000));
  try {
    const res = await fetch(`${UPSTASH_REST_URL}/pipeline`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${UPSTASH_REST_TOKEN}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify([
        ['INCR', key],
        ['EXPIRE', key, windowSeconds, 'NX'],
      ]),
      cache: 'no-store',
    });
    if (!res.ok) return false;
    const data: unknown = await res.json();
    const results = Array.isArray(data) ? data : (data as { result?: unknown[] })?.result;
    const first = Array.isArray(results) ? results[0] : undefined;
    const count = (first as { result?: number } | undefined)?.result ?? 0;
    return count <= max;
  } catch {
    return false;
  }
}
