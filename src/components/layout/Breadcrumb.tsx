import { Fragment } from 'react';
import Link from 'next/link';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

function Breadcrumb({ items }: BreadcrumbProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.label,
      item: item.href ? `https://hardwarecentral.com${item.href}` : undefined,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Fil d'Ariane">
        <ol className="flex flex-wrap items-center gap-1 text-sm text-graphite-600">
          {items.map((item, i) => {
            const isLast = i === items.length - 1;
            return (
              <Fragment key={item.label}>
                <li>
                  {isLast || !item.href ? (
                    <span aria-current={isLast ? 'page' : undefined} className={isLast ? 'font-medium text-graphite-900' : ''}>
                      {item.label}
                    </span>
                  ) : (
                    <Link href={item.href} className="hover:text-teal-600 transition-colors">
                      {item.label}
                    </Link>
                  )}
                </li>
                {!isLast && (
                  <li aria-hidden="true" className="text-graphite-400 select-none">
                    /
                  </li>
                )}
              </Fragment>
            );
          })}
        </ol>
      </nav>
    </>
  );
}

export default Breadcrumb;
