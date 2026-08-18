import type { Metadata } from 'next';
import { Mail } from 'lucide-react';
import Hero from '@/components/sections/Hero';
import TrustBadges from '@/components/sections/TrustBadges';
import CategoryGrid from '@/components/sections/CategoryGrid';
import FeaturedProducts from '@/components/sections/FeaturedProducts';
import BrandsGrid from '@/components/sections/BrandsGrid';
import NewsletterForm from '@/components/forms/NewsletterForm';
import { SITE_CONFIG } from '@/lib/site-config';

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
      <section className="px-4 py-10 md:py-16 sm:py-12">
        <div className="mx-auto max-w-7xl">
          <TrustBadges />
        </div>
      </section>
      <CategoryGrid />
      <FeaturedProducts />
      <section className="px-4 py-10 md:py-20 sm:py-14">
        <div className="mx-auto max-w-7xl">
          <div className="mb-9 text-center">
            <p className="eyebrow mb-2">Constructeurs</p>
            <h2 className="font-display text-title font-extrabold tracking-tight text-foreground">
              Les marques de référence
            </h2>
          </div>
          <BrandsGrid />
          <p className="mx-auto mt-6 max-w-2xl text-center text-xs leading-relaxed text-muted">
            Les logos et marques cités restent la propriété de leurs titulaires respectifs. Leur
            présence n&apos;implique aucun parrainage, aucune affiliation ni aucun partenariat officiel
            avec {SITE_CONFIG.companyName}.
          </p>
        </div>
      </section>
      <section className="relative isolate overflow-hidden bg-graphite-950 px-4 py-12 md:py-20 sm:py-16">
        <div className="absolute inset-0 -z-10 bg-grid opacity-50" aria-hidden="true" />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-56 max-w-2xl rounded-full bg-hero-glow blur-3xl"
          aria-hidden="true"
        />
        <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 text-center sm:gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/15 text-teal-300">
            <Mail className="h-5 w-5" aria-hidden="true" />
          </span>
          <h2 className="font-display text-title font-extrabold tracking-tight text-white">
            Restez informé
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-graphite-300 md:text-base">
            Recevez nos actualités, nouveaux produits et offres B2B par e-mail.
          </p>
          <div className="mt-2 w-full max-w-md">
            <NewsletterForm />
          </div>
        </div>
      </section>
    </>
  );
}
