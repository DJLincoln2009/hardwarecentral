import { cn } from '@/lib/utils';

interface BrandLogoProps {
  src: string;
  alt: string;
  className?: string;
  eager?: boolean;
}

function BrandLogo({ src, alt, className, eager = false }: BrandLogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- SVG local : next/image exige dangerouslyAllowSVG pour le SVG
    <img
      src={src}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      className={cn('h-full w-full object-contain', className)}
    />
  );
}

export default BrandLogo;
