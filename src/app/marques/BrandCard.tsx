import Link from 'next/link';
import type { Brand } from '@/types';
import { ArrowRight } from 'lucide-react';
import { products } from '@/lib/data/products';

interface BrandCardProps {
  brand: Brand;
}

function BrandCard({ brand }: BrandCardProps) {
  const count = products.filter((p) => p.brand === brand.code).length;

  return (
    <Link
      href={`/marques/${brand.code.toLowerCase()}`}
      className="flex flex-col items-center gap-3 rounded-lg border border-graphite-200 bg-white p-6 text-center transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 focus-visible:outline-none"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-graphite-50">
        <span className="text-lg font-bold font-display text-graphite-600">
          {brand.name.charAt(0)}
        </span>
      </div>
      <div>
        <p className="font-semibold text-graphite-900">{brand.name}</p>
        <p className="mt-0.5 text-xs text-graphite-500">{count} produits</p>
      </div>
      <p className="text-sm text-graphite-600 line-clamp-2">{brand.shortDescription}</p>
      <span className="inline-flex items-center gap-1 text-sm font-medium text-teal-600 hover:text-teal-800 transition-colors">
        Voir les produits
        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
      </span>
    </Link>
  );
}

export default BrandCard;
