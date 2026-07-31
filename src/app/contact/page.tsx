import type { Metadata } from 'next';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import Breadcrumb from '@/components/layout/Breadcrumb';
import ContactForm from '@/components/forms/ContactForm';
import { SITE_CONFIG } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Contactez HardwareCentral pour toute demande commerciale, technique ou partenariat. Devis, support technique, informations générales.',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Contact | HardwareCentral',
    description:
      'Contactez HardwareCentral pour toute demande commerciale, technique ou partenariat.',
  },
};

export default function ContactPage() {
  const breadcrumbItems = [
    { label: 'Accueil', href: '/' },
    { label: 'Contact' },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-6">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <section>
          <h1 className="mb-6 text-2xl font-bold text-graphite-900 font-display">Nous contacter</h1>

          <div className="space-y-5">
            <div className="flex items-start gap-3">
              <Phone className="mt-0.5 h-5 w-5 text-teal-600 shrink-0" aria-hidden="true" />
              <div>
                <p className="text-sm font-medium text-graphite-900">Téléphone</p>
                <a
                  href={`tel:${SITE_CONFIG.phone.e164}`}
                  className="text-sm text-graphite-600 hover:text-teal-600 transition-colors"
                >
                  {SITE_CONFIG.phone.display}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-5 w-5 text-teal-600 shrink-0" aria-hidden="true" />
              <div>
                <p className="text-sm font-medium text-graphite-900">E-mail</p>
                <a
                  href={`mailto:${SITE_CONFIG.email.contact}`}
                  className="text-sm text-graphite-600 hover:text-teal-600 transition-colors"
                >
                  {SITE_CONFIG.email.contact}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 text-teal-600 shrink-0" aria-hidden="true" />
              <div>
                <p className="text-sm font-medium text-graphite-900">Adresse</p>
                <address className="not-italic text-sm text-graphite-600">
                  {SITE_CONFIG.address.line1}<br />
                  {SITE_CONFIG.address.city}, {SITE_CONFIG.address.country}
                </address>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 h-5 w-5 text-teal-600 shrink-0" aria-hidden="true" />
              <div>
                <p className="text-sm font-medium text-graphite-900">Horaires d&apos;ouverture</p>
                <p className="text-sm text-graphite-600">
                  {SITE_CONFIG.businessHours.display}
                </p>
                <p className="text-xs text-graphite-600">{SITE_CONFIG.businessHours.timezone}</p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-6 text-xl font-bold text-graphite-900 font-display">Envoyez-nous un message</h2>
          <ContactForm />
        </section>
      </div>
    </div>
  );
}
