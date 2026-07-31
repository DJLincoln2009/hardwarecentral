import Link from 'next/link';
import { getActiveCategories } from '@/lib/data/categories';
import { SITE_CONFIG } from '@/lib/site-config';

const categoryRouteMap: Record<string, string> = {
  'server-storage': '/catalogue?categorie=server-storage',
  networking: '/catalogue?categorie=networking',
  security: '/catalogue?categorie=security',
  cctv: '/catalogue?categorie=cctv',
  laptop: '/catalogue?categorie=laptop',
};

function Footer() {
  const categories = getActiveCategories();

  return (
    <footer className="border-t border-graphite-200 bg-graphite-900 text-white">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-5">
          <div>
            <p className="mb-3 font-display font-bold text-white">HardwareCentral</p>
            <p className="text-sm text-graphite-200 leading-relaxed">
              Plateforme de référence pour l&apos;acquisition d&apos;équipements informatiques
              professionnels au Cameroun et dans la zone CEMAC.
            </p>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-graphite-200">
              Catalogue
            </p>
            <ul className="space-y-2">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={categoryRouteMap[cat.id] ?? `/catalogue?categorie=${cat.id}`}
                    className="text-sm text-graphite-300 hover:text-teal-200 transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-graphite-200">
              Entreprise
            </p>
            <ul className="space-y-2">
              <li>
                <Link href="/a-propos" className="text-sm text-graphite-300 hover:text-teal-200 transition-colors">
                  À propos
                </Link>
              </li>
              <li>
                <Link href="/marques" className="text-sm text-graphite-300 hover:text-teal-200 transition-colors">
                  Marques
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-graphite-300 hover:text-teal-200 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-graphite-200">
              Légal
            </p>
            <ul className="space-y-2">
              <li>
                <Link href="/mentions-legales" className="text-sm text-graphite-300 hover:text-teal-200 transition-colors">
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link href="/cgv" className="text-sm text-graphite-300 hover:text-teal-200 transition-colors">
                  CGV
                </Link>
              </li>
              <li>
                <Link href="/confidentialite" className="text-sm text-graphite-300 hover:text-teal-200 transition-colors">
                  Politique de confidentialité
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-graphite-200">
              Contact
            </p>
            <ul className="space-y-2 text-sm text-graphite-300">
              <li>
                <a
                  href={`tel:${SITE_CONFIG.phone.e164}`}
                  className="hover:text-teal-200 transition-colors"
                >
                  {SITE_CONFIG.phone.display}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${SITE_CONFIG.email.contact}`}
                  className="hover:text-teal-200 transition-colors"
                >
                  {SITE_CONFIG.email.contact}
                </a>
              </li>
              <li>{SITE_CONFIG.address.line1}</li>
              <li>
                {SITE_CONFIG.address.city}, {SITE_CONFIG.address.country}
              </li>
              <li>{SITE_CONFIG.businessHours.display}</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-graphite-800">
        <div className="mx-auto max-w-7xl px-4 py-4 text-center text-xs text-graphite-200 sm:text-left">
          <p>&copy; {new Date().getFullYear()} {SITE_CONFIG.companyName} — BTS</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
