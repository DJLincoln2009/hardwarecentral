import { SITE_CONFIG } from '@/lib/site-config';

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_API_URL = 'https://api.brevo.com/v3';
const SENDER_EMAIL = 'contact@hardware-central.com';
const SENDER_NAME = SITE_CONFIG.companyName;

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
    console.log('[Brevo mock] sendTransactionalEmail:', { to, subject, html });
    return;
  }

  const res = await brevoFetch('/smtp/email', {
    sender: { email: SENDER_EMAIL, name: SENDER_NAME },
    to: [{ email: to.email, name: to.name }],
    subject,
    htmlContent: html,
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Brevo sendEmail failed: ${res.status} ${body}`);
  }
}

export async function addNewsletterSubscriber(email: string): Promise<{ alreadySubscribed: boolean }> {
  if (!BREVO_API_KEY) {
    console.log('[Brevo mock] addNewsletterSubscriber:', email);
    return { alreadySubscribed: false };
  }

  const res = await brevoFetch('/contacts', {
    email,
    listIds: [2],
    updateEnabled: true,
  });

  if (res.status === 409) {
    return { alreadySubscribed: true };
  }

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Brevo addContact failed: ${res.status} ${body}`);
  }

  return { alreadySubscribed: false };
}

export { SITE_CONFIG };
