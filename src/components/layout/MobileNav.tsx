'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Heart, FileText, Search, Server, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { getNavbarCategories } from '@/lib/data/categories';
import { getActiveBrands } from '@/lib/data/brands';
import { useQuoteStore } from '@/lib/stores/quote-store';
import { useFavoritesStore } from '@/lib/stores/favorites-store';

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
  onOpenQuote: () => void;
}

const categoryRouteMap: Record<string, string> = {
  'server-storage': '/catalogue?categorie=server-storage',
  networking: '/catalogue?categorie=networking',
  security: '/catalogue?categorie=security',
  cctv: '/catalogue?categorie=cctv',
  laptop: '/catalogue?categorie=laptop',
};

function MobileNav({ open, onClose, onOpenQuote }: MobileNavProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [searchQuery, setSearchQuery] = useState('');
  const categories = getNavbarCategories();
  const brands = getActiveBrands();
  const quoteCount = useQuoteStore((s) => s.items.length);
  const favCount = useFavoritesStore((s) => s.productIds.length);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'Tab' && drawerRef.current) {
        const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(() => {
        drawerRef.current?.querySelector<HTMLElement>('button, [href], input')?.focus();
      });
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, handleKeyDown]);

  const handleNav = (href: string) => {
    onClose();
    router.push(href);
  };

  const handleOpenQuote = () => {
    onClose();
    onOpenQuote();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      onClose();
      router.push(`/recherche?q=${encodeURIComponent(q)}`);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
            className="absolute inset-0 bg-backdrop"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            ref={drawerRef}
            initial={{ x: prefersReducedMotion ? 0 : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: prefersReducedMotion ? 0 : '100%' }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.28, ease: 'easeOut' }}
            className="absolute right-0 top-0 h-full w-full max-w-sm overflow-y-auto bg-surface shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation mobile"
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <span className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-teal-800">
                  <Server className="h-4 w-4 text-white" aria-hidden="true" />
                </span>
                <span className="font-display text-base font-extrabold tracking-tight text-foreground">
                  Menu
                </span>
              </span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fermer le menu"
                className="rounded-lg p-2.5 text-faint transition-colors hover:bg-surface-muted hover:text-foreground active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="space-y-7 px-5 py-6">
              <form role="search" onSubmit={handleSearch} className="relative">
                <label htmlFor="mobile-search" className="sr-only">
                  Rechercher un produit, une marque, un SKU…
                </label>
                <input
                  id="mobile-search"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un produit, une marque, un SKU…"
                  className="w-full rounded-full border border-border bg-surface-muted/60 py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-faint transition-all duration-200 focus:border-accent focus:bg-surface focus:shadow-focus focus:outline-none"
                />
                <Search
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint"
                  aria-hidden="true"
                />
              </form>

              <div className="space-y-1">
                <p className="eyebrow mb-2">Catégories</p>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleNav(categoryRouteMap[cat.id] ?? `/catalogue?categorie=${cat.id}`)}
                    className="flex min-h-11 w-full items-center rounded-lg px-2 py-2 text-left text-sm text-foreground transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    {cat.name}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => handleNav('/catalogue')}
                  className="flex min-h-11 w-full items-center justify-between rounded-lg px-2 py-2 text-left text-sm font-semibold text-accent transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  Voir tout le catalogue
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              <div className="space-y-1">
                <p className="eyebrow mb-2">Marques</p>
                <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                  {brands.map((b) => (
                    <button
                      key={b.code}
                      type="button"
                      onClick={() => handleNav(`/marques/${b.code.toLowerCase()}`)}
                      className="flex min-h-11 w-full items-center rounded-lg px-2 py-2 text-left text-sm text-foreground transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      {b.name}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => handleNav('/marques')}
                  className="flex min-h-11 w-full items-center justify-between rounded-lg px-2 py-2 text-left text-sm font-semibold text-accent transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  Toutes les marques
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              <hr className="border-border" />

              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => handleNav('/favoris')}
                  className="flex min-h-11 w-full items-center gap-3 rounded-lg px-2 py-2 text-sm text-foreground transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <Heart className="h-5 w-5 text-faint" aria-hidden="true" />
                  <span>Favoris</span>
                  {favCount > 0 && (
                    <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-teal-600 px-1 text-xs font-medium text-white">
                      {favCount}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleNav('/devis')}
                  className="flex min-h-11 w-full items-center gap-3 rounded-lg px-2 py-2 text-sm text-foreground transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <FileText className="h-5 w-5 text-faint" aria-hidden="true" />
                  <span>Liste de devis</span>
                  {quoteCount > 0 && (
                    <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-teal-600 px-1 text-xs font-medium text-white">
                      {quoteCount}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleNav('/contact')}
                  className="flex min-h-11 w-full items-center rounded-lg px-2 py-2 text-sm text-foreground transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  Contact commercial
                </button>
                <button
                  type="button"
                  onClick={() => handleNav('/a-propos')}
                  className="flex min-h-11 w-full items-center rounded-lg px-2 py-2 text-sm text-foreground transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  À propos
                </button>
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleOpenQuote}
                  className="w-full min-h-11 rounded-full bg-teal-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-teal-700 hover:shadow-md active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                >
                  Demander un devis
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default MobileNav;
