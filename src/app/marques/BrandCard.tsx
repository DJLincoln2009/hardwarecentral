import Link from 'next/link';
import type { Brand } from '@/types';
import { ArrowRight } from 'lucide-react';
import { products } from '@/lib/data/products';
import BrandLogo from '@/components/brands/BrandLogo';

interface BrandCardProps {
  brand: Brand;
}

function BrandCard({ brand }: BrandCardProps) {
  const count = products.filter((p) => p.brand === brand.code).length;

  return (
    <Link
      href={`/marques/${brand.code.toLowerCase()}`}
      className="group flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6 text-center shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-border-strong hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <div className="flex h-16 w-full items-center justify-center rounded-xl border border-border bg-surface-muted px-4">
        {brand.logoUrl ? (
          <BrandLogo src={brand.logoUrl} alt={`Logo ${brand.name}`} />
        ) : (
          <span className="font-display text-xl font-extrabold text-foreground">
            {brand.name.charAt(0)}
          </span>
        )}
      </div>
      <div>
        <p className="font-display text-base font-bold text-foreground">{brand.name}</p>
        <p className="mt-0.5 text-xs font-medium text-muted">
          {count} produit{count !== 1 ? 's' : ''}
        </p>
      </div>
      <p className="text-sm leading-relaxed text-muted line-clamp-2">{brand.shortDescription}</p>
      <span className="mt-auto inline-flex items-center justify-center gap-1 text-sm font-semibold text-accent transition-colors group-hover:text-accent-hover">
        Voir les produits
        <ArrowRight
          className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </span>
    </Link>
  );
}

export default BrandCard;
