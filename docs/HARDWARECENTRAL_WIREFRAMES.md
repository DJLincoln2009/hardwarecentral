# WIREFRAMES.md — Transcription structurelle des écrans HardwareCentral

**Dérivé de :** `HARDWARECENTRAL_WIREFRAMES.html` — transcription fidèle et complète, reformatée pour être lue efficacement par un agent (au lieu de div/CSS imbriqués).
**Document compagnon de :** `HARDWARECENTRAL_AGENT_SPEC.md` et `HARDWARECENTRAL_IMPLEMENTATION_GUIDE.md`. Fixe la **structure et la hiérarchie** de chaque écran — pas le design visuel final (couleurs, typographie, espacement exact → `DESIGN.md`, section 4-9).
**Statut :** en cas de divergence entre les deux fichiers, `HARDWARECENTRAL_WIREFRAMES.html` (rendu visuel) reste la référence canonique pour l'agencement exact des boîtes ; ce document est la référence pour la hiérarchie, les composants attendus et les règles métier attachées à chaque écran. Les deux devraient rester synchronisés — si l'un est corrigé, reporter le changement dans l'autre.
**Basse fidélité intentionnelle :** les descriptions de texte génériques (« texte », « description courte ») ne sont **pas** le contenu réel — celui-ci vient exclusivement du modèle de données (spec section 12). Les libellés entre guillemets (« Demander un devis », « Disponible »…) sont, eux, du texte d'interface fixe à reproduire tel quel.

---

## 0. Conventions de notation

| Notation | Signification |
|---|---|
| `[Composant · réf]` | Tag renvoyant au composant à construire et à la section du spec maître à implémenter |
| 🖼 | Emplacement d'image (photo réelle en production) |
| **Bouton :** "Label" | CTA / bouton, avec son libellé exact d'interface |
| ⚠️ CONDITIONNEL | Élément qui n'existe **dans le DOM** que sous une condition précise — la règle est donnée juste après |
| *Règle : …* | Contrainte métier/technique attachée au bloc qui précède |
| « texte » | Libellé d'interface fixe, à reproduire tel quel |
| (générique) | Contenu réel variable, non spécifié ici — vient du modèle de données |

---

## Sommaire

<a id="etats-transverses"></a>0. [États & composants transverses](#0-états--composants-transverses)
<a id="screen-1"></a>1. Header + méga-menu (desktop) — transverse
<a id="screen-2"></a>2. Navigation mobile — transverse
<a id="screen-3"></a>3. Accueil — `/`
<a id="screen-4"></a>4. Catalogue (desktop) — `/catalogue`
<a id="screen-5"></a>5. Catalogue (mobile) — `/catalogue`
<a id="screen-6"></a>6. Fiche produit — `/produit/[slug]`
<a id="screen-7"></a>7. Liste de devis & formulaire — `/devis`
<a id="screen-8"></a>8. Footer — transverse
<a id="screen-9"></a>9. Annuaire des marques — `/marques`
<a id="screen-10"></a>10. Fiche marque — `/marques/[brand]`
<a id="screen-11"></a>11. Résultats de recherche — `/recherche`
<a id="screen-12"></a>12. Favoris sauvegardés — `/favoris`
<a id="screen-13"></a>13. À propos — `/a-propos`
<a id="screen-14"></a>14. Contact — `/contact`
<a id="screen-15"></a>15. Pages légales — `/mentions-legales`, `/cgv`, `/confidentialite`
<a id="screen-16"></a>16. Page introuvable (404) — `not-found.tsx`

---

## 0. États & composants transverses

Ne sont **pas** redessinés sur chaque écran individuel pour éviter la répétition — mais s'appliquent identiquement partout où ils sont pertinents. Comportement non négociable, quel que soit l'écran hôte (règle 16.6/25 du spec).

**EmptyState** `[EmptyState · 15.4]`
- Icône (cercle) + ligne de titre + ligne de description + **Bouton ghost :** "Réinitialiser les filtres" (libellé variable selon contexte)
- *Règle : un seul composant générique, prop `variant` — réutilisé pour filtre catalogue vide, aucun résultat de recherche, marque sans produit, favoris vides, liste de devis vide. Titre/description/action changent selon le contexte, jamais un espace blanc silencieux.*

**Loading (squelette)** `[· 16.6]`
- Deux blocs squelette côte à côte (placeholders de contenu en cours de chargement)
- *Règle : états `idle → loading → success/error` obligatoires sur tout composant asynchrone. Durée = temps de traitement réel, **jamais** de délai artificiel ajouté pour « faire percevoir un travail ».*

**Erreur formulaire** `[· 25.1]`
- Zone teintée d'erreur : 2 lignes de message + **Bouton :** "Réessayer · WhatsApp direct"
- *Règle : message explicite et actionnable, jamais un échec silencieux ni une fausse confirmation de succès. Champs déjà saisis **jamais** réinitialisés après une erreur réseau.*

**WhatsAppBubble** `[· 15.2]`
- Bulle flottante 💬, tag « numéro réel SITE_CONFIG »
- *Règle : bouton flottant persistant sur **toutes les pages**, lien `wa.me/{numberE164}` réel avec message pré-rempli. Masqué le temps qu'une `Modal` (devis) est ouverte, pour éviter tout chevauchement.*

**Toast (confirmation)** `[· 15.1]`
- Icône ✓ + ligne de confirmation
- *Règle : déclenché après chaque action de confirmation réelle (ajout au devis, favoris, soumission de formulaire) — jamais affiché sans action réseau correspondante derrière.*

**Lien d'évitement** `[· 18.2]`
- Bloc texte « ↳ Aller au contenu principal »
- *Règle : premier élément focusable de `<body>` sur **toutes les pages** — invisible par défaut, visible uniquement au focus clavier.*

---

## 1. Header + méga-menu ouvert

**Route/contexte :** desktop ≥1024px · présent sur toutes les pages
**Règles clés :** logo = vrai `<Link>`, jamais un `<div onClick>` (18.3). Le méga-menu s'ouvre au clic ET au survol, opérable au clavier (15.2). Compteur de devis mis à jour en temps réel depuis le store Zustand (23.2).

- **Barre supérieure** `[Header · 15.2]`
  - Logo (zone dédiée, ~150×34)
  - Barre de recherche `[role=search]` — placeholder : « 🔍 Rechercher un produit, une marque, un SKU… »
  - Icône Favoris (♡)
  - Icône Devis `[quote-store · 23.2]` (🧾) — badge de compteur
  - **Bouton primaire :** "Demander un devis"
  - Téléphone (texte, cliquable `tel:`) : « 📞 +237 6XX XXX XXX »
- **Barre de navigation** — items : « Shop by category » (☰), Serveurs, Réseau, Sécurité, CCTV, Ordinateurs, Marques
- **Panneau méga-menu** `[MegaMenu · role=menu, aria-expanded]`
  - 3 colonnes ; chaque colonne = 1 titre de sous-catégorie (gras) + 3 liens enfants

---

## 2. Header mobile + tiroir de navigation ouvert

**Route/contexte :** mobile <1024px
**Règles clés :** **écran historiquement cassé dans le prototype initial** (menu hover-only, inopérant en mobile — voir ADR du spec). Le hamburger doit ouvrir un panneau plein écran répliquant 100% des capacités desktop (16.2), piège de focus actif tant qu'il est ouvert, fermeture automatique après sélection d'un lien.

- **Header mobile (fermé)**
  - Icône ☰ (`[MobileNav trigger · 15.2]`) — Logo — icône 🔍 — icône Devis 🧾
- **Tiroir ouvert** `[MobileNav · piège de focus actif]`
  - Icône fermeture ✕ + titre du tiroir
  - Recherche (dupliquée du header)
  - Liste de liens de catégories (5 items)
  - Bloc liens secondaires (À propos, Marques, Contact)
  - **Bouton :** "Demander un devis"

---

## 3. Accueil

**Route/contexte :** `/` · desktop · SSG (6.2)
**Règles clés :** ordre vertical fixe. `CategoryGrid` n'affiche que les catégories avec `isActive:true` (3.5) — ne jamais afficher de catégorie vide comme dans le prototype initial. `BrandsGrid` limité aux marques actives (3.4).

- Header (voir écran 1)
- **Hero** `[sections/Hero]` : titre + sous-titre + **Bouton :** "Découvrir le catalogue"
- **TrustBadges** — 4 items (icône + libellé de réassurance)
- **CategoryGrid** `[isActive uniquement · 3.5]` — 5 cartes (icône + libellé)
  - *Règle : 5 catégories actives visibles (server-storage, networking, security, cctv, laptop) — datacenter/wireless/monitor/printers restent masquées tant qu'elles n'ont aucun produit.*
- **FeaturedProducts** `[isFeatured · 12.2]` — titre « Produits récents » + lien « Voir tout → », 4× `ProductCard` (voir 15.3) sur une ligne : image 🖼 + badge de disponibilité (Disponible/Sur commande/Stock limité) + nom + libellé secondaire
- **BrandsGrid** `[marques actives · 3.4]` — 6 logos alignés
- **NewsletterForm** `[soumission réelle · 22.3]` — libellé + champ e-mail + **Bouton :** "S'inscrire"
- Footer (voir écran 8)

---

## 4. Catalogue (desktop)

**Route/contexte :** `/catalogue?categorie=&marque=&format=&tri=&page=` · desktop · SSR (6.2)
**Règles clés :** filtre « Format Châssis » lit `attributes.chassisFormat`, jamais `specs` (bug d'origine corrigé, 12.1). Chaque filtre actif est reflété dans l'URL. La pagination ne s'affiche que si `totalResults > pageSize` — sinon le bloc entier est absent, pas juste vide.

- **Breadcrumb** `[tous liens réellement cliquables · 15.2]` — « Accueil › Catalogue complet »
- **Sidebar filtres** `[CatalogFilters · reflété dans l'URL · 15.4]` (~220px)
  - Groupe « Catégorie » (3 options)
  - Groupe « Marque » (3 options)
  - Groupe « Format châssis » `[attributes.chassisFormat · 12.2]` (3 options)
  - **Bouton ghost :** "Effacer les filtres"
- **Zone résultats**
  - Ligne d'en-tête : « 24 produits trouvés » + **`[CatalogSort · ≥2 options · 15.1]`** — « Trier : Nouveautés ▾ »
  - Grille de `ProductCard` (2 rangées de 3) — image 🖼 + badge disponibilité + nom
  - ⚠️ CONDITIONNEL — **`[CatalogPagination · masqué si 1 seule page · 15.4]`** — numéros 1, 2, 3
    - *Règle : ce bloc n'existe dans le DOM que si `Math.ceil(totalResults/pageSize) > 1` — jamais de numéros de page factices comme dans le prototype initial.*

---

## 5. Catalogue — mobile

**Route/contexte :** `/catalogue` · <768px
**Règles clés :** la sidebar de filtres desktop devient un bouton « Filtrer » ouvrant un tiroir/bottom-sheet plein écran (mêmes règles de piège de focus que `MobileNav`, 15.2) — jamais de filtres tronqués ou inaccessibles en mobile (16.2).

- **Vue liste**
  - Barre : **Bouton :** "⚙ Filtrer" + **Bouton :** "Trier ▾"
  - `ProductCard` empilées (image 🖼 + badge + nom)
- **Tiroir « Filtrer » ouvert** `[CatalogFilters (drawer) · piège de focus]`
  - Titre + icône fermeture ✕
  - Groupe « Catégorie » (2 options), groupe « Format châssis » (2 options)
  - **Bouton :** "Voir 12 résultats"

---

## 6. Fiche produit

**Route/contexte :** `/produit/[slug]` · desktop · SSG+ISR (6.2)
**Règles clés :** **écran le plus critique du site** (objectif de conversion primaire, 3.3). Badge de disponibilité et garantie **dérivés de `availability`/`warranty`**, jamais statiques (ADR-005). CTA « Ajouter au devis » toujours visible, jamais absent (corrige ADR-006). Bloc datasheet conditionnel — masqué entièrement si aucun document, jamais un lien mort (6.5.7).

- **Breadcrumb** `[+ BreadcrumbList JSON-LD · 20.3]` — 3 niveaux
- **Colonne galerie** `[ProductGallery · 15.3]` (~400px)
  - Image principale 🖼 (grande) + 3 vignettes 🖼
- **Colonne info**
  - Marque (petit texte) → Nom du produit (titre) → SKU (mono)
  - `[ProductAvailabilityBadge ← availability · 12.4]` : badge « Disponible » + « Délai : 3 jours »
  - `[Garantie ← warranty.durationLabel · 12.2]` : « 🛡 3 ans sur site J+1 »
  - **Bouton primaire (large) :** "Ajouter au devis" + icône Favoris (♡)
  - ⚠️ CONDITIONNEL — **`[Datasheets · masqué si vide · 6.5.7]`** : liste de documents (« 📄 QuickSpecs (PDF, v2) », « 📄 Guide technique complet (PDF, v1) »)
- **Tableau de specs** `[ProductSpecsTable · balisage <table> sémantique · 15.3]` — lignes clé/valeur
- Deux blocs additionnels côte à côte : `certifications[]` et `compatibility[]`

---

## 7. Liste de devis & formulaire de demande

**Route/contexte :** `/devis` · Client Component, `noindex` (13.2)
**Règles clés :** persisté réellement en `localStorage` (corrige ADR-008 — le prototype initial prétendait sauvegarder localement sans le faire). La modale est accessible depuis 3 endroits (header, fiche produit, cette page) — corrige la modale « Parler à un expert » jamais atteignable du prototype initial (ADR-006).

- **Page `/devis`**
  - Titre « Ma liste de devis (3) »
  - 3× ligne d'article : image 🖼 (44×44) + nom + libellé secondaire + icône suppression ✕
  - **Bouton :** "Demander un devis pour ces 3 articles"
- **Modal `QuoteRequestForm`** `[role=dialog aria-modal, piège de focus · 15.1]`
  - Titre + icône fermeture ✕
  - Champs (chacun `label` lié via `htmlFor`/`id`, 18.4) : nom complet, société, e-mail (2 colonnes), message
  - `[3 produits pré-remplis, retirables]`
  - `[honeypot caché · aria-hidden · 21.3]`
  - **Bouton :** "Envoyer la demande"
  - *Note : états à gérer — `idle` → `submitting` (spinner, champs désactivés) → `success` (confirmation + délai annoncé, 10.3) ou `error` (message explicite, champs conservés) — 15.5, 16.6.*

---

## 8. Footer

**Route/contexte :** présent sur toutes les pages · `components/layout/Footer`
**Règles clés :** toutes les coordonnées viennent exclusivement de `SITE_CONFIG` (10.4) — aucune recopie en dur. **Interdiction formelle** de faire pointer un lien vers la page 404 comme solution temporaire (15.2) : si une page n'est pas prête, elle n'apparaît simplement pas ici.

- **Footer** `[liens réels uniquement, jamais vers 404 · 15.2]` — 5 colonnes
  1. Bloc marque : nom + description courte + 2 icônes réseaux sociaux
  2. « Catalogue » : Serveurs & stockage, Réseau, Sécurité, Vidéosurveillance, Ordinateurs portables
  3. « Entreprise » : À propos, Marques, Contact
  4. « Légal » : Mentions légales, CGV, Politique de confidentialité
  5. « Contact » `[SITE_CONFIG source unique · 10.4]` : téléphone, e-mail, adresse, horaires
- **Barre du bas** : « © 2026 HardwareCentral — BTS » + liens Mentions légales / CGV / Confidentialité
- *Règle : identique en tout point (adresse, téléphone, horaires) au bloc Contact du header, de la page `/contact` et de la page À propos — corrige l'incohérence à trois identités du prototype initial (section 10).*

---

## 9. Annuaire des marques

**Route/contexte :** `/marques` · SSG+ISR · indexable (13.2)
**Règles clés :** le référentiel `brands.ts` est la **source unique** consommée ici, par le méga-menu, l'accueil et les filtres catalogue (10.5) — interdiction de listes de marques dupliquées et divergentes (corrige ADR-002).

- Breadcrumb : « Accueil › Marques »
- Titre « Nos marques partenaires » + sous-titre
- **Grille `BrandCard`** `[brands.ts, isActive uniquement · 3.4/10.5]` — 6 cartes (2 rangées de 3) : icône/logo + nom + description courte + **Bouton ghost :** "Voir les produits →"
- *Règle : 6 marques actives (HPE, Dell, Fortinet, Cisco, Huawei, Hikvision). Lenovo (« en préparation ») n'apparaît pas ici tant qu'aucun produit réel n'est catalogué (16.7) — logo réel si disponible sous licence, sinon repli typographique explicite (jamais un logo générique trompeur).*

---

## 10. Fiche marque

**Route/contexte :** `/marques/[brand]` · SSG+ISR · indexable (6.2/13.2)
**Règles clés :** réutilise le **même composant `ProductCard`** et le même moteur de filtrage que le catalogue (9.2) — pas d'implémentation parallèle.

- Breadcrumb : « Accueil › Marques › HPE »
- **En-tête de marque** `[Brand interface · 10.5]` : logo (64×64) + nom complet + description
- Compteur : « 12 produits HPE »
- **Grille `ProductCard`** `[identique 15.3/9.2]` — 6 cartes (2 rangées de 3) : image 🖼 + badge disponibilité + nom
- *Règle : cas limite — une marque `isActive` qui se retrouverait sans produit affiche l'`EmptyState` générique (voir écran 11) plutôt qu'une grille vide silencieuse (15.4).*

---

## 11. Résultats de recherche

**Route/contexte :** `/recherche?q=` · Client Component · `noindex` (13.2)
**Règles clés :** réutilise **la même fonction `filterProducts`** et la même grille que `/catalogue` (9.2, décision de simplification 13.2) — aucune seconde implémentation de recherche.

- **Cas « résultats trouvés »**
  - `[SearchBar · valeur = ?q= · 16.3]` — champ avec la requête active, ex. « 🔍 switch poe 48 ports »
  - Compteur : « 8 résultats pour « switch poe 48 ports » »
  - Grille `ProductCard`
- **Cas « aucun résultat »**
  - `[EmptyState · variant="search" · 15.4]` : icône + « Aucun résultat pour « nas 48 baies » » + description + **Bouton :** "Voir tout le catalogue"
- *Règle : composant `EmptyState` générique — même composant réutilisé pour filtre catalogue vide, marque sans produit (écran 10), favoris vides (écran 12) et liste de devis vide (écran 7).*

---

## 12. Favoris sauvegardés

**Route/contexte :** `/favoris` · Client Component · `noindex` (13.2)
**Règles clés :** distinct de la liste de devis (écran 7) : sauvegarde persistante d'articles à suivre, sans intention d'achat immédiate (4.4). Chaque article peut être basculé vers le devis sans quitter la page.

- **Cas « avec articles »**
  - Titre « Mes favoris (2) »
  - 2× ligne d'article `[favorites-store persisté]` : image 🖼 (52×52) + nom + libellé secondaire + **Bouton ghost :** "+ Devis" + icône suppression ✕
- **Cas « vide »**
  - `[EmptyState · variant="favorites" · 15.4]` : icône + « Aucun favori pour le moment » + description + **Bouton :** "Parcourir le catalogue"

---

## 13. À propos

**Route/contexte :** `/a-propos` · SSG · indexable (4.6/13.2)
**Règles clés :** bloc identité d'entreprise strictement identique (adresse, téléphone, horaires) au Footer (écran 8) et à la page Contact (écran 14) — source unique `SITE_CONFIG` (section 10).

- **Bandeau titre** : « À propos de HardwareCentral » + texte d'intro
- **Section « Notre mission »** : titre + 3 lignes de texte
- **TrustBadges** `[réutilisé · 14/4.6]` — 3 items
- **BrandsGrid** `[lien vers /marques · 10.5]` : titre « Nos partenaires » + 6 logos
- **Bloc identité légale** `[SITE_CONFIG · 10.2/10.4]` : « Bridge Technologies Solutions » + coordonnées

---

## 14. Contact

**Route/contexte :** `/contact` · SSG · indexable (4.6/13.2)
**Règles clés :** `ContactForm` à soumission réelle vers `POST /api/contact-messages` (22.3) — jamais un `setTimeout` simulé (corrige le défaut le plus critique du prototype initial, section 26). Champ « Sujet » avec options réellement différenciées, dont « Demande de devis ».

- **Colonne coordonnées** `[SITE_CONFIG · 10.4]` : titre « Nous contacter » + 4 lignes icône+texte (adresse, téléphone, e-mail, horaires) + lien « Voir sur Google Maps → »
- **Colonne formulaire** `[ContactForm · POST réel · 15.5/22.3]` : champs Nom complet*, E-mail*, Sujet* (select, ex. « Demande de devis ▾ »), Message* + **Bouton :** "Envoyer le message"
- *Règle : sujet « Demande de devis » redirige en interne vers la même logique que `QuoteRequestForm` ou, a minima, est routé au même e-mail `sales@` (15.5). États `idle → submitting → success/error` identiques au formulaire de devis (écran 7) — jamais de perte des données saisies en cas d'échec réseau.*

---

## 15. Pages légales (gabarit générique)

**Route/contexte :** `/mentions-legales` · `/cgv` · `/confidentialite` · SSG · indexable (13.2)
**Règles clés :** **un seul gabarit visuel pour les 3 routes** — seul le contenu change. Contenu réel et juridiquement adapté au pays d'immatriculation de la société (10.2) : jamais un texte générique de substitution (« Lorem ipsum » ou placeholder non adapté).

- Breadcrumb : « Accueil › Confidentialité »
- **Gabarit `LegalPage`** `[contenu variable par route · 10.2]` : titre (ex. « Politique de confidentialité ») + « Dernière mise à jour : JJ/MM/AAAA »
- Sections numérotées (ex. « 1. Finalité de la collecte », « 2. Durée de conservation », « 3. Droits d'accès et de rectification ») — titre + paragraphe(s) par section
- *Règle : s'applique identiquement à `/mentions-legales` (identité légale, RCCM/NIU) et `/cgv` (conditions générales de vente) — même structure de titres, contenu propre à chaque route (21.x).*

---

## 16. Page introuvable (404)

**Route/contexte :** `not-found.tsx` (fallback Next.js) · `noindex` (13.2/17.5)
**Règles clés :** utilisée **uniquement** pour de vraies erreurs de navigation — jamais comme destination provisoire d'un lien non implémenté (corrige ADR-011 : « Support Client B2B » et « Centre d'aide » pointaient intentionnellement vers cette page dans le prototype initial).

- `[not-found.tsx · statut HTTP 404 réel · 25.3/25.4]`
- « 404 » (grand) + « Page introuvable » + description
- `[SearchBar réutilisée]` : « 🔍 Rechercher un produit… »
- **Bouton :** "Retour à l'accueil"
- Suggestions de catégories (pills) : Serveurs, Réseau, Sécurité
- *Règle : suggestions = catégories actives uniquement (mêmes règles que l'écran 3, 3.5) — jamais de lien mort en sortie de cette page.*

---

## Clôture

Ce document doit rester synchronisé avec `HARDWARECENTRAL_WIREFRAMES.html` : toute correction de structure/hiérarchie sur l'un doit être reportée sur l'autre. Pour le style visuel final de chaque élément listé ici (couleurs, typographie, espacement, états de composants) → `DESIGN.md`. Pour les règles métier détaillées derrière chaque annotation `(x.y)` → `HARDWARECENTRAL_AGENT_SPEC.md`.

**Transcription de HARDWARECENTRAL_WIREFRAMES.html — WIREFRAMES.md v1.0.0**
