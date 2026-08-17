'use client';

import { useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronRight,
  Server,
  Network,
  Shield,
  Camera,
  Building2,
  Wifi,
  Printer,
  Monitor,
  Sparkles,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { getNavbarCategories, getCategoryRoute } from '@/lib/data/categories';
import { getActiveBrands } from '@/lib/data/brands';

interface MegaMenuProps {
  open: boolean;
  onClose: () => void;
}

const iconMap: Record<string, LucideIcon> = {
  Server,
  Network,
  Shield,
  Camera,
  Building2,
  Wifi,
  Printer,
  Monitor,
};

function MegaMenu({ open, onClose }: MegaMenuProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const categories = getNavbarCategories();
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
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: prefersReducedMotion ? 0 : -6 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.18, ease: 'easeOut' }}
          role="menu"
          className="absolute left-0 top-full z-40 w-full border-t border-border bg-surface/95 shadow-xl backdrop-blur-2xl"
        >
          <div className="mx-auto grid max-w-7xl grid-cols-12 gap-0 px-4 py-8 lg:px-6">
            <div className="col-span-4 border-r border-border pr-6">
              <p className="eyebrow mb-4">Catégories</p>
              <ul className="space-y-0.5">
                {categories.map((cat) => {
                  const Icon = iconMap[cat.icon];
                  return (
                    <li key={cat.id}>
                      <Link
                        href={getCategoryRoute(cat.id)}
                        role="menuitem"
                        className="group flex items-center gap-3 rounded-lg px-2.5 py-2.5 text-sm font-medium text-foreground transition-colors duration-150 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                        onClick={onClose}
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-teal-50 text-teal-700 transition-colors duration-150 group-hover:bg-teal-600 group-hover:text-white dark:bg-teal-500/15 dark:text-teal-300 dark:group-hover:bg-teal-500">
                          {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
                        </span>
                        <span className="flex-1">{cat.name}</span>
                        <ChevronRight
                          className="h-4 w-4 shrink-0 text-faint opacity-0 transition-all duration-150 group-hover:translate-x-0.5 group-hover:text-accent group-hover:opacity-100"
                          aria-hidden="true"
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="col-span-5 border-r border-border px-6">
              <p className="eyebrow mb-4">Marques</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                {brands.map((b) => (
                  <Link
                    key={b.code}
                    href={`/marques/${b.code.toLowerCase()}`}
                    role="menuitem"
                    className="rounded-lg px-2.5 py-2.5 text-sm text-muted transition-colors duration-150 hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    onClick={onClose}
                  >
                    {b.name}
                  </Link>
                ))}
              </div>
              <div className="mt-4 border-t border-border pt-4">
                <Link
                  href="/marques"
                  role="menuitem"
                  className="group inline-flex items-center gap-1.5 text-sm font-semibold text-accent transition-colors hover:text-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
                  onClick={onClose}
                >
                  Toutes les marques
                  <ArrowRight
                    className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>
              </div>
            </div>

            <div className="col-span-3 pl-6">
              <div className="flex flex-col gap-4">
                <div className="relative overflow-hidden rounded-xl bg-graphite-950 p-5">
                  <div
                    className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-teal-500/25 blur-2xl"
                    aria-hidden="true"
                  />
                  <div className="relative">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-500/15 text-teal-300">
                      <Sparkles className="h-4.5 w-4.5" aria-hidden="true" />
                    </span>
                    <p className="mt-3 text-sm font-semibold text-white">
                      Devis sur mesure pour vos projets IT
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-graphite-300">
                      Constitution, réseau, vidéosurveillance — un commercial vous répond sous
                      48-72h ouvrées.
                    </p>
                    <Link
                      href="/devis"
                      role="menuitem"
                      onClick={onClose}
                      className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-teal-300 px-3.5 py-2 text-xs font-semibold text-graphite-950 transition-colors hover:bg-teal-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300"
                    >
                      Constituer ma liste
                      <ArrowRight className="h-3 w-3" aria-hidden="true" />
                    </Link>
                  </div>
                </div>

                <Link
                  href="/contact"
                  role="menuitem"
                  onClick={onClose}
                  className="group rounded-lg px-2.5 py-2 text-sm text-muted transition-colors duration-150 hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  Contact commercial
                </Link>
                <Link
                  href="/a-propos"
                  role="menuitem"
                  onClick={onClose}
                  className="rounded-lg px-2.5 py-2 text-sm text-muted transition-colors duration-150 hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  À propos
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
