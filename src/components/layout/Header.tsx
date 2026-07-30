'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, FileText, Menu, Search, ChevronDown, Phone, X } from 'lucide-react';
import MegaMenu from './MegaMenu';
import MobileNav from './MobileNav';
import QuoteRequestForm from '@/components/forms/QuoteRequestForm';
import { useQuoteStore } from '@/lib/stores/quote-store';
import { useFavoritesStore } from '@/lib/stores/favorites-store';
import { getActiveCategories } from '@/lib/data/categories';
import { SITE_CONFIG } from '@/lib/site-config';

const categoryRouteMap: Record<string, string> = {
  'server-storage': '/catalogue?categorie=server-storage',
  networking: '/catalogue?categorie=networking',
  security: '/catalogue?categorie=security',
  cctv: '/catalogue?categorie=cctv',
  laptop: '/catalogue?categorie=laptop',
};

function Header() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const megaMenuTriggerRef = useRef<HTMLButtonElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const mobileSearchButtonRef = useRef<HTMLButtonElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);
  const megaMenuDelayRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const quoteCount = useQuoteStore((s) => s.items.length);
  const favCount = useFavoritesStore((s) => s.productIds.length);
  const categories = getActiveCategories();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      router.push(`/recherche?q=${encodeURIComponent(q)}`);
      setSearchQuery('');
      setMobileSearchOpen(false);
    }
  };

  useEffect(() => {
    if (mobileSearchOpen) {
      mobileSearchInputRef.current?.focus();
    }
  }, [mobileSearchOpen]);

  const closeMobileSearch = () => {
    setMobileSearchOpen(false);
    requestAnimationFrame(() => mobileSearchButtonRef.current?.focus());
  };

  const openMegaMenu = () => {
    if (megaMenuDelayRef.current) clearTimeout(megaMenuDelayRef.current);
    setMegaMenuOpen(true);
  };

  const closeMegaMenu = () => {
    megaMenuDelayRef.current = setTimeout(() => setMegaMenuOpen(false), 150);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        megaMenuOpen &&
        megaMenuTriggerRef.current &&
        !megaMenuTriggerRef.current.contains(e.target as Node) &&
        !document.querySelector('[role="menu"]')?.contains(e.target as Node)
      ) {
        setMegaMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [megaMenuOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-graphite-200 bg-white relative">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center gap-4 py-3">
          <Link
            href="/"
            className="font-display text-xl font-bold text-graphite-900 shrink-0"
          >
            Hardware<span className="text-teal-600">Central</span>
          </Link>

          <div className="hidden md:flex flex-1 justify-center">
            <form
              role="search"
              onSubmit={handleSearch}
              className="flex w-full max-w-md items-center gap-2"
            >
              <label htmlFor="header-search" className="sr-only">
                Rechercher un produit, une marque, un SKU…
              </label>
              <div className="relative flex-1">
                <input
                  id="header-search"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un produit, une marque, un SKU…"
                  className="w-full rounded-md border border-graphite-200 bg-white px-3 py-2 pl-9 text-sm text-graphite-900 placeholder:text-graphite-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-600 focus:ring-offset-1 focus:outline-none"
                />
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-graphite-400" aria-hidden="true" />
              </div>
              <button
                type="submit"
                aria-label="Rechercher"
                className="rounded-md bg-teal-600 min-h-11 min-w-11 px-3 py-2 text-sm font-medium text-white hover:bg-teal-800 active:scale-95 transition-colors focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none"
              >
                <Search className="h-4 w-4" aria-hidden="true" />
              </button>
            </form>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <Link
              href="/favoris"
              aria-label={`Favoris${favCount > 0 ? ` (${favCount})` : ''}`}
              className="relative flex min-h-11 min-w-11 items-center justify-center p-3 text-graphite-600 hover:text-graphite-900 active:scale-95 transition-colors rounded-sm focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none"
            >
              <Heart className="h-5 w-5" aria-hidden="true" />
              {favCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-teal-600 text-xs font-medium text-white">
                  {favCount > 9 ? '9+' : favCount}
                </span>
              )}
            </Link>

            <Link
              href="/devis"
              aria-label={`Liste de devis${quoteCount > 0 ? ` (${quoteCount})` : ''}`}
              className="relative flex min-h-11 min-w-11 items-center justify-center p-3 text-graphite-600 hover:text-graphite-900 active:scale-95 transition-colors rounded-sm focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none"
            >
              <FileText className="h-5 w-5" aria-hidden="true" />
              {quoteCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-teal-600 text-xs font-medium text-white">
                  {quoteCount > 9 ? '9+' : quoteCount}
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={() => setQuoteModalOpen(true)}
              className="hidden md:inline-flex rounded-md bg-teal-600 min-h-11 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 transition-colors focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              Demandez un devis
            </button>

            <button
              type="button"
              ref={mobileSearchButtonRef}
              onClick={() => setMobileSearchOpen((prev) => !prev)}
              aria-expanded={mobileSearchOpen}
              aria-label={mobileSearchOpen ? 'Fermer la recherche' : 'Rechercher'}
              className="flex min-h-11 min-w-11 items-center justify-center p-3 text-graphite-600 hover:text-graphite-900 active:scale-95 transition-colors rounded-sm focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none lg:hidden"
            >
              <Search className="h-5 w-5" aria-hidden="true" />
            </button>

            <button
              ref={hamburgerRef}
              type="button"
              aria-label="Ouvrir le menu"
              className="flex min-h-11 min-w-11 items-center justify-center p-3 text-graphite-600 hover:text-graphite-900 active:scale-95 transition-colors rounded-sm focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none lg:hidden"
              onClick={() => {
                setMobileSearchOpen(false);
                setMobileNavOpen(true);
              }}
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {mobileSearchOpen && (
          <form
            role="search"
            onSubmit={handleSearch}
            onKeyDown={(e) => {
              if (e.key === 'Escape') closeMobileSearch();
            }}
            className="flex items-center gap-2 pb-3 lg:hidden"
          >
            <label htmlFor="header-search-mobile" className="sr-only">
              Rechercher un produit, une marque, un SKU…
            </label>
            <div className="relative flex-1">
              <input
                id="header-search-mobile"
                ref={mobileSearchInputRef}
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un produit, une marque, un SKU…"
                className="w-full rounded-md border border-graphite-200 bg-white px-3 py-2 pl-9 text-sm text-graphite-900 placeholder:text-graphite-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-600 focus:ring-offset-1 focus:outline-none"
              />
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-graphite-400" aria-hidden="true" />
            </div>
            <button
              type="submit"
              aria-label="Lancer la recherche"
              className="rounded-md bg-teal-600 min-h-11 min-w-11 px-3 py-2 text-sm font-medium text-white hover:bg-teal-800 active:scale-95 transition-colors focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={closeMobileSearch}
              aria-label="Fermer la recherche"
              className="flex min-h-11 min-w-11 items-center justify-center p-3 text-graphite-600 hover:text-graphite-900 active:scale-95 transition-colors rounded-sm focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </form>
        )}

        <nav className="hidden lg:flex items-center gap-6 pb-3" aria-label="Catégories principales">
          <button
            ref={megaMenuTriggerRef}
            type="button"
            onMouseEnter={openMegaMenu}
            onMouseLeave={closeMegaMenu}
            onClick={() => setMegaMenuOpen((prev) => !prev)}
            aria-haspopup="true"
            aria-expanded={megaMenuOpen}
            className="flex items-center gap-1.5 text-sm font-medium text-graphite-900 hover:text-teal-800 transition-colors focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none rounded-sm"
          >
            <Menu className="h-4 w-4" aria-hidden="true" />
            <span>Catégories</span>
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform duration-150 ${megaMenuOpen ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
          </button>

          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={categoryRouteMap[cat.id] ?? `/catalogue?categorie=${cat.id}`}
              className="text-sm text-graphite-600 hover:text-teal-800 transition-colors focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none rounded-sm"
            >
              {cat.name}
            </Link>
          ))}

          <Link
            href="/marques"
            className="text-sm text-graphite-600 hover:text-teal-800 transition-colors focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none rounded-sm"
          >
            Marques
          </Link>

          <a
            href={`tel:${SITE_CONFIG.phone.e164}`}
            aria-label={`Téléphone : ${SITE_CONFIG.phone.display}`}
            className="ml-auto flex items-center gap-1.5 text-sm text-graphite-600 hover:text-teal-800 transition-colors focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none rounded-sm"
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
            <span>{SITE_CONFIG.phone.display}</span>
          </a>
        </nav>
      </div>

      {/* Positionné par rapport au <header> (relative, pleine largeur) et non plus
          par rapport à un élément interne de la nav : le panneau s'étend sur toute
          la largeur du header, sous la barre de nav, comme sur le wireframe #screen-1. */}
      <div onMouseEnter={openMegaMenu} onMouseLeave={closeMegaMenu}>
        <MegaMenu open={megaMenuOpen} onClose={() => {
          setMegaMenuOpen(false);
          requestAnimationFrame(() => megaMenuTriggerRef.current?.focus());
        }} />
      </div>

      <MobileNav
        open={mobileNavOpen}
        onClose={() => {
          setMobileNavOpen(false);
          requestAnimationFrame(() => hamburgerRef.current?.focus());
        }}
        onOpenQuote={() => setQuoteModalOpen(true)}
      />
      <QuoteRequestForm open={quoteModalOpen} onClose={() => setQuoteModalOpen(false)} />
    </header>
  );
}

export default Header;