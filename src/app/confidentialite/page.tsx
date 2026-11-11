import type { Metadata } from 'next';
import LegalPageTemplate from '@/components/sections/LegalPageTemplate';
import { SITE_CONFIG } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Politique de confidentialité',
  description:
    'Politique de confidentialité de HardwareCentral : données transmises lors des demandes de devis, de contact et de newsletter, finalités, conservation et droits des utilisateurs.',
  robots: { index: true, follow: true },
  alternates: { canonical: '/confidentialite' },
  openGraph: {
    title: 'Politique de confidentialité | HardwareCentral',
    description:
      'Quelles données personnelles HardwareCentral collecte (devis, contact, newsletter) et quels sont vos droits sur ces données.',
  },
};

export default function ConfidentialitePage() {
  return (
    <LegalPageTemplate
      title="Politique de confidentialité"
      lastUpdated="11/11/2026"
      breadcrumbLabel="Confidentialité"
    >
      <section className="space-y-6 text-sm text-graphite-700 leading-relaxed">
        <div>
          <h2 className="text-lg font-semibold text-graphite-900">1. Données collectées</h2>
          <p>
            Le site ne stocke aucune donnée personnelle sur ses serveurs. Les formulaires de devis,
            de contact et de newsletter préparent un e-mail et ouvrent votre logiciel de messagerie
            : les informations que vous y saisissez (nom, prénom, adresse e-mail professionnelle,
            numéro de téléphone, nom de l&apos;entreprise, produits sélectionnés, message) ne nous
            sont transmises qu&apos;au moment où vous envoyez cet e-mail, puis reçues par les
            services de {SITE_CONFIG.companyName}.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-graphite-900">2. Finalité du traitement</h2>
          <p>Les données collectées sont utilisées exclusivement pour :</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              Répondre aux demandes de devis et messages envoyés par e-mail depuis les formulaires
              du site ;
            </li>
            <li>Assurer le suivi commercial et technique des clients ;</li>
            <li>Envoyer la newsletter (avec consentement explicite) ;</li>
            <li>Améliorer les services et le contenu du site.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-graphite-900">3. Base légale</h2>
          <p>
            Le traitement des données repose sur l&apos;exécution de mesures précontractuelles
            (demande de devis) et, pour la newsletter, sur le consentement de l&apos;utilisateur.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-graphite-900">4. Durée de conservation</h2>
          <p>
            Les données reçues par e-mail au titre des demandes de devis sont conservées pour une
            durée de 3 ans à compter du dernier contact. Les données de newsletter sont conservées
            jusqu&apos;à désabonnement.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-graphite-900">5. Destinataires des données</h2>
          <p>
            Les données sont destinées aux services internes de {SITE_CONFIG.companyName} et ne sont
            jamais cédées à des tiers à des fins commerciales. Elles peuvent être communiquées aux
            autorités compétentes dans le cadre d&apos;une obligation légale.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-graphite-900">6. Vos droits</h2>
          <p>
            Conformément à la réglementation applicable en matière de protection des données, vous
            disposez des droits d&apos;accès, de rectification et de suppression des données vous
            concernant. Pour exercer ces droits, contactez-nous à l&apos;adresse suivante :
          </p>
          <p className="mt-2">
            {SITE_CONFIG.companyName}
            <br />
            E-mail : {SITE_CONFIG.email.contact}
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-graphite-900">7. Cookies</h2>
          <p>
            Le site utilise uniquement des cookies techniques nécessaires au fonctionnement de la
            plateforme (session, préférences d&apos;affichage) et un stockage local du navigateur
            pour conserver votre liste de devis, vos favoris et vos préférences. Aucun cookie
            publicitaire ou de suivi tiers n&apos;est déposé sans consentement explicite. Vous
            pouvez configurer votre navigateur pour refuser les cookies.
          </p>
        </div>
      </section>
    </LegalPageTemplate>
  );
}
