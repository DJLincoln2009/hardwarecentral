import { NextRequest, NextResponse } from 'next/server';
import { contactMessageSchema } from '@/lib/validations/forms';
import { sendTransactionalEmail } from '@/lib/email';
import { SITE_CONFIG } from '@/lib/site-config';

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count += 1;
  return true;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown';

  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Trop de demandes. Veuillez réessayer plus tard.' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Requête invalide' }, { status: 400 });
  }

  const parsed = contactMessageSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return NextResponse.json({ error: 'Validation échouée', fieldErrors }, { status: 400 });
  }

  const { firstName, lastName, companyName, professionalEmail, subject, message } = parsed.data;
  const fullName = `${firstName} ${lastName}`;

  const ccSales = subject === 'devis';

  try {
    await sendTransactionalEmail({
      to: { email: ccSales ? SITE_CONFIG.email.contact : SITE_CONFIG.email.general },
      subject: `Nouveau message de ${fullName} — ${subject}`,
      html: `
        <p><strong>Nom :</strong> ${fullName}</p>
        <p><strong>Société :</strong> ${companyName ?? '—'}</p>
        <p><strong>E-mail :</strong> ${professionalEmail}</p>
        <p><strong>Sujet :</strong> ${subject}</p>
        <p><strong>Message :</strong></p>
        <p>${message}</p>
      `,
    });

    await sendTransactionalEmail({
      to: { email: professionalEmail, name: fullName },
      subject: 'Accusé de réception — HardwareCentral',
      html: `
        <p>Bonjour ${fullName},</p>
        <p>Nous avons bien reçu votre message.</p>
        <p>Notre équipe vous répondra dans les plus brefs délais.</p>
        <p>Cordialement,<br>L'équipe ${SITE_CONFIG.companyName}</p>
      `,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Erreur lors de l\'envoi. Veuillez réessayer.' }, { status: 500 });
  }
}
