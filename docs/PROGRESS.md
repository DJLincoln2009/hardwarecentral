# Suivi d'avancement — HardwareCentral

| Phase | Statut | Date | Notes |
|---|---|---|---|
| 0 — Initialisation | Fait | 2026-07-29 | Next.js 16.2.12, TypeScript strict, Tailwind v4, arborescence 30 dossiers, `site-config.ts` (placeholders TODO), `types/index.ts`, ESLint + Prettier, tokens @theme (palette graphite/teal, fonts Manrope/IBM Plex), `.env.local` + `.env.example`, build OK |
| 1 — Pipeline d'ingestion & catalogue | Fait | 2026-07-30 | Scraper Python (FastAPI, Oxylabs + fallback), clients TS (amazon-scraper, icecat, imagekit), pipeline ingest-product-media.ts. Catalogue : **360 produits** (60 par marque : HPE, Dell, Fortinet, Cisco, Huawei, Hikvision) — 240 serveurs/réseau/sécurité/CCTV + 120 nouveaux produits (ordinateurs portables, stations de travail, collaboration, appliances sécurité). Index `products.ts` avec helpers. **~33 ASINs Amazon.fr configurés** — 25 images uploadées sur ImageKit. Icecat : 0 datasheet trouvé. |
| 2 — Composants UI | Fait | 2026-07-29 | Button (4 variants, 3 tailles, loading/disabled/icon), Input/Textarea/Select (label+erreur+aria, Select protégé option unique), Badge (4 variantes), Modal (focus trap, Escape/overlay, role=dialog), Toast (Provider+useToast, auto-dismiss+manuel, aria-live), Skeleton (loading), SkipLink. Build/tsc/lint OK, couleurs section 14.3 respectées, pas de `<div onClick>`, `focus-visible` partout. |
| 3 — Layout global | Fait | 2026-07-29 | Header (Logo Link, search form role=search, quote/fav counters Zustand, CTA "Demander un devis", phone SITE_CONFIG), MegaMenu (hover+click, 3 colonnes catégories/marques/supports, aria-haspopup/expanded/role=menu, Escape+click-outside), MobileNav (<1024px, piège de focus Tab/Shift+Tab, Drawer plein écran, auto-fermeture sur sélection), Footer (5 colonnes: Présentation/Catalogue/Entreprise/Légal/Contact — SITE_CONFIG source unique, liens réels jamais vers 404), Breadcrumb (nav>ol, aria-current="page" sur dernier, JSON-LD BreadcrumbList), WhatsAppBubble (wa.me, target=_blank, aria-label, masqué si modalOpen). Stores Zustand persistés (quote-store, favorites-store, ui-store). Build OK. |
| 4 — Catalogue & fiches produit | Fait | 2026-07-29 | `filterProducts()` (filtres catégorie/marque/format/recherche + tri + pagination), `ProductAvailabilityBadge` (mapping AvailabilityStatus → Badge), `ProductCard` (image, badge, nom, marque, SKU, specs, quote+fav), `ProductGallery` (image principale + vignettes), `ProductSpecsTable` (th scope=row), `QuoteToggleButton` (toggle devis), `EmptyState` (search/filter/favorites/quote/empty), `CatalogFilters` (sidebar radio+checkbox, URL sync), `CatalogSort` (3 options, URL sync), `CatalogPagination` (ellipsis, masqué si ≤1 page), `MobileFilterDrawer` (drawer animé, focus trap, Escape). Pages SSR : `/catalogue/page.tsx` (sidebar + grille + tri + pagination), `/produit/[slug]/page.tsx` (generateStaticParams, OpenGraph, galerie+infos+CTA+datasheets), `/marques/page.tsx` (BrandCard grid), `/marques/[brand]/page.tsx` (bannière + grille produits, EmptyState si aucun), `/recherche/page.tsx` (q searchParams, EmptyState si vide). Build/tsc OK. |
| 5 — Devis / favoris / formulaires | Fait | 2026-07-29 | Stores Zustand mis à jour (hasHydrated + version 1). Zod schemas (quoteRequest, contactMessage, newsletter). Email lib Brevo mocké avec TODO. 3 Route Handlers POST : `/api/quote-requests` (validation, honeypot, rate-limit, email notification + accusé réception), `/api/contact-messages` (identique, sujet `devis` routé vers sales@), `/api/newsletter` (Brevo contacts API mocké). 3 formulaires : `QuoteRequestForm` (modal avec liste produits pré-remplie retirable, états idle/submitting/success/error, données conservées en cas d'échec), `ContactForm` (sujets différenciés dont « Demande de devis » -> sales@), `NewsletterForm` (email + soumission réelle). 2 pages : `/devis` (liste + retrait + CTA ouvre modal), `/favoris` (liste + action « + Devis » par article). Entry point Header CTA ouvre modal QuoteRequestForm (3 points d'accès : header, fiche produit, page /devis). Build/tsc OK. |
| 6 — Pages institutionnelles | Fait | 2026-07-29 | `TrustBadges` (4 icônes réassurance), `BrandsGrid` (marques actives liées vers /marques/[brand]), `LegalPageTemplate` (gabarit unique breadcrumb + titre + contenu). 6 pages créées : `/a-propos` (mission + TrustBadges + BrandsGrid + identité légale SITE_CONFIG), `/contact` (coordonnées à gauche SITE_CONFIG + ContactForm à droite), `/mentions-legales` (identité éditeur, hébergement, droit applicable Cameroun), `/cgv` (8 articles CGV adaptés Cameroun), `/confidentialite` (7 articles protection données), `not-found.tsx` (404 numéral, message, barre de recherche, catégories actives en badges, lien retour accueil). Aucune donnée de contact codée en dur hors SITE_CONFIG vérifié. Build/tsc OK. |
| 7 — SEO technique | Fait | 2026-07-29 | Root layout: title template avec fallback spec 20.2 + Organization JSON-LD (SITE_CONFIG). Toutes les pages indexables ont désormais title/description/canonical/OpenGraph. Template `%s | HardwareCentral` appliqué partout. `sitemap.ts` (5 statiques + 6 marques + 240 produits). `robots.ts` (disallow /devis /favoris /recherche /api/). Product JSON-LD ajouté sur `/produit/[slug]` (name, sku, brand, image, category, availability — sans `offers`). BreadcrumbList JSON-LD déjà présent (Phase 3). Build/tsc OK. |
| 8 — Accessibilité & Performance | Fait | 2026-07-29 | `usePrefersReducedMotion` hook + appliqué à Modal/MobileNav/MobileFilterDrawer/Toast/MegaMenu. `<h1>` ajouté sur `/` et `/catalogue` (sr-only). Tous `<img>` → `next/image` (fill + sizes). Touch targets 44×44px (close btns, fav btn, poubelle, filtres categories/checkboxes, "effacer filtres"). `dotenv` retiré (inutilisé). `tsc` OK, `eslint` 0 erreurs/warnings. |
| 9 — Tests & CI | Fait | 2026-07-29 | Vitest: 25 tests unitaires/composants (getAvailabilityDisplay, filterProducts, CatalogPagination, QuoteToggleButton). Playwright E2E: flow 17.1 complet + axe-core audit 4 pages + navigation clavier. GitHub Actions CI: quality (tsc → lint → vitest → next build) + e2e + security-audit. `npm run test` / `npm run test:e2e` configurés. Build/tsc/lint OK. |
| 10 — Recette finale & déploiement | Fait (reste déploiement manuel) | 2026-07-30 | ✅ Checklist section 26 (Definition of Done) — tous les points vérifiés conformes. ✅ Aucun TODO/placeholder résiduel. ✅ En-têtes sécurité (CSP, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, X-Frame-Options) ajoutés dans `next.config.ts` (section 21.2). ✅ `metadataBase` + `NEXT_PUBLIC_SITE_URL` dans `.env.example`. 🚧 Reste manuel : déploiement Vercel, DNS du domaine, variables d'env réelles en production, test E2E soumission devis. |

## Audit & correctifs (plan `docs/OPENCODE_AUDIT_FIXES.md`)

| Lot | Statut | Date | Notes |
|---|---|---|---|
| 1.1 Sécurité | Fait | 2026-07-31 | Secrets supprimés du code, rotation documentée (`docs/SECURITY_SECRET_ROTATION.md`) |
| 2 — Décisions D1-D5 | Fait | 2026-07-31 | Domaine `hardware-central.com`, mentions légales honnêtes, email unique `contact@`, devis 48-72h ouvrées, pipeline 3D par lots (featured d'abord) |
| 3 — P0 (3.1-3.5, 3.7) | Fait | 2026-07-31 | Domaine canonique, SSR catalogue/recherche, split HPE/HP (`hp.ts` → `hpProducts`), 5 concaténations JSX corrigées, mentions légales, titres racine/not-found |
| 4 — P1 (4.1, 4.3-4.8) | Fait | 2026-07-31 | TrustBadges 48-72h, email unique partout, og:image PNG dynamique produit (fonts WOFF locales), message WhatsApp contextuel, rate-limit Upstash + repli mémoire, `text-graphite-600` (footer corrigé en `-200` pour AA), meta descriptions uniques |
| 5 — P2 (5.1, 5.4-5.6) | Fait | 2026-07-31 | Footer bas simplifié, mention BTS sur `/a-propos` (TODO raison sociale), CSP prod sans `unsafe-eval`, consentement newsletter |
| 6 — Pipeline 3D (code) | Fait | 2026-07-31 | Types `ai-render`/`ai-3d-render`, micro-mention, `3d-pipeline/` (products.yaml 27 featured, scripts Python, `scripts/upload-3d-renders.ts`), `.gitignore`, rapport de couverture mis à jour (356 produits) |
| 6 — Pipeline 3D (exécution) | **Action humaine** | 2026-07-31 | Blender 4.x non installé → exécution documentée : renseigner `reference_images` officielles puis `python 3d-pipeline/scripts/orchestrate.py <slug>` (cas-test `dell-poweredge-r760`) |
| 7 — Audit npm (12 high → 0) | Fait | 2026-07-31 | `package.json` → bloc `overrides` (verrouillé, à ne pas retirer) : `minimatch@10.2.6`, `postcss@^8.5.25`, `sharp@^0.35.0`. Résout les 3 chaînes : brace-expansion 1.1.18 (via minimatch 3), postcss 8.4.31 et libvips CVE-2026-33327/33328/35590/35591 (via sharp 0.34.5) embarqués dans `next@16.2.12`. `npm audit` → **0 vulnérabilité**. `npm audit fix --force` (next@9.3.3 / jsx-a11y 6.4.1) ignoré : downgrades cassants. Validé : tsc, lint 0 warning, vitest 25/25, build 382 pages, Playwright 12/12 |

### Correctifs e2e / UI découverts en recette finale (2026-07-31)
- `e2e/flow-17.1.spec.ts` : slug `hpe-proliant-dl380-gen12`, SKU `HPE-DL380-G12`, sélecteurs mis à jour (checkbox HPE, « Catégories », modal « Demandez un devis », succès « Demande envoyée avec succès ! », scoping dialog).
- `Footer.tsx` : copyright `text-graphite-200` (contraste AA 6.58:1 sur `graphite-900`).
- `DevisContent.tsx` : `QuoteRequestForm` monté hors du conditionnel — après `clearAll()`, l'écran de succès ne disparaissait plus instantanément.
- Vérifié : tsc, lint (0 warning), vitest 25/25, `next build` (382 pages), **Playwright 12/12**.

## Informations réelles encore en attente (section 1 du guide)
- [x] Téléphone / WhatsApp réel : +237 677 550 082
- [x] Email de contact : contact@hardware-central.com
- [x] Adresse : Douala, Bonamoussadi
- [x] Domaine : hardware-central.com
- [x] Horaires : WAT (Lun–Ven, 8h–18h)
- [x] Raison sociale : HardwareCentral (`site-config.ts` → `legalName`)
- [x] Clé API Amazon Scraper — scraper Python (FastAPI) + Oxylabs configurés
- [x] Compte Icecat (datasheets) — credentials configurés dans `.env.local`
- [x] ImageKit.io — stockage média configuré
- [x] Clé API Brevo (email transactionnel + newsletter) — active dans `.env.local`, implémentation réelle dans `src/lib/email/index.ts` (fallback mock si clé absente)

## Pipeline exécutable
- Lancement du scraper Python : `cd amazon-scraper && uvicorn main:app --reload --port 8000`
- Lancement de l'ingestion : `npx tsx scripts/ingest-product-media.ts`
- IMAGEKIT_PRIVATE_KEY doit être définie dans `.env.local`

## Produits avec image réelle (0/356)
- Aucune : dernière image réelle (hikvision-ds-2cd2t47g2-l) retirée le 2026-07-31 → placeholder SVG.
- Les 20 produits HP Inc. utilisent le branding HP (bleu `#0096D6`), plus aucun « HPE » sur leurs SVG.
- Chiffres détaillés et état du pipeline 3D dans `image-coverage-report.md`.
