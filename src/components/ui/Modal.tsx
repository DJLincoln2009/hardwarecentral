'use client';

import { useEffect, useRef, type ReactNode, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
  /** Largeur maximale : 'sm' (formulaires courts) | 'md' (défaut) | 'lg' (devis) */
  size?: 'sm' | 'md' | 'lg';
}

function Modal({ open, onClose, title, children, className = '', size = 'md' }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<Element | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  const sizeMap = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md',
    lg: 'sm:max-w-2xl',
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
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
      triggerRef.current = document.activeElement;
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';

      requestAnimationFrame(() => {
        dialogRef.current?.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        )?.focus();
      });
    } else {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      if (triggerRef.current instanceof HTMLElement) {
        triggerRef.current.focus();
      }
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, handleKeyDown]);

  const modal = (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.25 }}
            className="absolute inset-0 bg-backdrop backdrop-blur-[2px]"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            ref={dialogRef}
            initial={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.96, y: 16, translateZ: 0 }
            }
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
            exit={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.96, y: 16 }
            }
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { duration: 0.35, ease: [0.16, 1, 0.3, 1] }
            }
            className={cn(
              'relative z-10 flex w-full flex-col rounded-none border-0 border-border bg-surface shadow-xl',
              'max-w-full max-h-[100dvh]',
              'sm:rounded-2xl sm:border sm:max-h-[85vh]',
              sizeMap[size],
              className,
            )}
          >
            <div className="flex items-center justify-between gap-4 border-b border-border/60 px-4 pt-4 pb-3 sm:px-6 sm:pt-5 sm:pb-4">
              <h2
                id="modal-title"
                className="font-display text-lg font-bold tracking-tight text-foreground"
              >
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="group -mr-1.5 -mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-faint transition-colors hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                aria-label="Fermer la fenêtre"
              >
                <X className="h-4.5 w-4.5 transition-transform duration-200 group-hover:rotate-90" aria-hidden="true" />
              </button>
            </div>
            <div className="overflow-y-auto px-4 py-4 sm:px-6 sm:py-5 pb-[max(1rem,env(safe-area-inset-bottom))]">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  if (typeof window === 'undefined') return null;

  return createPortal(modal, document.body);
}

export default Modal;
