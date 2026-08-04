import Link from 'next/link';
import { Server, MapPin, Phone, Mail, Clock, ArrowRight } from 'lucide-react';
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

  const columnLinkClass =
    'text-sm text-graphite-300 transition-colors duration-150 hover:text-teal-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 rounded-sm';

  return (
    <footer className="relative overflow-hidden border-t border-graphite-800 bg-graphite-950 text-graphite-300">
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-full max-w-4xl -translate-x-1/2 bg-gradient-to-r from-transparent via-teal-400/50 to-transparent" aria-hidden="true" />
      <div className="pointer-events-none absolute -top-32 right-0 h-72 w-72 rounded-full bg-teal-500/10 blur-3xl" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-4 py-14 lg:px-6">
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-3 lg:grid-cols-6">
          <div className="col-span-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-teal-700">
                <Server className="h-4.5 w-4.5 text-white" aria-hidden="true" />
              </span>
              <span className="font-display text-lg font-extrabold tracking-tight text-white">
                Hardware<span className="text-teal-300">Central</span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-graphite-300">
              Plateforme de référence pour l&apos;acquisition d&apos;équipements informatiques
              professionnels au Cameroun et dans la zone CEMAC.
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <Link
                href="/devis"
                className="group inline-flex items-center gap-1.5 rounded-full bg-teal-300 px-4 py-2 text-xs font-semibold text-graphite-950 transition-all duration-200 hover:bg-teal-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300"
              >
                Constituer ma liste
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
              <Link
                href="/catalogue"
                className="inline-flex items-center gap-1.5 rounded-full border border-graphite-700 px-4 py-2 text-xs font-semibold text-graphite-200 transition-all duration-200 hover:border-teal-400 hover:text-teal-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
              >
                Voir le catalogue
              </Link>
            </div>
          </div>

          <div>
            <p className="eyebrow mb-4 text-graphite-400">Catalogue</p>
            <ul className="space-y-2.5">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={categoryRouteMap[cat.id] ?? `/catalogue?categorie=${cat.id}`}
                    className={columnLinkClass}
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="eyebrow mb-4 text-graphite-400">Entreprise</p>
            <ul className="space-y-2.5">
              <li>
                <Link href="/a-propos" className={columnLinkClass}>
                  À propos
                </Link>
              </li>
              <li>
                <Link href="/marques" className={columnLinkClass}>
                  Marques
                </Link>
              </li>
              <li>
                <Link href="/contact" className={columnLinkClass}>
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="eyebrow mb-4 text-graphite-400">Légal</p>
            <ul className="space-y-2.5">
              <li>
                <Link href="/mentions-legales" className={columnLinkClass}>
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link href="/cgv" className={columnLinkClass}>
                  Conditions générales de vente
                </Link>
              </li>
              <li>
                <Link href="/confidentialite" className={columnLinkClass}>
                  Politique de confidentialité
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="eyebrow mb-4 text-graphite-400">Contact</p>
            <ul className="space-y-3 text-sm text-graphite-300">
              <li>
                <a
                  href={`tel:${SITE_CONFIG.phone.e164}`}
                  className="group inline-flex items-center gap-2 transition-colors hover:text-teal-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 rounded-sm"
                >
                  <Phone className="h-4 w-4 shrink-0 text-graphite-500 transition-colors group-hover:text-teal-300" aria-hidden="true" />
                  {SITE_CONFIG.phone.display}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${SITE_CONFIG.email.contact}`}
                  className="group inline-flex items-center gap-2 transition-colors hover:text-teal-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 rounded-sm"
                >
                  <Mail className="h-4 w-4 shrink-0 text-graphite-500 transition-colors group-hover:text-teal-300" aria-hidden="true" />
                  {SITE_CONFIG.email.contact}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-graphite-500" aria-hidden="true" />
                <span>
                  {SITE_CONFIG.address.line1}
                  <br />
                  {SITE_CONFIG.address.city}, {SITE_CONFIG.address.country}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="h-4 w-4 shrink-0 text-graphite-500" aria-hidden="true" />
                {SITE_CONFIG.businessHours.display}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="relative border-t border-graphite-800">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-graphite-400 sm:flex-row lg:px-6">
          <p>
            &copy; {new Date().getFullYear()} {SITE_CONFIG.companyName} — Tous droits réservés.
          </p>
          <p className="font-mono">BTS · ZONE CEMAC</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
