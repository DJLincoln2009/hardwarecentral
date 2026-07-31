import type { Brand } from '@/types';

export const brands: Brand[] = [
  {
    code: 'HPE',
    name: 'HPE',
    shortDescription:
      "Hewlett Packard Enterprise (HPE) conçoit des infrastructures IT d'entreprise : serveurs ProLiant, stockage Alletra/Nimble/Primera/StoreOnce, appliances SimpliVity et réseaux Aruba.",
    isActive: true,
  },
  {
    code: 'HP',
    name: 'HP Inc.',
    shortDescription:
      "HP Inc. est le spécialiste des PC professionnels et des stations de travail : portables EliteBook/ProBook, workstations Z et ZBook pour les usages exigeants.",
    isActive: true,
  },
  {
    code: 'DELL',
    name: 'Dell Technologies',
    shortDescription:
      'Dell Technologies fournit des serveurs PowerEdge, stations de travail, PC portables Latitude/Precision/XPS et solutions de stockage pour les professionnels.',
    isActive: true,
  },
  {
    code: 'CISCO',
    name: 'Cisco',
    shortDescription:
      'Cisco est le leader mondial du réseau, de la sécurité et de la collaboration (Webex, Room Kit, Board Pro) pour les infrastructures d\'entreprise.',
    isActive: true,
  },
  {
    code: 'FORTINET',
    name: 'Fortinet',
    shortDescription:
      'Fortinet est un acteur majeur de la cybersécurité, spécialisé dans les pare-feux, solutions de sécurité réseau, switches FortiSwitch, points d\'accès FortiAP et appliances de gestion FortiManager/FortiAnalyzer.',
    isActive: true,
  },
  {
    code: 'HUAWEI',
    name: 'Huawei',
    shortDescription:
      'Huawei Enterprise propose des solutions de stockage, d\'infrastructure IT, PC portables MateBook/Qingyun et stations de travail MateStation pour les entreprises.',
    isActive: true,
  },
  {
    code: 'HIKVISION',
    name: 'Hikvision',
    shortDescription:
      'Hikvision est le leader mondial de la vidéosurveillance, des systèmes de sécurité électronique et des stations de travail dédiées à la gestion vidéo et à l\'analyse IA.',
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
