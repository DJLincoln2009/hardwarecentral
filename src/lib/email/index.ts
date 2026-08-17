import { SITE_CONFIG } from '@/lib/site-config';

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_API_URL = 'https://api.brevo.com/v3';
const SENDER_EMAIL = SITE_CONFIG.email.contact;
const SENDER_NAME = SITE_CONFIG.companyName;
const NEWSLETTER_LIST_ID = SITE_CONFIG.brevo.newsletterListId;

interface SendEmailParams {
  to: { email: string; name?: string };
  subject: string;
  html: string;
}

async function brevoFetch(path: string, body: unknown): Promise<Response> {
  return fetch(`${BREVO_API_URL}${path}`, {
    method: 'POST',
    headers: {
      'api-key': BREVO_API_KEY ?? '',
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  });
}

export async function sendTransactionalEmail({ to, subject, html }: SendEmailParams): Promise<void> {
  if (!BREVO_API_KEY) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('BREVO_API_KEY is not configured — emails cannot be sent in production');
    }
    console.warn('[Brevo mock] Email non envoyé (mode développement) — to:', to.email, 'subject:', subject);
    return;
  }

  const res = await brevoFetch('/smtp/email', {
    sender: { email: SENDER_EMAIL, name: SENDER_NAME },
    to: [{ email: to.email, name: to.name }],
    subject,
    htmlContent: html,
  });

  if (!res.ok) {
    throw new Error(`Brevo sendEmail failed: ${res.status}`);
  }
}

export async function addNewsletterSubscriber(email: string): Promise<{ alreadySubscribed: boolean }> {
  if (!BREVO_API_KEY) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('BREVO_API_KEY is not configured — newsletter cannot be processed in production');
    }
    console.warn('[Brevo mock] Newsletter inscription simulée (mode développement)');
    return { alreadySubscribed: false };
  }

  const res = await brevoFetch('/contacts', {
    email,
    listIds: [NEWSLETTER_LIST_ID],
    updateEnabled: true,
  });

  if (res.status === 409) {
    return { alreadySubscribed: true };
  }

  if (!res.ok) {
    throw new Error(`Brevo addContact failed: ${res.status}`);
  }

  return { alreadySubscribed: false };
}

export { SITE_CONFIG };
