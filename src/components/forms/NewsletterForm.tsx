'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { Send } from 'lucide-react';
import Button from '@/components/ui/Button';
import HoneypotField from '@/components/forms/HoneypotField';
import { buildMailtoUrl } from '@/lib/mailto';
import { useToast } from '@/components/ui/Toast';
import { SITE_CONFIG } from '@/lib/site-config';

function NewsletterForm() {
  const { addToast } = useToast();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'success'>('idle');

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const honeypot = new FormData(e.currentTarget).get('honeypot');
      if (typeof honeypot === 'string' && honeypot !== '') {
        setStatus('success');
        return;
      }

      const body = [
        'Bonjour,',
        '',
        `Je souhaite m'inscrire à la newsletter avec l'adresse : ${email}`,
      ];

      window.location.href = buildMailtoUrl(
        SITE_CONFIG.email.contact,
        'Inscription à la newsletter',
        body,
      );

      setStatus('success');
      addToast('Votre inscription a été préparée !');
    },
    [email, addToast],
  );

  if (status === 'success') {
    return (
      <p className="rounded-2xl border border-teal-400/30 bg-teal-400/10 px-5 py-4 text-sm font-medium text-teal-200">
        Merci ! Votre logiciel de messagerie s&apos;est ouvert pour finaliser votre inscription à
        notre newsletter.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-left">
      <HoneypotField />
      <div className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor="newsletter-email" className="sr-only">
          Adresse e-mail
        </label>
        <input
          id="newsletter-email"
          type="email"
          required
          aria-required="true"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Votre adresse e-mail"
          className="min-h-[44px] flex-1 rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-sm text-white backdrop-blur placeholder:text-graphite-400 transition-all duration-200 focus:border-teal-300 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-teal-200/40 disabled:opacity-50"
        />
        <Button type="submit" size="md" icon={<Send className="h-4 w-4" />}>
          S&rsquo;inscrire
        </Button>
      </div>
      <div className="flex items-start gap-2.5">
        <input
          id="newsletter-consent"
          type="checkbox"
          required
          className="mt-0.5 h-4 w-4 shrink-0 rounded-sm border-graphite-500 text-teal-500 focus:ring-2 focus:ring-teal-200"
        />
        <label
          htmlFor="newsletter-consent"
          className="min-h-[44px] flex items-center text-xs leading-relaxed text-graphite-300"
        >
          J&apos;accepte de recevoir les actualités et offres de HardwareCentral par e-mail.
          Consultez notre{' '}
          <Link
            href="/confidentialite"
            className="text-teal-300 underline underline-offset-2 transition-colors hover:text-teal-200"
          >
            politique de confidentialité
          </Link>
          .
        </label>
      </div>
    </form>
  );
}

export default NewsletterForm;
