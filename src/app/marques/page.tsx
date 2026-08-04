import type { Metadata } from 'next';
import { getActiveBrands } from '@/lib/data/brands';
import Breadcrumb from '@/components/layout/Breadcrumb';
import BrandCard from './BrandCard';
import { SITE_CONFIG } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Marques',
  description:
    'Découvrez les marques leaders du marché que nous distribuons : HPE, HP Inc., Dell, Fortinet, Cisco, Huawei, Hikvision.',
  alternates: { canonical: '/marques' },
  openGraph: {
    title: 'Marques | HardwareCentral',
    description:
      'Découvrez les marques leaders du marché que nous distribuons : HPE, HP Inc., Dell, Fortinet, Cisco, Huawei, Hikvision.',
  },
};

export default function BrandsPage() {
  const brands = getActiveBrands();

  const breadcrumbItems = [
    { label: 'Accueil', href: '/' },
    { label: 'Marques' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <div className="mb-8">
        <div className="mb-4">
          <Breadcrumb items={breadcrumbItems} />
        </div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow mb-1.5">Constructeurs</p>
            <h1 className="font-display text-display font-extrabold tracking-tight text-foreground">
              Nos marques
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
              Nous distribuons les plus grandes marques d&apos;infrastructure IT — serveurs,
              réseau, sécurité et vidéosurveillance.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-semibold text-muted shadow-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-600" aria-hidden="true" />
            {brands.length} marques
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {brands.map((brand) => (
          <BrandCard key={brand.code} brand={brand} />
        ))}
      </div>

      <p className="mx-auto mt-8 max-w-2xl text-center text-xs leading-relaxed text-muted">
        Les logos et marques cités sur ce site restent la propriété de leurs titulaires respectifs.
        Leur présence n&apos;implique aucun parrainage, aucune affiliation ni aucun partenariat
        officiel avec {SITE_CONFIG.companyName}.
      </p>
    </div>
  );
}
