'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Erreur non rattrapée :', error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-7xl font-bold text-graphite-200 font-display">500</p>
      <h1 className="mt-4 text-2xl font-bold text-graphite-900 font-display">
        Une erreur est survenue
      </h1>
      <p className="mt-2 text-sm text-graphite-600">
        Un problème technique est survenu. Nos équipes ont été informées.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-md bg-teal-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-teal-800 transition-colors focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Réessayer
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-md border border-graphite-200 px-5 py-2.5 text-sm font-medium text-graphite-900 hover:bg-graphite-50 transition-colors focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
