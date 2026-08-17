import { NextRequest, NextResponse } from 'next/server';
import { contactMessageSchema } from '@/lib/validations/forms';
import { sendTransactionalEmail } from '@/lib/email';
import { SITE_CONFIG } from '@/lib/site-config';
import { escapeHtml } from '@/lib/email/sanitize';
import { RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS } from '@/lib/rate-limit';
import { getClientIp, parseAndValidateBody, checkRouteRateLimit } from '@/lib/api-helpers';

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rateCheck = await checkRouteRateLimit(`ratelimit:contact:${ip}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);
  if ('error' in rateCheck) return rateCheck.error;

  const body = await parseAndValidateBody(request, contactMessageSchema);
  if ('error' in body) return body.error;

  const { firstName, lastName, companyName, professionalEmail, subject, message } = body.data;
  const fullName = `${firstName} ${lastName}`;

  try {
    await sendTransactionalEmail({
      to: { email: SITE_CONFIG.email.contact },
      subject: `Nouveau message de ${escapeHtml(fullName)} — ${escapeHtml(subject)}`,
      html: `
        <p><strong>Nom :</strong> ${escapeHtml(fullName)}</p>
        <p><strong>Société :</strong> ${escapeHtml(companyName ?? '—')}</p>
        <p><strong>E-mail :</strong> ${escapeHtml(professionalEmail)}</p>
        <p><strong>Sujet :</strong> ${escapeHtml(subject)}</p>
        <p><strong>Message :</strong></p>
        <p>${escapeHtml(message)}</p>
      `,
    });

    await sendTransactionalEmail({
      to: { email: professionalEmail, name: fullName },
      subject: 'Accusé de réception — HardwareCentral',
      html: `
        <p>Bonjour ${escapeHtml(fullName)},</p>
        <p>Nous avons bien reçu votre message.</p>
        <p>Notre équipe vous répondra dans les plus brefs délais.</p>
        <p>Cordialement,<br>L&apos;équipe ${escapeHtml(SITE_CONFIG.companyName)}</p>
      `,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Erreur lors de l\'envoi. Veuillez réessayer.' }, { status: 500 });
  }
}
