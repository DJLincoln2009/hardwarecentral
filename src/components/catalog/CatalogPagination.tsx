'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CatalogPaginationProps {
  currentPage: number;
  totalPages: number;
}

function CatalogPagination({ currentPage, totalPages }: CatalogPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page <= 1) params.delete('page');
    else params.set('page', String(page));
    router.push(`${pathname}?${params.toString()}`);
  };

  const pages: (number | '...')[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  const navButtonClass = cn(
    'flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-150',
    'text-muted hover:bg-surface-muted hover:text-foreground active:scale-95',
    'disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
  );

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1.5">
      <button
        type="button"
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label="Page précédente"
        className={cn(navButtonClass, 'border-border bg-surface')}
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
      </button>

      {pages.map((p, i) =>
        p === '...' ? (
          <span
            key={`ellipsis-${i}`}
            className="flex h-10 w-10 items-center justify-center text-sm text-muted"
          >
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => goToPage(p)}
            aria-current={p === currentPage ? 'page' : undefined}
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-all duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
              p === currentPage
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/25'
                : 'border border-border bg-surface text-muted hover:bg-surface-muted hover:text-foreground',
            )}
          >
            {p}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage >= totalPages}
        aria-label="Page suivante"
        className={cn(navButtonClass, 'border-border bg-surface')}
      >
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </nav>
  );
}

export default CatalogPagination;
