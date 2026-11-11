import type { Metadata } from 'next';
import LegalPageTemplate from '@/components/sections/LegalPageTemplate';
import { SITE_CONFIG } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Mentions légales',
  description:
    "Mentions légales du site HardwareCentral : identité de l'éditeur basé à Douala (Cameroun), coordonnées de contact, direction de la publication et hébergement.",
  robots: { index: true, follow: true },
  alternates: { canonical: '/mentions-legales' },
  openGraph: {
    title: 'Mentions légales | HardwareCentral',
    description:
      "Identité de l'éditeur, coordonnées et direction de la publication du site HardwareCentral à Douala (Cameroun).",
  },
};

export default function MentionsLegalesPage() {
  return (
    <LegalPageTemplate
      title="Mentions légales"
      lastUpdated="11/11/2026"
      breadcrumbLabel="Mentions légales"
    >
      <section className="space-y-6 text-sm text-graphite-700 leading-relaxed">
        <div>
          <h2 className="text-lg font-semibold text-graphite-900">Identité de l&apos;éditeur</h2>
          <p className="mt-2">
            <strong>{SITE_CONFIG.companyName}</strong>
            <br />
            {SITE_CONFIG.address.line1}
            <br />
            {SITE_CONFIG.address.city}, {SITE_CONFIG.address.country}
          </p>
          <p className="mt-2">
            Téléphone : {SITE_CONFIG.phone.display}
            <br />
            E-mail : {SITE_CONFIG.email.contact}
          </p>
          <p className="mt-2">
            Forme juridique : Établissement (ETS) ; RCCM : en cours de finalisation.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-graphite-900">Directeur de la publication</h2>
          <p>{SITE_CONFIG.legalName}</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-graphite-900">Hébergement</h2>
          <p>
            Le site {SITE_CONFIG.companyName} est hébergé par{' '}
            <strong>{SITE_CONFIG.hosting.legalName}</strong>, {SITE_CONFIG.hosting.address}.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-graphite-900">Propriété intellectuelle</h2>
          <p>
            L&apos;ensemble des contenus du site (textes, images, logos, marques) est protégé par le
            droit d&apos;auteur et le droit des marques. Toute reproduction ou représentation,
            totale ou partielle, sans autorisation préalable est interdite.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-graphite-900">Marques et logos</h2>
          <p>
            Les marques et logos cités sur le site (HPE, HP, Dell Technologies, Cisco, Fortinet,
            Huawei, Hikvision, etc.) restent la propriété exclusive de leurs titulaires respectifs.
            Ils sont reproduits à titre informatif, sans modification, pour identifier les
            équipements distribués. Cette reproduction n&apos;implique aucun parrainage, aucune
            affiliation ni aucun partenariat officiel entre {SITE_CONFIG.companyName} et les
            titulaires de ces marques.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-graphite-900">Responsabilité</h2>
          <p>
            {SITE_CONFIG.companyName} s&apos;efforce d&apos;assurer l&apos;exactitude des
            informations présentées sur ce site. Les visuels produits sont des illustrations
            génériques (photos à venir) et les descriptions sont fournies à titre indicatif ; elles
            peuvent varier selon les lots et les évolutions constructeur.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-graphite-900">Droit applicable</h2>
          <p>
            Les présentes mentions légales sont soumises au droit camerounais. Tout litige relatif à
            l&apos;utilisation du site sera soumis à la compétence exclusive des tribunaux de
            Douala, Cameroun.
          </p>
        </div>
      </section>
    </LegalPageTemplate>
  );
}
