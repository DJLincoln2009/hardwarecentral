import type { Brand } from '@/types';

export const brands: Brand[] = [
  {
    code: 'HPE',
    name: 'HPE',
    shortDescription:
      'Leader mondial des infrastructures IT, HPE propose des serveurs, solutions de stockage et réseaux (Aruba) pour les entreprises.',
    isActive: true,
  },
  {
    code: 'DELL',
    name: 'Dell Technologies',
    shortDescription:
      'Dell Technologies fournit des serveurs PowerEdge, stations de travail et solutions de stockage pour les professionnels.',
    isActive: true,
  },
  {
    code: 'CISCO',
    name: 'Cisco',
    shortDescription:
      'Cisco est le leader mondial du réseau et de la sécurité pour les infrastructures d\'entreprise.',
    isActive: true,
  },
  {
    code: 'FORTINET',
    name: 'Fortinet',
    shortDescription:
      'Fortinet est un acteur majeur de la cybersécurité, spécialisé dans les pare-feux et solutions de sécurité réseau.',
    isActive: true,
  },
  {
    code: 'HUAWEI',
    name: 'Huawei',
    shortDescription:
      'Huawei Enterprise propose des solutions de stockage et d\'infrastructure IT innovantes pour les entreprises.',
    isActive: true,
  },
  {
    code: 'HIKVISION',
    name: 'Hikvision',
    shortDescription:
      'Hikvision est le leader mondial de la vidéosurveillance et des systèmes de sécurité électronique.',
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
