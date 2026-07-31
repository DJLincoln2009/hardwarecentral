'use client';

import { useState, useCallback } from 'react';
import { X } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import HoneypotField from '@/components/forms/HoneypotField';
import { useQuoteStore } from '@/lib/stores/quote-store';
import { useToast } from '@/components/ui/Toast';

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
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setStatus('submitting');
      setErrorMessage('');

      try {
        const res = await fetch('/api/quote-requests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName,
            companyName: companyName || undefined,
            professionalEmail,
            phone: phone || undefined,
            message,
            productIds: items.map((i) => i.productId),
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setStatus('error');
          setErrorMessage(data.error ?? 'Une erreur est survenue.');
          return;
        }

        setStatus('success');
        clearAll();
        addToast('Votre demande de devis a été envoyée avec succès !');
      } catch {
        setStatus('error');
        setErrorMessage('Erreur réseau. Vos données sont conservées. Veuillez réessayer.');
      }
    },
    [fullName, companyName, professionalEmail, phone, message, items, clearAll, addToast],
  );

  const handleClose = () => {
    if (status === 'submitting') return;
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
          <p className="text-success-text font-semibold">Demande envoyée avec succès !</p>
          <p className="text-sm text-graphite-600">
            Notre équipe vous recontactera sous 48 à 72 heures ouvrées à l&apos;adresse{' '}
            <strong>{professionalEmail}</strong>.
          </p>
          <Button variant="secondary" onClick={handleClose}>
            Fermer
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <HoneypotField />

          <Input
            label="Nom complet *"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            disabled={status === 'submitting'}
          />
          <Input
            label="Société"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            disabled={status === 'submitting'}
          />
          <Input
            label="E-mail professionnel *"
            type="email"
            value={professionalEmail}
            onChange={(e) => setProfessionalEmail(e.target.value)}
            required
            disabled={status === 'submitting'}
          />
          <Input
            label="Téléphone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={status === 'submitting'}
          />
          <Textarea
            label="Message *"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            disabled={status === 'submitting'}
          />

          <div className="rounded-md border border-graphite-200 bg-graphite-50 p-3">
            <p className="mb-2 text-sm font-medium text-graphite-900">
              Produits dans la demande ({items.length})
            </p>
            {items.length > 0 ? (
              <ul className="space-y-1.5">
                {items.map((item) => (
                  <li key={item.productId} className="flex items-center gap-2 text-sm text-graphite-600">
                    <span className="flex-1 truncate">
                      {item.name}
                      <span className="ml-1 font-mono text-xs text-graphite-600">({item.sku})</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId)}
                      disabled={status === 'submitting'}
                      className="p-2.5 text-graphite-400 hover:text-danger-text transition-colors rounded-sm focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none"
                      aria-label={`Retirer ${item.name}`}
                    >
                      <X className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-graphite-500">
                Aucun produit sélectionné. Ajoutez des produits depuis le catalogue.
              </p>
            )}
          </div>

          {status === 'error' && (
            <p role="alert" className="text-sm text-danger-text flex items-center gap-1">
              <span aria-hidden="true">⚠</span>
              {errorMessage}
            </p>
          )}

          <div className="flex gap-3">
            <Button type="submit" loading={status === 'submitting'} className="flex-1 justify-center">
              Envoyer la demande
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={status === 'submitting'}
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
