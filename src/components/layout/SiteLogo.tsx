import { cn } from '@/lib/utils';

interface SiteLogoProps {
  variant?: 'default' | 'white';
  className?: string;
  alt?: string;
}

function SiteLogo({ variant = 'default', className, alt = 'HardwareCentral' }: SiteLogoProps) {
  const src =
    variant === 'white' ? '/logo/hardwarecentral-logo-white.svg' : '/logo/hardwarecentral-logo.svg';

  return (
    // eslint-disable-next-line @next/next/no-img-element -- SVG local : next/image exige dangerouslyAllowSVG pour le SVG
    <img
      src={src}
      alt={alt}
      width={1194}
      height={741}
      decoding="async"
      className={cn('w-auto', className)}
    />
  );
}

export default SiteLogo;
