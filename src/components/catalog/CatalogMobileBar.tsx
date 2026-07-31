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
        className="inline-flex items-center gap-1.5 rounded-md border border-graphite-200 px-3 py-1.5 text-sm text-graphite-600 hover:bg-graphite-50 transition-colors lg:hidden focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none"
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
