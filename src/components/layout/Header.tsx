'use client';

import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, FileText, Menu, Search, ChevronDown, Phone, X, Server } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import MobileNav from './MobileNav';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useQuoteStore } from '@/lib/stores/quote-store';
import { useFavoritesStore } from '@/lib/stores/favorites-store';
import { getNavbarCategories, getCategoryRoute } from '@/lib/data/categories';
import { SITE_CONFIG } from '@/lib/site-config';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { cn } from '@/lib/utils';

const MegaMenu = dynamic(() => import('./MegaMenu'), { ssr: false });
const QuoteRequestForm = dynamic(() => import('@/components/forms/QuoteRequestForm'), { ssr: false });

function Header() {
  const router = useRouter();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [searchQuery, setSearchQuery] = useState('');
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const megaMenuTriggerRef = useRef<HTMLButtonElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const mobileSearchButtonRef = useRef<HTMLButtonElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);
  const megaMenuDelayRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const quoteCount = useQuoteStore((s) => s.items.length);
  const favCount = useFavoritesStore((s) => s.productIds.length);
  const categories = getNavbarCategories();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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

  const iconButtonClass = cn(
    'relative flex h-10 w-10 items-center justify-center rounded-lg text-muted',
    'transition-colors duration-150 hover:bg-surface-muted hover:text-foreground',
    'active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
  );

  const counterBadge = (count: number) =>
    count > 0 && (
      <span
        className={cn(
          'absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center',
          'rounded-full bg-teal-600 px-1 text-[10px] font-bold text-white ring-2 ring-surface',
        )}
      >
        {count > 9 ? '9+' : count}
      </span>
    );

  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b border-border bg-surface/85 backdrop-blur-xl',
        'transition-shadow duration-300',
        scrolled && 'shadow-sm',
      )}
    >
      <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">
        {/* === MAIN BAR === */}
        <div className="flex items-center gap-1.5 py-2 sm:gap-2.5 sm:py-3 lg:gap-2.5">
          {/* Logo */}
          <Link
            href="/"
            className="group flex shrink-0 items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-lg"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-800 shadow-sm transition-shadow duration-200 group-hover:shadow-glow sm:h-9 sm:w-9">
              <Server className="h-4 w-4 text-white sm:h-[18px] sm:w-[18px]" aria-hidden="true" />
            </span>
            <span className="font-display text-base font-extrabold tracking-tight text-foreground sm:text-lg">
              Hardware<span className="text-accent">Central</span>
            </span>
          </Link>

          {/* Desktop search */}
          <div className="hidden flex-1 justify-center md:flex">
            <form role="search" onSubmit={handleSearch} className="flex w-full max-w-lg items-center gap-2">
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
                  className="w-full rounded-full border border-border bg-surface-muted/60 py-2.5 pl-10 pr-4 text-sm text-foreground shadow-xs placeholder:text-faint transition-all duration-200 hover:border-border-strong focus:border-accent focus:bg-surface focus:shadow-focus focus:outline-none"
                />
                <Search
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint"
                  aria-hidden="true"
                />
              </div>
              <button
                type="submit"
                aria-label="Rechercher"
                className="flex h-10 w-11 shrink-0 items-center justify-center rounded-full bg-teal-600 text-white transition-all duration-200 hover:bg-teal-700 hover:shadow-md active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
              >
                <Search className="h-4 w-4" aria-hidden="true" />
              </button>
            </form>
          </div>

          {/* Right actions */}
          <div className="ml-auto flex items-center gap-0.5 sm:gap-1.5">
            <Link
              href="/favoris"
              aria-label={`Favoris${favCount > 0 ? ` (${favCount})` : ''}`}
              className={iconButtonClass}
            >
              <Heart className="h-5 w-5" aria-hidden="true" />
              {counterBadge(favCount)}
            </Link>

            <Link
              href="/devis"
              aria-label={`Liste de devis${quoteCount > 0 ? ` (${quoteCount})` : ''}`}
              className={iconButtonClass}
            >
              <FileText className="h-5 w-5" aria-hidden="true" />
              {counterBadge(quoteCount)}
            </Link>

            <ThemeToggle />

            {/* Desktop CTA */}
            <button
              type="button"
              onClick={() => setQuoteModalOpen(true)}
              className="hidden rounded-full bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-teal-700 hover:shadow-md active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface lg:inline-flex lg:px-5 lg:py-2.5"
            >
              Demander un devis
            </button>

            {/* Mobile search toggle */}
            <button
              type="button"
              ref={mobileSearchButtonRef}
              onClick={() => setMobileSearchOpen((prev) => !prev)}
              aria-expanded={mobileSearchOpen}
              aria-label={mobileSearchOpen ? 'Fermer la recherche' : 'Rechercher'}
              className={cn(iconButtonClass, 'md:hidden')}
            >
              <AnimatePresence mode="wait" initial={false}>
                {mobileSearchOpen ? (
                  <motion.span
                    key="close"
                    initial={prefersReducedMotion ? false : { rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={prefersReducedMotion ? { opacity: 0 } : { rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="flex h-5 w-5 items-center justify-center"
                  >
                    <X className="h-5 w-5" aria-hidden="true" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="search"
                    initial={prefersReducedMotion ? false : { rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={prefersReducedMotion ? { opacity: 0 } : { rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="flex h-5 w-5 items-center justify-center"
                  >
                    <Search className="h-5 w-5" aria-hidden="true" />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {/* Hamburger */}
            <button
              ref={hamburgerRef}
              type="button"
              aria-label="Ouvrir le menu"
              className={cn(iconButtonClass, 'lg:hidden')}
              onClick={() => {
                setMobileSearchOpen(false);
                setMobileNavOpen(true);
              }}
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* === MOBILE SEARCH (slide-down) === */}
        <AnimatePresence>
          {mobileSearchOpen && (
            <motion.div
              initial={prefersReducedMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.2, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden md:hidden"
            >
              <form
                role="search"
                onSubmit={handleSearch}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') closeMobileSearch();
                }}
                className="flex items-center gap-2 pb-3"
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
                    className="w-full rounded-full border border-border bg-surface-muted/60 py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-faint transition-all duration-200 focus:border-accent focus:bg-surface focus:shadow-focus focus:outline-none"
                  />
                  <Search
                    className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint"
                    aria-hidden="true"
                  />
                </div>
                <button
                  type="submit"
                  aria-label="Lancer la recherche"
                  className="flex h-10 w-11 shrink-0 items-center justify-center rounded-full bg-teal-600 text-white transition-all duration-200 hover:bg-teal-700 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <Search className="h-4 w-4" aria-hidden="true" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* === DESKTOP CATEGORY NAV === */}
        <nav
          className="hidden items-center gap-5 pb-3 lg:flex"
          aria-label="Catégories principales"
        >
          <button
            ref={megaMenuTriggerRef}
            type="button"
            onMouseEnter={openMegaMenu}
            onMouseLeave={closeMegaMenu}
            onClick={() => setMegaMenuOpen((prev) => !prev)}
            aria-haspopup="true"
            aria-expanded={megaMenuOpen}
            className={cn(
              'flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
              megaMenuOpen
                ? 'bg-surface-muted text-foreground'
                : 'text-foreground hover:bg-surface-muted/60',
            )}
          >
            <Menu className="h-4 w-4" aria-hidden="true" />
            <span>Catégories</span>
            <ChevronDown
              className={`h-3.5 w-3.5 text-faint transition-transform duration-200 ${megaMenuOpen ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
          </button>

          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={getCategoryRoute(cat.id)}
              className="text-sm font-medium text-muted transition-colors duration-150 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
            >
              {cat.name}
            </Link>
          ))}

          <Link
            href="/marques"
            className="text-sm font-medium text-muted transition-colors duration-150 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
          >
            Marques
          </Link>

          <a
            href={`tel:${SITE_CONFIG.phone.e164}`}
            aria-label={`Téléphone : ${SITE_CONFIG.phone.display}`}
            className="ml-auto flex items-center gap-2 font-mono text-sm text-muted transition-colors duration-150 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-50 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300">
              <Phone className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
            {SITE_CONFIG.phone.display}
          </a>
        </nav>
      </div>

      <div role="presentation" onMouseEnter={openMegaMenu} onMouseLeave={closeMegaMenu}>
        <MegaMenu
          open={megaMenuOpen}
          onClose={() => {
            setMegaMenuOpen(false);
            requestAnimationFrame(() => megaMenuTriggerRef.current?.focus());
          }}
        />
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
