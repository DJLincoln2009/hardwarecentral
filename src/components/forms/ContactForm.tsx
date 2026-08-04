'use client';

import { useState, useCallback } from 'react';
import { AlertCircle } from 'lucide-react';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import HoneypotField from '@/components/forms/HoneypotField';
import { useToast } from '@/components/ui/Toast';

const subjectOptions = [
  { value: '', label: 'Sélectionnez un sujet' },
  { value: 'devis', label: 'Demande de devis' },
  { value: 'support-technique', label: 'Support technique' },
  { value: 'partenariat', label: 'Partenariat' },
  { value: 'autre', label: 'Autre' },
];

function ContactForm() {
  const { addToast } = useToast();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [professionalEmail, setProfessionalEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!subject) return;
      setStatus('submitting');
      setErrorMessage('');

      try {
        const res = await fetch('/api/contact-messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName,
            lastName,
            companyName: companyName || undefined,
            professionalEmail,
            subject,
            message,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setStatus('error');
          setErrorMessage(data.error ?? 'Une erreur est survenue.');
          return;
        }

        setStatus('success');
        addToast('Votre message a été envoyé avec succès !');
      } catch {
        setStatus('error');
        setErrorMessage('Erreur réseau. Vos données sont conservées. Veuillez réessayer.');
      }
    },
    [firstName, lastName, companyName, professionalEmail, subject, message, addToast],
  );

  if (status === 'success') {
    return (
      <div className="text-center py-8 space-y-3">
        <p className="text-success-text font-semibold">Message envoyé avec succès !</p>
        <p className="text-sm text-muted">
          Notre équipe vous répondra dans les plus brefs délais.
        </p>
        <Button
          variant="secondary"
          onClick={() => {
            setStatus('idle');
            setFirstName('');
            setLastName('');
            setCompanyName('');
            setProfessionalEmail('');
            setSubject('');
            setMessage('');
          }}
        >
          Envoyer un autre message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <HoneypotField />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Prénom *"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
          aria-required="true"
          disabled={status === 'submitting'}
        />
        <Input
          label="Nom *"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
          aria-required="true"
          disabled={status === 'submitting'}
        />
      </div>

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
        aria-required="true"
        disabled={status === 'submitting'}
      />

      <Select
        label="Sujet *"
        options={subjectOptions}
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        required
        aria-required="true"
        disabled={status === 'submitting'}
      />

      <Textarea
        label="Message *"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        required
        aria-required="true"
        disabled={status === 'submitting'}
      />

      {status === 'error' && (
        <p role="alert" className="flex items-center gap-1.5 text-sm text-danger-text">
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          {errorMessage}
        </p>
      )}

      <Button type="submit" loading={status === 'submitting'}>
        Envoyer le message
      </Button>
    </form>
  );
}

export default ContactForm;
