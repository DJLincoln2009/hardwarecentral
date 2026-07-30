import type { ReactNode } from 'react';
import Breadcrumb from '@/components/layout/Breadcrumb';

interface LegalPageTemplateProps {
  title: string;
  lastUpdated: string;
  breadcrumbLabel: string;
  children: ReactNode;
}

function LegalPageTemplate({ title, lastUpdated, breadcrumbLabel, children }: LegalPageTemplateProps) {
  const breadcrumbItems = [
    { label: 'Accueil', href: '/' },
    { label: breadcrumbLabel },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="mb-6">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      <article className="prose prose-graphite max-w-none">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-graphite-900 font-display">{title}</h1>
          <p className="mt-1 text-sm text-graphite-500">Dernière mise à jour : {lastUpdated}</p>
        </header>
        {children}
      </article>
    </div>
  );
}

export default LegalPageTemplate;
