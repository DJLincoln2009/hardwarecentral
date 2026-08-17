import { NextRequest, NextResponse } from 'next/server';
import { newsletterSchema } from '@/lib/validations/forms';
import { addNewsletterSubscriber } from '@/lib/email';
import { NEWSLETTER_RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS } from '@/lib/rate-limit';
import { getClientIp, parseAndValidateBody, checkRouteRateLimit } from '@/lib/api-helpers';

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rateCheck = await checkRouteRateLimit(`ratelimit:newsletter:${ip}`, NEWSLETTER_RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);
  if ('error' in rateCheck) return rateCheck.error;

  const body = await parseAndValidateBody(request, newsletterSchema);
  if ('error' in body) return body.error;

  const { email } = body.data;

  try {
    const { alreadySubscribed } = await addNewsletterSubscriber(email);
    if (alreadySubscribed) {
      return NextResponse.json({ success: true, message: 'Vous êtes déjà inscrit' }, { status: 200 });
    }
    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Erreur lors de l\'inscription. Veuillez réessayer.' }, { status: 500 });
  }
}
