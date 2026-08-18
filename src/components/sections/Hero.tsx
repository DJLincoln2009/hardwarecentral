import Link from 'next/link';
import { ArrowRight, FileText, ShieldCheck } from 'lucide-react';
import { products } from '@/lib/data/products';
import { getActiveBrands } from '@/lib/data/brands';
import { getActiveCategories } from '@/lib/data/categories';
import { getFeaturedProducts } from '@/lib/data/products';
import ProductImage from '@/components/product/ProductImage';
import ProductAvailabilityBadge from '@/components/product/ProductAvailabilityBadge';

function Hero() {
  const brands = getActiveBrands();
  const categories = getActiveCategories();
  const featured = getFeaturedProducts()[0];

  const stats = [
    { value: `${products.length}+`, label: 'références professionnelles' },
    { value: `${brands.length}`, label: 'marques constructeurs' },
    { value: `${categories.length}`, label: "familles d'équipements" },
  ];

  return (
    <section className="relative isolate overflow-hidden bg-background pb-[max(4rem,env(safe-area-inset-bottom,0px))] dark:bg-graphite-950">
      <div
        className="absolute inset-0 -z-10 bg-grid opacity-70 dark:opacity-60"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 -top-40 mx-auto h-96 max-w-4xl rounded-full bg-hero-glow blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-48 -left-24 h-96 w-96 rounded-full bg-hero-glow-2 blur-3xl"
        aria-hidden="true"
      />

      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 pt-10 pb-12 sm:px-6 sm:gap-12 sm:pt-14 sm:pb-16 md:pt-20 md:pb-24 md:gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
        <div className="relative text-center lg:text-left">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted shadow-xs backdrop-blur sm:gap-2 sm:px-4 sm:py-1.5 dark:border-white/10 dark:bg-white/5 dark:text-graphite-200">
            <ShieldCheck
              className="h-3.5 w-3.5 text-teal-600 dark:text-teal-300"
              aria-hidden="true"
            />
            Matériel authentique · Garantie constructeur · Cameroun &amp; zone CEMAC
          </span>

          <h1 className="mt-5 font-display text-hero font-extrabold leading-[1.05] tracking-tight text-foreground sm:mt-6 dark:text-white">
            Équipements IT professionnels pour l&apos;Afrique Centrale
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted sm:mt-5 sm:text-base md:text-lg dark:text-graphite-300 lg:mx-0">
            Serveurs, stockage, réseau, sécurité et vidéosurveillance pour les entreprises. Une
            plateforme de référence pour bâtir et faire évoluer vos infrastructures.
          </p>

          <div className="mt-7 flex flex-col items-stretch gap-2.5 sm:mt-8 sm:w-auto sm:flex-row sm:items-center sm:justify-start sm:gap-3 lg:justify-start">
            <Link
              href="/catalogue"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-teal-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-teal-600/20 transition-all duration-200 hover:bg-teal-700 hover:shadow-glow active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:w-auto"
            >
              Découvrir le catalogue
              <ArrowRight
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
            <Link
              href="/devis"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border-strong bg-surface/60 px-7 py-3.5 text-sm font-semibold text-foreground backdrop-blur transition-all duration-200 hover:border-accent hover:text-accent active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:border-teal-300 dark:hover:text-teal-300 sm:w-auto"
            >
              <FileText className="h-4 w-4 text-teal-600 dark:text-teal-300" aria-hidden="true" />
              Constituer ma liste de devis
            </Link>
          </div>

          <dl className="mx-auto mt-8 grid max-w-xl grid-cols-3 divide-x divide-border rounded-2xl border border-border bg-surface/70 shadow-sm backdrop-blur sm:mt-10 sm:max-w-full dark:divide-white/10 dark:border-white/10 dark:bg-white/5 lg:mx-0">
            {stats.map((stat) => (
              <div key={stat.label} className="px-3 py-3 text-center sm:px-4 sm:py-5">
                <dd className="font-display text-xl font-extrabold tracking-tight text-foreground sm:text-2xl md:text-3xl dark:text-white">
                  {stat.value}
                </dd>
                <dt className="mt-1 text-xs leading-tight text-muted dark:text-graphite-300">
                  {stat.label}
                </dt>
              </div>
            ))}
          </dl>
        </div>

        {featured && (
          <div className="relative mx-auto w-full max-w-sm sm:max-w-md lg:max-w-none">
            <div
              className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-radial-accent blur-2xl sm:-inset-8 sm:rounded-[3rem]"
              aria-hidden="true"
            />
            <div className="relative overflow-hidden rounded-2xl border border-border bg-surface/80 p-2 shadow-xl backdrop-blur-xl sm:rounded-[2rem] sm:p-3 dark:border-white/10 dark:bg-white/5">
              <ProductImage
                src={featured.primaryImage.url}
                alt={featured.primaryImage.alt}
                sizes="(max-width: 1024px) 90vw, 40vw"
                width={1200}
                height={900}
                priority
                className="aspect-[4/3] rounded-3xl bg-surface dark:bg-white/5"
                imageClassName="p-8"
              />
              <div className="flex items-center justify-between gap-3 px-4 pt-4">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted dark:text-graphite-300">
                    {featured.brand}
                  </p>
                  <p className="mt-0.5 truncate text-sm font-semibold text-foreground dark:text-white">
                    {featured.name}
                  </p>
                </div>
                <ProductAvailabilityBadge status={featured.availability.status} />
              </div>
              <div className="px-4 pb-4 pt-1">
                <Link
                  href={`/produit/${featured.id}`}
                  className="group inline-flex items-center gap-1.5 text-sm font-semibold text-accent transition-colors hover:text-accent-hover"
                >
                  Voir la fiche produit
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default Hero;
