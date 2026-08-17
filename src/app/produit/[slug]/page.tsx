import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Check, Download, BadgeCheck } from 'lucide-react';
import { products, getProductById } from '@/lib/data/products';
import { getBrandByCode } from '@/lib/data/brands';
import { getCategoryById } from '@/lib/data/categories';
import { stripBrandPrefix } from '@/lib/utils';
import Breadcrumb from '@/components/layout/Breadcrumb';
import ProductGallery from '@/components/product/ProductGallery';
import ProductSpecsTable from '@/components/product/ProductSpecsTable';
import ProductAvailabilityBadge from '@/components/product/ProductAvailabilityBadge';
import QuotePanel from '@/components/product/QuotePanel';
import ProductWhatsAppMessage from '@/components/product/ProductWhatsAppMessage';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return products.map((p) => ({ slug: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductById(slug);
  if (!product) return { title: 'Produit introuvable' };
  const brand = getBrandByCode(product.brand);
  const brandName = brand?.name ?? product.brand;
  return {
    title: `${product.name} – ${brandName}`,
    description: product.shortDescription.slice(0, 160),
    openGraph: {
      title: `${product.name} – ${brandName}`,
      description: product.shortDescription.slice(0, 160),
    },
    alternates: { canonical: `/produit/${slug}` },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = getProductById(slug);
  if (!product) notFound();

  const brand = getBrandByCode(product.brand);
  const category = getCategoryById(product.category);

  const breadcrumbItems = [
    { label: 'Accueil', href: '/' },
    { label: category?.name ?? product.category, href: `/catalogue?categorie=${product.category}` },
    { label: product.name },
  ];

  const availabilityMap: Record<string, string> = {
    available: 'https://schema.org/InStock',
    limited: 'https://schema.org/LimitedAvailability',
    'on-order': 'https://schema.org/PreOrder',
    discontinued: 'https://schema.org/Discontinued',
  };

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.shortDescription,
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: brand?.name ?? product.brand,
    },
    image: product.primaryImage.url || undefined,
    category: category?.name ?? product.category,
    availability: availabilityMap[product.availability.status] ?? 'https://schema.org/InStock',
  };

  const stockCount = product.availability.stockQuantity;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <ProductWhatsAppMessage productName={product.name} sku={product.sku} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <div className="mb-6">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      <div className="flex flex-col gap-10 lg:flex-row lg:gap-14">
        <div className="w-full lg:w-[400px] lg:flex-shrink-0">
          <ProductGallery
            images={[product.primaryImage, ...product.gallery]}
            productName={product.name}
          />
          {product.primaryImage.imageSource === 'ai-render' && (
            <p className="mt-3 text-xs italic text-muted">
              Visuel généré, produit réel non contractuel sur cette image.
            </p>
          )}
        </div>

        <div className="flex-1 space-y-6">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              {brand && (
                <Link
                  href={`/marques/${brand.code.toLowerCase()}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted shadow-xs transition-all duration-150 hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <BadgeCheck className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                  {brand.name}
                </Link>
              )}
              <span className="rounded-full bg-surface-muted px-3 py-1 font-mono text-xs text-muted">
                Réf: {product.sku}
              </span>
            </div>
            <h1 className="mt-3 font-display text-2xl font-extrabold leading-tight tracking-tight text-foreground lg:text-3xl">
              {stripBrandPrefix(product.name, product.brand)}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <ProductAvailabilityBadge status={product.availability.status} />
            {stockCount > 0 && (
              <span className="text-xs font-semibold text-success-text">
                {stockCount} unité{stockCount > 1 ? 's' : ''} en stock
              </span>
            )}
            {stockCount === 0 &&
              product.availability.leadTimeDays != null &&
              product.availability.leadTimeDays > 0 && (
                <span className="text-xs font-medium text-muted">
                  Délai estimé : {product.availability.leadTimeDays} jour
                  {product.availability.leadTimeDays > 1 ? 's' : ''}
                </span>
              )}
          </div>

          {product.specs.length > 0 && (
            <div>
              <p className="eyebrow mb-2.5">Caractéristiques clés</p>
              <ul className="space-y-2">
                {product.specs.slice(0, 4).map((s) => (
                  <li key={s.label} className="flex items-baseline gap-2.5 text-sm leading-snug">
                    <Check className="h-4 w-4 shrink-0 translate-y-0.5 text-accent" aria-hidden="true" />
                    <span className="text-muted">
                      <span className="font-semibold text-foreground">{s.label} :</span>{' '}
                      {s.value}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {product.datasheets.length > 0 && (
            <div className="flex flex-col gap-2">
              {product.datasheets.map((ds) => (
                <a
                  key={ds.url}
                  href={ds.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-border-strong bg-surface px-4 py-2.5 text-sm font-medium text-foreground transition-all duration-150 hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <Download className="h-4 w-4 text-accent" aria-hidden="true" />
                  Télécharger la fiche technique (PDF)
                  <span className="text-xs text-muted">({ds.fileSizeLabel})</span>
                </a>
              ))}
            </div>
          )}

          <QuotePanel product={product} />
        </div>
      </div>

      <div className="mt-14 space-y-10">
        <section>
          <div className="mb-5 flex items-center gap-3">
            <h2 className="font-display text-xl font-extrabold tracking-tight text-foreground">
              Caractéristiques techniques
            </h2>
            <span className="h-px flex-1 bg-border" aria-hidden="true" />
          </div>
          <ProductSpecsTable specs={product.specs} />
        </section>

        {(product.certifications.length > 0 || product.compatibility.length > 0) && (
          <div className="grid gap-4 sm:grid-cols-2">
            {product.certifications.length > 0 && (
              <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs">
                <h3 className="text-sm font-semibold text-foreground">Certifications</h3>
                <ul className="mt-2.5 flex flex-wrap gap-2">
                  {product.certifications.map((cert) => (
                    <li
                      key={cert}
                      className="rounded-full bg-surface-muted px-3 py-1.5 text-xs font-medium text-muted"
                    >
                      {cert}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {product.compatibility.length > 0 && (
              <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs">
                <h3 className="text-sm font-semibold text-foreground">Compatibilité</h3>
                <ul className="mt-2.5 flex flex-wrap gap-2">
                  {product.compatibility.map((comp) => (
                    <li
                      key={comp}
                      className="rounded-full bg-surface-muted px-3 py-1.5 text-xs font-medium text-muted"
                    >
                      {comp}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {product.fullDescription && (
          <section>
            <div className="mb-5 flex items-center gap-3">
              <h2 className="font-display text-xl font-extrabold tracking-tight text-foreground">
                Description
              </h2>
              <span className="h-px flex-1 bg-border" aria-hidden="true" />
            </div>
            <p className="max-w-3xl whitespace-pre-line text-sm leading-relaxed text-muted">
              {product.fullDescription}
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
