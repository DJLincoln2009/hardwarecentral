import type { Metadata } from 'next';
import { getActiveBrands } from '@/lib/data/brands';
import Breadcrumb from '@/components/layout/Breadcrumb';
import BrandCard from './BrandCard';

export const metadata: Metadata = {
  title: 'Marques partenaires',
  description:
    'Découvrez les marques leaders du marché que nous distribuons : HPE, Dell, Fortinet, Cisco, Huawei, Hikvision.',
  alternates: { canonical: '/marques' },
  openGraph: {
    title: 'Marques partenaires | HardwareCentral',
    description:
      'Découvrez les marques leaders du marché que nous distribuons : HPE, Dell, Fortinet, Cisco, Huawei, Hikvision.',
  },
};

export default function BrandsPage() {
  const brands = getActiveBrands();

  const breadcrumbItems = [
    { label: 'Accueil', href: '/' },
    { label: 'Marques' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-graphite-900 font-display">Nos marques partenaires</h1>
        <p className="mt-2 text-sm text-graphite-600">
          Nous distribuons les plus grandes marques d&apos;infrastructure IT.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {brands.map((brand) => (
          <BrandCard key={brand.code} brand={brand} />
        ))}
      </div>
    </div>
  );
}
