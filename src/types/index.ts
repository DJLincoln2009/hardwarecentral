export type CategoryId =
  | 'server-storage'
  | 'networking'
  | 'security'
  | 'cctv'
  | 'laptop'
  | 'datacenter'
  | 'wireless'
  | 'monitor'
  | 'printers';

export type BrandCode =
  'HPE' | 'HP' | 'DELL' | 'LENOVO' | 'CISCO' | 'FORTINET' | 'HUAWEI' | 'HIKVISION';

export type AvailabilityStatus = 'available' | 'limited' | 'on-order' | 'discontinued';

export type ChassisFormat = '1U' | '2U' | '3U' | '4U' | 'Tower' | 'Desktop' | 'Compact';

export type FormFactor = 'rack' | 'tower' | 'desktop' | 'appliance';

export interface Category {
  id: CategoryId;
  name: string;
  icon: string;
  isActive: boolean;
}

export interface Brand {
  code: BrandCode;
  name: string;
  shortDescription: string;
  logoUrl?: string;
  isActive: boolean;
}

export interface ProductAvailability {
  status: AvailabilityStatus;
  stockQuantity: number;
  leadTimeDays?: number;
}

export interface ProductDatasheet {
  name: string;
  url: string;
  fileSizeLabel: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  brand: BrandCode;
  category: CategoryId;

  shortDescription: string;
  fullDescription: string;

  specs: { label: string; value: string }[];

  attributes: {
    chassisFormat?: ChassisFormat;
    rackUnits?: number;
    formFactor?: FormFactor;
  };

  availability: ProductAvailability;
  certifications: string[];
  compatibility: string[];
  datasheets: ProductDatasheet[];

  releaseYear?: number;
  weightKg?: number;
  dimensionsCm?: { height: number; width: number; depth: number };

  isFeatured: boolean;
  publishedAt: string;
}
