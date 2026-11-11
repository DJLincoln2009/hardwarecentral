import {
  Cctv,
  Laptop,
  Monitor,
  Network,
  Printer,
  Server,
  ShieldCheck,
  Wifi,
  type LucideIcon,
} from 'lucide-react';
import type { BrandCode, CategoryId } from '@/types';
import { cn } from '@/lib/utils';

interface BrandVisual {
  color: string;
  bg: string;
  label: string;
}

const BRAND_VISUALS: Record<BrandCode, BrandVisual> = {
  HPE: { color: '#01A982', bg: '#EDFBF7', label: 'HPE' },
  HP: { color: '#0096D6', bg: '#EDF7FC', label: 'HP' },
  DELL: { color: '#0076CE', bg: '#EDF6FC', label: 'Dell' },
  FORTINET: { color: '#EE3124', bg: '#FDF1F0', label: 'Fortinet' },
  CISCO: { color: '#049FD9', bg: '#EDF8FD', label: 'Cisco' },
  HUAWEI: { color: '#CF0A2C', bg: '#FCF1F2', label: 'Huawei' },
  HIKVISION: { color: '#00A0E9', bg: '#EDF7FD', label: 'Hikvision' },
  LENOVO: { color: '#E2231A', bg: '#FCF1F0', label: 'Lenovo' },
};

const categoryIcons: Record<CategoryId, LucideIcon> = {
  'server-storage': Server,
  networking: Network,
  security: ShieldCheck,
  cctv: Cctv,
  laptop: Laptop,
  datacenter: Server,
  wireless: Wifi,
  monitor: Monitor,
  printers: Printer,
};

interface ProductVisualProps {
  brand: BrandCode;
  productName: string;
  category?: CategoryId;
  iconSize?: 'sm' | 'md' | 'lg';
  compact?: boolean;
  className?: string;
}

/**
 * Placeholder visuel personnalisé des produits — remplace les photos produits.
 * Reproduit l'identité des visuels SVG historiques : fond teinté aux couleurs
 * de la marque, bordure pointillée, icône de catégorie, pastille marque et
 * mention honnête « Photo à venir ».
 */
function ProductVisual({
  brand,
  productName,
  category,
  iconSize = 'md',
  compact = false,
  className,
}: ProductVisualProps) {
  const visual = BRAND_VISUALS[brand];
  const Icon = category ? categoryIcons[category] : Server;

  const iconClasses = {
    sm: 'h-6 w-6',
    md: 'h-10 w-10 sm:h-12 sm:w-12',
    lg: 'h-14 w-14 sm:h-16 sm:w-16',
  } as const;

  return (
    <div
      role="img"
      aria-label={`${productName} — photo à venir`}
      className={cn(
        'relative flex w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl p-4',
        className,
      )}
      style={{ backgroundColor: visual.bg }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-2 rounded-xl border-2 border-dashed opacity-30"
        style={{ borderColor: visual.color }}
      />
      <Icon
        className={cn('relative shrink-0', iconClasses[iconSize])}
        style={{ color: visual.color }}
        aria-hidden="true"
      />
      <span
        className="relative rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider"
        style={{ backgroundColor: `${visual.color}1F`, color: visual.color }}
      >
        {visual.label}
      </span>
      {!compact && (
        <span className="relative line-clamp-2 text-center text-xs font-medium text-graphite-600">
          {productName}
        </span>
      )}
      <span className="relative text-[11px] italic text-graphite-400">Photo à venir</span>
    </div>
  );
}

export default ProductVisual;
