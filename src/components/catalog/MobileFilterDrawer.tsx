'use client';

import { useEffect, useRef, useCallback } from 'react';
import { X, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import CatalogFilters from './CatalogFilters';

interface MobileFilterDrawerProps {
  open: boolean;
  onClose: () => void;
  resultCount: number;
}

function MobileFilterDrawer({ open, onClose, resultCount }: MobileFilterDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

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
          if (document.activeElement === first) { e.preventDefault(); last.focus(); }
        } else {
          if (document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, handleKeyDown]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
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
            className="absolute right-0 top-0 flex h-full w-full max-w-sm flex-col bg-surface shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Filtrer le catalogue"
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <span className="flex items-center gap-2.5 font-display text-base font-extrabold tracking-tight text-foreground">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                  <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                </span>
                Filtres
              </span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fermer les filtres"
                className="rounded-lg p-2.5 text-faint transition-colors hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-6">
              <CatalogFilters />
            </div>
            <div className="border-t border-border px-5 py-4">
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-full bg-teal-600 min-h-11 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-teal-700 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
              >
                Voir {resultCount} résultat{resultCount !== 1 ? 's' : ''}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default MobileFilterDrawer;
