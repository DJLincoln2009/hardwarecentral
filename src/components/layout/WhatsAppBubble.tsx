'use client';

import { MessageCircle } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/site-config';
import { useUIStore } from '@/lib/stores/ui-store';

function WhatsAppBubble() {
  const contextualMessage = useUIStore((s) => s.whatsappMessage);

  const message = contextualMessage ?? SITE_CONFIG.whatsapp.defaultMessage;
  const url = `https://wa.me/${SITE_CONFIG.whatsapp.numberE164}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contacter par WhatsApp"
      className="group fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-teal-700 text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <span
        className="absolute inset-0 rounded-full bg-teal-500/40 animate-ping"
        aria-hidden="true"
        style={{ animationDuration: '3s' }}
      />
      <MessageCircle className="relative h-6 w-6" aria-hidden="true" />
    </a>
  );
}

export default WhatsAppBubble;
