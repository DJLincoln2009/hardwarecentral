import type { AvailabilityStatus } from '@/types';
import Badge from '@/components/ui/Badge';
import { getAvailabilityDisplay } from '@/lib/utils';

interface ProductAvailabilityBadgeProps {
  status: AvailabilityStatus;
}

function ProductAvailabilityBadge({ status }: ProductAvailabilityBadgeProps) {
  const { label, variant } = getAvailabilityDisplay(status);
  return <Badge variant={variant}>{label}</Badge>;
}

export default ProductAvailabilityBadge;
