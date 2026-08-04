'use client';

import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import MobileFilterDrawer from './MobileFilterDrawer';

interface CatalogMobileBarProps {
  resultCount: number;
}

function CatalogMobileBar({ resultCount }: CatalogMobileBarProps) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileFiltersOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-4 py-2.5 text-sm font-medium text-foreground shadow-xs transition-all duration-200 hover:border-border-strong active:scale-95 lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
        Filtrer
      </button>
      <MobileFilterDrawer
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        resultCount={resultCount}
      />
    </>
  );
}

export default CatalogMobileBar;
