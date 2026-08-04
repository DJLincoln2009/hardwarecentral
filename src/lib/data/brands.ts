import type { Brand } from '@/types';

export const brands: Brand[] = [
  {
    code: 'HPE',
    name: 'HPE',
    shortDescription:
      "Hewlett Packard Enterprise (HPE) conçoit des infrastructures IT d'entreprise : serveurs ProLiant, stockage Alletra/Nimble/Primera/StoreOnce, appliances SimpliVity et réseaux Aruba.",
    logoUrl: '/brands/hpe.svg',
    isActive: true,
  },
  {
    code: 'HP',
    name: 'HP Inc.',
    shortDescription:
      "HP Inc. est le spécialiste des PC professionnels et des stations de travail : portables EliteBook/ProBook, workstations Z et ZBook pour les usages exigeants.",
    logoUrl: '/brands/hp.svg',
    isActive: true,
  },
  {
    code: 'DELL',
    name: 'Dell Technologies',
    shortDescription:
      'Dell Technologies fournit des serveurs PowerEdge, stations de travail, PC portables Latitude/Precision/XPS et solutions de stockage pour les professionnels.',
    logoUrl: '/brands/dell.svg',
    isActive: true,
  },
  {
    code: 'CISCO',
    name: 'Cisco',
    shortDescription:
      'Cisco est le leader mondial du réseau, de la sécurité et de la collaboration (Webex, Room Kit, Board Pro) pour les infrastructures d\'entreprise.',
    logoUrl: '/brands/cisco.svg',
    isActive: true,
  },
  {
    code: 'FORTINET',
    name: 'Fortinet',
    shortDescription:
      'Fortinet est un acteur majeur de la cybersécurité, spécialisé dans les pare-feux, solutions de sécurité réseau, switches FortiSwitch, points d\'accès FortiAP et appliances de gestion FortiManager/FortiAnalyzer.',
    logoUrl: '/brands/fortinet.svg',
    isActive: true,
  },
  {
    code: 'HUAWEI',
    name: 'Huawei',
    shortDescription:
      'Huawei Enterprise propose des solutions de stockage, d\'infrastructure IT, PC portables MateBook/Qingyun et stations de travail MateStation pour les entreprises.',
    logoUrl: '/brands/huawei.svg',
    isActive: true,
  },
  {
    code: 'HIKVISION',
    name: 'Hikvision',
    shortDescription:
      'Hikvision est le leader mondial de la vidéosurveillance, des systèmes de sécurité électronique et des stations de travail dédiées à la gestion vidéo et à l\'analyse IA.',
    logoUrl: '/brands/hikvision.svg',
    isActive: true,
  },
  {
    code: 'LENOVO',
    name: 'Lenovo',
    shortDescription:
      'Lenovo propose des serveurs, stations de travail et équipements informatiques professionnels.',
    isActive: false,
  },
];

export function getBrandByCode(code: string): Brand | undefined {
  return brands.find((b) => b.code === code);
}

export function getActiveBrands(): Brand[] {
  return brands.filter((b) => b.isActive);
}
