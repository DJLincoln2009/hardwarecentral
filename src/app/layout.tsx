import type { Metadata } from 'next';
import { IBM_Plex_Sans, IBM_Plex_Mono, Manrope } from 'next/font/google';
import SkipLink from '@/components/ui/SkipLink';
import ToastProvider from '@/components/ui/Toast';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WhatsAppBubble from '@/components/layout/WhatsAppBubble';
import { SITE_CONFIG } from '@/lib/site-config';
import './globals.css';

const ibmPlexSans = IBM_Plex_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
});

const manrope = Manrope({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['700', '800'],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.domain),
  title: {
    default: `${SITE_CONFIG.companyName} — Équipements IT professionnels pour l'Afrique Centrale`,
    template: `%s | ${SITE_CONFIG.companyName}`,
  },
  description:
    'HardwareCentral est votre plateforme de référence pour l\'acquisition d\'équipements informatiques professionnels au Cameroun et dans la zone CEMAC.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_CONFIG.companyName,
    url: SITE_CONFIG.domain,
    logo: `${SITE_CONFIG.domain}/logo.png`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: SITE_CONFIG.address.line1,
      addressLocality: SITE_CONFIG.address.city,
      addressCountry: SITE_CONFIG.address.country,
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: SITE_CONFIG.phone.e164,
        contactType: 'sales',
        email: SITE_CONFIG.email.contact,
      },
    ],
  };

  return (
    <html
      lang="fr"
      className={`${ibmPlexSans.variable} ${manrope.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <SkipLink />
        <ToastProvider>
          <Header />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <Footer />
          <WhatsAppBubble />
        </ToastProvider>
      </body>
    </html>
  );
}
