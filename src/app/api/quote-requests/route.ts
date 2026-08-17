import { NextRequest, NextResponse } from 'next/server';
import { quoteRequestSchema } from '@/lib/validations/forms';
import { sendTransactionalEmail } from '@/lib/email';
import { getProductById } from '@/lib/data/products';
import { SITE_CONFIG } from '@/lib/site-config';
import { escapeHtml } from '@/lib/email/sanitize';
import { RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS } from '@/lib/rate-limit';
import { getClientIp, parseAndValidateBody, checkRouteRateLimit } from '@/lib/api-helpers';

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rateCheck = await checkRouteRateLimit(`ratelimit:quote:${ip}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);
  if ('error' in rateCheck) return rateCheck.error;

  const body = await parseAndValidateBody(request, quoteRequestSchema);
  if ('error' in body) return body.error;

  const { fullName, companyName, professionalEmail, phone, message, items } = body.data;

  const validItems = items
    .map(({ productId, quantity }) => {
      const p = getProductById(productId);
      return p ? { product: p, quantity } : null;
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);

  try {
    const productListHtml = validItems
      .map(
        ({ product: p, quantity }) =>
          `- ${escapeHtml(p.name)} (SKU: ${escapeHtml(p.sku)}) × ${quantity} — <a href="${SITE_CONFIG.domain}/produit/${escapeHtml(p.id)}">${escapeHtml(p.id)}</a>`,
      )
      .join('<br>');

    await sendTransactionalEmail({
      to: { email: SITE_CONFIG.email.contact },
      subject: `Nouvelle demande de devis de ${escapeHtml(fullName)}`,
      html: `
        <p><strong>Nom :</strong> ${escapeHtml(fullName)}</p>
        <p><strong>Société :</strong> ${escapeHtml(companyName ?? '—')}</p>
        <p><strong>E-mail :</strong> ${escapeHtml(professionalEmail)}</p>
        <p><strong>Téléphone :</strong> ${escapeHtml(phone ?? '—')}</p>
        <p><strong>Message :</strong></p>
        <p>${escapeHtml(message)}</p>
        <p><strong>Produits demandés :</strong></p>
        <p>${productListHtml || 'Aucun produit valide'}</p>
      `,
    });

    await sendTransactionalEmail({
      to: { email: professionalEmail, name: fullName },
      subject: 'Nous avons bien reçu votre demande de devis',
      html: `
        <p>Bonjour ${escapeHtml(fullName)},</p>
        <p>Nous accusons réception de votre demande de devis.</p>
        <p>Notre équipe commerciale vous recontactera sous 48 à 72 heures ouvrées.</p>
        <p>Cordialement,<br>L&apos;équipe ${escapeHtml(SITE_CONFIG.companyName)}</p>
      `,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Erreur lors de l\'envoi. Veuillez réessayer.' }, { status: 500 });
  }
}
