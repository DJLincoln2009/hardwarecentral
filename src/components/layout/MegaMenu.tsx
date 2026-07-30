'use client';

import { useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight } from 'lucide-react';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { getActiveCategories } from '@/lib/data/categories';
import { getActiveBrands } from '@/lib/data/brands';

interface MegaMenuProps {
  open: boolean;
  onClose: () => void;
}

const categoryRouteMap: Record<string, string> = {
  'server-storage': '/catalogue?categorie=server-storage',
  networking: '/catalogue?categorie=networking',
  security: '/catalogue?categorie=security',
  cctv: '/catalogue?categorie=cctv',
  laptop: '/catalogue?categorie=laptop',
};

function MegaMenu({ open, onClose }: MegaMenuProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const categories = getActiveCategories();
  const brands = getActiveBrands();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, handleKeyDown]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: prefersReducedMotion ? 0 : -4 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.15 }}
          role="menu"
          className="absolute left-0 top-full z-40 w-full border-t border-graphite-200 bg-white shadow-lg"
        >
          <div className="mx-auto grid max-w-7xl grid-cols-12 gap-0 px-4 py-8">
            <div className="col-span-3 border-r border-graphite-100 pr-6">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-graphite-500">
                Catégories
              </p>
              <ul className="space-y-0.5">
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <Link
                      href={categoryRouteMap[cat.id] ?? `/catalogue?categorie=${cat.id}`}
                      role="menuitem"
                      className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium text-graphite-900 hover:bg-teal-50 hover:text-teal-800 transition-colors focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none"
                      onClick={onClose}
                    >
                      <ChevronRight className="h-4 w-4 shrink-0 text-teal-600" aria-hidden="true" />
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-span-5 border-r border-graphite-100 px-6">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-graphite-500">
                Marques
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                {brands.map((b) => (
                  <Link
                    key={b.code}
                    href={`/marques/${b.code.toLowerCase()}`}
                    role="menuitem"
                    className="rounded-md px-3 py-2.5 text-sm text-graphite-900 hover:bg-graphite-50 hover:text-teal-800 transition-colors focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none"
                    onClick={onClose}
                  >
                    {b.name}
                  </Link>
                ))}
              </div>
              <div className="mt-3 border-t border-graphite-100 pt-3">
                <Link
                  href="/marques"
                  role="menuitem"
                  className="text-sm font-medium text-teal-600 hover:text-teal-800 transition-colors focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none rounded-sm"
                  onClick={onClose}
                >
                  Toutes les marques →
                </Link>
              </div>
            </div>

            <div className="col-span-4 pl-6">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-graphite-500">
                Support
              </p>
              <ul className="space-y-0.5">
                <li>
                  <Link
                    href="/contact"
                    role="menuitem"
                    className="block rounded-md px-3 py-2.5 text-sm text-graphite-900 hover:bg-graphite-50 hover:text-teal-800 transition-colors focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none"
                    onClick={onClose}
                  >
                    Contact commercial
                  </Link>
                </li>
                <li>
                  <Link
                    href="/a-propos"
                    role="menuitem"
                    className="block rounded-md px-3 py-2.5 text-sm text-graphite-900 hover:bg-graphite-50 hover:text-teal-800 transition-colors focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none"
                    onClick={onClose}
                  >
                    À propos
                  </Link>
                </li>
              </ul>

              <div className="mt-5 border-t border-graphite-100 pt-5">
                <Link
                  href="/catalogue"
                  role="menuitem"
                  className="flex items-center justify-center gap-1.5 rounded-md bg-teal-600 px-4 py-3 text-sm font-medium text-white hover:bg-teal-800 transition-colors focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 focus-visible:outline-none"
                  onClick={onClose}
                >
                  Voir tout le catalogue →
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default MegaMenu;