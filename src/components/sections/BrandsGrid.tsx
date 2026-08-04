import Link from 'next/link';
import { getActiveBrands } from '@/lib/data/brands';
import BrandLogo from '@/components/brands/BrandLogo';

function BrandsGrid() {
  const brands = getActiveBrands();

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
      {brands.map((brand) => (
        <Link
          key={brand.code}
          href={`/marques/${brand.code.toLowerCase()}`}
          className="group flex items-center justify-center rounded-xl border border-border bg-surface px-3 py-4 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {brand.logoUrl ? (
            <span className="flex h-9 w-full items-center justify-center">
              <BrandLogo src={brand.logoUrl} alt={`Logo ${brand.name}`} />
            </span>
          ) : (
            <span className="text-sm font-semibold text-muted">{brand.name}</span>
          )}
        </Link>
      ))}
    </div>
  );
}

export default BrandsGrid;
