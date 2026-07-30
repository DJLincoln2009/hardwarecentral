'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Search, ArrowLeft } from 'lucide-react';
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
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-7xl font-bold text-graphite-200 font-display">404</p>
      <h1 className="mt-4 text-2xl font-bold text-graphite-900 font-display">Page introuvable</h1>
      <p className="mt-2 text-sm text-graphite-600">
        La page que vous recherchez n&apos;existe pas ou a été déplacée.
      </p>

      <form onSubmit={handleSearch} className="mt-8 w-full">
        <label htmlFor="not-found-search" className="sr-only">Rechercher un produit</label>
        <div className="relative">
          <input
            id="not-found-search"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un produit, une marque, un SKU…"
            className="w-full rounded-md border border-graphite-200 bg-white px-3 py-2.5 pl-9 text-sm text-graphite-900 placeholder:text-graphite-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-600 focus:outline-none"
          />
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-graphite-400" aria-hidden="true" />
        </div>
      </form>

      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-2 rounded-md bg-teal-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-teal-800 transition-colors focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Retour à l&apos;accueil
      </Link>

      {categories.length > 0 && (
        <div className="mt-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-graphite-500">
            Catégories populaires
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={categoryRouteMap[cat.id] ?? `/catalogue?categorie=${cat.id}`}
                className="rounded-full border border-graphite-200 px-3 py-1.5 text-xs font-medium text-graphite-600 hover:bg-graphite-50 hover:text-teal-600 transition-colors focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
