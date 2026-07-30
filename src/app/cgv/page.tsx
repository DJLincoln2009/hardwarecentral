import type { Metadata } from 'next';
import LegalPageTemplate from '@/components/sections/LegalPageTemplate';
import { SITE_CONFIG } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Conditions Générales de Vente',
  robots: { index: true, follow: true },
  alternates: { canonical: '/cgv' },
  openGraph: {
    title: 'Conditions Générales de Vente | HardwareCentral',
    description: 'Conditions générales de vente de HardwareCentral applicables aux transactions professionnelles.',
  },
};

export default function CgvPage() {
  return (
    <LegalPageTemplate
      title="Conditions Générales de Vente"
      lastUpdated="15/01/2026"
      breadcrumbLabel="CGV"
    >
      <section className="space-y-6 text-sm text-graphite-700 leading-relaxed">
        <div>
          <h2 className="text-lg font-semibold text-graphite-900">1. Champ d&apos;application</h2>
          <p>
            Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles entre
            {SITE_CONFIG.companyName} ({SITE_CONFIG.address.city}, {SITE_CONFIG.address.country}) et
            tout acheteur professionnel. Elles s&apos;appliquent à toutes les demandes de devis,
            commandes et livraisons de produits et services.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-graphite-900">2. Devis et commande</h2>
          <p>
            Tout devis établi par {SITE_CONFIG.companyName} est valable 15 jours à compter de sa date
            d&apos;émission. La commande est confirmée après validation du devis par le client et
            réception de l&apos;acompte éventuellement exigé. Les informations issues du catalogue en
            ligne (photos, descriptions techniques) sont données à titre indicatif et ne sont pas
            contractuelles.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-graphite-900">3. Prix et facturation</h2>
          <p>
            Les prix sont indiqués en {SITE_CONFIG.currency} (Franc CFA), hors taxes et hors frais de
            transport sauf mention contraire. La facture est émise après expédition ou remise des
            marchandises.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-graphite-900">4. Paiement</h2>
          <p>
            Les modalités de paiement sont définies dans chaque devis. En l&apos;absence de stipulation
            particulière, le paiement est exigible à la commande par virement bancaire. Tout retard de
            paiement peut entraîner l&apos;application de pénalités calculées au taux d&apos;intérêt légal
            en vigueur au Cameroun.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-graphite-900">5. Livraison</h2>
          <p>
            Les délais de livraison sont donnés à titre indicatif. {SITE_CONFIG.companyName} s&apos;engage
            à informer le client de tout retard prévisible. La livraison s&apos;effectue en « départ usine »
            sauf accord contraire. Les risques de transport sont transférés au client dès la remise des
            marchandises au transporteur.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-graphite-900">6. Garantie</h2>
          <p>
            Les produits sont couverts par la garantie constructeur dont les termes sont précisés dans la
            fiche produit (onglet Garantie). {SITE_CONFIG.companyName} n&apos;est pas fabricant et ne peut
            être tenu responsable des défauts de conception ou de fabrication imputables au constructeur.
            La garantie ne couvre pas les dommages résultant d&apos;une mauvaise utilisation, d&apos;une
            installation non conforme ou d&apos;une modification non autorisée.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-graphite-900">7. Droit de rétractation</h2>
          <p>
            Conformément à la réglementation camerounaise applicable aux transactions entre professionnels,
            le droit de rétractation ne s&apos;applique pas sauf stipulation contraire expresse dans le devis.
            Tout retour de marchandise doit faire l&apos;objet d&apos;un accord préalable écrit.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-graphite-900">8. Litiges</h2>
          <p>
            Tout litige relatif à ces CGV sera soumis à la compétence exclusive des tribunaux de Douala,
            Cameroun, nonobstant pluralité de défendeurs ou appel en garantie.
          </p>
        </div>
      </section>
    </LegalPageTemplate>
  );
}
