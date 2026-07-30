import type { Metadata } from 'next';
import Hero from '@/components/sections/Hero';
import TrustBadges from '@/components/sections/TrustBadges';
import CategoryGrid from '@/components/sections/CategoryGrid';
import FeaturedProducts from '@/components/sections/FeaturedProducts';
import BrandsGrid from '@/components/sections/BrandsGrid';
import NewsletterForm from '@/components/forms/NewsletterForm';

export const metadata: Metadata = {
  title: 'Accueil',
  description:
    'HardwareCentral — Équipements et infrastructures informatiques professionnels pour les entreprises au Cameroun et dans la zone CEMAC.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'HardwareCentral — Équipements IT professionnels pour l\'Afrique Centrale',
    description:
      'Plateforme de référence pour l\'acquisition d\'équipements informatiques professionnels : serveurs, stockage, réseau, sécurité, vidéosurveillance.',
  },
};

export default function Home() {
  return (
    <>
      <Hero />
      <section className="px-4 py-12 md:py-16">
        <div className="mx-auto max-w-7xl">
          <TrustBadges />
        </div>
      </section>
      <CategoryGrid />
      <FeaturedProducts />
      <section className="bg-graphite-50 px-4 py-12 md:py-16">
        <div className="mx-auto max-w-7xl">
          <BrandsGrid />
        </div>
      </section>
      <section className="px-4 py-12 md:py-16">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 text-center">
          <h2 className="text-2xl font-bold text-graphite-900 font-display md:text-3xl">
            Restez informé
          </h2>
          <p className="text-sm text-graphite-600 md:text-base">
            Recevez nos actualités et nouveaux produits par e-mail.
          </p>
          <div className="w-full max-w-md">
            <NewsletterForm />
          </div>
        </div>
      </section>
    </>
  );
}
