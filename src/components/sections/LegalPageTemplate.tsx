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
    <div className="mx-auto max-w-3xl px-4 py-8 lg:px-6">
      <div className="mb-4">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      <header className="mb-10">
        <p className="eyebrow mb-2">Informations légales</p>
        <h1 className="font-display text-display font-extrabold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-medium text-muted shadow-xs">
          Dernière mise à jour : {lastUpdated}
        </p>
      </header>

      <article className="prose prose-graphite max-w-none">{children}</article>
    </div>
  );
}

export default LegalPageTemplate;
