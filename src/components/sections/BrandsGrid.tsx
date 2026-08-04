import Link from 'next/link';
import { getActiveBrands } from '@/lib/data/brands';

function BrandsGrid() {
  const brands = getActiveBrands();

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
      {brands.map((brand) => (
        <Link
          key={brand.code}
          href={`/marques/${brand.code.toLowerCase()}`}
          className="group flex items-center justify-center rounded-xl border border-border bg-surface px-4 py-4 text-sm font-semibold text-muted shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:text-accent hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {brand.name}
        </Link>
      ))}
    </div>
  );
}

export default BrandsGrid;
