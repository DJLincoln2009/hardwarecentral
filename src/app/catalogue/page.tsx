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

export default async function CataloguePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <CatalogueContent searchParams={searchParams} />;
}
