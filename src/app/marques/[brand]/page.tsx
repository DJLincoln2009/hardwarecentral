import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getActiveBrands, getBrandByCode } from '@/lib/data/brands';
import { getProductsByBrand } from '@/lib/data/products';
import Breadcrumb from '@/components/layout/Breadcrumb';
import ProductCard from '@/components/product/ProductCard';
import EmptyState from '@/components/ui/EmptyState';
import BrandLogo from '@/components/brands/BrandLogo';

interface Props {
  params: Promise<{ brand: string }>;
}

export async function generateStaticParams(): Promise<{ brand: string }[]> {
  return getActiveBrands().map((b) => ({ brand: b.code.toLowerCase() }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brand: code } = await params;
  const brand = getBrandByCode(code.toUpperCase());
  if (!brand) return { title: 'Marque introuvable' };
  return {
    title: brand.name,
    description: brand.shortDescription.slice(0, 160),
    alternates: { canonical: `/marques/${code}` },
    openGraph: {
      title: `${brand.name} | HardwareCentral`,
      description: brand.shortDescription.slice(0, 160),
    },
  };
}

export default async function BrandPage({ params }: Props) {
  const { brand: code } = await params;
  const brand = getBrandByCode(code.toUpperCase());
  if (!brand) notFound();

  const brandProducts = getProductsByBrand(brand.code);
  const brandName = brand.name;

  const breadcrumbItems = [
    { label: 'Accueil', href: '/' },
    { label: 'Marques', href: '/marques' },
    { label: brandName },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <div className="mb-6">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      <section className="relative isolate overflow-hidden rounded-3xl bg-graphite-950 px-6 py-10 md:px-10 md:py-12">
        <div className="absolute inset-0 -z-10 bg-grid opacity-50" aria-hidden="true" />
        <div
          className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-hero-glow blur-3xl"
          aria-hidden="true"
        />
        <div className="relative flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          <span className="flex h-20 w-48 shrink-0 items-center justify-center rounded-2xl bg-white p-3 shadow-lg">
            {brand.logoUrl ? (
              <BrandLogo src={brand.logoUrl} alt={`Logo ${brand.name}`} />
            ) : (
              <span className="font-display text-2xl font-extrabold text-graphite-900">
                {brandName.charAt(0)}
              </span>
            )}
          </span>
          <div>
            <p className="eyebrow mb-1.5 text-graphite-400">Marque</p>
            <h1 className="font-display text-title font-extrabold tracking-tight text-white">
              {brandName}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-graphite-300">
              {brand.shortDescription}
            </p>
            <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-graphite-200 backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-300" aria-hidden="true" />
              {brandProducts.length} produit{brandProducts.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </section>

      {brandProducts.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {brandProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="mt-8">
          <EmptyState
            variant="empty"
            title="Aucun produit disponible"
            description={`Les produits ${brandName} arrivent bientôt.`}
            action={{ label: 'Voir toutes les marques', href: '/marques' }}
          />
        </div>
      )}
    </div>
  );
}
