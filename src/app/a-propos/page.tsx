import type { Metadata } from 'next';
import Breadcrumb from '@/components/layout/Breadcrumb';
import TrustBadges from '@/components/sections/TrustBadges';
import BrandsGrid from '@/components/sections/BrandsGrid';
import { SITE_CONFIG } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'À propos',
  description:
    'Découvrez HardwareCentral, plateforme de référence pour l\'acquisition d\'équipements informatiques professionnels au Cameroun et dans la zone CEMAC.',
  alternates: { canonical: '/a-propos' },
  openGraph: {
    title: 'À propos | HardwareCentral',
    description:
      'Découvrez HardwareCentral, plateforme de référence pour l\'acquisition d\'équipements informatiques professionnels au Cameroun et dans la zone CEMAC.',
  },
};

const identityRows = [
  { label: 'Raison sociale', value: SITE_CONFIG.companyName },
  {
    label: 'Siège social',
    value: `${SITE_CONFIG.address.line1}, ${SITE_CONFIG.address.city}, ${SITE_CONFIG.address.country}`,
  },
  { label: 'Téléphone', value: SITE_CONFIG.phone.display },
  { label: 'E-mail', value: SITE_CONFIG.email.contact },
  { label: 'Horaires', value: SITE_CONFIG.businessHours.display },
  { label: 'Fuseau horaire', value: SITE_CONFIG.businessHours.timezone },
];

export default function AboutPage() {
  const breadcrumbItems = [
    { label: 'Accueil', href: '/' },
    { label: 'À propos' },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 lg:px-6">
      <div className="mb-4">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      <section className="relative isolate mb-14 overflow-hidden rounded-3xl bg-graphite-950 px-6 py-12 md:px-10 md:py-14">
        <div className="absolute inset-0 -z-10 bg-grid opacity-50" aria-hidden="true" />
        <div
          className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full bg-hero-glow blur-3xl"
          aria-hidden="true"
        />
        <div className="relative">
          <p className="eyebrow mb-3 text-graphite-400">À propos</p>
          <h1 className="max-w-2xl font-display text-display font-extrabold tracking-tight text-white">
            À propos de {SITE_CONFIG.companyName}
          </h1>
          <div className="mt-6 max-w-3xl space-y-4 text-sm leading-relaxed text-graphite-300 md:text-base">
            <p>
              {SITE_CONFIG.companyName} est une plateforme digitale basée à {SITE_CONFIG.address.city},
              Cameroun, dédiée à la distribution d&apos;équipements et d&apos;infrastructures informatiques
              professionnelles pour les entreprises de la zone CEMAC.
            </p>
            <p>
              Nous accompagnons les DSI, intégrateurs et acheteurs IT dans la sélection et
              l&apos;acquisition de serveurs, solutions de stockage, équipements réseau, sécurité
              informatique, vidéosurveillance et stations de travail — auprès des plus grandes marques du
              marché.
            </p>
            {/* TODO: Confirmer la raison sociale exacte et le rôle de BTS vis-à-vis de
                HardwareCentral avant publication définitive (cf. mentions légales). */}
            <p>
              Le site est exploité par la société BTS, qui opère sous le nom commercial{' '}
              {` `}
              HardwareCentral.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-14">
        <h2 className="mb-6 font-display text-title font-extrabold tracking-tight text-foreground">
          Pourquoi nous choisir
        </h2>
        <TrustBadges />
      </section>

      <section className="mb-14">
        <h2 className="mb-3 font-display text-title font-extrabold tracking-tight text-foreground">
          Nos marques
        </h2>
        <p className="mb-6 text-sm text-muted">
          Nous distribuons les leaders mondiaux de l&apos;infrastructure IT.
        </p>
        <BrandsGrid />
        <p className="mx-auto mt-6 max-w-2xl text-center text-xs leading-relaxed text-muted">
          Les logos et marques cités restent la propriété de leurs titulaires respectifs. Leur
          présence n&apos;implique aucun parrainage, aucune affiliation ni aucun partenariat officiel
          avec {SITE_CONFIG.companyName}.
        </p>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-6 shadow-xs md:p-8">
        <h2 className="font-display text-xl font-extrabold tracking-tight text-foreground">
          Identité légale
        </h2>
        <dl className="mt-5 grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
          {identityRows.map((row) => (
            <div key={row.label}>
              <dt className="eyebrow">{row.label}</dt>
              <dd className="mt-1.5 text-sm text-foreground">{row.value}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
