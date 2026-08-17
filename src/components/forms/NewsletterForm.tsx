'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { Send } from 'lucide-react';
import Button from '@/components/ui/Button';
import HoneypotField from '@/components/forms/HoneypotField';
import { useToast } from '@/components/ui/Toast';

function NewsletterForm() {
  const { addToast } = useToast();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setStatus('submitting');
      setErrorMessage('');

      try {
        const res = await fetch('/api/newsletter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, honeypot: '' }),
        });

        const data = await res.json();

        if (!res.ok) {
          setStatus('error');
          setErrorMessage(data.error ?? 'Une erreur est survenue.');
          return;
        }

        setStatus('success');
        addToast(
          data.message === 'Vous êtes déjà inscrit'
            ? 'Vous êtes déjà inscrit à notre newsletter.'
            : 'Inscription réussie !',
        );
      } catch {
        setStatus('error');
        setErrorMessage('Erreur réseau. Veuillez réessayer.');
      }
    },
    [email, addToast],
  );

  if (status === 'success') {
    return (
      <p className="rounded-2xl border border-teal-400/30 bg-teal-400/10 px-5 py-4 text-sm font-medium text-teal-200">
        Merci de votre inscription !
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-left">
      <HoneypotField />
      <div className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor="newsletter-email" className="sr-only">Adresse e-mail</label>
        <input
          id="newsletter-email"
          type="email"
          required
          aria-required="true"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Votre adresse e-mail"
          disabled={status === 'submitting'}
          className="flex-1 rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-sm text-white backdrop-blur placeholder:text-graphite-400 transition-all duration-200 focus:border-teal-300 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-teal-200/40 disabled:opacity-50"
        />
        <Button type="submit" loading={status === 'submitting'} size="md" icon={<Send className="h-4 w-4" />}>
          S&rsquo;inscrire
        </Button>
      </div>
      <div className="flex items-start gap-2">
        <input
          id="newsletter-consent"
          type="checkbox"
          required
          disabled={status === 'submitting'}
          className="mt-0.5 h-4 w-4 shrink-0 rounded-sm border-graphite-500 text-teal-500 focus:ring-2 focus:ring-teal-200"
        />
        <label htmlFor="newsletter-consent" className="text-xs leading-relaxed text-graphite-300">
          J&apos;accepte de recevoir les actualités et offres de HardwareCentral par e-mail. Consultez notre{' '}
          <Link href="/confidentialite" className="text-teal-300 underline underline-offset-2 transition-colors hover:text-teal-200">
            politique de confidentialité
          </Link>
          .
        </label>
      </div>
      {status === 'error' && (
        <p role="alert" className="mt-1 text-xs text-danger-text">
          {errorMessage}
        </p>
      )}
    </form>
  );
}

export default NewsletterForm;
