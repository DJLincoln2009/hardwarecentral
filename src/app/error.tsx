'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Erreur non rattrapée :', error);
  }, [error]);

  return (
    <section className="relative isolate overflow-hidden bg-graphite-950 px-4 py-24 md:py-32">
      <div className="absolute inset-0 -z-10 bg-grid opacity-60" aria-hidden="true" />
      <div
        className="pointer-events-none absolute inset-x-0 -top-40 mx-auto h-96 max-w-4xl rounded-full bg-hero-glow blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-48 -left-24 h-96 w-96 rounded-full bg-hero-glow-2 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-32 -top-24 h-80 w-80 rounded-full bg-hero-glow-2 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-graphite-200 backdrop-blur">
          <AlertTriangle className="h-3.5 w-3.5 text-teal-300" aria-hidden="true" />
          Erreur serveur
        </span>

        <p className="mt-6 font-display text-[7rem] font-extrabold leading-none tracking-tight text-gradient md:text-[9rem]">
          500
        </p>

        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-white md:text-4xl">
          Une erreur est survenue
        </h1>
        <p className="mt-3 max-w-md text-base leading-relaxed text-graphite-300">
          Un problème technique est survenu. Nos équipes ont été informées.
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            onClick={reset}
            className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-teal-300 px-7 py-3.5 text-sm font-semibold text-graphite-950 shadow-lg shadow-teal-300/25 transition-all duration-200 hover:bg-teal-200 hover:shadow-glow active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 sm:w-auto"
          >
            <RefreshCw className="h-4 w-4 transition-transform duration-300 group-hover:rotate-180" aria-hidden="true" />
            Réessayer
          </button>
          <Link
            href="/"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur transition-all duration-200 hover:border-white/30 hover:bg-white/10 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4 text-teal-300" aria-hidden="true" />
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </section>
  );
}
