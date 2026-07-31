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

export default function AboutPage() {
  const breadcrumbItems = [
    { label: 'Accueil', href: '/' },
    { label: 'À propos' },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="mb-6">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      <section className="mb-12 rounded-lg bg-graphite-50 p-8">
        <h1 className="text-3xl font-bold text-graphite-900 font-display">
          À propos de {SITE_CONFIG.companyName}
        </h1>
        <p className="mt-3 text-graphite-700 leading-relaxed">
          {SITE_CONFIG.companyName} est une plateforme digitale basée à {SITE_CONFIG.address.city}, Cameroun,
          dédiée à la distribution d&apos;équipements et d&apos;infrastructures informatiques professionnelles pour les
          entreprises de la zone CEMAC.
        </p>
        <p className="mt-4 text-graphite-700 leading-relaxed">
          Nous accompagnons les DSI, intégrateurs et acheteurs IT dans la sélection et l&apos;acquisition de serveurs,
          solutions de stockage, équipements réseau, sécurité informatique, vidéosurveillance et stations de travail
          — auprès des plus grandes marques du marché.
        </p>
        {/* TODO: Confirmer la raison sociale exacte et le rôle de BTS vis-à-vis de
            HardwareCentral avant publication définitive (cf. mentions légales). */}
        <p className="mt-4 text-graphite-700 leading-relaxed">
          Le site est exploité par la société BTS, qui opère sous le nom commercial
          {` `}HardwareCentral.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="mb-6 text-2xl font-bold text-graphite-900 font-display">Pourquoi nous choisir</h2>
        <TrustBadges />
      </section>

      <section className="mb-12">
        <h2 className="mb-6 text-2xl font-bold text-graphite-900 font-display">Nos marques partenaires</h2>
        <p className="mb-4 text-sm text-graphite-600">
          Nous distribuons les leaders mondiaux de l&apos;infrastructure IT.
        </p>
        <BrandsGrid />
      </section>

      <section className="rounded-lg border border-graphite-200 p-6">
        <h2 className="text-xl font-bold text-graphite-900 font-display">Identité légale</h2>
        <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-graphite-500">Raison sociale</dt>
            <dd className="text-sm text-graphite-900">{SITE_CONFIG.companyName}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-graphite-500">Siège social</dt>
            <dd className="text-sm text-graphite-900">
              {SITE_CONFIG.address.line1}, {SITE_CONFIG.address.city}, {SITE_CONFIG.address.country}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-graphite-500">Téléphone</dt>
            <dd className="text-sm text-graphite-900">{SITE_CONFIG.phone.display}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-graphite-500">E-mail</dt>
            <dd className="text-sm text-graphite-900">{SITE_CONFIG.email.contact}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-graphite-500">Horaires</dt>
            <dd className="text-sm text-graphite-900">{SITE_CONFIG.businessHours.display}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-graphite-500">Fuseau horaire</dt>
            <dd className="text-sm text-graphite-900">{SITE_CONFIG.businessHours.timezone}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
