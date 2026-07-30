import Link from 'next/link';
import { getActiveBrands } from '@/lib/data/brands';

function BrandsGrid() {
  const brands = getActiveBrands();

  return (
    <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
      {brands.map((brand) => (
        <Link
          key={brand.code}
          href={`/marques/${brand.code.toLowerCase()}`}
          className="text-sm font-semibold text-graphite-500 hover:text-teal-600 transition-colors focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none rounded-sm"
        >
          {brand.name}
        </Link>
      ))}
    </div>
  );
}

export default BrandsGrid;
