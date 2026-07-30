import { NextRequest, NextResponse } from 'next/server';
import { quoteRequestSchema } from '@/lib/validations/forms';
import { sendTransactionalEmail } from '@/lib/email';
import { getProductById } from '@/lib/data/products';
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

  const parsed = quoteRequestSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return NextResponse.json({ error: 'Validation échouée', fieldErrors }, { status: 400 });
  }

  const { fullName, companyName, professionalEmail, phone, message, productIds } = parsed.data;

  const validProducts = productIds
    .map((id) => getProductById(id))
    .filter((p): p is NonNullable<typeof p> => p !== undefined);

  try {
    const productListHtml = validProducts
      .map((p) => `- ${p.name} (SKU: ${p.sku}) — <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/produit/${p.id}">${p.id}</a>`)
      .join('<br>');

    await sendTransactionalEmail({
      to: { email: SITE_CONFIG.email.contact },
      subject: `Nouvelle demande de devis de ${fullName}`,
      html: `
        <p><strong>Nom :</strong> ${fullName}</p>
        <p><strong>Société :</strong> ${companyName ?? '—'}</p>
        <p><strong>E-mail :</strong> ${professionalEmail}</p>
        <p><strong>Téléphone :</strong> ${phone ?? '—'}</p>
        <p><strong>Message :</strong></p>
        <p>${message}</p>
        <p><strong>Produits demandés :</strong></p>
        <p>${productListHtml || 'Aucun produit valide'}</p>
      `,
    });

    await sendTransactionalEmail({
      to: { email: professionalEmail, name: fullName },
      subject: 'Nous avons bien reçu votre demande de devis',
      html: `
        <p>Bonjour ${fullName},</p>
        <p>Nous accusons réception de votre demande de devis.</p>
        <p>Notre équipe commerciale vous recontactera sous 48 à 72 heures ouvrées.</p>
        <p>Cordialement,<br>L'équipe ${SITE_CONFIG.companyName}</p>
      `,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Erreur lors de l\'envoi. Veuillez réessayer.' }, { status: 500 });
  }
}
