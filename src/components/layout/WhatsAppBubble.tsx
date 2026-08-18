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
      className="group fixed z-40 flex items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-teal-700 text-white shadow-lg transition-all duration-300 ease-[var(--ease-out-expo)] hover:shadow-xl hover:-translate-y-0.5 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] h-12 w-12 sm:bottom-[max(1.5rem,env(safe-area-inset-bottom))] sm:right-[max(1.5rem,env(safe-area-inset-right))] sm:h-14 sm:w-14"
    >
      <span
        className="absolute inset-0 rounded-full bg-teal-500/40 animate-ping"
        aria-hidden="true"
        style={{ animationDuration: '3s' }}
      />
      <MessageCircle className="relative h-6 w-6 max-sm:h-5 max-sm:w-5" aria-hidden="true" />
    </a>
  );
}

export default WhatsAppBubble;
