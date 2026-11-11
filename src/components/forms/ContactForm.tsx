'use client';

import { useState, useCallback } from 'react';
import { MailCheck } from 'lucide-react';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import HoneypotField from '@/components/forms/HoneypotField';
import { buildMailtoUrl } from '@/lib/mailto';
import { useToast } from '@/components/ui/Toast';
import { SITE_CONFIG } from '@/lib/site-config';

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
  const [status, setStatus] = useState<'idle' | 'success'>('idle');

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!subject) return;

      const honeypot = new FormData(e.currentTarget).get('honeypot');
      if (typeof honeypot === 'string' && honeypot !== '') {
        setStatus('success');
        return;
      }

      const subjectLabel =
        subjectOptions.find((option) => option.value === subject)?.label ?? 'Contact';

      const body = [
        `Prénom : ${firstName}`,
        `Nom : ${lastName}`,
        `Société : ${companyName || '—'}`,
        `E-mail : ${professionalEmail}`,
        '',
        'Message :',
        message,
      ];

      window.location.href = buildMailtoUrl(
        SITE_CONFIG.email.contact,
        `${subjectLabel} — ${firstName} ${lastName}`,
        body,
      );

      setStatus('success');
      addToast('Votre message a été transmis avec succès !');
    },
    [firstName, lastName, companyName, professionalEmail, subject, message, addToast],
  );

  if (status === 'success') {
    return (
      <div className="text-center py-8 space-y-3">
        <MailCheck className="mx-auto h-10 w-10 text-success-text" aria-hidden="true" />
        <p className="text-success-text font-semibold">Message transmis !</p>
        <p className="text-sm text-muted">
          Votre logiciel de messagerie s&apos;est ouvert avec un e-mail pré-rempli à destination de
          notre équipe ({SITE_CONFIG.email.contact}). Il ne vous reste qu&apos;à l&apos;envoyer.
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
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-4">
      <HoneypotField />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        <Input
          label="Prénom *"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
          aria-required="true"
        />
        <Input
          label="Nom *"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
          aria-required="true"
        />
      </div>

      <Input label="Société" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />

      <Input
        label="E-mail professionnel *"
        type="email"
        value={professionalEmail}
        onChange={(e) => setProfessionalEmail(e.target.value)}
        required
        aria-required="true"
      />

      <Select
        label="Sujet *"
        options={subjectOptions}
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        required
        aria-required="true"
      />

      <Textarea
        label="Message *"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        required
        aria-required="true"
      />

      <Button type="submit" className="w-full sm:w-auto">
        Envoyer le message
      </Button>
    </form>
  );
}

export default ContactForm;
