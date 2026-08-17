import { NextRequest, NextResponse } from 'next/server';
import { ZodSchema } from 'zod';
import { checkRateLimit } from '@/lib/rate-limit';

export function getClientIp(request: NextRequest): string {
  return (request.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || request.headers.get('x-real-ip') || 'unknown';
}

export async function parseAndValidateBody<T>(
  request: NextRequest,
  schema: ZodSchema<T>,
): Promise<{ data: T } | { error: NextResponse }> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return { error: NextResponse.json({ error: 'Requête invalide' }, { status: 400 }) };
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return { error: NextResponse.json({ error: 'Validation échouée', fieldErrors }, { status: 400 }) };
  }

  return { data: parsed.data };
}

export async function checkRouteRateLimit(
  key: string,
  max: number,
  windowMs: number,
): Promise<{ ok: boolean } | { error: NextResponse }> {
  if (!(await checkRateLimit(key, max, windowMs))) {
    return { error: NextResponse.json({ error: 'Trop de demandes. Veuillez réessayer plus tard.' }, { status: 429 }) };
  }
  return { ok: true };
}
