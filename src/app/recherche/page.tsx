import type { Metadata } from 'next';
import { Suspense } from 'react';
import SearchContent from './SearchContent';

export const metadata: Metadata = {
  title: 'Recherche | HardwareCentral',
  robots: { index: false, follow: true },
};

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-8"><p className="text-graphite-600">Recherche en cours…</p></div>}>
      <SearchContent />
    </Suspense>
  );
}
