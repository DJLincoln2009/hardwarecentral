import Link from 'next/link';
import { ArrowRight, FileText, ShieldCheck } from 'lucide-react';
import { products } from '@/lib/data/products';
import { getActiveBrands } from '@/lib/data/brands';
import { getActiveCategories } from '@/lib/data/categories';

function Hero() {
  const brands = getActiveBrands();
  const categories = getActiveCategories();

  const stats = [
    { value: `${products.length}+`, label: 'références professionnelles' },
    { value: `${brands.length}`, label: 'marques constructeurs' },
    { value: `${categories.length}`, label: 'familles d\'équipements' },
  ];

  return (
    <section className="relative isolate overflow-hidden bg-graphite-950 px-4 py-20 md:py-28">
      <div className="absolute inset-0 -z-10 bg-grid opacity-60" aria-hidden="true" />
      <div
        className="pointer-events-none absolute inset-x-0 -top-40 mx-auto h-96 max-w-4xl rounded-full bg-hero-glow blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-48 -left-24 h-96 w-96 rounded-full bg-hero-glow-2 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-graphite-200 backdrop-blur">
            <ShieldCheck className="h-3.5 w-3.5 text-teal-300" aria-hidden="true" />
            Matériel authentique · Garantie constructeur · Cameroun &amp; zone CEMAC
          </span>

          <h1 className="mt-6 font-display text-hero font-extrabold leading-[1.05] tracking-tight text-white">
            Équipements IT professionnels pour l&apos;Afrique Centrale
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-graphite-300 md:text-lg">
            Serveurs, stockage, réseau, sécurité et vidéosurveillance pour les entreprises.
            Une plateforme de référence pour bâtir et faire évoluer vos infrastructures.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/catalogue"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-teal-500 px-7 py-3.5 text-sm font-semibold text-graphite-950 shadow-lg shadow-teal-500/25 transition-all duration-200 hover:bg-teal-400 hover:shadow-glow active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 sm:w-auto"
            >
              Découvrir le catalogue
              <ArrowRight
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
            <Link
              href="/devis"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur transition-all duration-200 hover:border-white/30 hover:bg-white/10 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 sm:w-auto"
            >
              <FileText className="h-4 w-4 text-teal-300" aria-hidden="true" />
              Constituer ma liste de devis
            </Link>
          </div>

          <dl className="mx-auto mt-12 grid max-w-xl grid-cols-3 divide-x divide-white/10 rounded-2xl border border-white/10 bg-white/5 backdrop-blur">
            {stats.map((stat) => (
              <div key={stat.label} className="px-4 py-5 text-center">
                <dd className="font-display text-2xl font-extrabold tracking-tight text-white md:text-3xl">
                  {stat.value}
                </dd>
                <dt className="mt-1 text-[11px] leading-tight text-graphite-400 md:text-xs">
                  {stat.label}
                </dt>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

export default Hero;
