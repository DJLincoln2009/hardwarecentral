import { NextRequest, NextResponse } from 'next/server';
import { contactMessageSchema } from '@/lib/validations/forms';
import { sendTransactionalEmail } from '@/lib/email';
import { SITE_CONFIG } from '@/lib/site-config';
import { checkRateLimit } from '@/lib/rate-limit';

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown';

  if (!(await checkRateLimit(`ratelimit:contact:${ip}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS))) {
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

  try {
    await sendTransactionalEmail({
      to: { email: SITE_CONFIG.email.contact },
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
