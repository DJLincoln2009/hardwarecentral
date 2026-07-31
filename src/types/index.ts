export type ImageSource = 'real' | 'ai-render' | 'placeholder';
export type ImageProvider =
  | 'amazon-scraper'
  | 'icecat'
  | 'manufacturer-portal'
  | 'manual-capture'
  | 'branded-placeholder'
  | 'ai-3d-render';

export interface MediaAsset {
  url: string;
  alt: string;
  width: number;
  height: number;
  imageSource: ImageSource;
  provenance: {
    sourceProvider: ImageProvider;
    sourceUrl: string | null;
    sourceIdentifier: string | null;
    fetchedAt: string;
    checksum: string;
  };
}

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
  | 'HPE'
  | 'HP'
  | 'DELL'
  | 'LENOVO'
  | 'CISCO'
  | 'FORTINET'
  | 'HUAWEI'
  | 'HIKVISION';

export type AvailabilityStatus = 'available' | 'limited' | 'on-order' | 'discontinued';

export type ChassisFormat = '1U' | '2U' | '3U' | '4U' | 'Tower' | 'Desktop' | 'Compact';

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
  leadTimeDays: number;
}

export interface ProductWarranty {
  durationLabel: string;
  supportTier?: 'standard' | 'premium' | 'mission-critical';
}

export interface ProductDatasheet extends MediaAsset {
  name: string;
  fileSizeLabel: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  brand: BrandCode;
  category: CategoryId;
  asin?: string;

  primaryImage: MediaAsset;
  gallery: MediaAsset[];

  shortDescription: string;
  fullDescription: string;

  specs: { label: string; value: string }[];

  attributes: {
    chassisFormat?: ChassisFormat;
    rackUnits?: number;
    formFactor?: 'rack' | 'tower' | 'desktop' | 'appliance';
  };

  availability: ProductAvailability;
  warranty: ProductWarranty;
  certifications: string[];
  compatibility: string[];
  datasheets: ProductDatasheet[];

  releaseYear?: number;
  weightKg?: number;
  dimensionsCm?: { height: number; width: number; depth: number };

  isFeatured: boolean;
  publishedAt: string;
}

export interface QuoteListItem {
  productId: string;
  addedAt: string;
}

export interface QuoteRequestPayload {
  fullName: string;
  companyName?: string;
  professionalEmail: string;
  phone?: string;
  message: string;
  productIds: string[];
  honeypot?: string;
}

export interface ContactMessagePayload {
  firstName: string;
  lastName: string;
  companyName?: string;
  professionalEmail: string;
  subject: 'devis' | 'support-technique' | 'partenariat' | 'autre';
  message: string;
  honeypot?: string;
}

export interface NewsletterSubscriptionPayload {
  email: string;
  honeypot?: string;
}
