'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Heart, FileText, Search, Server, ArrowRight, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { useFocusTrap } from '@/lib/hooks/useFocusTrap';
import { getNavbarCategories, getCategoryRoute } from '@/lib/data/categories';
import { getActiveBrands } from '@/lib/data/brands';
import { useQuoteStore } from '@/lib/stores/quote-store';
import { useFavoritesStore } from '@/lib/stores/favorites-store';
import { cn } from '@/lib/utils';

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
  onOpenQuote: () => void;
}

function MobileNav({ open, onClose, onOpenQuote }: MobileNavProps) {
  const drawerRef = useFocusTrap<HTMLDivElement>(open, onClose);
  const router = useRouter();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [searchQuery, setSearchQuery] = useState('');
  const [brandsExpanded, setBrandsExpanded] = useState(false);
  const categories = getNavbarCategories();
  const brands = getActiveBrands();
  const quoteCount = useQuoteStore((s) => s.items.length);
  const favCount = useFavoritesStore((s) => s.productIds.length);

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
        <div className="fixed inset-0 z-50 lg:hidden" style={{ height: '100dvh' }}>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
            className="absolute inset-0 bg-backdrop"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.div
            ref={drawerRef}
            initial={{ x: prefersReducedMotion ? 0 : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: prefersReducedMotion ? 0 : '100%' }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.28, ease: 'easeOut' }}
            className="absolute right-0 top-0 flex h-full w-full max-w-sm flex-col bg-surface shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation mobile"
          >
            {/* Header */}
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
                className="flex h-10 w-10 items-center justify-center rounded-lg text-faint transition-colors hover:bg-surface-muted hover:text-foreground active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              <div className="space-y-5 px-5 py-5">
                {/* Search */}
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

                {/* Categories */}
                <div>
                  <p className="eyebrow mb-2.5 text-graphite-400">Catégories</p>
                  <div className="space-y-0.5">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleNav(getCategoryRoute(cat.id))}
                        className="flex min-h-12 w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-surface-muted active:bg-surface-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      >
                        <span>{cat.name}</span>
                        <ChevronRight className="h-4 w-4 shrink-0 text-faint/60" aria-hidden="true" />
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => handleNav('/catalogue')}
                      className="flex min-h-12 w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-accent transition-colors hover:bg-surface-muted active:bg-surface-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      <span>Voir tout le catalogue</span>
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                {/* Brands — collapsible */}
                <div>
                  <button
                    type="button"
                    onClick={() => setBrandsExpanded((prev) => !prev)}
                    className="flex w-full items-center justify-between"
                    aria-expanded={brandsExpanded}
                  >
                    <p className="eyebrow text-graphite-400">Marques</p>
                    <ChevronRight
                      className={cn(
                        'h-4 w-4 text-faint transition-transform duration-200',
                        brandsExpanded && 'rotate-90',
                      )}
                      aria-hidden="true"
                    />
                  </button>
                  <AnimatePresence>
                    {brandsExpanded && (
                      <motion.div
                        initial={prefersReducedMotion ? false : { height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={prefersReducedMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                        transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 pt-2.5">
                          {brands.map((b) => (
                            <button
                              key={b.code}
                              type="button"
                              onClick={() => handleNav(`/marques/${b.code.toLowerCase()}`)}
                              className="flex min-h-11 w-full items-center rounded-xl px-3 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-surface-muted active:bg-surface-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                            >
                              {b.name}
                            </button>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleNav('/marques')}
                          className="mt-1 flex min-h-11 w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-accent transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                        >
                          Toutes les marques
                          <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Divider */}
                <hr className="border-border" />

                {/* Quick links */}
                <div className="space-y-0.5">
                  <button
                    type="button"
                    onClick={() => handleNav('/favoris')}
                    className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-surface-muted active:bg-surface-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <Heart className="h-5 w-5 shrink-0 text-faint" aria-hidden="true" />
                    <span>Favoris</span>
                    {favCount > 0 && (
                      <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-teal-600 px-1.5 text-[10px] font-bold text-white">
                        {favCount}
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNav('/devis')}
                    className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-surface-muted active:bg-surface-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <FileText className="h-5 w-5 shrink-0 text-faint" aria-hidden="true" />
                    <span>Liste de devis</span>
                    {quoteCount > 0 && (
                      <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-teal-600 px-1.5 text-[10px] font-bold text-white">
                        {quoteCount}
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNav('/contact')}
                    className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-surface-muted active:bg-surface-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                      <span className="h-1.5 w-1.5 rounded-full bg-teal-500" aria-hidden="true" />
                    </span>
                    Contact commercial
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNav('/a-propos')}
                    className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-surface-muted active:bg-surface-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                      <span className="h-1.5 w-1.5 rounded-full bg-graphite-400" aria-hidden="true" />
                    </span>
                    À propos
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="border-t border-border px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <button
                type="button"
                onClick={handleOpenQuote}
                className="w-full min-h-12 rounded-full bg-teal-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-teal-700 hover:shadow-md active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
              >
                Demander un devis
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default MobileNav;
