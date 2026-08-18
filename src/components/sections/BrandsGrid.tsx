import Link from 'next/link';
import { getActiveBrands } from '@/lib/data/brands';
import BrandLogo from '@/components/brands/BrandLogo';

function BrandsGrid() {
  const brands = getActiveBrands();

  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-4 lg:grid-cols-7">
      {brands.map((brand) => (
        <Link
          key={brand.code}
          href={`/marques/${brand.code.toLowerCase()}`}
          className="group flex items-center justify-center rounded-lg border border-border bg-surface px-2 py-3 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:rounded-xl sm:px-3 sm:py-4"
        >
          {brand.logoUrl ? (
            <span className="flex h-8 w-full items-center justify-center sm:h-9">
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
