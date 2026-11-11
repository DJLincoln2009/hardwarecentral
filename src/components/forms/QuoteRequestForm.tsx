'use client';

import { useState, useCallback } from 'react';
import { X, FileText, MailCheck } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import HoneypotField from '@/components/forms/HoneypotField';
import { buildMailtoUrl } from '@/lib/mailto';
import { useQuoteStore } from '@/lib/stores/quote-store';
import { useToast } from '@/components/ui/Toast';
import { SITE_CONFIG } from '@/lib/site-config';

interface QuoteRequestFormProps {
  open: boolean;
  onClose: () => void;
}

function QuoteRequestForm({ open, onClose }: QuoteRequestFormProps) {
  const items = useQuoteStore((s) => s.items);
  const clearAll = useQuoteStore((s) => s.clearAll);
  const removeItem = useQuoteStore((s) => s.removeItem);
  const { addToast } = useToast();

  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [professionalEmail, setProfessionalEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'success'>('idle');

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const honeypot = new FormData(e.currentTarget).get('honeypot');
      if (typeof honeypot === 'string' && honeypot !== '') {
        setStatus('success');
        clearAll();
        return;
      }

      const body = [
        `Nom : ${fullName}`,
        `Société : ${companyName || '—'}`,
        `E-mail : ${professionalEmail}`,
        `Téléphone : ${phone || '—'}`,
        '',
        'Message :',
        message,
        '',
        'Produits demandés :',
        ...(items.length > 0
          ? items.map((i) => `- ${i.name} (SKU : ${i.sku}) × ${i.quantity}`)
          : ['Aucun produit sélectionné.']),
      ];

      window.location.href = buildMailtoUrl(
        SITE_CONFIG.email.contact,
        `Demande de devis — ${fullName}`,
        body,
      );

      setStatus('success');
      clearAll();
      addToast('Votre demande de devis a été transmise !');
    },
    [fullName, companyName, professionalEmail, phone, message, items, clearAll, addToast],
  );

  const handleClose = () => {
    if (status === 'success') {
      setStatus('idle');
      setFullName('');
      setCompanyName('');
      setProfessionalEmail('');
      setPhone('');
      setMessage('');
    }
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="Demander un devis">
      {status === 'success' ? (
        <div className="space-y-3 text-center py-4">
          <MailCheck className="mx-auto h-10 w-10 text-success-text" aria-hidden="true" />
          <p className="text-success-text font-semibold">Demande transmise !</p>
          <p className="text-sm text-muted">
            Votre logiciel de messagerie s&apos;est ouvert avec un e-mail pré-rempli à destination
            de notre équipe commerciale ({SITE_CONFIG.email.contact}). Il ne vous reste qu&apos;à
            l&apos;envoyer.
          </p>
          <Button variant="secondary" onClick={handleClose}>
            Fermer
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-3">
          <HoneypotField />

          <Input
            label="Nom complet *"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          <Input
            label="Société"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
          <Input
            label="E-mail professionnel *"
            type="email"
            value={professionalEmail}
            onChange={(e) => setProfessionalEmail(e.target.value)}
            required
          />
          <Input
            label="Téléphone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <Textarea
            label="Message *"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />

          <div className="rounded-xl border border-border bg-surface-muted/60 p-4">
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
              <FileText className="h-4 w-4 text-accent" aria-hidden="true" />
              Produits dans la demande ({items.length})
            </p>
            {items.length > 0 ? (
              <ul className="max-h-40 space-y-1.5 overflow-y-auto">
                {items.map((item) => (
                  <li key={item.productId} className="flex items-center gap-2 text-sm text-muted">
                    <span className="flex-1 truncate">
                      {item.name}
                      <span className="ml-1 font-mono text-xs text-muted">({item.sku})</span>
                    </span>
                    <span className="shrink-0 font-mono text-xs text-muted">× {item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId)}
                      className="rounded-md p-2 text-faint transition-colors hover:bg-surface-strong hover:text-danger-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      aria-label={`Retirer ${item.name}`}
                    >
                      <X className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted">
                Aucun produit sélectionné. Ajoutez des produits depuis le catalogue.
              </p>
            )}
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:gap-3">
            <Button type="submit" className="w-full justify-center sm:flex-1">
              Envoyer la demande
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              className="w-full sm:w-auto"
            >
              Annuler
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}

export default QuoteRequestForm;
