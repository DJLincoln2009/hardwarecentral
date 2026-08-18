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

const contactItems = [
  {
    icon: Phone,
    label: 'Téléphone',
    content: (
      <a
        href={`tel:${SITE_CONFIG.phone.e164}`}
        className="text-sm text-muted transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
      >
        {SITE_CONFIG.phone.display}
      </a>
    ),
  },
  {
    icon: Mail,
    label: 'E-mail',
    content: (
      <a
        href={`mailto:${SITE_CONFIG.email.contact}`}
        className="text-sm text-muted transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
      >
        {SITE_CONFIG.email.contact}
      </a>
    ),
  },
  {
    icon: MapPin,
    label: 'Adresse',
    content: (
      <address className="not-italic text-sm text-muted">
        {SITE_CONFIG.address.line1}
        <br />
        {SITE_CONFIG.address.city}, {SITE_CONFIG.address.country}
      </address>
    ),
  },
  {
    icon: Clock,
    label: "Horaires d'ouverture",
    content: (
      <p className="text-sm text-muted">
        {SITE_CONFIG.businessHours.display}
        <br />
        <span className="text-xs text-muted">{SITE_CONFIG.businessHours.timezone}</span>
      </p>
    ),
  },
];

export default function ContactPage() {
  const breadcrumbItems = [
    { label: 'Accueil', href: '/' },
    { label: 'Contact' },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8 lg:px-6">
      <div className="mb-6 sm:mb-8">
        <div className="mb-4">
          <Breadcrumb items={breadcrumbItems} />
        </div>
        <div>
          <p className="eyebrow mb-1.5">Support &amp; commercial</p>
          <h1 className="font-display text-[1.75rem] font-extrabold tracking-tight text-foreground sm:text-display md:text-[2.5rem]">
            Nous contacter
          </h1>
        </div>
      </div>

      <div className="grid gap-6 sm:gap-8 lg:grid-cols-5">
        <section className="lg:col-span-2" aria-label="Coordonnées">
          <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-3 lg:grid-cols-1">
            {contactItems.map((item) => (
              <div
                key={item.label}
                className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-4 shadow-xs sm:p-5"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300">
                  <item.icon className="h-4.5 w-4.5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.label}</p>
                  <div className="mt-1">{item.content}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="lg:col-span-3" aria-label="Formulaire de contact">
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs sm:p-6 md:p-8">
            <h2 className="font-display text-xl font-extrabold tracking-tight text-foreground sm:text-title">
              Envoyez-nous un message
            </h2>
            <p className="mt-2 text-sm text-muted">
              Un commercial vous répondra dans les plus brefs délais.
            </p>
            <div className="mt-6">
              <ContactForm />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
