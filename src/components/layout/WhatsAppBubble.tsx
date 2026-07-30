'use client';

import { MessageCircle } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/site-config';
import { useUIStore } from '@/lib/stores/ui-store';

function WhatsAppBubble() {
  const modalOpen = useUIStore((s) => s.modalOpen);

  if (modalOpen) return null;

  const url = `https://wa.me/${SITE_CONFIG.whatsapp.numberE164}?text=${encodeURIComponent(SITE_CONFIG.whatsapp.defaultMessage)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contacter par WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-teal-600 text-white shadow-lg transition-all duration-150 hover:bg-teal-800 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
    >
      <MessageCircle className="h-6 w-6" aria-hidden="true" />
    </a>
  );
}

export default WhatsAppBubble;
