# HardwareCentral — Plan de correction pour agent OpenCode

**Statut :** prêt à l'exécution
**Portée :** correction intégrale des défauts identifiés lors de l'audit UX/UI/technique/SEO du 31/07/2026, complétée par une inspection directe du code source du dépôt `***REMOVED***/hardwarecentral`.
**Rapport à :** ce document complète `docs/HARDWARECENTRAL_AGENT_SPEC.md` et `docs/HARDWARECENTRAL_IMPLEMENTATION_GUIDE.md` — il ne les remplace pas. En cas de conflit d'interprétation UX/Design, le spec et `docs/DESIGN.md` restent prioritaires. Ce document prévaut uniquement sur les points de correction listés ici.

---

## 0. Instructions d'exécution pour l'agent

1. **Un item = une branche/un commit scopé.** Ne pas mélanger plusieurs corrections sans rapport dans un même commit — cela complique la revue humaine et le rollback.
2. **Avant de commencer un item, relire sa section source dans `HARDWARECENTRAL_AGENT_SPEC.md`** si elle est référencée, pour ne pas réintroduire un pattern déjà proscrit par un ADR existant.
3. **Après CHAQUE item**, exécuter dans l'ordre et confirmer un résultat propre avant de passer au suivant :
   ```
   npx tsc --noEmit
   npm run lint
   npx vitest run
   npm run build
   ```
   Ces quatre commandes passent actuellement sans erreur sur `main` (vérifié le 31/07/2026) — toute régression introduite par une correction doit être résolue avant de continuer.
4. **Ne jamais inventer une donnée réelle manquante** (numéro RCCM, nom de dirigeant, clé API) : poser un `// TODO:` explicite et documenté plutôt qu'une valeur plausible. C'est déjà la règle du projet (`AGENTS.md`) — ce document ne fait que la rappeler aux endroits où elle s'applique.
5. **Ordre global recommandé** : Section 1 (sécurité) → Section 2 (décisions bloquantes de Lincoln, à obtenir avant de coder les items qui en dépendent) → Section 3 (P0) → Section 4 (P1) → Section 5 (P2) → Section 6 (pipeline images).
6. Légende de gravité : 🔴 Critique (bloque la crédibilité, la sécurité ou l'indexation) · 🟠 Important (dégrade fortement l'UX/SEO/conversion) · 🟡 Mineur (finition).

---

## ✅ `OPENCODE_PIPELINE_3D.md` — réconcilié

Le fichier a été relu intégralement et réconcilié avec le code réel du dépôt. Une version corrigée (v1.1) a été produite : `OPENCODE_PIPELINE_3D.md` (à remplacer dans le dépôt aux côtés de ce document). Cinq corrections techniques y ont été apportées (sourcing d'images restreint aux domaines constructeur officiels, validation de résolution via `pillow` — déclaré mais inutilisé en v1.0 —, robustesse par-image dans `download_refs.py`, caméra Blender adaptative à la taille réelle de l'objet au lieu d'une position fixe, fond transparent au lieu de l'environnement HDRI visible) et une étape 5 manquante a été ajoutée (`sync_to_catalog.py` + upload ImageKit + rapport de revue humaine) pour raccorder réellement les rendus produits à `src/lib/data/products/*.ts`, sans quoi le pipeline produirait des PNG jamais vus par un visiteur du site. Le détail complet des changements (marqués `🆕`) est dans le fichier v1.1 lui-même. La Section 6 ci-dessous a été mise à jour en conséquence.

---

## 1. 🔴 SÉCURITÉ — À traiter avant tout le reste, hors cycle de commit normal

### 1.1 Identifiants réels codés en dur dans le dépôt (probablement déjà exposés publiquement)

**Constat (vérifié en lisant le code, pas une supposition) :**
- `amazon-scraper/scraper.py` ligne 31 : `OXYLABS_PASSWORD = "***REMOVED***"` — mot de passe Oxylabs en clair, sans variable d'environnement.
- `src/lib/icecat-client.ts` ligne 18 : `const password = config?.password ?? '***REMOVED***';` — mot de passe Icecat en clair comme valeur de repli par défaut.
- `scripts/ingest-product-media.ts` : `password: process.env.ICECAT_PASSWORD ?? '***REMOVED***'`, `username: process.env.ICECAT_USERNAME ?? '***REMOVED***'` — même identifiant repris en dur une deuxième fois.

Ces identifiants sont commités dans l'historique Git. Les supprimer du fichier actuel **ne suffit pas** : ils restent lisibles dans l'historique tant qu'il n'est pas réécrit, et sur un dépôt distant public ils sont donc potentiellement déjà exposés à quiconque a cloné le dépôt.

**Pourquoi c'est grave :** identifiants de service tiers payant (Oxylabs) et de compte personnel (Icecat) exploitables par un tiers — risque de facturation frauduleuse, de suspension de compte, et le mot de passe suit un format réutilisable (nom + année) qu'il ne faut plus jamais utiliser ailleurs une fois exposé.

**Correction attendue :**
1. **Rotation immédiate** (hors périmètre de l'agent de code — action humaine à faire en parallèle, à signaler explicitement à Lincoln) : changer le mot de passe Oxylabs et le mot de passe Icecat dès que possible, indépendamment de l'avancement du reste de ce document.
2. Supprimer toute valeur de repli en dur dans le code : remplacer `config?.password ?? '***REMOVED***'` par un comportement qui **échoue explicitement** si la variable d'environnement est absente, sur le modèle déjà correct de `src/lib/imagekit.ts` (`if (!config.privateKey) { throw new Error(...) }`).
3. Ajouter `amazon-scraper/scraper.py` à une gestion de secrets par variable d'environnement (`os.environ["OXYLABS_PASSWORD"]`, avec erreur explicite si absente) au lieu d'une constante en tête de fichier.
4. Purger l'historique Git de ces identifiants (`git filter-repo` ou BFG Repo-Cleaner) puis `git push --force` sur la branche concernée — à documenter clairement pour Lincoln car cette étape réécrit l'historique partagé.
5. Ajouter un scanner de secrets au CI (`gitleaks` ou équivalent) dans `.github/workflows/ci.yml`, en job séparé, pour empêcher toute régression future de ce type.

**Critère de validation :** `git grep -i "***REMOVED***\|***REMOVED***"` ne retourne plus aucun résultat dans le code source (l'historique est traité séparément) ; le pipeline d'ingestion échoue proprement avec un message clair si `ICECAT_PASSWORD`/`OXYLABS_PASSWORD` ne sont pas définies.

---

## 2. Décisions à obtenir de Lincoln avant de coder les items qui en dépendent

Ces points ne sont pas des bugs de code : ce sont des décisions produit/entreprise qui déterminent *comment* corriger plusieurs items critiques ci-dessous. L'agent ne doit pas les trancher seul (règle 0.2.1 et 0.2.2 du spec — pas d'improvisation sur l'identité de marque).

| # | Décision requise | Bloque |
|---|---|---|
| D1 | **Nom de domaine canonique définitif** : `hardware-central.com` (celui réellement en ligne aujourd'hui) ou `hardwarecentral.com` (celui utilisé par défaut dans tout le code) ? Si les deux sont possédés, lequel redirige (301) vers l'autre ? | Items 3.1, 3.7, 4.4 |
| D2 | **Identité juridique réelle** : raison sociale exacte, forme juridique (SARL/SA/Établissement), numéro RCCM, NIU, nom du dirigeant/directeur de publication | Item 3.5 |
| D3 | **Adresses e-mail réellement surveillées** : une adresse dédiée pour les devis a-t-elle un sens opérationnel (`devis@…`) ou une seule adresse `contact@…` suffit-elle ? | Item 4.3 |
| D4 | **Délai de réponse réel** aux devis : 24h ou 48–72h (voir item 4.1 — les deux valeurs coexistent actuellement dans le produit) | Item 4.1 |
| D5 | **Volume à couvrir par le pipeline 3D avant premier déploiement** : lancer sur les seuls produits `isFeatured: true` + page d'accueil (quelques dizaines) pour un premier lot vérifiable manuellement, ou viser le catalogue complet (240 produits) d'emblée en acceptant un temps d'exécution de plusieurs heures et une revue humaine à plus grande échelle | Section 6 |

---

## 3. 🔴 CRITIQUE

### 3.1 Domaine canonique incohérent avec le domaine réellement servi

**Fichiers :** `src/app/layout.tsx` (L30, L48-49), `src/app/robots.ts` (L3), `src/app/sitemap.ts` (L5), `src/lib/email/index.ts` (L5)

**Constat :** `metadataBase`, le JSON-LD `Organization`, `robots.ts` et `sitemap.ts` retombent tous par défaut sur `https://hardwarecentral.com` (sans tiret) si `NEXT_PUBLIC_SITE_URL` n'est pas définie — alors que le site est réellement servi sur `hardware-central.com` (avec tiret). À l'inverse, `SENDER_EMAIL` dans `src/lib/email/index.ts` est codé en dur sur `contact@hardware-central.com` (avec tiret), alors que `SITE_CONFIG.email.contact` (source de vérité censée être unique) vaut `contact@hardwarecentral.com` (sans tiret). Le nom de domaine n'est même pas un champ de `SITE_CONFIG` — c'est la cause racine : il n'existe aujourd'hui aucune source unique pour cette donnée, en violation directe de la règle 0.2.2 du spec.

**Impact :** si `NEXT_PUBLIC_SITE_URL` n'est pas correctement positionnée en production sur Vercel, le `canonical`, l'`og:url`, le `sitemap.xml` et le JSON-LD pointent vers un domaine différent de celui affiché dans la barre d'adresse — Google peut ignorer l'indexation ou la fragmenter. Le mail transactionnel de confirmation de devis part potentiellement d'un domaine d'expédition (`hardware-central.com`) différent du domaine vérifié dans Brevo, ce qui peut faire échouer silencieusement l'envoi — cassant le canal de conversion principal du site sans qu'aucune erreur ne soit visible côté utilisateur.

**Correction attendue (après décision D1) :**
1. Ajouter `domain: 'https://<domaine-choisi>'` à `SITE_CONFIG` dans `src/lib/site-config.ts`.
2. Remplacer tous les `process.env.NEXT_PUBLIC_SITE_URL ?? 'https://hardwarecentral.com'` (layout.tsx, robots.ts, sitemap.ts, quote-requests/route.ts) par une lecture unique de `SITE_CONFIG.domain`, elle-même dérivée de `NEXT_PUBLIC_SITE_URL` si définie.
3. Corriger `SENDER_EMAIL` dans `src/lib/email/index.ts` pour qu'il importe `SITE_CONFIG.email.contact` au lieu d'une chaîne en dur — et s'assurer que ce domaine d'expédition est bien le domaine vérifié (SPF/DKIM) dans le compte Brevo.
4. Vérifier/configurer sur Vercel : `NEXT_PUBLIC_SITE_URL` définie sur le domaine choisi, redirection 301 en place depuis l'autre domaine si les deux sont possédés.
5. Après déploiement, vérifier `curl -I https://<domaine>/sitemap.xml` et le `<link rel="canonical">` d'au moins 3 pages (accueil, catalogue, une fiche produit) pour confirmer la cohérence.

**Critère de validation :** aucune occurrence de `'https://hardwarecentral.com'` ou `'hardware-central.com'` codée en dur en dehors de `SITE_CONFIG` (`git grep` de contrôle) ; `sitemap.xml` et tous les `canonical` utilisent le même domaine que celui effectivement servi.

### 3.2 Page Catalogue et page Recherche non pré-rendues (rendu 100 % client)

**Fichiers :** `src/app/catalogue/CatalogueContent.tsx`, `src/app/catalogue/page.tsx`, `src/app/recherche/SearchContent.tsx`, `src/app/recherche/page.tsx`

**Constat :** `CatalogueContent` et `SearchContent` sont des Client Components (`'use client'`) qui lisent les filtres via `useSearchParams()`. Next.js impose alors un `<Suspense>` — dont le HTML initial (celui vu par un crawler ou un visiteur avant hydratation) est le fallback (« Chargement du catalogue… » / « Recherche en cours… »), pas la grille de produits. Or `filterProducts()` (`src/lib/data/filter-products.ts`) ne fait **aucun appel réseau** : les données sont déjà statiques (`import { products } from '@/lib/data/products'`). Il n'y a donc aucune raison technique de garder cette page en rendu client — c'est un choix d'implémentation à corriger, pas une contrainte de données.

**Impact :** `/catalogue` est référencée avec `alternates: { canonical: '/catalogue' }` (destinée à être indexée) mais son contenu produit n'existe pas dans le HTML initial — risque réel de sous-indexation de la page la plus stratégique du site. Sur connexion lente, un visiteur peut rester bloqué sur l'état de chargement plus longtemps qu'un rendu serveur ne l'aurait exigé.

**Correction attendue :**
1. Transformer `app/catalogue/page.tsx` en Server Component qui reçoit `searchParams` (prop native App Router : `{ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }`), appelle `filterProducts()` côté serveur, et rend la grille de produits directement dans le HTML.
2. Garder en Client Component uniquement les éléments réellement interactifs (`CatalogSort`, `MobileFilterDrawer`, `CatalogFilters`) qui naviguent déjà via `useRouter()`/`Link` — ils n'ont pas besoin de connaître le résultat filtré, seulement de modifier l'URL.
3. Appliquer exactement le même traitement à `app/recherche/` (actuellement identique dans sa structure).
4. Supprimer le `Suspense` autour du contenu principal une fois qu'il n'est plus nécessaire (il reste nécessaire seulement si un sous-composant appelle encore `useSearchParams()` côté client).

**Critère de validation :** `curl https://<domaine>/catalogue | grep "Chargement du catalogue"` ne retourne rien après correction — le HTML brut contient déjà les noms de produits de la première page de résultats. Idem pour `/recherche` avec une requête `?q=`.

### 3.3 Confusion de marque HP Inc. / HPE dans le modèle de données

**Fichiers :** `src/lib/data/brands.ts`, `src/lib/data/products/hpe.ts` (tous les produits `EliteBook`/`ProBook`/`Z*` workstation)

**Constat :** `brands.ts` décrit la marque `HPE` comme couvrant « PC portables EliteBook/ProBook et stations de travail Z » — or ces gammes appartiennent à **HP Inc.**, entité distincte de **HPE (Hewlett Packard Enterprise)** depuis la scission de 2015. Tous les produits `hpe-elitebook-*`, `hpe-probook-*` dans `products/hpe.ts` ont `brand: 'HPE'`.

**Impact :** un DSI ou acheteur IT professionnel — la cible exacte du persona 1/2 du spec — identifie cette erreur immédiatement ; c'est un défaut de crédibilité technique directement disqualifiant sur un site B2B.

**Correction attendue :**
1. Ajouter une entrée `HP` distincte dans `brands.ts` (nom d'affichage « HP Inc. » ou « HP »), avec sa propre description centrée PC portables/stations de travail professionnelles.
2. Dans `products/hpe.ts`, reclasser `brand: 'HPE'` → `brand: 'HP'` pour toutes les références EliteBook/ProBook/Z-workstation ; ne conserver `HPE` que pour ProLiant (serveurs), Aruba (réseau) et le stockage.
3. Séparer le fichier en `products/hpe.ts` (serveurs/stockage/réseau) et `products/hp.ts` (postes de travail), en cohérence avec le découpage déjà appliqué à Dell (`DELL` couvre correctement PowerEdge **et** Latitude/Precision/XPS, car Dell Technologies n'a pas subi cette scission — ne pas répliquer ce changement sur Dell).
4. Mettre à jour `getActiveBrands()`, la page `/marques`, le méga-menu et tout filtre qui énumère les marques pour inclure `HP` séparément.
5. Vérifier que `Product['brand']` (type dans `src/types/index.ts`) inclut bien la nouvelle valeur `'HP'`.

**Critère de validation :** aucune fiche produit EliteBook/ProBook/Z-workstation n'affiche plus le badge « HPE » ; la page `/marques/hp` existe et liste uniquement des produits HP Inc.

### 3.4 Bug de concaténation JSX sans espace (page CGV)

**Fichier :** `src/app/cgv/page.tsx`, lignes 26-27

**Constat exact :**
```tsx
Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles entre
{SITE_CONFIG.companyName} ({SITE_CONFIG.address.city}, {SITE_CONFIG.address.country}) et
```
Le retour à la ligne entre `entre` et `{SITE_CONFIG.companyName}` est un piège JSX classique : un saut de ligne directement adjacent à une expression `{...}` est **entièrement supprimé** par le compilateur (pas remplacé par une espace), contrairement à un saut de ligne entre deux blocs de texte pur. Résultat en rendu : `« …contractuelles entreHardwareCentral (Douala… »`.

**Impact :** sur une page contractuelle (CGV), ce type de coquille est particulièrement dommageable pour la crédibilité — c'est le genre de défaut qui laisse penser que le contenu légal n'a jamais été relu.

**Correction attendue :**
1. Réécrire ces deux lignes sur une seule ligne logique, ou ajouter explicitement une espace : `entre{' '}\n{SITE_CONFIG.companyName}`.
2. **Balayer l'intégralité du code** (pas seulement ce fichier) à la recherche du même pattern : toute occurrence où du texte se termine en fin de ligne juste avant `{SITE_CONFIG...}` ou toute autre expression JSX, sans espace explicite sur la ligne. Porter une attention particulière à `src/app/mentions-legales/page.tsx`, `src/app/confidentialite/page.tsx`, `src/app/a-propos/page.tsx` et `src/components/sections/LegalPageTemplate.tsx`.
3. Ajouter un test de non-régression (voir 3.4bis).

### 3.4bis Test de non-régression pour ce type de bug

**Fichier à créer :** `e2e/legal-pages-text.spec.ts` (Playwright, cohérent avec la stack de test déjà en place)

**Contenu attendu :** visiter `/cgv`, `/mentions-legales`, `/confidentialite`, `/a-propos`, `/contact`, extraire le texte visible, et faire échouer le test si une regex de type `/[a-zà-ÿ]HardwareCentral\b|\bHardwareCentral[a-zà-ÿ]/` trouve une correspondance (lettre minuscule collée directement à « HardwareCentral », dans un sens ou l'autre) — cela couvre toute régression future du même type, pas seulement celle déjà connue.

**Vérification production requise :** avant de considérer cet item clos, redéployer et re-vérifier les pages légales en production réelle (pas seulement en local) — un écart a été observé entre l'état actuellement déployé sur `hardware-central.com` et l'état du dépôt à `main` au moment de cet audit (voir remarque 4.9), ce qui suggère que la production n'est peut-être pas synchronisée avec le dernier commit.

### 3.5 Mentions légales incomplètes (placeholders non remplis)

**Fichier :** `src/app/mentions-legales/page.tsx`

**Constat :** ligne 36, le texte affiché est littéralement *« Le directeur de la publication est la personne physique ou morale qui publie le site. »* — précédé d'un commentaire `{/* TODO: Nom du dirigeant */}` déjà présent dans le code, donc déjà identifié comme incomplet par un développeur précédent mais jamais finalisé. Aucun numéro RCCM, NIU, ni forme juridique nulle part sur le site (cohérent avec le manque déjà noté en prérequis Phase 6 du guide d'implémentation).

**Correction attendue (dépend de la décision D2) :**
1. Remplacer le texte de directeur de publication par le nom réel une fois obtenu.
2. Ajouter forme juridique, capital social (si applicable), RCCM et NIU dans le bloc « Identité de l'éditeur ».
3. Tant que D2 n'est pas tranchée, remplacer le texte de placeholder implicite par un `// TODO` explicite ET un texte de repli qui ne ressemble pas à une phrase de définition générique (éviter de laisser un texte qui semble correct mais ne l'est pas — préférer un encart visuellement neutre du type « Informations en cours de finalisation » plutôt que la phrase actuelle qui imite une vraie mention légale sans en être une).

### 3.6 Couverture image produit quasi nulle (0,4 %)

**Fichiers :** `image-coverage-report.md`, `src/lib/data/products/*.ts` (champ `primaryImage`)

**Constat (chiffres exacts du rapport déjà présent dans le dépôt) :** sur 240 produits, une seule image réelle existe (`hikvision-ds-2cd2t47g2-l`, via ImageKit) ; les 239 autres utilisent un SVG placeholder générique portant la mention **« Image non disponible »** directement visible sur chaque fiche produit et chaque vignette catalogue.

**Impact :** c'est probablement le défaut le plus visible et le plus dommageable de tout le site pour un visiteur réel — un acheteur B2B qui parcourt le catalogue voit « Image non disponible » sur quasiment 100 % des références, ce qui met en doute la fiabilité de l'ensemble du catalogue, pas seulement des photos.

**Correction attendue :** voir Section 6 (pipeline images) — c'est le chantier le plus important en volume de tout ce document.

### 3.7 Titre de page dupliqué sur les fiches produit

**Fichier :** `src/app/produit/[slug]/page.tsx`, ligne 27

**Constat exact :**
```ts
title: `${product.name} – ${product.brand} | HardwareCentral`,
```
Le layout racine (`src/app/layout.tsx` L33) définit un `template: \`%s | ${SITE_CONFIG.companyName}\``. Comme cette page fournit une chaîne simple (et non `{ absolute: '...' }`), Next.js applique le template par-dessus, produisant en sortie : `« HPE ProLiant Compute DL380 Gen12 – HPE | HardwareCentral | HardwareCentral »` — la marque et le nom du site sont chacun dupliqués.

**Correction attendue :**
```ts
title: `${product.name} – ${brand?.name ?? product.brand}`,
```
(en retirant `| HardwareCentral`, laissé au template parent) — et vérifier que `brand?.name` est résolu **avant** `generateMetadata` retourne, pour utiliser le nom d'affichage correct (ex. « HP Inc. » après correction de l'item 3.3) plutôt que le code brut `product.brand`.

**Critère de validation :** le `<title>` rendu d'une fiche produit ne contient le mot « HardwareCentral » qu'une seule fois.

---

## 4. 🟠 IMPORTANT

### 4.1 Promesse de délai de réponse contradictoire (24h vs 48–72h)

**Fichiers :** `src/components/sections/TrustBadges.tsx` (L6) vs `src/components/forms/QuoteRequestForm.tsx` (L90) vs `src/app/api/quote-requests/route.ts` (L70)

**Constat :** le bandeau de réassurance affiché en page d'accueil promet *« Devis sous 24h ouvrées »*, tandis que le formulaire de devis lui-même ET l'e-mail de confirmation transactionnel promettent tous deux *« 48 à 72 heures ouvrées »*. Ce n'est pas une simple coquille : ce sont deux promesses commerciales chiffrées et contradictoires, l'une dans un élément de confiance visible par tous, l'autre dans le parcours de conversion réel.

**Impact :** élément de réassurance explicitement conçu pour rassurer le persona 3 (décideur) qui, en pratique, se contredit dès l'étape suivante du parcours — dégrade la confiance au moment précis où elle compte le plus.

**Correction attendue (dépend de la décision D4) :** aligner les trois occurrences sur une seule valeur réelle et tenable opérationnellement.

### 4.2 Fonctionnalité fiches techniques PDF présente en code mais vide à 100 %

**Fichier :** `src/app/produit/[slug]/page.tsx` (bloc conditionnel `product.datasheets.length > 0`)

**Constat :** le bloc d'affichage des fiches techniques est correctement implémenté et conditionné, mais `datasheets: []` est vide pour la totalité des 240 produits (confirmé par grep) — le pipeline Icecat n'a jamais été exécuté en production. Le second canal de conversion prévu par le spec (téléchargement PDF avant contact) est donc actuellement inexistant pour l'utilisateur final, alors même que le CTA principal reste unique (« Ajouter au devis ») sur chaque fiche.

**Correction attendue :** priorité opérationnelle immédiate dès que le pipeline Icecat (Section 6) tourne au moins une fois — ne pas considérer ce point comme réglé simplement parce que le code existe déjà.

### 4.3 Adresses e-mail « devis » et « général » strictement identiques

**Fichier :** `src/lib/site-config.ts` (L18-19), `src/app/contact/page.tsx` (L57, L64)

**Constat :** `email.contact` et `email.general` pointent tous deux vers `contact@hardwarecentral.com`. La page Contact affiche pourtant deux blocs visuellement distincts (« devis » / « général »), suggérant une distinction fonctionnelle qui n'existe pas.

**Correction attendue (dépend de D3) :** soit créer une adresse dédiée réelle, soit fusionner les deux blocs d'affichage en un seul pour ne pas suggérer une distinction inexistante.

### 4.4 `og:image` en `.svg` sur les fiches produit

**Fichier :** `src/app/produit/[slug]/page.tsx` (L30, `openGraph.images`)

**Constat :** `product.primaryImage.url` (actuellement un fichier `.svg` pour 239/240 produits) est utilisé tel quel comme image Open Graph. La plupart des crawlers de prévisualisation (WhatsApp, LinkedIn, Facebook) ne rendent pas correctement le SVG en aperçu de partage — canal particulièrement important ici puisque WhatsApp est le canal de contact B2B privilégié de la cible (persona 2, spec section 2.3).

**Correction attendue :** générer une image `og:image` dédiée en PNG/JPG (1200×630) par produit — soit via une route API de génération dynamique (`app/produit/[slug]/opengraph-image.tsx`, fonctionnalité native Next.js Metadata), soit en exportant un PNG en plus du SVG dans le pipeline images (Section 6).

### 4.5 Message WhatsApp identique sur toutes les pages, jamais contextualisé au produit consulté

**Fichier :** `src/components/layout/WhatsAppBubble.tsx`

**Constat :** la bulle flottante globale utilise systématiquement `SITE_CONFIG.whatsapp.defaultMessage`, y compris lorsqu'elle est affichée par-dessus une fiche produit précise — le commercial qui reçoit le message n'a aucune idée du produit qui a motivé le contact.

**Correction attendue :** faire de `WhatsAppBubble` (ou d'un contexte React léger) un composant capable de recevoir un message contextuel optionnel, renseigné par la page fiche produit (nom + SKU du produit consulté), avec repli sur le message générique ailleurs.

### 4.6 Rate limiting en mémoire, non fiable en environnement serverless

**Fichier :** `src/app/api/quote-requests/route.ts` (L8-20)

**Constat :** `const rateLimitMap = new Map(...)` stocke l'état de limitation de débit en mémoire du processus. Sur Vercel (fonctions serverless), chaque instance peut être froide/différente selon la charge — cette limitation n'est donc pas garantie de façon fiable entre deux requêtes consécutives d'un même client, et se réinitialise silencieusement à chaque redéploiement ou changement d'instance.

**Correction attendue :** migrer vers un stockage durable partagé entre instances (Vercel KV / Upstash Redis, ou l'équivalent déjà utilisé ailleurs dans le projet si disponible) pour un rate limiting réellement effectif. Appliquer la même remarque à `src/app/api/contact-messages/route.ts` et `src/app/api/newsletter/route.ts` s'ils utilisent le même pattern (à vérifier).

### 4.7 Contraste insuffisant : `graphite-400` utilisé en texte de petite taille (WCAG 2.2 — 1.4.3)

**Fichiers :** `src/components/product/ProductCard.tsx` (L44), `src/app/produit/[slug]/page.tsx` (L96), `src/components/layout/Footer.tsx` (L124), `src/components/forms/QuoteRequestForm.tsx` (L147), et tout autre usage de `text-graphite-400` combiné à `text-xs`

**Constat (calculé, pas estimé) :** `graphite-400` (`#888780`) sur fond blanc offre un ratio de contraste de **3,61:1**. Le seuil WCAG 2.2 AA pour du texte normal est 4,5:1 (3:1 seulement pour du texte large ≥ 18px ou ≥ 14px gras). Le SKU produit (`text-xs font-mono text-graphite-400`, 12px) affiché sur **chaque** carte produit du catalogue et sur **chaque** fiche produit, ainsi que la barre de copyright du footer (`text-xs text-graphite-400`), sont donc en échec AA — pas juste sous-optimaux.

Par comparaison, `graphite-600` (`#5F5E5A`) offre 6,49:1 sur blanc — largement conforme.

**Correction attendue :** remplacer `text-graphite-400` par `text-graphite-600` pour tout texte informatif de moins de 18px (SKU, mentions de copyright, légendes). Réserver `graphite-400` aux icônes décoratives, aux textes de type `placeholder` (exemptés par WCAG car non essentiels et remplacés à la saisie), et aux éléments ≥ 18px.

**Critère de validation :** ajouter ce cas au scan `@axe-core/playwright` déjà présent dans `e2e/` s'il ne le couvre pas déjà automatiquement (axe détecte normalement ce type d'échec — si le CI actuel passe malgré ce défaut, vérifier que le test e2e visite effectivement `/catalogue` et une fiche produit).

### 4.8 Meta descriptions génériques et peu différenciées sur les pages institutionnelles

**Fichiers :** `src/app/confidentialite/page.tsx`, `src/app/mentions-legales/page.tsx`, `src/app/cgv/page.tsx`

**Constat :** les `openGraph.description` de ces trois pages reprennent des formulations quasi identiques centrées sur le nom de marque, sans réel contenu différenciant pour les moteurs de recherche.

**Correction attendue :** rédiger une meta description unique et spécifique par page (ce sont des pages à faible priorité SEO de toute façon — priorité basse, à traiter après les items critiques).

### 4.9 Écart suspecté entre le code du dépôt et la production déployée

**Constat :** lors de l'audit du site en ligne (`hardware-central.com`), plusieurs occurrences du bug de concaténation JSX (item 3.4) ont été observées à des endroits du texte CGV où le code actuel du dépôt (`main`) est syntaxiquement correct (espaces présents sur la même ligne). Cela suggère soit que la production tourne sur une révision antérieure à `main`, soit qu'un correctif a déjà été appliqué au dépôt sans redéploiement.

**Correction attendue :** avant de clôturer ce document, vérifier quel commit est réellement servi en production (`x-vercel-id` / dashboard Vercel / date de build) et déclencher un redéploiement propre depuis `main` une fois les corrections de ce document mergées, puis re-vérifier le site en ligne (pas seulement en local) pour chaque item marqué 🔴.

---

## 5. 🟡 MINEUR

| # | Problème | Fichier(s) | Correction |
|---|---|---|---|
| 5.1 | Liens légaux dupliqués dans le footer (liste principale + barre du bas) | `src/components/layout/Footer.tsx` | Retirer la duplication, garder un seul emplacement |
| 5.2 | Micro-copy CTA identique (« Ajouter au devis ») sans variation contextuelle | `src/components/product/QuoteToggleButton.tsx` | Optionnel — pas de changement fonctionnel requis, cosmétique uniquement |
| 5.3 | Pas de sélecteur de langue FR/EN malgré une cible incluant des partenaires internationaux | Global | Hors scope V1 selon spec section 11 (« aucun contenu anglais en V1 ») — **ne pas corriger sans validation explicite**, ce point contredirait une règle déjà actée |
| 5.4 | `© {year} HardwareCentral — BTS` sans explication de la relation entre les deux marques | `src/components/layout/Footer.tsx` (L125), `src/app/a-propos/page.tsx` | Ajouter une phrase explicative en page À propos |
| 5.5 | CSP autorise `'unsafe-inline'` et `'unsafe-eval'` sur `script-src` | `next.config.ts` | Durcissement possible via nonce Next.js (`middleware.ts` + `headers()` dynamiques) — non bloquant, le reste des en-têtes de sécurité est déjà correctement en place (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` sont tous déjà présents et corrects) |
| 5.6 | Pas de case de consentement explicite sur le formulaire newsletter | `src/components/forms/NewsletterForm.tsx` | Ajouter une checkbox de consentement + lien vers `/confidentialite` |

---

## 6. Pipeline images — exécution du pipeline 3D réconcilié

### 6.1 État réel constaté dans le dépôt `hardwarecentral`

- `scripts/generate-placeholder-svgs.ts` et `scripts/generate-product-images.ts` génèrent les SVG de repli actuellement affichés pour 239/240 produits (couleur de marque + icône de catégorie + nom produit + mention « Image non disponible »).
- `scripts/ingest-product-media.ts` orchestre le pipeline Amazon Scraper API + Icecat décrit en spec 6.5 — n'a été exécuté avec succès qu'une seule fois (1 produit Hikvision), et dépend des identifiants à régénérer suite à l'item 1.1.
- Le modèle `MediaAsset` (`src/types/index.ts`) supporte déjà `imageSource` et un objet `provenance` complet — voir 6.3 pour l'extension nécessaire de ce type.

### 6.2 Pipeline à exécuter : `OPENCODE_PIPELINE_3D.md` v1.1

Le pipeline complet (téléchargement de références → conversion image-to-3D via Hugging Face/Meshy → rendu Blender headless → intégration catalogue) est spécifié dans **`OPENCODE_PIPELINE_3D.md`** (v1.1, réconciliée), à traiter comme faisant partie intégrante de ce plan de correction. Points clés de cette v1.1 par rapport à la version initiale de Lincoln :

1. **Sourcing restreint aux domaines officiels des constructeurs** (`hpe.com`, `dell.com`, `fortinet.com`, `cisco.com`, `huawei.com`, `hikvision.com`) — `download_refs.py` refuse désormais toute URL de référence provenant d'un site distributeur tiers, réduisant le risque juridique par rapport à la v1.0 initiale et par rapport au sourcing Amazon Scraper API (ADR-022).
2. **Validation de résolution minimale** des images de référence (`pillow`, déjà déclaré en dépendance mais inutilisé en v1.0).
3. **Caméra Blender adaptative** à la taille réelle de l'objet (bounding box) au lieu d'une position fixe — nécessaire vu l'écart d'échelle entre un point d'accès mural et un rack de stockage complet.
4. **Fond transparent** (`film_transparent = True`, `RGBA`) au lieu de l'environnement HDRI visible en arrière-plan — cohérent avec les standards e-commerce (photo produit isolée) plutôt qu'une scène en contexte.
5. **Étape 5 ajoutée** (`sync_to_catalog.py` + `scripts/upload-3d-renders.ts` côté dépôt principal, réutilisant `src/lib/imagekit.ts`) : sans cette étape, le pipeline produit des PNG dans `outputs/` qui ne sont jamais vus par un visiteur du site — ce n'était pas couvert par la v1.0.

### 6.3 Évolution de type requise avant d'utiliser les rendus générés

**Fichier :** `src/types/index.ts`

```ts
export type ImageSource = 'real' | 'ai-render' | 'placeholder';
export type ImageProvider =
  | 'amazon-scraper'
  | 'icecat'
  | 'manufacturer-portal'
  | 'manual-capture'
  | 'branded-placeholder'
  | 'ai-3d-render';
```

Un produit dont l'image provient du pipeline 3D doit avoir `imageSource: 'ai-render'` (jamais `'real'`) — voir le détail dans `OPENCODE_PIPELINE_3D.md` v1.1, y compris la micro-mention UI à afficher sur la fiche produit pour rester honnête sur la nature du visuel.

### 6.4 Ordre d'exécution recommandé

1. Exécuter le pipeline sur `dell-precision-3490` (cas de test de référence du document) et valider manuellement le rendu avant tout batch.
2. Étendre à un premier lot de 10-15 produits `isFeatured: true` couvrant plusieurs marques et catégories différentes (pas uniquement des laptops Dell) pour valider que le Space Hugging Face gérera correctement des géométries variées (caméra dôme, châssis rack, boîtier pare-feu).
3. Passer en revue le rapport `sync-reports/*.json`, uploader vers ImageKit, committer manuellement les `MediaAsset` dans `products/*.ts` (jamais d'écriture automatique — cohérent avec ADR-020).
4. Étendre progressivement au reste du catalogue par lots, en respectant la décision D5.
5. Mettre à jour `image-coverage-report.md` pour distinguer trois états : `real` / `ai-render` / `placeholder-svg` — l'objectif est de faire tendre ce dernier vers 0 %.

---

## 7. Definition of Done — vérification finale globale

Avant de considérer ce document intégralement traité :

- [ ] `npx tsc --noEmit`, `npm run lint`, `npx vitest run`, `npm run build` passent sans erreur.
- [ ] `npx playwright test` (incluant les scans `@axe-core/playwright` déjà en place) passe sans nouvelle violation.
- [ ] Identifiants Oxylabs et Icecat régénérés, historique Git purgé, scanner de secrets ajouté au CI.
- [ ] Un seul domaine canonique utilisé partout (`SITE_CONFIG.domain`), vérifié en production sur au moins 3 pages.
- [ ] `/catalogue` et `/recherche` retournent du contenu produit dans le HTML initial (vérifiable via `curl`, sans exécution JS).
- [ ] Plus aucune fiche produit HP Inc. (EliteBook/ProBook/Z) n'affiche la marque « HPE ».
- [ ] `git grep` de contrôle sur le pattern de concaténation JSX ne retourne rien sur les pages légales ; test e2e de non-régression en place.
- [ ] Mentions légales complétées (ou `TODO` explicite et honnête si D2 n'est pas encore tranchée).
- [ ] Délai de réponse aux devis identique partout où il est promis.
- [ ] `text-graphite-400` n'est plus utilisé pour du texte < 18px porteur d'information.
- [ ] Couverture image réelle ou 3D générique > 0 % en dehors du seul produit Hikvision existant, avec plan de montée en couverture documenté.
- [ ] Site redéployé depuis `main` après fusion de toutes les corrections ci-dessus, et re-vérifié en conditions réelles sur le domaine de production.
