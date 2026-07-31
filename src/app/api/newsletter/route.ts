import { NextRequest, NextResponse } from 'next/server';
import { newsletterSchema } from '@/lib/validations/forms';
import { addNewsletterSubscriber } from '@/lib/email';
import { checkRateLimit } from '@/lib/rate-limit';

const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown';

  if (!(await checkRateLimit(`ratelimit:newsletter:${ip}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS))) {
    return NextResponse.json({ error: 'Trop de demandes. Veuillez réessayer plus tard.' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Requête invalide' }, { status: 400 });
  }

  const parsed = newsletterSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation échouée' }, { status: 400 });
  }

  const { email } = parsed.data;

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
