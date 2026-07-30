import { Suspense } from 'react';
import type { Metadata } from 'next';
import CatalogueContent from './CatalogueContent';

export const metadata: Metadata = {
  title: 'Catalogue complet',
  description:
    'Découvrez l\'ensemble de notre catalogue d\'équipements informatiques professionnels : serveurs, stockage, réseau, sécurité, vidéosurveillance.',
  alternates: { canonical: '/catalogue' },
  openGraph: {
    title: 'Catalogue complet | HardwareCentral',
    description:
      'Découvrez l\'ensemble de notre catalogue d\'équipements informatiques professionnels : serveurs, stockage, réseau, sécurité, vidéosurveillance.',
  },
};

export default function CataloguePage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-8"><p className="text-graphite-600">Chargement du catalogue…</p></div>}>
      <CatalogueContent />
    </Suspense>
  );
}
