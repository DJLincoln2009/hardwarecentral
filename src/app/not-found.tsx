'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, Compass, Search } from 'lucide-react';
import { getActiveCategories } from '@/lib/data/categories';

const categoryRouteMap: Record<string, string> = {
  'server-storage': '/catalogue?categorie=server-storage',
  networking: '/catalogue?categorie=networking',
  security: '/catalogue?categorie=security',
  cctv: '/catalogue?categorie=cctv',
  laptop: '/catalogue?categorie=laptop',
};

export default function NotFound() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const categories = getActiveCategories();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) router.push(`/recherche?q=${encodeURIComponent(q)}`);
  };

  return (
    <section className="relative isolate overflow-hidden bg-graphite-950 px-4 py-24 md:py-32">
      <div className="absolute inset-0 -z-10 bg-grid opacity-60" aria-hidden="true" />
      <div
        className="pointer-events-none absolute inset-x-0 -top-40 mx-auto h-96 max-w-4xl rounded-full bg-hero-glow blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-48 -left-24 h-96 w-96 rounded-full bg-hero-glow-2 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-32 -top-24 h-80 w-80 rounded-full bg-hero-glow-2 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-graphite-200 backdrop-blur">
          <Compass className="h-3.5 w-3.5 text-teal-300" aria-hidden="true" />
          Erreur 404
        </span>

        <p className="mt-6 font-display text-[7rem] font-extrabold leading-none tracking-tight text-gradient md:text-[9rem]">
          404
        </p>

        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-white md:text-4xl">
          Page introuvable
        </h1>
        <p className="mt-3 max-w-md text-base leading-relaxed text-graphite-300">
          La page que vous recherchez n&apos;existe pas ou a été déplacée.
        </p>

        <form onSubmit={handleSearch} className="mt-9 w-full max-w-md">
          <label htmlFor="not-found-search" className="sr-only">Rechercher un produit</label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-graphite-400"
              aria-hidden="true"
            />
            <input
              id="not-found-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un produit, une marque, un SKU…"
              className="w-full rounded-full border border-white/10 bg-white/5 py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-graphite-400 backdrop-blur transition-all duration-200 hover:border-white/20 focus:border-teal-400 focus:bg-white/10 focus:shadow-glow focus:outline-none"
            />
          </div>
        </form>

        <Link
          href="/"
          className="group mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-teal-300 px-7 py-3.5 text-sm font-semibold text-graphite-950 shadow-lg shadow-teal-300/25 transition-all duration-200 hover:bg-teal-200 hover:shadow-glow active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300"
        >
          <ArrowLeft
            className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5"
            aria-hidden="true"
          />
          Retour à l&apos;accueil
        </Link>

        {categories.length > 0 && (
          <div className="mt-12">
            <p className="eyebrow text-graphite-400">Catégories populaires</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={categoryRouteMap[cat.id] ?? `/catalogue?categorie=${cat.id}`}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-graphite-200 backdrop-blur transition-all duration-200 hover:border-teal-300/40 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-400" aria-hidden="true" />
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
