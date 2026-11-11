export const SITE_CONFIG = {
  companyName: 'ETS HARDWARE CENTRAL',
  legalName: 'ETS HARDWARE CENTRAL',
  domain: 'https://hardware-central.com',
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
    contact: 'contact@hardware-central.com',
  },
  businessHours: {
    display: 'Lun–Ven, 8h–18h',
    timezone: 'WAT',
  },
  currency: 'XAF',
  locale: 'fr-CM',
  hosting: {
    provider: 'Hostinger',
    legalName: 'Hostinger International Ltd.',
    address: '61 Lordou Vironos Street, 6023 Larnaca, Chypre',
  },
  rccm: null as string | null,
} as const;
