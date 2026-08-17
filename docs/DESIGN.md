# DESIGN.md — Système de design HardwareCentral

**Document compagnon de :** `HARDWARECENTRAL_AGENT_SPEC.md` (v1.2.0) — extrait consolidé et reformaté des sections 10, 11, 12.4, 14, 15, 16 et 18.
**Destiné à :** agents IA de développement travaillant sur ce dépôt, en particulier **OpenCode**.
**Statut :** ce document est une **synthèse actionnable**, pas une nouvelle source de vérité. En cas de doute, d'ambiguïté ou de conflit apparent avec ce fichier, `HARDWARECENTRAL_AGENT_SPEC.md` prévaut toujours — voir sa règle 0.2.
**Ne couvre pas :** architecture système, modèle de données complet, stack backend, règles métier RFQ, SEO, sécurité, tests. Pour cela → `HARDWARECENTRAL_AGENT_SPEC.md`. Pour la structure écran par écran → `HARDWARECENTRAL_WIREFRAMES.md` (transcription agent-friendly ; `HARDWARECENTRAL_WIREFRAMES.html` reste la référence visuelle canonique si un rendu exact est nécessaire). Pour l'ordre d'exécution en phases → `HARDWARECENTRAL_IMPLEMENTATION_GUIDE.md`.

> **État du projet au moment de la rédaction : Phase 10 — Recette finale & déploiement.**
> Les phases 0 à 9 (fondations, pipeline d'ingestion, composants UI, layout, catalogue/fiche produit, devis/favoris/formulaires, pages institutionnelles, SEO, accessibilité/performance, tests/CI) sont considérées **déjà construites**. Ce document ne sert donc plus principalement à *guider* la construction de composants encore inexistants, mais à :
> 1. **Auditer** l'implémentation existante contre chaque règle (c'est l'usage prioritaire immédiat — voir section 17, ajoutée pour cette phase) ;
> 2. **Documenter durablement** le système de design pour toute évolution post-lancement (V2/V3, corrections, nouvelles pages) une fois le site en production.
>
> Conséquence directe : toute occurrence ci-dessous d'un placeholder (téléphone, adresse, e-mail) doit, à ce stade, **déjà avoir été remplacée par une donnée réelle** dans `site-config.ts` — le pré-requis d'entrée de la Phase 10 est justement « plus de `TODO` restant ». Si ce document est utilisé pour construire un composant qui n'existe pas encore, il reste valable en l'état.

---

## 0. Comment charger ce document dans OpenCode

Garder `AGENTS.md` court (même principe que le `CLAUDE.md` décrit dans le guide d'implémentation, section 2.2) : il ne doit pas dupliquer ce fichier, seulement pointer dessus.

**Option recommandée** — déclarer ce fichier comme instruction persistante via `opencode.json`, pour qu'il soit injecté automatiquement dans le contexte sans avoir à le référencer manuellement à chaque session (OpenCode ne suit pas automatiquement les liens Markdown internes à `AGENTS.md`, d'où l'usage du champ `instructions`) :

```json
{
  "$schema": "https://opencode.ai/config.json",
  "instructions": [
    "docs/HARDWARECENTRAL_AGENT_SPEC.md",
    "docs/HARDWARECENTRAL_IMPLEMENTATION_GUIDE.md",
    "docs/DESIGN.md",
    "docs/HARDWARECENTRAL_WIREFRAMES.md"
  ]
}
```

**Dans `AGENTS.md`**, ajouter un rappel court :

```markdown
Avant toute tâche touchant à l'UI, un composant, une couleur, une police ou un
espacement : relis docs/DESIGN.md (tokens + bibliothèque de composants) et
docs/HARDWARECENTRAL_WIREFRAMES.md (structure de l'écran concerné, ancre
#screen-N). N'improvise jamais un token ou un pattern hors de ces deux fichiers.
```

Charger ce document **avant** toute action sur `src/components/`, `src/app/**/page.tsx`, `globals.css`, ou toute classe Tailwind — pas seulement au début d'une session longue.

**Vu l'état d'avancement (Phase 10, voir encart ci-dessus)**, la première utilisation attendue de ce document n'est pas la construction mais **l'audit** (section 17). Prompt de départ suggéré pour OpenCode :
> « Lis `docs/DESIGN.md` intégralement, puis audite le code existant de `src/components/` et `src/lib/site-config.ts` contre chaque règle des sections 2 à 15. Rapporte chaque écart trouvé (fichier, ligne, règle violée), sans corriger automatiquement — j'arbitrerai avant correction. »

---

## 1. Les 5 règles non négociables

1. **Priorité au spec maître.** En cas de conflit entre ce fichier et `HARDWARECENTRAL_AGENT_SPEC.md`, ce dernier fait autorité.
2. **Zéro donnée de contact codée en dur.** Téléphone, e-mail, adresse, horaires : uniquement via `SITE_CONFIG` (section 2).
3. **Zéro fausse affordance.** Tout élément qui a l'air cliquable (curseur pointer, couleur de lien, effet hover) DOIT déclencher une action réelle. Test systématique : « si je clique ici, que se passe-t-il concrètement ? » — « rien » est un défaut bloquant.
4. **Zéro donnée statique masquant une donnée dynamique.** Statut de disponibilité, garantie, badge : toujours dérivés du modèle `Product`, jamais câblés dans un composant.
5. **Complétude avant esthétique.** Un composant visuellement soigné mais dont un état (erreur, vide, chargement) est manquant n'est pas terminé.

Ces règles corrigent des défauts réels et documentés du prototype initial (voir le journal des décisions, section 27 du spec maître) — elles ne sont pas des préférences stylistiques.

---

## 2. Identité de marque — Single Source of Truth

**Règle non négociable :** toute donnée ci-dessous vit **une seule fois** dans `src/lib/site-config.ts`, typée, importée partout où nécessaire. Interdiction absolue de recopier une chaîne contenant un numéro de téléphone, un e-mail, une adresse ou un horaire dans un composant.

> **Check Phase 10 :** les valeurs ci-dessous sont celles du spec original (placeholders structurels). À ce stade du projet, `site-config.ts` doit contenir les **valeurs réelles** — c'est un pré-requis d'entrée de la Phase 10 (section 1 du guide d'implémentation). Ne pas re-livrer ces placeholders tels quels ; vérifier plutôt qu'aucun ne subsiste (`grep -n "6XX\|XXX XXX" src/lib/site-config.ts` doit être vide).

| Champ | Valeur figée V1 (spec original) |
|---|---|
| Raison sociale | HardwareCentral |
| Pays / ville du siège | Cameroun / Douala |
| Adresse | Douala, Bonamoussadi |
| Téléphone principal | `+237 677550082` (placeholder — un seul numéro, utilisé partout) |
| WhatsApp Business | même numéro que le téléphone principal|
| E-mail commercial (devis) | `contact@hardwarecentral.com` |
| E-mail général (contact) | `contact@hardwarecentral.com` |
| Devise | XAF |
| Locale | `fr-CM` |

**Horaires — deux régimes à ne jamais confondre :**
- **Horaires commerciaux standards** (par défaut partout) : Lun–Ven, 8h–18h WAT.
- **Support 24/7** : réservé aux clients sous contrat SLA. Ne **jamais** afficher « 24/7 » comme horaire général tant qu'aucun portail client n'existe (V1). Formulation honnête si mentionné : « Support technique dédié pour nos clients sous contrat ».

```ts
// src/lib/site-config.ts
export const SITE_CONFIG = {
  companyName: 'HardwareCentral',
  legalCountry: 'Cameroun',
  headquartersCity: 'Douala',
  address: { line1: 'Douala, Bonamoussadi', city: 'Douala', country: 'Cameroun' },
  phone: { display: '+237 677550082', e164: '+237677550082' },
  whatsapp: {
    numberE164: '237677550082', // sans "+", format attendu par wa.me
    defaultMessage: "Bonjour HardwareCentral, je souhaite avoir plus d'informations sur vos équipements et solutions d'infrastructure.",
  },
  email: { contact: 'contact@hardwarecentral.com', general: 'contact@hardwarecentral.com' },
  businessHours: { display: 'Lun–Ven, 8h–18h', timezone: "WAT" },
  currency: 'XAF',
  locale: 'fr-CM',
} as const;
```

Un composant nécessitant une de ces informations DOIT faire `import { SITE_CONFIG } from '@/lib/site-config'`. Toute chaîne littérale ressemblant à un téléphone (`/\+?\d[\d\s]{7,}/`) ou un e-mail codée ailleurs est un défaut à rejeter en revue de code.

Le référentiel des marques (`src/lib/data/brands.ts`, voir section 12 ci-dessous) suit le même principe : source unique consommée par la grille de marques de l'accueil, le méga-menu, la page Marques et les filtres catalogue.

---

## 3. Langue

- V1 est **mono-langue français, sans exception** — y compris les métadonnées techniques.
- `<html lang="fr">` obligatoire sur le layout racine.
- `<title>` par défaut = valeur de marque réelle, jamais un texte de scaffolding.
- Toute micro-copie (horaires, copyright, placeholders de formulaire) en français : « Tous droits réservés », pas « All rights reserved ».
- Pas de bibliothèque i18n en V1 (pas de `next-intl`) — mais ne jamais coder de logique dépendante du texte français (`if (label === 'Disponible')` interdit ; utiliser des valeurs typées comme `badge.type: 'available'`, réserver le français à l'affichage).
- Formats régionaux : dates `JJ/MM/AAAA` ou en toutes lettres (jamais `MM/DD/YYYY`) ; séparateur de milliers = espace insécable (`1 250 000 FCFA`) ; téléphones au format international camerounais.

---

## 4. Palette de couleurs

Base conservée du prototype initial (jugée solide à l'audit), complétée avec les états manquants et corrigée là où des paires ne respectaient pas WCAG AA.

```css
@theme {
  --font-sans: "IBM Plex Sans", ui-sans-serif, system-ui, sans-serif;
  --font-display: "Manrope", sans-serif;
  --font-mono: "IBM Plex Mono", monospace;

  --color-graphite-50:  #F1EFE8;
  --color-graphite-100: #D3D1C7;
  --color-graphite-200: #B4B2A9;
  --color-graphite-400: #888780;
  --color-graphite-600: #5F5E5A;
  --color-graphite-800: #444441;
  --color-graphite-900: #2C2C2A;

  --color-teal-50:  #E1F5EE;
  --color-teal-100: #9FE1CB;
  --color-teal-200: #5DCAA5;
  --color-teal-400: #1D9E75;
  --color-teal-600: #0F6E56;
  --color-teal-800: #085041;
  --color-teal-900: #04342C;

  --color-success-bg:     #EAF3DE;
  --color-success-border: #C0DD97;
  --color-success-text:   #27500A;

  --color-warning-bg:     #FAEEDA;
  --color-warning-border: #FAC775;
  --color-warning-text:   #633806;

  --color-danger-bg:     #FCEBEB;
  --color-danger-border: #F7C1C1;
  --color-danger-text:   #791F1F;

  --color-on-order-bg:     #FFF8E7;
  --color-on-order-border: #F2E3BD;
  --color-on-order-text:   #B45309;

  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
}
```

### Table des paires texte/fond validées WCAG 2.2 AA (à utiliser exclusivement)

| Texte | Fond | Usage | Ratio |
|---|---|---|---|
| `graphite-900` | `white` / `graphite-50` | Texte courant sur fond clair | ~13:1 |
| `graphite-600` | `white` / `graphite-50` | Texte secondaire sur fond clair | ~5.9:1 |
| `white` | `graphite-900` | Texte sur fond sombre (header, footer, hero) | ~13:1 |
| `teal-200` | `graphite-900` | Accents/labels **sur fond sombre uniquement** | ~8:1 |
| `white` | `teal-600` | Texte sur bouton primaire | ~5.4:1 |
| `teal-600` | `white` / `teal-50` | Liens et texte d'accent sur fond clair | ~5.9:1 |
| `success-text` | `success-bg` | Badges de statut positif | conforme |
| `warning-text` | `warning-bg` | Badges de statut d'alerte | conforme |
| `danger-text` | `danger-bg` | Badges négatifs, erreurs | conforme |
| `on-order-text` | `on-order-bg` | Badges « Sur commande » | conforme (~4.7:1) |

**Trois corrections impératives, jamais à réintroduire :**
- `teal-200` **interdit** comme texte sur fond clair (ratio ≈ 2:1) — réservé au fond sombre.
- Survol de lien texte sur fond clair → `teal-800`, **jamais** `teal-400` (ratio ≈ 3.4:1, insuffisant).
- Anneaux de focus (`focus:ring-*`) → `teal-600`/`teal-800` sur fond clair ; `teal-200` uniquement acceptable sur fond sombre (header, modale à fond `graphite-900`).

Toute combinaison hors de cette table doit être vérifiée manuellement (4.5:1 texte courant, 3:1 texte large ≥24px ou ≥18.66px gras, 3:1 composants d'interface/icônes significatives) avant usage.

---

## 5. Typographie

| Rôle | Police | Graisses | Usage |
|---|---|---|---|
| Titres (`h1`–`h4`, `.font-display`) | Manrope | 700, 800 | Titres de section/page |
| Corps de texte | IBM Plex Sans | 400, 500, 600 | Paragraphes, libellés, boutons |
| Données techniques | IBM Plex Mono | 400, 500, 600 | SKU, tableaux de specs, badges, horodatages |

| Rôle | Mobile | Desktop |
|---|---|---|
| H1 page | `text-3xl` (30px) | `text-5xl` (48px) |
| H2 section | `text-2xl` (24px) | `text-3xl` (30px) |
| H3 | `text-lg` (18px) | `text-xl` (20px) |
| Corps | `text-sm` (14px) | `text-base` (16px) |
| Légende / méta | `text-xs` (12px) | `text-xs` (12px) |

**Règle impérative :** jamais en dessous de `text-xs` (12px) pour du contenu informatif (proscrit : `text-[10px]`, présent dans le prototype initial sur certains libellés de formulaire).

---

## 6. Espacement, rayons, ombres

- Échelle d'espacement : exclusivement l'échelle Tailwind par défaut (multiples de 4px). Aucune valeur arbitraire (`p-[13px]` interdit).
- Rayons : `--radius-sm` (6px) éléments denses (badges, boutons secondaires, champs), `--radius-md` (8px) cartes, `--radius-lg` (12px) conteneurs de section/modales.
- Ombres : réservées aux éléments flottants/interactifs au survol (cartes produit, modales) — pas d'ombre sur du statique, pour préserver une hiérarchie visuelle claire.

---

## 7. Breakpoints (responsive)

| Nom | Largeur | Bascule |
|---|---|---|
| `sm` | 640px | Ajustements mineurs mobile large |
| `md` | 768px | Navigation desktop, grilles 2 colonnes |
| `lg` | 1024px | Desktop complet : sidebar filtres catalogue, grilles 3–4 col. |
| `xl` | 1280px | Grilles 4+ col., bloc téléphone visible dans le header |

**Règle impérative :** toute fonctionnalité disponible en desktop (navigation, recherche, devis, favoris) DOIT avoir un équivalent pleinement fonctionnel en mobile.

---

## 8. Mouvement & animation

- Librairie unique : `motion` (Framer Motion). Transitions de page : fondu + translation légère (`opacity` + `y: 10px`, 300ms).
- **Obligatoire :** hook `usePrefersReducedMotion()` consommé par tout composant animé — toute animation non essentielle doit être désactivée/réduite à une simple opacité quand `prefers-reduced-motion: reduce`.
- Spinners et squelettes de chargement sont exemptés (animations fonctionnelles, pas décoratives) mais doivent rester sobres.
- Aucun contenu clignotant plus de 3 fois/seconde ; tout carrousel/animation automatique future doit être pausable.

---

## 9. Iconographie

- Librairie unique : `lucide-react`. Jamais de mélange avec un autre jeu d'icônes.
- Tailles : `w-4 h-4` (16px) en contexte de texte courant, `w-5 h-5` (20px) icônes de navigation/action, `w-6 h-6` (24px) icônes de mise en avant (trust badges, À propos).
- Toute icône seule utilisée comme contrôle interactif → `aria-label` explicite en français.

---

## 10. Statuts de disponibilité (mapping figé, à ne jamais dupliquer)

| `status` | Libellé affiché | Token couleur |
|---|---|---|
| `available` | Disponible | `success` |
| `limited` | Stock limité | `warning` |
| `on-order` | Sur commande | `on-order` (ambre doux) |
| `discontinued` | Fin de commercialisation | `danger` |

Ce mapping vit dans **une fonction unique** `getAvailabilityDisplay(status)` (`lib/utils.ts`), importée à la fois par `ProductCard` et la fiche produit — garantit que le badge est identique partout pour un même produit. Ne jamais recréer ce mapping localement dans un composant.

---

## 11. Bibliothèque de composants

Chaque composant listé doit exister avec **tous** ses états applicables — aucune livraison partielle.

### `components/ui/` — primitifs

**`Button`** — Variantes : `primary` (fond `teal-600`, texte blanc), `secondary` (bordure `graphite-200`, texte `graphite-900`), `ghost` (texte seul), `destructive` (fond `danger-text`, réservé aux suppressions). Tailles `sm/md/lg`. États obligatoires : `default`, `hover`, `focus-visible` (`ring-2 ring-teal-600 ring-offset-2` sur fond clair / `ring-teal-200` sur fond sombre), `active` (`scale-95`), `disabled` (opacité réduite + `cursor-not-allowed` + attribut HTML `disabled`, jamais couleur seule), `loading` (spinner inline, bouton désactivé). Toujours un `<button>` ou `<a>` natif — jamais `<div onClick>`.

**`Input` / `Textarea` / `Select`** — `<label>` toujours associé via `htmlFor`/`id`. États : `default`, `hover`, `focus` (bordure `teal-600`), `disabled`, `error` (bordure `danger-border` + texte lié via `aria-describedby`), `valid` (discret). `Select` : jamais livré avec une seule option réellement sélectionnable — si une seule option existe, ce n'est pas un `Select` mais du texte statique.

**`Badge`** — Variantes `success/warning/danger/neutral/on-order` (voir section 10). Toujours dérivé d'une donnée réelle (`availability.status`), jamais une valeur statique câblée dans le parent.

**`Modal`** — Piège de focus, fermeture `Échap` + clic overlay, restitution du focus au déclencheur à la fermeture, `role="dialog"` + `aria-modal="true"` + `aria-labelledby`. États internes : `idle`, `submitting`, `success`, `error`.

**`Toast`** — Confirmation d'action rapide non bloquante (ex. « Produit ajouté au devis »). Région `aria-live="polite"`. Disparition automatique après 4s **et** fermeture manuelle (bouton croix) — jamais uniquement automatique.

### `components/layout/`

**`Header`** — Logo = vrai `<Link href="/">`. Recherche = `<form role="search">` avec `<label>` (peut être `sr-only`, jamais absente du DOM), soumission `Enter` + bouton visible. Badge du nombre d'articles en liste de devis, mis à jour en temps réel depuis le store Zustand. CTA permanent « Demander un devis » visible (desktop). Téléphone = lien `tel:` depuis `SITE_CONFIG`.

**`MegaMenu`** — Ouverture au survol **et** au clic/`Enter`. `aria-haspopup="true"`, `aria-expanded` synchronisé, panneau `role="menu"`/items `role="menuitem"`. `Tab` parcourt les items, `Échap` referme et rend le focus.

**`MobileNav`** — Sous 1024px : hamburger → panneau plein écran/tiroir listant toutes les catégories actives, Marques, Devis, Favoris, Contact. Réplique 100% des capacités desktop. Fermeture automatique après sélection, piège de focus actif.

**`Breadcrumb`** — Chaque segment = vrai `<Link>`, sauf le dernier (`aria-current="page"`, non cliquable visuellement distinct). Balisage : `<nav aria-label="Fil d'Ariane"><ol>…</ol></nav>`.

**`WhatsAppBubble`** — Bouton flottant persistant, lien `https://wa.me/{SITE_CONFIG.whatsapp.numberE164}?text=...`, `target="_blank" rel="noopener noreferrer"`, `aria-label` explicite. Masqué/repositionné quand la `Modal` de devis est ouverte (évite le conflit z-index/focus).

**`Footer`** — Coordonnées exclusivement issues de `SITE_CONFIG`. **Interdiction formelle** de faire pointer un lien de footer vers la 404 comme solution temporaire — une page non prête n'apparaît simplement pas dans le footer, ou affiche un état « Page en préparation » honnête.

### `components/product/`

**`ProductCard`** — Racine = `<Link href="/produit/[slug]">` englobante (pas de `<div onClick>`), actions secondaires en `<button>` internes avec `preventDefault()`/`stopPropagation()`. Format **compact** (densité B2B) : padding `p-3`, image `aspect-square` avec `p-3`, grille 4 colonnes en `xl` ; **12 produits par page** sur `/catalogue` et `/recherche` (multiple du nombre de colonnes, pages entièrement remplies). Structure catalogue B2B (réf. style sysllc, adaptée aux tokens) : ligne haute = badge de disponibilité + favori ; image détourée (ratio 1:1, zoom subtil au survol) ; puis marque en surligne capitales espacées + « SKU: » mis en avant sur la même ligne ; titre complet du produit (`name`, marque incluse, `line-clamp-2`) ; spécifications en puces techniques (chips avec icône de catégorie, `specs` jamais `attributes`) ; CTA « Ajouter au devis » pleine largeur en bas de carte (via `QuoteToggleButton`). Fond blanc pur sans boîte intérieure ; liseré `border-border` + ombre douce au repos.

**`ProductImage`** — Image `next/image` avec détourage transparent via ImageKit `e-bgremove` (fond supprimé à la volée, padding transparent, `object-contain`) : le produit flotte sur la surface sans encadré de fond. Placeholder de chargement blanc. Transformation IA native ImageKit (coût faible) ; dégradation gracieuse vers l'image source si le quota est épuisé.

**`QuotePanel`** — Bloc de conversion de la fiche produit (colonne droite) : sélecteur de quantité `[−] n [+]` (logique réelle persistée dans le store devis, borné 1–999) + `QuoteToggleButton` `lg` + ligne de réassurance compacte sous le bouton (`border-t` fin, deux items Livraison / Devis). Si l'article est déjà dans la liste, le sélecteur modifie la quantité enregistrée en temps réel.

**`QuoteToggleButton`** — États `idle` (« Ajouter au devis ») / `added` (« Ajouté ✓ », clic devient « Retirer »). Prop optionnelle `quantity` (défaut 1) enregistrée à l'ajout. Déclenche un `Toast` à l'ajout. Partagé entre `ProductCard`, `QuotePanel` (fiche produit) et les favoris.

**`ProductGallery`** — Image principale détourée en ratio carré occupant l'essentiel du cadre (padding léger `p-3`) + vignettes `<button>` avec `aria-label` (« Voir l'image {n} de {nom} ») et `aria-pressed`/`aria-current` pour l'image active. Bouton zoom / HD (loupe, coin haut droit) : lightbox `Modal` réelle (piège de focus, `Échap`, clic overlay, image pleine résolution) — jamais décoratif.

**`ProductSpecsTable`** — `<table>` sémantique avec `<th scope="row">`, pas une grille de `<div>`.

**`ProductAvailabilityBadge`** — Reçoit uniquement `availability: ProductAvailability` en prop, applique le mapping de la section 10. Ne doit **jamais** accepter un libellé/couleur en props directement.

### `components/catalog/`

**`CatalogFilters`** — Cases à cocher (marque), sélection unique (catégorie), filtre « Format châssis » utilisant exclusivement `attributes.chassisFormat` (jamais `specs`). Chaque filtre actif reflété dans l'URL (`searchParams`). Bouton « Effacer tout » visible seulement si un filtre est actif.

**`CatalogSort`** — Ordre par défaut **mélange déterministe par marque** (round-robin, pas de blocs « marque après marque », stable SSR/pagination). Options réelles sans référence au prix : `Mélange de marques`, `Nouveautés`, `Nom (A→Z)`, `Disponibilité`. Minimum 2 options fonctionnelles — jamais un tri à option unique.

**`CatalogPagination`** — Calculée dynamiquement (`Math.ceil(totalResults / pageSize)`). Ne **jamais** afficher un numéro de page au-delà du nombre réel. **Non rendue du tout** si `totalResults <= pageSize`. Numéro de page synchronisé avec `?page=`.

**`EmptyState`** — Générique, réutilisé pour : aucun résultat filtre/recherche, aucun produit de marque, aucun favori, liste de devis vide. Props `variant`, `title`, `description`, `action`.

### `components/forms/`

**`QuoteRequestForm`** — Champs : nom complet\*, société, e-mail pro\*, téléphone, message\*, liste de produits pré-remplie (retrait possible, quantité `× n` affichée). Payload réel `items: { productId, quantity }[]`. Invocable depuis header, fiche produit, page `/devis`. États `idle/submitting/success/error`. Soumission réelle vers `POST /api/quote-requests` — **interdiction absolue** de simuler avec un `setTimeout` sans appel réseau réel.

**`ContactForm`** — Mêmes exigences de soumission réelle. Champ « Sujet » avec options réellement différenciées (« Demande de devis » route vers la même logique que `QuoteRequestForm` ou, a minima, le même e-mail `contact@`).

**`NewsletterForm`** — Soumission réelle vers le fournisseur d'e-mailing, jamais un simple `preventDefault()` sans action.

---

## 12. Référentiels actifs consommés par les composants de design

Ces listes alimentent `MegaMenu`, `CategoryGrid`, `BrandsGrid`, `CatalogFilters` et la page Marques. **Une catégorie/marque n'apparaît en navigation que si elle contient au moins un produit publié.**

**Marques actives V1 :** HPE, Dell Technologies, Cisco, Fortinet, Huawei, Hikvision.
**Marque « en préparation » (roadmap) :** Lenovo — non affichée comme active tant qu'aucun produit n'est catalogué ; si mentionnée, badge explicite « Bientôt disponible » obligatoire (voir 13.7 ci-dessous).

**Catégories actives V1 :** Serveurs & Stockage, Réseau, Sécurité & Pare-feu, Vidéosurveillance, Ordinateurs & Stations de travail.
**Catégories roadmap (ne pas afficher dans la navigation principale) :** Datacenter, Wi-Fi & Sans-fil, Écrans, Imprimantes.

---

## 13. Règles UX transverses

**13.1 — Aucune fausse affordance (principe directeur).** Voir règle 3 de la section 1.

**13.2 — Navigation mobile.** Sous 1024px, bascule automatique vers `MobileNav`. Toutes les actions desktop (recherche, devis, favoris, contact) restent accessibles. Cible tactile minimale **44×44px** pour tout élément interactif.

**13.3 — Recherche.** Un seul moteur (`filterProducts`), utilisé identiquement par `/catalogue?q=` et `/recherche`. Porte sur : nom, SKU, marque, description courte. Retour immédiat et permanent (« {n} produit(s) trouvé(s) »), jamais un texte flottant temporaire déconnecté du résultat réel.

**13.4 — Liste de devis.** Ajout depuis `ProductCard`/fiche produit → store Zustand persistant (`localStorage`) → `Toast` de confirmation + compteur header mis à jour de façon optimiste, sans rechargement. Page `/devis` : liste, retrait possible, CTA « Demander un devis pour ces {n} articles ». Après soumission réussie, liste vidée automatiquement + confirmation du délai de réponse (cohérent avec section 2).

**13.5 — Favoris.** Indépendant de la liste de devis. Persistance **réelle** via store Zustand dédié — jamais `useState` volatile. Aucune mention d'un « compte professionnel » à créer tant que cette fonctionnalité n'existe pas réellement.

**13.6 — États de chargement/succès/erreur.** Tout composant asynchrone gère explicitement `idle/loading/success/error`. Un état `loading` ne doit jamais durer plus longtemps que le traitement réel — pas de délai artificiel pour « simuler » un travail.

**13.7 — Affichage honnête des catégories/marques sans produit.** Si mentionnée par anticipation, une catégorie/marque porte un badge explicite « Bientôt disponible » et n'est jamais cliquable vers une page vide sans contexte. Ne doit jamais apparaître dans les filtres actifs tant qu'aucun produit n'y est rattaché.

**13.8 — Cohérence des CTA.** Toutes les actions principales (« Demander un devis », « Ajouter au devis », « Découvrir le catalogue ») utilisent strictement la même variante `primary` du `Button`. Un seul niveau de CTA primaire visible par section à la fois.

---

## 14. Accessibilité (WCAG 2.2 niveau AA) — non négociable, pas une passe a posteriori

- **Langue/structure** : `lang="fr"` sur le layout racine. Un seul `<h1>` par page, hiérarchie sans saut de niveau. Landmarks sémantiques (`<header>`, `<nav>`, `<main>` unique, `<footer>`, `<aside>`). Lien d'évitement (« Aller au contenu principal ») en premier élément focusable.
- **Clavier** : tout élément déclenchant une action = `<button>`, `<a href>`, ou `role` + `tabindex="0"` + `onKeyDown` (Entrée/Espace) s'il ne peut pas être natif. Ordre de tabulation cohérent avec l'ordre visuel. `:focus-visible` sur 100% des éléments interactifs, contraste conforme — jamais `outline: none` sans remplacement.
- **Formulaires** : `label`/`input` liés via `htmlFor`/`id`. Champs requis marqués visuellement (`*`) **et** `aria-required="true"`. Erreurs liées via `aria-describedby`, annoncées via `aria-live="polite"`. Jamais d'information portée uniquement par la couleur.
- **Contenu non textuel** : `alt` descriptif et spécifique par image produit (jamais le nom brut répété mécaniquement sur plusieurs vignettes). Images décoratives : `alt=""` ou `background-image` CSS. Icône seule utilisée comme contrôle → `aria-label` en français.
- **Contraste** : voir table section 4, exclusivement.
- **Menus complexes** : voir `MegaMenu`/`Modal` en section 11.
- **Cible tactile** : 44×44px minimum, y compris boutons de fermeture, vignettes de galerie, cases de filtre.
- **Mouvement** : voir section 8.
- **Tests obligatoires avant livraison** : navigation clavier complète (Tab/Shift+Tab/Entrée/Échap), test lecteur d'écran (NVDA ou VoiceOver, spot-check sur les parcours critiques), audit `axe-core` sans violation `critical`/`serious`.

---

## 15. Checklist de non-régression design — avant de déclarer un composant/écran terminé

- [ ] Chaque élément visuellement cliquable déclenche une action réelle et complète.
- [ ] Chaque formulaire soumet réellement vers un endpoint `/api/*` et gère les 4 états.
- [ ] Chaque tri/filtre a au moins 2 options réellement différenciantes, ou n'est pas affiché.
- [ ] La pagination n'apparaît que s'il existe réellement plusieurs pages.
- [ ] Aucun lien (footer, breadcrumb, nav) ne pointe vers une page non implémentée ou vers la 404.
- [ ] Chaque badge de statut est calculé depuis les données réelles du produit affiché.
- [ ] Liste de devis et favoris persistent réellement après rafraîchissement.
- [ ] Aucun texte d'interface ne référence une fonctionnalité inexistante (ex. compte utilisateur).
- [ ] Coordonnées entreprise exclusivement issues de `SITE_CONFIG` — recherche `grep` de chaînes suspectes faite.
- [ ] Liste de marques identique entre accueil, méga-menu, page Marques, filtres.
- [ ] Aucune catégorie/marque sans produit publié n'apparaît comme active.
- [ ] `lang="fr"`, aucun texte anglais résiduel.
- [ ] Navigation clavier testée manuellement sur le composant/écran livré.
- [ ] Tous les champs de formulaire ont un `label` associé.
- [ ] Contraste conforme sur tout nouveau texte/composant (table section 4).
- [ ] `Select`/dropdown : aucune instance à option unique.

---

## 16. Repères visuels — écrans de référence (`HARDWARECENTRAL_WIREFRAMES.md`)

Ce fichier fixe la structure/hiérarchie de chaque écran clé — pas le style visuel final (couleurs, typographie, espacement = ce document). Ouvrir l'ancre correspondante avant de construire une page. Le `.html` d'origine reste disponible pour un rendu visuel exact si besoin.

| # | Écran | Ancre | Route |
|---|---|---|---|
| 1 | Header + méga-menu | `#screen-1` | transverse |
| 2 | Navigation mobile | `#screen-2` | transverse |
| 3 | Accueil | `#screen-3` | `/` |
| 4 | Catalogue (desktop) | `#screen-4` | `/catalogue` |
| 5 | Catalogue (mobile) | `#screen-5` | `/catalogue` |
| 6 | Fiche produit | `#screen-6` | `/produit/[slug]` |
| 7 | Liste de devis & formulaire | `#screen-7` | `/devis` |
| 8 | Footer | `#screen-8` | transverse |
| 9 | Annuaire des marques | `#screen-9` | `/marques` |
| 10 | Fiche marque | `#screen-10` | `/marques/[brand]` |
| 11 | Résultats de recherche | `#screen-11` | `/recherche` |
| 12 | Favoris sauvegardés | `#screen-12` | `/favoris` |
| 13 | À propos | `#screen-13` | `/a-propos` |
| 14 | Contact | `#screen-14` | `/contact` |
| 15 | Pages légales | `#screen-15` | `/mentions-legales`, `/cgv`, `/confidentialite` |
| 16 | Page introuvable (404) | `#screen-16` | `/404` |
| — | États & composants transverses | `#etats-transverses` | tous |

---

## 17. Audit design — Phase 10 (recette finale)

Usage immédiat de ce document à ce stade du projet. Objectif : faire passer chaque case de la section 15 (checklist de non-régression) de « supposée conforme » à « vérifiée conforme », avant mise en production. Reprend et complète, côté design uniquement, la checklist section 26 du spec maître et les commandes de vérification de la section 6 du guide d'implémentation.

**17.1 — Commandes à exécuter sur le dépôt complet**

```bash
# Aucune donnée de contact hors site-config.ts
grep -rn "+237\|@hardwarecentral\.com" src/components/     # doit être vide

# Aucun placeholder résiduel dans la config
grep -n "6XX\|XXX XXX\|Placeholder\|TODO" src/lib/site-config.ts   # doit être vide

# Aucun <div onClick> (fausse affordance / défaut d'accessibilité)
grep -rn "onClick" src/components/ | grep "<div"            # doit être vide

# Aucune classe Tailwind hors tokens (couleur/espacement arbitraires)
grep -rn "bg-\[#\|text-\[#\|p-\[\|m-\[" src/components/ src/app/   # doit être vide, sauf justification documentée

# Combinaisons interdites de la table de contraste (section 4)
grep -rn "text-teal-200" src/components/ | grep -v "graphite-900\|dark"   # à examiner manuellement si non vide
grep -rn "hover:text-teal-400" src/components/                            # doit être vide (teal-800 attendu)
```

**17.2 — Vérifications manuelles ciblées design**

- [ ] Chaque paire texte/fond du dépôt correspond à la table de la section 4 — parcourir `components/ui/`, `components/product/`, `components/sections/` un par un.
- [ ] `Button`, `Input`/`Textarea`/`Select`, `Badge`, `Modal`, `Toast` implémentent bien **tous** les états listés en section 11 (pas seulement `default`/`hover`) — tester `disabled`, `error`, `loading` explicitement, pas seulement au survol.
- [ ] `MegaMenu` et `MobileNav` : navigation clavier complète (Tab/Entrée/Échap), sans souris, sur un poste de test dédié.
- [ ] `CatalogPagination` : confirmer qu'elle disparaît bien quand `totalResults <= pageSize` (pas seulement vide visuellement — absente du DOM).
- [ ] `CatalogSort` : confirmer au moins 2 options réellement fonctionnelles en conditions réelles (pas juste présentes dans le JSX).
- [ ] Liste de marques (accueil / méga-menu / page Marques / filtres catalogue) : comparer les 4 sources une par une, doivent être strictement identiques (référentiel unique, section 12).
- [ ] Aucune catégorie/marque roadmap (Datacenter, Wi-Fi, Écrans, Imprimantes, Lenovo) n'apparaît comme active dans la navigation livrée.
- [ ] `prefers-reduced-motion` activé au niveau système : les transitions de page se réduisent à un simple changement d'opacité (vérification manuelle, pas seulement lecture du code).
- [ ] Audit `axe-core` (section 14) sans violation `critical`/`serious` sur accueil, catalogue, fiche produit, devis, contact.
- [ ] Score Lighthouse Accessibilité ≥ 95 sur accueil et fiche produit (throttling mobile).

**17.3 — En cas d'écart trouvé**

Ne pas corriger silencieusement une règle de ce document pendant l'audit — consigner l'écart (fichier, ligne, règle violée, section concernée), puis traiter comme n'importe quelle autre correction de Phase 10 : un prompt scopé, une vérification, un commit séparé (`fix: ...`), en respectant la règle d'or du guide d'implémentation (section 0). Si l'écart révèle une règle de ce document elle-même incorrecte ou obsolète par rapport au spec maître, corriger `DESIGN.md` en conséquence et le signaler explicitement plutôt que de le laisser diverger silencieusement.

---

## Clôture

À ce stade (Phase 10), ce document sert d'abord de grille d'audit (section 17) pour la recette finale, puis — une fois le site en production — de référence permanente pour toute évolution (corrections, V2/V3, nouvelles pages) sans avoir à recharger l'intégralité du spec maître à chaque fois.

Il doit être mis à jour dès qu'une modification touche les sections 10, 11, 12.4, 14, 15, 16 ou 18 de `HARDWARECENTRAL_AGENT_SPEC.md` — une nouvelle entrée ADR côté spec maître doit se répercuter ici si elle change une règle de design. Ne jamais laisser ce fichier diverger silencieusement de sa source.

**Dérivé de HARDWARECENTRAL_AGENT_SPEC.md v1.2.0 — DESIGN.md v1.0.0, rédigé en Phase 10**
