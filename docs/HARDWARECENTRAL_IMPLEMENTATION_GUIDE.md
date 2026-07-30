# Guide d'implémentation — HardwareCentral

**Document compagnon de :** `HARDWARECENTRAL_AGENT_SPEC.md` (v1.0.0)
**Objectif de ce guide :** transformer la spécification en un plan d'exécution concret, phase par phase, avec des instructions prêtes à copier-coller pour un agent IA de développement, des critères de sortie vérifiables, et un suivi d'avancement.

---

## 0. Comment utiliser ce guide

- **`HARDWARECENTRAL_AGENT_SPEC.md`** est la source de vérité : il répond à « quelle est la règle ? » (architecture, design system, modèle de données, règles métier, ADR).
- **Ce guide (`HARDWARECENTRAL_IMPLEMENTATION_GUIDE.md`)** répond à « dans quel ordre, avec quelles instructions, et comment savoir que c'est terminé ? ».
- **Ce fichier`HARDWARECENTRAL_WIREFRAMES.html`** accompagne HARDWARECENTRAL_AGENT_SPEC.md et HARDWARECENTRAL_IMPLEMENTATION_GUIDE.md. Il fixe la structure et la hiérarchie de chaque écran clé — pas le design visuel final (couleurs, typographie, espacement exact restent définis par la section 14 du spec).
- Les deux fichiers doivent rester dans le dépôt de code (`docs/`), versionnés ensemble. Ne travaillez jamais sur une copie du spec séparée de celle utilisée par l'agent — un seul exemplaire, faisant autorité (même principe de source unique que le `SITE_CONFIG` décrit en section 10 du spec).
- Chaque phase ci-dessous cite les sections du spec à lire **avant** de lancer le prompt. Ne demandez jamais à l'agent d'improviser une règle déjà définie dans le spec.

### Règle d'or : une phase = un prompt scopé = une vérification = un commit

Ne donnez jamais l'intégralité du spec à exécuter d'un bloc (« construis-moi tout le site »). C'est précisément ce mode « one-shot » sans point de contrôle qui a produit le prototype défaillant à l'origine de ce projet (modale de devis inatteignable, filtre cassé silencieusement, pagination factice, trois identités d'entreprise contradictoires — voir le journal des décisions, section 27 du spec). Chaque phase de ce guide doit être :

1. **Lancée** avec un prompt scopé (fourni ci-dessous, à adapter).
2. **Vérifiée** contre les critères de sortie listés (build, tests manuels, checklist).
3. **Commitée** séparément (`feat: phase X — ...`), avant de passer à la phase suivante.

Si une phase échoue à ses critères de sortie, ne passez pas à la suivante — corrigez d'abord, en redonnant à l'agent le critère précis qui échoue plutôt qu'en redemandant toute la phase.

---

## 1. Pré-requis à réunir avant de démarrer

Le spec laisse volontairement des valeurs de type *placeholder* qu'aucun agent IA ne peut deviner de façon fiable (inventer ces valeurs serait reproduire l'erreur du prototype initial — voir ADR-017 du spec). Réunissez ces informations **avant** d'attaquer les phases qui en dépendent (indiquées dans chaque phase) :

| Information | Utilisée en | Où l'obtenir |
|---|---|---|
| Numéro de téléphone professionnel réel (+237) | Phase 0, 3, 6 | Direction commerciale |
| Numéro WhatsApp Business réel | Phase 0, 3 | Direction commerciale / IT |
| Adresse légale complète (Douala ou autre) | Phase 0, 6 | Service juridique / registre du commerce |
| Raison sociale exacte + numéro d'immatriculation (RCCM/NIU) | Phase 6 (mentions légales) | Extrait RCCM existant, ou création via le CFCE (guichet unique, Douala) si la société n'est pas encore immatriculée |
| Compte + clé API **Amazon Scraper API** (ex. Oxylabs, Bright Data, ScraperAPI, Decodo — voir spec 6.5.2) | Phase 1 | À créer si absent ; **validation juridique préalable recommandée** avant usage en production (voir spec 6.5.8) |
| Compte + clé API **Open Icecat** (datasheets uniquement — voir spec 6.5.5) | Phase 1 | Inscription gratuite sur icecat.biz |
| Compte + bucket **Cloudflare R2** (ou équivalent S3) pour le stockage des médias | Phase 1 | Service IT — voir spec 6.5.4 |
| Coordonnées de garantie/support réelles par produit | Phase 1 | Service technique (non couvert par Amazon Scraper API ni Icecat, voir spec 6.5.2) |
| Compte + clé API **Brevo** (transactionnel + newsletter, fournisseur unique — voir spec 22.0) | Phase 5 | À créer si absent (plan gratuit suffisant au démarrage) |
| Adresse e-mail de réception des leads (`sales@`, `contact@`) réellement surveillée | Phase 5 | Direction commerciale |
| Nom de domaine + accès DNS (pour le déploiement) | Phase 10 | Service IT |
| Compte plateforme de déploiement (ex. Vercel) | Phase 10 | Service IT |

**Règle pratique :** si une de ces informations manque au moment d'une phase, ne laissez pas l'agent inventer une valeur plausible. Demandez-lui explicitement de poser un `TODO` typé et documenté (voir gabarit de prompt en section 3) plutôt que de fabriquer une donnée — c'est exactement le type de raccourci qui a produit les contradictions du prototype initial.

---

## 2. Mise en place de l'environnement agent

### 2.1 Outil recommandé

Ce projet (migration complète vers Next.js, ~10 phases, tests, CI) est mieux mené avec un agent qui travaille directement sur votre dépôt Git local (Claude Code, Cursor, ou équivalent) plutôt que dans un chat isolé — vous gardez l'historique de commits comme trace de chaque phase.

### 2.2 Fichier `CLAUDE.md` (ou équivalent `.cursor/rules`) à la racine du dépôt

Gardez ce fichier **court** — il ne doit pas dupliquer le spec, seulement pointer dessus et rappeler les règles qu'un agent a le plus tendance à oublier en cours de session longue :

```markdown
# Instructions du projet HardwareCentral

Avant toute action, lis intégralement :
- docs/HARDWARECENTRAL_AGENT_SPEC.md (règles, architecture, design system, ADR)
- docs/HARDWARECENTRAL_IMPLEMENTATION_GUIDE.md (feuille de route, phase en cours)

Règles non négociables à ne jamais oublier en cours de session :
- Aucune donnée de contact (téléphone, e-mail, adresse, horaires) codée en dur
  ailleurs que dans src/lib/site-config.ts (section 10 du spec).
- Aucun élément interactif sans véritable logique fonctionnelle derrière
  (section 16.1 du spec) — pas de bouton, filtre, tri ou pagination décoratif.
- Aucune donnée affichée (statut, garantie, délai) codée en dur : tout provient
  du modèle Product (section 12).
- Avant de déclarer une phase terminée, vérifie-la contre les critères de sortie
  correspondants dans HARDWARECENTRAL_IMPLEMENTATION_GUIDE.md.
- Si une information réelle manque (téléphone, clé API, matching produit), pose un
  TODO explicite plutôt que d'inventer une valeur.
- Amazon Scraper API est réservé aux images et infos de base ; Icecat est réservé
  aux datasheets (section 6.5 du spec) — ne jamais inverser ni mélanger les deux.
- Le script d'ingestion (scripts/ingest-product-media.ts) n'écrit jamais
  directement dans products.ts : il produit un rapport relu et committé
  manuellement (section 6.5.1 du spec).
  Référence structurelle visuelle (en plus du spec) :
- docs/HARDWARECENTRAL_WIREFRAMES.html — 16 écrans + une section « états
  transverses », chacun avec un ancrage #screen-N (ou #etats-transverses).
  Avant de construire une page ou un composant, ouvre l'écran correspondant
  (voir table de correspondance dans docs/HARDWARECENTRAL_PROMPTS_WIREFRAMES.md)
  et respecte : l'ordre vertical des blocs, quels composants sont présents
  ou absents, et les états conditionnels signalés en encadré jaune.
- Les wireframes sont intentionnellement en basse fidélité (boîtes grises).
  Ne jamais en déduire une couleur, une police ou un espacement : ces valeurs
  viennent exclusivement de la section 14 du spec.
- Chaque bloc annoté d'une étiquette noire (« Composant · section ») dans les
  wireframes doit exister dans le code sous ce nom de composant, à cet
  emplacement dans l'arborescence visuelle.
```

### 2.3 Structure documentaire recommandée dans le dépôt

```
hardwarecentral/
├── docs/
│   ├── HARDWARECENTRAL_AGENT_SPEC.md
│   ├── HARDWARECENTRAL_IMPLEMENTATION_GUIDE.md
│   └── PROGRESS.md              # suivi d'avancement, voir section 8 de ce guide
├── CLAUDE.md
└── ... (voir arborescence cible, section 8 du spec)
```

---

## 3. Feuille de route détaillée (Phases 0 à 10)

Pour chaque phase : objectif, sections du spec à relire, pré-requis, prompt suggéré (à adapter), critères de sortie (Definition of Done de la phase), pièges spécifiques à surveiller.

---

### Phase 0 — Initialisation du projet & fondations

**Objectif :** poser les fondations techniques sans encore construire de fonctionnalité visible.

**Sections du spec à lire :** 6 (architecture), 7 (stack), 8 (structure des dossiers), 9 (conventions), 10.4 (`site-config.ts`), 12.2 (types), 14 (design tokens).

**Pré-requis :** aucun bloquant — cette phase peut démarrer immédiatement, avec des valeurs placeholder explicitement marquées comme telles pour les champs de `SITE_CONFIG` en attente d'informations réelles (section 1 de ce guide).

**Prompt suggéré :**
> « En te basant strictement sur les sections 6 à 10 et 12.2, 14 du document `docs/HARDWARECENTRAL_AGENT_SPEC.md` : initialise un projet Next.js 15 (App Router, TypeScript strict), installe les dépendances listées en section 7.1, mets en place l'arborescence de dossiers de la section 8.1, configure les tokens Tailwind (`@theme`) de la section 14.2 et 14.4, crée `src/lib/site-config.ts` conforme à la section 10.4 (utilise des valeurs placeholder explicitement commentées `// TODO: valeur réelle à fournir` pour le téléphone et l'adresse), et `src/types/index.ts` conforme à la section 12.2. Ne crée aucune page ni composant fonctionnel à ce stade. Configure ESLint (config Next.js + `eslint-plugin-jsx-a11y`) et Prettier conformément à la section 24.1. »

**Critères de sortie (à vérifier avant de committer) :**
- [ ] `npm run build` (ou équivalent) réussit sans erreur.
- [ ] `tsc --noEmit` ne remonte aucune erreur.
- [ ] L'arborescence correspond à la section 8.1 du spec.
- [ ] `site-config.ts` existe, est importé nulle part encore (normal à ce stade), et documente clairement les valeurs en attente.
- [ ] Aucune page fonctionnelle n'existe encore — c'est normal et attendu.
- [ ] `package.json` ne contient **aucune** des dépendances proscrites en section 7.2 du spec (`@google/genai`, `express`, `dotenv` sans usage réel).

**Pièges à surveiller :** un agent peut avoir tendance à générer une page d'accueil « pour tester » — refusez, cette phase est intentionnellement limitée aux fondations pour garder un historique de commits lisible.

---

### Phase 1 — Pipeline d'ingestion & catalogue produit

**Objectif :** mettre en place le pipeline d'ingestion à deux sources (Amazon Scraper API pour images/infos de base, Icecat pour les datasheets), l'exécuter sur le catalogue de départ, puis produire un jeu de données produit réel et typé.

**Sections du spec à lire :** 6.5 (pipeline d'ingestion, intégralement — c'est la section la plus longue et la plus structurante de cette phase), 12 (modèle de données, notamment `MediaAsset` en 12.2/6.5.9), 3.4/3.5 (référentiels marques/catégories).

**Pré-requis :** clé API Amazon Scraper API, compte Icecat, bucket R2 configuré (section 1 de ce guide). **Si ces éléments ne sont pas encore disponibles**, ne bloquez pas toute la phase : demandez à l'agent de migrer d'abord les 8 produits existants du prototype initial en column-mappant leurs champs vers le nouveau modèle avec des visuels de substitution neutres et des `TODO` explicites, puis de lancer le pipeline dès que les accès sont prêts.

Cette phase se déroule en trois étapes distinctes (voir le workflow détaillé en spec 6.5.1) :

**Étape 1a — Construire les clients et le script d'ingestion**
> « En te basant sur la section 6.5 du spec, construis `src/lib/amazon-scraper-client.ts`, `src/lib/icecat-client.ts` (borné aux datasheets, voir 6.5.5), `src/lib/media-storage.ts` (upload vers R2, voir 6.5.4), et `scripts/ingest-product-media.ts` qui orchestre le workflow complet décrit en 6.5.1 : résolution ASIN, téléchargement, déduplication par checksum (6.5.3), upload, et écriture d'un **rapport** — jamais une écriture directe dans `products.ts` (règle 6.5.1, étape 7-9). Implémente aussi `scripts/verify-media-links.ts` (6.5.10). »

**Étape 1b — Exécuter le pipeline sur le catalogue de départ**
> « Lance `scripts/ingest-product-media.ts` sur les 8 produits du prototype initial (marque + référence constructeur pour chacun). Produis le rapport de synchronisation complet : succès, produits sans correspondance Amazon, ASIN ambigus nécessitant un arbitrage, datasheets introuvables sur Icecat. Ne modifie aucun fichier de données en production à ce stade — attends ma validation du rapport. »

**Étape 1c — Après revue humaine, construire le catalogue final**
> « En te basant sur la section 12 du spec, crée `src/lib/data/products.ts`, `categories.ts` et `brands.ts` à partir du rapport validé. Chaque `primaryImage`/`gallery`/`datasheet` utilise le type `MediaAsset` avec sa provenance complète (6.5.9). Sépare strictement `specs` (affichage libre) et `attributes` (filtrage typé, notamment `chassisFormat`). Pour tout produit resté sans image après le pipeline et ses replis (portail constructeur, capture manuelle), utilise un visuel de substitution neutre + `TODO` — jamais la photo d'un autre produit (6.4). Pour tout produit sans datasheet, n'affiche simplement pas la section correspondante (règle de repli 6.5.7) — jamais un lien mort. Applique le référentiel de marques actives (3.4) et de catégories actives (3.5). »

**Critères de sortie :**
- [ ] `tsc --noEmit` propre sur les nouveaux fichiers.
- [ ] Le script d'ingestion tourne produit par produit sans qu'un échec sur un SKU n'interrompe les autres (6.5.1).
- [ ] Aucun produit ne réutilise l'image d'un autre produit/marque — y compris le cas « checksum identique entre deux produits différents » (garde-fou 6.5.3), à vérifier explicitement dans le rapport.
- [ ] Chaque `MediaAsset` stocké porte une provenance complète (`sourceProvider`, `sourceUrl`, `sourceIdentifier`, `fetchedAt`, `checksum` — 6.5.9), cohérente avec la règle `amazon-scraper` réservé aux images et `icecat` réservé aux datasheets.
- [ ] Chaque catégorie/marque avec `isActive: true` a bien au moins un produit associé.
- [ ] Aucune écriture automatique du script dans `products.ts` — uniquement via le rapport relu et committé manuellement.
- [ ] La liste récapitulative des éléments en attente (images, datasheets, garanties) a bien été produite et transmise à l'équipe métier.

**Pièges à surveiller :**
- Le bug d'origine du filtre « Format Châssis » (ADR-014) : vérifiez qu'aucune valeur de `specs` ne s'est retrouvée dupliquée dans `attributes` sous une clé mal cassée.
- **Vigilance légale (voir spec 6.5.8)** : avant de publier telle quelle une image récupérée via Amazon Scraper API, assurez-vous que la décision de mitigation retenue (image de remplacement à droits clairs vs. publication directe avec confirmation constructeur) a bien été arbitrée avec l'équipe/le service juridique — ce n'est pas un détail technique à trancher silencieusement pendant cette phase.
- Un produit dont le listing Amazon correspond à un kit/bundle ou une variante régionale plutôt qu'au SKU exact ne doit jamais être validé automatiquement (6.5.2) — vérifiez chaque matching un par un dans le rapport avant de committer.

---

### Phase 2 — Design System & composants primitifs (`components/ui/`)

**Objectif :** construire la bibliothèque de composants réutilisables avant toute page.

**Sections du spec à lire :** 14 (tokens), 15.1 (composants primitifs), 18.3/18.4/18.6 (accessibilité clavier, formulaires, contraste).

**Pré-requis :** aucun.

**Prompt suggéré :**
> En te basant sur les sections 14 et 15.1 du spec, construis dans `src/components/ui/` : `Button`, `Input`/`Textarea`/`Select`, `Badge`, `Modal`, `Toast`. Utilise exclusivement les paires texte/fond validées en section 14.3.
>
> **Référence structurelle :** ouvre `docs/HARDWARECENTRAL_WIREFRAMES.html#etats-transverses` avant de commencer. Les items « Loading (squelette) », « Erreur formulaire », « Toast (confirmation) » et « Lien d'évitement » y montrent la composition attendue (icône/texte/action) de ces états partagés — construis-les comme des primitives réutilisables dès cette phase, pas comme des cas particuliers ajoutés plus tard page par page.

**Critères de sortie :**
- [ ] Chaque composant est un véritable `<button>`/`<a>`/élément sémantique natif — aucun `<div onClick>` (section 18.3).
- [ ] Navigation clavier testée manuellement sur chaque composant (Tab, Entrée, Échap pour la Modal).
- [ ] Focus visible (`:focus-visible`) sur 100% des éléments interactifs.
- [ ] Aucune combinaison texte/fond hors de la table 14.3.
- [ ] `Select` : vérifier qu'aucune instance n'est livrée avec une seule option (règle 15.1/16.1).

**Pièges à surveiller :** c'est la phase où le défaut d'accessibilité le plus répandu du prototype initial (`<div onClick>` partout) doit être définitivement écarté — soyez intransigeant ici, car toutes les phases suivantes réutiliseront ces primitives.

---

### Phase 3 — Layout global

**Objectif :** navigation complète (desktop + mobile), header, footer.

**Sections du spec à lire :** 15.2 (Header, MegaMenu, MobileNav, Breadcrumb, WhatsAppBubble, Footer), 10 (identité de marque), 16.2 (navigation mobile).

**Pré-requis :** numéro de téléphone/WhatsApp réel idéalement disponible (sinon, placeholder `TODO` explicite comme en Phase 0).

**Prompt suggéré :**
> En te basant sur la section 15.2 du spec, construis `Header`, `MegaMenu`, `MobileNav`, `Footer`, `Breadcrumb`, `WhatsAppBubble` dans `src/components/layout/`.
>
> **Référence structurelle :** utilise `#screen-1` (header + méga-menu desktop), `#screen-2` (header + tiroir mobile) et `#screen-8` (footer) comme référence exacte de hiérarchie : ordre des blocs du méga-menu, contenu du tiroir mobile (catégories → Marques → Devis → Favoris → Contact, dans cet ordre), et les 5 colonnes du footer avec leurs libellés exacts. L'écran 8 précise aussi que le bloc coordonnées du footer doit être identique à celui du header — vérifie-le visuellement contre l'écran 1.
>
> Si tu construis l'Accueil dans cette même phase : utilise `#screen-3` comme référence d'ordre vertical (Hero → TrustBadges → CategoryGrid → FeaturedProducts → BrandsGrid → NewsletterForm → Footer) — ne réordonne pas ces blocs sans raison documentée.


**Critères de sortie :**
- [ ] Navigation complète possible au clavier seul (Tab/Entrée/Échap), sans souris.
- [ ] Navigation complète possible sur un viewport mobile simulé (< 768px), menu hamburger fonctionnel.
- [ ] Aucun texte contenant un numéro de téléphone/e-mail/adresse en dur trouvé par une recherche `grep` dans `src/components/` (tout doit venir de `site-config.ts`).
- [ ] Aucun lien de footer ne mène à une page 404 intentionnellement.
- [ ] Lien `tel:` et `mailto:` fonctionnels et cliquables.

**Pièges à surveiller :** testez explicitement le méga-menu au clavier ET sur un émulateur tactile — c'était totalement non fonctionnel dans le prototype initial (hover-only).

---

### Phase 4 — Catalogue, recherche, fiches produit, marques

**Objectif :** parcours de découverte produit complet et fonctionnel de bout en bout.

**Sections du spec à lire :** 13 (routes/URLs), 15.3 (composants produit), 15.4 (composants catalogue), 16.3 (recherche), 9.2 (fonction unique de filtrage).

**Pré-requis :** Phases 1, 2, 3 terminées.

**Prompt suggéré :**
> En te basant sur les sections 13, 15.3, 15.4 et 16.3 du spec, construis les routes `/catalogue`, `/produit/[slug]`, `/marques`, `/marques/[brand]`, `/recherche`. Crée une fonction unique `filterProducts` réutilisée par toutes ces routes.
>
> **Référence structurelle :** cinq écrans à consulter pour cette phase — `#screen-4` (catalogue desktop, sidebar de filtres 220px + grille 3 colonnes), `#screen-5` (catalogue mobile, filtres en tiroir plein écran), `#screen-6` (fiche produit — galerie + colonne info + CTA toujours visible + bloc datasheet conditionnel), `#screen-9` (annuaire des marques, grille de `BrandCard`) et `#screen-10` (fiche marque, réutilise exactement la grille `ProductCard` de l'écran 4). Pour `/recherche`, `#screen-11` montre les deux états à couvrir : résultats trouvés **et** `EmptyState` zéro-résultat — les deux sont obligatoires, pas seulement le cas « heureux ».

**Critères de sortie :**
- [ ] Filtrer par « Format Châssis » retourne effectivement un sous-ensemble différent de résultats (test manuel critique — c'était le bug historique le plus insidieux).
- [ ] La pagination n'apparaît pas si un seul écran de résultats suffit ; si elle apparaît, chaque page affiche un contenu réellement différent.
- [ ] Le badge de disponibilité d'un même produit est identique entre la carte catalogue et la fiche détaillée.
- [ ] `/recherche` et `/catalogue?q=...` utilisent la même fonction de filtrage (vérification dans le code, pas seulement visuelle).
- [ ] Chaque URL de filtre/page est copiable et rechargeable dans un nouvel onglet en conservant le même résultat.
- [ ] Le fil d'Ariane est entièrement cliquable (aucun segment avec un style de lien mais sans action, cf. l'ancien bug des breadcrumbs).

**Pièges à surveiller :** demandez explicitement à l'agent de tester le cas « catalogue filtré par une marque + un format » simultanément — c'est la combinaison qui révèle le plus vite un bug de filtrage résiduel.

---

### Phase 5 — Liste de devis, favoris, formulaires & API

**Objectif :** rendre fonctionnel l'unique objectif de conversion du site (section 3.3 du spec).

**Sections du spec à lire :** 22 (contrat API, dont 22.0 sur le choix de Brevo comme fournisseur unique), 23.2 (stores Zustand), 15.5 (formulaires), 21.3 (anti-spam), 16.4/16.5 (comportements devis/favoris).

**Pré-requis :** clé API Brevo, adresse `sales@`/`contact@` réellement surveillée (section 1 de ce guide). **Cette phase ne peut pas être considérée « terminée » sans ces éléments** — si absents, l'agent doit construire l'intégralité du flux avec un connecteur d'e-mail mocké clairement identifié comme temporaire, jamais silencieusement.

**Prompt suggéré :**
> En te basant sur les sections 22, 23.2, 15.5 et 21.3 du spec : crée les stores Zustand `quote-store.ts` et `favorites-store.ts`, les formulaires `QuoteRequestForm`, `ContactForm`, `NewsletterForm`, et les Route Handlers `/api/quote-requests`, `/api/contact-messages`, `/api/newsletter`.
>
> **Référence structurelle :** `#screen-7` montre les deux surfaces à livrer — la page `/devis` (liste + retrait par article) **et** la modale `QuoteRequestForm` (champs, honeypot caché, note d'états idle/submitting/success/error) avec ses 3 points d'entrée (header, fiche produit, page devis). `#screen-12` montre `/favoris` avec son action secondaire « + Devis » par article (bascule vers le devis sans quitter la page) et son état vide dédié — ne fusionne pas favoris et devis dans un seul store, ce sont deux listes distinctes.


**Critères de sortie :**
- [ ] Ajouter un produit aux favoris ou au devis, **rafraîchir la page (F5)** : les données doivent survivre (test critique, corrige ADR-008).
- [ ] Soumettre `QuoteRequestForm` déclenche un vrai appel réseau visible dans l'onglet Réseau du navigateur, et un e-mail arrive réellement à l'adresse `sales@` configurée.
- [ ] Soumettre un formulaire avec le champ honeypot rempli (test manuel via les DevTools) est rejeté silencieusement (retour 200 sans envoi réel).
- [ ] Le compteur d'articles du header se met à jour immédiatement après ajout, sans rechargement de page.
- [ ] Une erreur réseau simulée (couper la connexion) affiche un message d'erreur explicite et **ne vide pas** les champs déjà saisis.

**Pièges à surveiller :** c'est la phase qui corrige le défaut le plus critique identifié dans l'audit initial (formulaire de devis entièrement construit mais totalement inatteignable). Vérifiez concrètement, en cliquant vous-même dans l'interface, que le formulaire est bien atteignable depuis au moins 3 endroits différents du site.

---

### Phase 6 — Pages institutionnelles

**Objectif :** contenu de confiance cohérent (À propos, Contact, pages légales, 404).

**Sections du spec à lire :** 4.6, 17.3, 25.4, 10 (identité de marque).

**Pré-requis :** raison sociale exacte, adresse légale, numéro d'immatriculation (section 1 de ce guide) — les pages légales ne doivent pas être livrées avec un contenu générique non adapté au pays réel d'immatriculation.

**Prompt suggéré :**
> Construis `/a-propos`, `/contact`, `/mentions-legales`, `/cgv`, `/confidentialite` et la page 404, conformément aux sections 4.6, 17.3 et 25.4 du spec.
>
> **Référence structurelle :** `#screen-13` (À propos — mission, TrustBadges réutilisé, BrandsGrid réutilisé, bloc identité légale), `#screen-14` (Contact — coordonnées à gauche, `ContactForm` déjà construit en Phase 5 à droite, avec le sujet « Demande de devis » dans le select), `#screen-15` (un seul gabarit visuel pour les 3 pages légales — seul le contenu texte change entre elles) et `#screen-16` (404 — numéral, message, barre de recherche réutilisée, suggestions de catégories actives, jamais un lien mort en sortie).

**Critères de sortie :**
- [ ] Les coordonnées affichées sur `/contact`, dans le header et dans le footer sont **identiques mot pour mot** (même téléphone, même adresse, mêmes horaires).
- [ ] Les pages légales contiennent un contenu réel et cohérent avec le pays d'immatriculation déclaré, pas un texte substitué d'un autre pays.
- [ ] Aucun lien interne du site ne mène à la page 404.
- [ ] La page 404 propose un lien de retour à l'accueil, une recherche, et des suggestions de catégories actives.

**Pièges à surveiller :** relisez ADR-017 du spec (les trois identités contradictoires du prototype initial) et faites une recherche `grep` de tout numéro de téléphone/adresse e-mail codé en dur restant dans le code avant de clore cette phase.

---

### Phase 7 — SEO technique & données structurées

**Objectif :** indexabilité complète du catalogue.

**Sections du spec à lire :** 13.3, 20 (SEO complet).

**Pré-requis :** Phases 4 et 6 terminées.

**Prompt suggéré :**
> « En te basant sur les sections 13.3 et 20 du spec, ajoute `generateMetadata` sur chaque route indexable (title/description/canonical/OpenGraph selon les gabarits de 13.3), crée `app/sitemap.ts` et `app/robots.ts` conformément à 20.1, ajoute les données structurées JSON-LD `Organization` (layout racine), `Product` (fiche produit, sans bloc `offers`), `BreadcrumbList` (pages profondes) conformément à 20.3. Marque `/devis`, `/favoris`, `/recherche` en `noindex` (13.2/13.3). »

**Critères de sortie :**
- [ ] Chaque page indexable a un `<title>` et une `<meta description>` uniques (vérification en inspectant le `<head>` généré).
- [ ] `sitemap.xml` accessible et listant bien toutes les routes indexables du catalogue actuel.
- [ ] Validation des données structurées sans erreur (outil de test de résultats enrichis).
- [ ] `/devis`, `/favoris`, `/recherche` renvoient bien `noindex` dans leurs métadonnées.

---

### Phase 8 — Accessibilité & Performance (audit + corrections)

**Objectif :** conformité mesurée, pas seulement supposée.

**Sections du spec à lire :** 18 (accessibilité complète), 19 (performance).

**Pré-requis :** Phases 2 à 7 terminées (audit global, pas phase par phase à ce stade).

**Prompt suggéré :**
> « Exécute un audit `axe-core` sur les pages accueil, catalogue, fiche produit, contact. Corrige toute violation `critical`/`serious` en te référant à la section 18 du spec. Vérifie que chaque image passe par `next/image` avec dimensions explicites (19.2), qu'aucune image de produit n'est hotlinkée depuis une banque d'images externe (19.2/6.4), et que `prefers-reduced-motion` est respecté sur les animations de transition de page (18.9/14.7). Fournis un rapport Lighthouse avant/après. »

**Critères de sortie :**
- [ ] 0 violation `critical`/`serious` axe-core sur les 4 pages testées.
- [ ] Score Lighthouse Accessibilité ≥ 95, SEO ≥ 95.
- [ ] LCP < 2.5s, CLS < 0.1, INP < 200ms (section 19.1) sur la fiche produit et l'accueil, mesurés en throttling mobile.
- [ ] `prefers-reduced-motion: reduce` testé manuellement (réglage système) : les transitions de page se réduisent à un simple changement d'opacité.

---

### Phase 9 — Tests automatisés & CI

**Objectif :** empêcher toute régression future des défauts corrigés dans ce projet.

**Sections du spec à lire :** 17 (parcours utilisateurs), 24 (qualité de code, tests, CI).

**Pré-requis :** Phases 0 à 8 terminées.

**Prompt suggéré :**
> « En te basant sur les sections 17 et 24 du spec, écris des tests unitaires Vitest pour `filterProducts` et `getAvailabilityDisplay` (12.4), des tests de composants pour `CatalogPagination` (vérifier qu'elle ne se rend pas si une seule page) et `QuoteToggleButton`, et des tests Playwright couvrant le parcours 17.1 en entier (recherche → filtre → fiche produit → ajout devis → soumission → confirmation), en vérifiant qu'un appel réseau réel est déclenché vers `/api/quote-requests`. Intègre un audit `axe-core` automatisé dans les tests Playwright. Mets en place le pipeline CI de la section 24.5 (lint, `tsc`, tests, build, audit de sécurité des dépendances), bloquant sur la branche principale. »

**Critères de sortie :**
- [ ] Le pipeline CI est vert de bout en bout sur une branche de test.
- [ ] Faire échouer volontairement un test (ex. casser temporairement `filterProducts`) bloque bien la fusion — validation que la CI est réellement contraignante, pas seulement informative.
- [ ] Le parcours 17.1 est couvert par au moins un test Playwright de bout en bout.

---

### Phase 10 — Recette finale & déploiement

**Objectif :** dernière vérification exhaustive avant mise en production, puis mise en ligne.

**Sections du spec à lire :** 26 (Definition of Done complète), 21 (sécurité).

**Pré-requis :** toutes les informations réelles de la section 1 de ce guide doivent être en place (plus de `TODO` restant) ; nom de domaine et accès de déploiement disponibles.

**Prompt suggéré :**
> « Parcours intégralement la checklist de la section 26 du spec, point par point, et rapporte l'état de chaque case (conforme / non conforme / non applicable) avec, pour chaque non-conformité, une proposition de correction. Vérifie qu'aucun `TODO` ou valeur placeholder ne subsiste dans `site-config.ts` ni ailleurs. Prépare la configuration de déploiement (variables d'environnement de production, en-têtes de sécurité de la section 21.2). »

**Critères de sortie :**
- [ ] 100% des cases de la section 26 du spec cochées « conforme » (ou justifiées « non applicable » explicitement).
- [ ] `grep` global du dépôt ne remonte plus aucun `TODO` lié à une donnée de contact/identité.
- [ ] Variables d'environnement de production configurées (`.env` réel, jamais commité), conformes à `.env.example`.
- [ ] En-têtes de sécurité HTTP vérifiés en production (CSP, `X-Content-Type-Options`, etc. — section 21.2).
- [ ] Test de bout en bout effectué directement en production (ou en pré-production identique) : soumission réelle d'une demande de devis reçue sur la messagerie de l'équipe commerciale.

**Après cette phase, le site est en production.** Toute évolution ultérieure repasse par le cycle : lire le spec → scoper un prompt → vérifier → committer, et toute décision qui modifie une règle du spec donne lieu à une nouvelle entrée ADR (section 27 du spec).

---

## 4. Pièges transverses à surveiller à chaque phase

Ces anti-patterns sont à l'origine des défauts les plus critiques du prototype initial. Gardez cette liste sous les yeux à chaque revue de code, quelle que soit la phase :

| Anti-pattern | Comment le détecter | Section du spec concernée |
|---|---|---|
| Élément visuellement cliquable sans action réelle | Cliquer sur chaque bouton/lien/filtre de la page livrée et vérifier un effet concret | 16.1 |
| Donnée statique masquant une donnée dynamique existante | `grep` de valeurs suspectes (« Disponible », « 3 ans ») codées en dur dans un composant | 12.1, ADR-005 |
| Formulaire qui affiche un succès sans transmission réelle | Vérifier l'onglet Réseau du navigateur lors de la soumission | 22, ADR-006 |
| `<div onClick>` au lieu d'un élément sémantique | Navigation clavier complète (Tab uniquement, sans souris) | 18.3 |
| Donnée de contact recopiée hors de `site-config.ts` | `grep -rn "+237\|@hardwarecentral" src/` doit ne remonter que `site-config.ts` | 10.4 |
| Persistance annoncée mais non implémentée | Rafraîchir la page (F5) après chaque action utilisateur qui devrait persister | 16.4, 16.5, ADR-008 |
| Lien menant intentionnellement à la 404 | Vérifier chaque lien de footer/navigation un par un | 25.4, ADR-011 |
| Logique dupliquée entre deux composants similaires | Rechercher deux implémentations d'une même fonctionnalité (ex. filtrage) | 9.2, ADR-007 |
| Contraste de couleur insuffisant | Vérifier chaque nouvelle paire texte/fond contre la table 14.3 | 14.3, 18.6 |
| Catégorie/marque affichée sans produit réel | Vérifier `isActive` calculé, pas codé en dur | 3.4, 3.5, 16.7 |
| Script d'ingestion qui écrit directement en production | Vérifier que `products.ts` n'est modifié que par un commit humain, jamais par une exécution automatique du script | 6.5.1, ADR-022 |
| `MediaAsset` sans provenance complète ou avec un `sourceProvider` incohérent (ex. `icecat` sur une image) | Inspecter chaque entrée `provenance` — `amazon-scraper` réservé aux images, `icecat` réservé aux datasheets | 6.5.9 |

---

## 5. Suivi d'avancement

Créez `docs/PROGRESS.md` dès la Phase 0 et tenez-le à jour après chaque phase validée. Gabarit :

```markdown
# Suivi d'avancement — HardwareCentral

| Phase | Statut | Date | Commit | Notes |
|---|---|---|---|---|
| 0 — Initialisation | ☐ À faire / ☐ En cours / ☐ Fait | | | |
| 1 — Modèle de données | | | | |
| 2 — Composants UI | | | | |
| 3 — Layout global | | | | |
| 4 — Catalogue & fiche produit | | | | |
| 5 — Devis / favoris / formulaires | | | | |
| 6 — Pages institutionnelles | | | | |
| 7 — SEO technique | | | | |
| 8 — Accessibilité & Performance | | | | |
| 9 — Tests & CI | | | | |
| 10 — Recette finale & déploiement | | | | |

## Informations réelles encore en attente (section 1 du guide)
- [ ] Téléphone / WhatsApp réel
- [ ] Adresse légale complète
- [ ] Raison sociale + immatriculation (RCCM/NIU)
- [ ] Clé API Amazon Scraper API (+ validation juridique préalable)
- [ ] Compte Icecat (datasheets)
- [ ] Bucket Cloudflare R2 (ou équivalent S3)
- [ ] Produits sans image après pipeline + repli (liste : ...)
- [ ] Produits sans datasheet après pipeline + repli (liste : ...)
- [ ] Clé API Brevo (transactionnel + newsletter)
```

Ce fichier sert de point de synchronisation entre vous et l'agent : commencez chaque nouvelle session par « Lis `docs/PROGRESS.md`, nous en sommes à la Phase X ».

---

## 6. Aide-mémoire des commandes de vérification

À exécuter à la fin de chaque phase, avant de committer :

```bash
# Qualité de code
npm run build          # doit réussir sans erreur
npx tsc --noEmit        # 0 erreur de typage
npm run lint            # ESLint + jsx-a11y, 0 erreur

# Tests
npm run test            # Vitest (unitaires + composants)
npx playwright test     # end-to-end (à partir de la Phase 9)

# Recherche de régressions connues (à adapter selon l'avancement)
grep -rn "+237\|@hardwarecentral\.com" src/components/     # doit être vide (tout vient de site-config.ts)
grep -rn "onClick" src/components/ | grep "<div"            # doit être vide (aucun div cliquable)
grep -rn "TODO" src/lib/site-config.ts                       # doit être vide avant la Phase 10

# Audit qualité (Phase 8+)
npx lighthouse http://localhost:3000 --view
npx playwright test --grep "@axe"
```

---

## 7. Note de clôture

Ce guide et le `HARDWARECENTRAL_AGENT_SPEC.md` forment ensemble un cycle complet : le spec définit **le quoi et le pourquoi**, ce guide définit **le comment et le quand**. Toute nouvelle fonctionnalité future doit suivre le même cycle — relire les sections concernées du spec, scoper un prompt, vérifier contre des critères de sortie explicites, committer, mettre à jour `PROGRESS.md`. C'est cette discipline d'exécution incrémentale et vérifiée, plutôt que la qualité du prompt initial à elle seule, qui évite de reproduire les défauts identifiés dans l'audit du prototype d'origine.

**Fin du guide.**
