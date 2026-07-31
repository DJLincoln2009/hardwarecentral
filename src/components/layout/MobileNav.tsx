'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Heart, FileText, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { getActiveCategories } from '@/lib/data/categories';
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
  const categories = getActiveCategories();
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
            className="absolute inset-0 bg-graphite-900/60"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            ref={drawerRef}
            initial={{ x: prefersReducedMotion ? 0 : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: prefersReducedMotion ? 0 : '100%' }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.25, ease: 'easeInOut' }}
            className="absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-xl overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation mobile"
          >
            <div className="flex items-center justify-between border-b border-graphite-200 px-4 py-3">
              <span className="font-display font-bold text-graphite-900">Menu</span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fermer le menu"
                className="p-3 text-graphite-400 hover:text-graphite-900 active:scale-95 transition-colors rounded-sm focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="space-y-6 px-4 py-6">
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
                  className="w-full rounded-md border border-graphite-200 bg-white pl-9 pr-3 py-3 text-sm text-graphite-900 placeholder:text-graphite-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-600 focus:outline-none"
                />
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-graphite-400" aria-hidden="true" />
              </form>

              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-graphite-600">
                  Catégories
                </p>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleNav(categoryRouteMap[cat.id] ?? `/catalogue?categorie=${cat.id}`)}
                    className="flex min-h-11 w-full items-center text-left px-2 py-2 text-sm text-graphite-900 hover:bg-graphite-50 rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none"
                  >
                    {cat.name}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => handleNav('/catalogue')}
                  className="flex min-h-11 w-full items-center text-left px-2 py-2 text-sm font-medium text-teal-600 hover:text-teal-800 hover:bg-graphite-50 rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none"
                >
                  Voir tout le catalogue →
                </button>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-graphite-600">
                  Marques
                </p>
                {brands.map((b) => (
                  <button
                    key={b.code}
                    type="button"
                    onClick={() => handleNav(`/marques/${b.code.toLowerCase()}`)}
                    className="flex min-h-11 w-full items-center text-left px-2 py-2 text-sm text-graphite-900 hover:bg-graphite-50 rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none"
                  >
                    {b.name}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => handleNav('/marques')}
                  className="flex min-h-11 w-full items-center text-left px-2 py-2 text-sm font-medium text-teal-600 hover:text-teal-800 hover:bg-graphite-50 rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none"
                >
                  Toutes les marques →
                </button>
              </div>

              <hr className="border-graphite-200" />

              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => handleNav('/favoris')}
                  className="flex min-h-11 w-full items-center gap-3 px-2 py-2 text-sm text-graphite-900 hover:bg-graphite-50 rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none"
                >
                  <Heart className="h-5 w-5" aria-hidden="true" />
                  <span>Favoris</span>
                  {favCount > 0 && (
                    <span className="ml-auto inline-flex h-5 w-5 items-center justify-center rounded-full bg-teal-600 text-xs font-medium text-white">
                      {favCount}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleNav('/devis')}
                  className="flex min-h-11 w-full items-center gap-3 px-2 py-2 text-sm text-graphite-900 hover:bg-graphite-50 rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none"
                >
                  <FileText className="h-5 w-5" aria-hidden="true" />
                  <span>Liste de devis</span>
                  {quoteCount > 0 && (
                    <span className="ml-auto inline-flex h-5 w-5 items-center justify-center rounded-full bg-teal-600 text-xs font-medium text-white">
                      {quoteCount}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleNav('/contact')}
                  className="flex min-h-11 w-full items-center px-2 py-2 text-sm text-graphite-900 hover:bg-graphite-50 rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none"
                >
                  Contact commercial
                </button>
                <button
                  type="button"
                  onClick={() => handleNav('/a-propos')}
                  className="flex min-h-11 w-full items-center px-2 py-2 text-sm text-graphite-900 hover:bg-graphite-50 rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none"
                >
                  À propos
                </button>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleOpenQuote}
                  className="w-full min-h-11 rounded-md bg-teal-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-800 active:scale-95 transition-colors focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 focus-visible:outline-none"
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