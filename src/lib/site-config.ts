export const SITE_CONFIG = {
  companyName: 'HardwareCentral',
  address: {
    line1: 'Douala, Bonamoussadi',
    city: 'Douala',
    country: 'Cameroun',
  },
  phone: {
    display: '+237 677550082',
    e164: '+237677550082',
  },
  whatsapp: {
    numberE164: '237677550082',
    defaultMessage:
      "Bonjour HardwareCentral, je souhaite avoir plus d'informations sur vos équipements et solutions d'infrastructure.",
  },
  email: {
    contact: 'contact@hardwarecentral.com',
    general: 'contact@hardwarecentral.com',
  },
  businessHours: {
    display: 'Lun–Ven, 8h–18h',
    timezone: 'WAT',
  },
  currency: 'XAF',
  locale: 'fr-CM',
} as const;
