# HardwareCentral — Spécification Maîtresse pour Agent IA de Développement

**Version du document :** 1.2.0 — séparation des sources du pipeline média (section 6.5 intégralement révisée) : Amazon Scraper API pour les images et informations de base, Open Icecat borné aux fiches techniques ; voir ADR-022.
**Statut :** Source de vérité unique (Single Source of Truth — SSOT)
**Portée :** Conception, développement, maintenance et évolution complètes de la plateforme HardwareCentral
**Audience :** Agents IA de développement logiciel (Claude Code, Cursor, GitHub Copilot, Gemini CLI, OpenAI Codex, ou tout autre agent autonome ou semi-autonome)

---

## 0. À propos de ce document

### 0.1 Objectif

Ce document est le **contexte racine** du projet HardwareCentral. Il doit être chargé en mémoire (ou référencé) par tout agent IA avant toute action de conception, de génération de code, de refactoring ou de revue. Il remplace toute connaissance implicite ou supposition que l'agent pourrait faire sur le projet.

Ce document décrit un produit à construire **à partir d'un prototype existant défaillant** (généré via une plateforme de prototypage IA — Google AI Studio). Ce prototype a fait l'objet d'un audit UX/UI/technique exhaustif. Les décisions prises dans ce document **corrigent explicitement** chaque défaut identifié dans cet audit. Quand une règle ci-dessous semble « évidente », c'est probablement parce qu'elle corrige un bug réel constaté dans le prototype d'origine — la section 27 (Journal des décisions) trace cette correspondance.

### 0.2 Règles d'usage pour l'agent IA

1. **Priorité absolue** : en cas de conflit entre ce document et toute autre source (mémoire d'entraînement, conventions par défaut d'un framework, préférences stylistiques génériques), ce document prévaut.
2. **Aucune improvisation sur les données de contact, l'identité de marque, la langue ou le modèle commercial** : ces éléments sont figés en section 10 et 11 et doivent être consommés depuis une source unique de configuration (voir 10.4), jamais recopiés en dur dans plusieurs fichiers.
3. **Aucune fonctionnalité « décorative »** : tout élément d'interface qui ressemble à un contrôle interactif (bouton, lien, filtre, tri, pagination) DOIT être fonctionnel. Il est interdit de livrer un composant visuellement interactif sans logique fonctionnelle réelle derrière (voir section 26, règle non négociable).
4. **Aucune donnée statique masquant une donnée dynamique existante** : si une information varie selon le produit/l'utilisateur/le contexte (statut de stock, garantie, prix, etc.), elle DOIT être lue depuis le modèle de données, jamais codée en dur dans un composant.
5. **Complétude avant esthétique** : un parcours utilisateur incomplet (ex. un formulaire qui ne soumet rien) est un défaut **critique**, plus grave qu'un défaut visuel.
6. En cas d'ambiguïté non couverte par ce document, l'agent doit choisir l'option la **plus cohérente avec les règles déjà établies** (voir Design System et UX transverses) plutôt que d'introduire un nouveau pattern, et documenter son choix dans un commentaire de code ou un ADR additionnel (section 27).

### 0.3 Table des matières

0. À propos de ce document
1. Vision produit & positionnement
2. Marché, contexte & personas
3. Modèle métier & règles business
4. Périmètre fonctionnel V1 (in scope)
5. Hors périmètre V1 (out of scope) & roadmap
6. Architecture globale du système
7. Stack technique & dépendances
8. Structure des dossiers & organisation du code
9. Conventions de nommage & style de code
10. Identité de marque & Single Source of Truth
11. Internationalisation & langue
12. Modèle de données
13. Cartographie des routes & structure des URLs
14. Design System (tokens)
15. Bibliothèque de composants
16. Règles UX transverses
17. Parcours utilisateurs clés (user flows)
18. Accessibilité (WCAG 2.2 AA)
19. Performance & Core Web Vitals
20. SEO technique & on-page
21. Sécurité
22. Contrat API / Backend
23. Gestion d'état applicatif
24. Qualité de code, tests & CI
25. Gestion des erreurs & états limites
26. Checklist de non-régression (Definition of Done)
27. Journal des décisions (ADR) — traçabilité vs prototype initial
28. Glossaire

---

## 1. Vision produit & positionnement

### 1.1 Énoncé de vision

> HardwareCentral est la plateforme de référence pour l'acquisition d'équipements informatiques professionnels (serveurs, stockage, réseau, sécurité, vidéosurveillance) en Afrique Centrale. Elle permet aux décideurs IT (DSI, responsables infrastructure, intégrateurs) de découvrir un catalogue de matériel de marques constructeurs reconnues, d'obtenir une documentation technique fiable, et de déclencher une demande de devis qualifiée en quelques clics — sans friction, sans ambiguïté, avec une confiance totale dans l'exactitude des informations affichées.

### 1.2 Proposition de valeur

| Pilier | Description |
|---|---|
| **Catalogue technique fiable** | Fiches produits exhaustives (specs, compatibilité, certifications, garantie réelle) sourcées et vérifiées, jamais génériques ou copiées d'un autre produit. |
| **Modèle B2B par devis (RFQ)** | Pas de prix public affiché (marché B2B à forte variabilité tarifaire selon volume/négociation/disponibilité fournisseur) ; à la place, un parcours de demande de devis rapide, structuré et traçable. |
| **Expertise conseil** | Accès direct à un architecte systèmes pour valider une configuration avant achat (dimensionnement serveur, compatibilité, redondance). |
| **Logistique régionale** | Livraison et support technique couvrant le Cameroun et la sous-région CEMAC, avec délais de livraison affichés par produit. |
| **Multi-marques** | Partenariats avec les grands constructeurs (HPE, Dell Technologies, Cisco, Fortinet, Huawei, Hikvision — voir 10.5 pour la liste figée des marques actives). |

### 1.3 Ce que le produit N'EST PAS (pour cadrer les attentes de l'agent)

- Ce n'est **pas** un site e-commerce B2C avec panier, prix public et paiement en ligne immédiat (voir 5.1 pour justification).
- Ce n'est **pas** une marketplace multi-vendeurs.
- Ce n'est **pas** un configurateur de serveur sur-mesure (pas de PC-builder interactif en V1).
- Ce n'est **pas** un portail de support technique après-vente (tickets, SAV) — uniquement de la génération de leads commerciaux et de la découverte produit en V1.

---

## 2. Marché, contexte & personas

### 2.1 Marché cible

- **Zone géographique principale** : Cameroun (siège social, entrepôt logistique, équipe support).
- **Zone de couverture commerciale** : sous-région CEMAC (Cameroun, Gabon, Congo, Tchad, République Centrafricaine, Guinée Équatoriale).
- **Langue du marché** : français (langue des affaires et de l'administration dans la zone cible). Voir section 11 pour la politique linguistique complète — **aucun contenu en anglais ne doit apparaître dans l'interface livrée**, y compris dans les métadonnées techniques (`lang`, `title` par défaut, libellés d'horaires, mentions de copyright).
- **Devise de référence** (si une valeur monétaire doit un jour être affichée — ex. devis) : Franc CFA (XAF), format `1 250 000 FCFA`.

### 2.2 Personas

#### Persona 1 — Le Responsable Infrastructure IT (utilisateur principal)
- **Rôle** : DSI, responsable infrastructure ou ingénieur systèmes dans une PME/ETI ou une administration.
- **Objectif** : trouver rapidement une référence précise (ex. « serveur rack 2U bi-processeur avec 8 baies SAS ») et obtenir une fiche technique fiable + un devis sous 24-48h.
- **Frustrations à éviter** : fiches produits approximatives, photos ne correspondant pas au modèle exact, absence d'information sur la garantie réelle, impossibilité de contacter un humain rapidement.
- **Comportement** : consulte le site depuis un poste de travail (desktop) en majorité, mais peut consulter une fiche produit depuis mobile en déplacement (ex. sur site client). Attend une réponse par e-mail ou téléphone, pas un chatbot automatisé impersonnel.

#### Persona 2 — L'Intégrateur / Revendeur partenaire
- **Rôle** : société tierce qui revend les équipements à ses propres clients finaux.
- **Objectif** : vérifier la disponibilité et le délai de livraison réel avant de s'engager auprès de son client, comparer plusieurs marques équivalentes.
- **Comportement** : consulte fréquemment, compare par marque (d'où l'importance des pages « Marques »), a besoin d'une communication rapide (WhatsApp est un canal privilégié en Afrique Centrale).

#### Persona 3 — Le Décideur / Directeur Général (utilisateur secondaire)
- **Rôle** : valide budgétairement un projet préparé par le Persona 1.
- **Objectif** : consulter une page « À propos » crédible (preuve sociale, ancienneté, certifications) avant de valider un fournisseur inconnu.
- **Comportement** : lecture rapide, sensible aux signaux de confiance (adresse physique vérifiable, cohérence des informations, présence de marques reconnues).

### 2.3 Implication produit des personas

- La **cohérence et l'exactitude des informations de contact et d'identité d'entreprise** (adresse, téléphone, horaires) sont un facteur de conversion direct pour le Persona 3 — toute incohérence détectée (même mineure) détruit la confiance et fait perdre le lead. C'est pourquoi la section 10 impose une source unique de vérité.
- Le canal **WhatsApp Business** doit être fonctionnel et prioritaire (pas seulement décoratif) car c'est le canal de communication B2B dominant dans la zone CEMAC.
- Les fiches produits doivent afficher le **délai de livraison réel** (`leadTimeDays`) car c'est un critère de décision clé pour le Persona 2.

---

## 3. Modèle métier & règles business

### 3.1 Décision structurante : modèle « Request For Quote » (RFQ), pas de vente en ligne directe

**Règle :** Aucun prix n'est affiché publiquement sur le site. Aucune fonctionnalité de panier d'achat, de paiement en ligne ou de checkout transactionnel ne doit être implémentée en V1.

**Justification :**
- Le matériel IT professionnel (serveurs, baies de stockage, pare-feu d'entreprise) se vend en B2B avec des tarifs variables selon le volume, la disponibilité fournisseur en temps réel, les remises négociées et les frais de douane/logistique propres à chaque pays de livraison. Un prix public fixe serait soit inexact, soit non compétitif.
- Le cycle de vente B2B implique systématiquement une phase de qualification humaine (validation technique, conditions de paiement en compte, facturation professionnelle) incompatible avec un achat impulsif en un clic.
- **Conséquence directe sur l'architecture** : le modèle de données `Product` ne contient **aucun champ de prix**. Toute action utilisateur qui pourrait sembler mener à un achat (ex. bouton produit) doit mener à une **demande de devis**, jamais à un panier de paiement.

### 3.2 Décision structurante : positionnement strictement B2B (le B2C est explicitement exclu)

**Règle :** Toute la plateforme, y compris les micro-copies, doit être rédigée pour une audience professionnelle (entreprise, organisation). Aucune mention de vente « B2C » ou « grand public » ne doit apparaître.

**Justification :** Le catalogue (serveurs rack, baies SAN, commutateurs d'entreprise 48 ports PoE+) n'a pas de pertinence pour un acheteur particulier. Positionner le site comme B2B/B2C hybride dilue le message de marque et introduit de la confusion (voir ADR-003 en section 27 : cette confusion existait littéralement dans le prototype initial et est ici formellement tranchée).

### 3.3 Modèle de génération de leads

Le site a un seul objectif de conversion mesurable : **la soumission d'une demande de devis qualifiée**. Toutes les fonctionnalités doivent être évaluées à l'aune de cet objectif.

Trois canaux de conversion doivent coexister, tous fonctionnels, tous menant à un enregistrement traçable côté back-office (voir section 22) :

1. **Demande de devis structurée** (formulaire avec liste de produits pré-remplie depuis la « Liste de devis », voir 16.4) — canal principal, le plus qualifié.
2. **Formulaire de contact général** (page Contact) — pour les demandes non liées à un produit précis (partenariat, support, question générale).
3. **WhatsApp Business** — canal informel à faible friction, pour une prise de contact rapide, particulièrement adapté au marché cible (2.3).

Chaque canal doit déboucher sur une confirmation claire à l'utilisateur (voir 16.6, états de succès) **et** sur une notification réelle côté entreprise (e-mail transactionnel ou webhook CRM — voir section 22). Un formulaire qui affiche un message de succès sans transmettre réellement la donnée est un défaut **critique** et ne doit jamais être livré (ceci corrige un défaut majeur du prototype initial — voir ADR-006).

### 3.4 Marques partenaires (référentiel figé V1)

La liste des marques actives (avec produits réels au catalogue) et la liste des marques « partenaires annoncées » doivent être **strictement identiques** sur toutes les pages (accueil, méga-menu, page Marques, filtres catalogue). Il est interdit d'annoncer une marque partenaire sans y associer soit des produits réels, soit un état « Bientôt disponible » explicite et honnête (voir 16.7).

**Marques actives V1 (avec produits) :**

| Code marque | Nom d'affichage | Catégories couvertes |
|---|---|---|
| `HPE` | HPE | Serveurs, Stockage, Réseau (Aruba) |
| `DELL` | Dell Technologies | Serveurs, Stations de travail |
| `CISCO` | Cisco | Réseau, Sécurité |
| `FORTINET` | Fortinet | Sécurité / Pare-feu |
| `HUAWEI` | Huawei | Stockage |
| `HIKVISION` | Hikvision | Vidéosurveillance |

**Marques en préparation (roadmap, non affichées comme actives tant qu'aucun produit n'est catalogué) :** Lenovo. Voir règle 16.7 pour l'affichage honnête des marques sans produit.

### 3.5 Catégories de produits (référentiel figé V1)

| ID catégorie | Nom d'affichage | Statut V1 |
|---|---|---|
| `server-storage` | Serveurs & Stockage | Actif (produits présents) |
| `networking` | Réseau | Actif (produits présents) |
| `security` | Sécurité & Pare-feu | Actif (produits présents) |
| `cctv` | Vidéosurveillance | Actif (produits présents) |
| `laptop` | Ordinateurs & Stations de travail | Actif (produits présents) |
| `datacenter` | Datacenter (racks, PDU, onduleurs) | Roadmap — ne pas afficher dans la navigation principale tant qu'aucun produit n'est catalogué |
| `wireless` | Wi-Fi & Sans-fil | Roadmap — idem |
| `monitor` | Écrans | Roadmap — idem |
| `printers` | Imprimantes | Roadmap — idem |

**Règle impérative :** une catégorie ne doit apparaître dans la navigation (grille d'accueil, méga-menu, filtres) que si elle contient au moins un produit publié. Ceci corrige un défaut du prototype initial où 4 catégories sur 9 menaient systématiquement à un état vide (voir ADR-009).

---

## 4. Périmètre fonctionnel V1 (in scope)

Cette section liste **exhaustivement** ce qui doit être construit en V1. Toute fonctionnalité non listée ici est soit en section 5 (hors périmètre explicite), soit doit être proposée à validation avant implémentation.

### 4.1 Navigation & découverte
- Page d'accueil avec : bannière hero, bandeau de réassurance (trust badges), grille de catégories actives, section produits récents/mis en avant, grille de marques actives, bloc newsletter.
- Méga-menu de navigation par catégorie, accessible **au clic ET au survol**, opérable au clavier (voir section 18).
- Barre de recherche globale (nom, SKU, marque, description) avec suggestions et page de résultats dédiée.
- Page « Catalogue complet » avec filtres (catégorie, marque, format châssis) et tri.
- Page « Liste des marques » et page « Marque » (fiche marque + produits associés).
- Fil d'Ariane (breadcrumb) fonctionnel sur toutes les pages profondes (catalogue, produit, marque, recherche).

### 4.2 Fiches produits
- Page produit complète : galerie d'images (image principale + vignettes), statut de disponibilité **dynamique**, spécifications techniques tabulaires, garantie **réelle par produit**, délai de livraison, certifications, compatibilité logicielle/matérielle, documentation téléchargeable (datasheets PDF réels ou état « à venir » explicite si absent), CTA principal « Ajouter au devis ».

### 4.3 Demande de devis (RFQ)
- Liste de devis persistante (localStorage) : ajout/suppression de produits depuis la fiche produit ou la carte produit.
- Indicateur visuel du nombre d'articles dans la liste de devis, visible dans le header.
- Formulaire de demande de devis (nom, société, e-mail professionnel, téléphone, message, liste des produits sélectionnés en lecture seule avec possibilité de retrait), accessible depuis : le header (CTA permanent), la fiche produit, la page « Liste de devis ».
- Confirmation de soumission avec délai de réponse annoncé, cohérent avec les horaires réels (voir 10.3).

### 4.4 Favoris (distinct de la liste de devis)
- Sauvegarde d'articles « à consulter plus tard » sans intention d'achat immédiate, persistée en `localStorage` (et non en mémoire volatile — voir ADR-008).
- Page dédiée « Mes favoris ».

### 4.5 Contact & support
- Page Contact avec informations de l'entreprise (issues de la source unique, section 10), formulaire de contact général fonctionnel (soumission réelle, voir 22.3), carte de localisation (optionnelle en V1, peut être un lien Google Maps).
- Bulle WhatsApp flottante persistante, avec numéro réel configuré (voir 10.4).
- Liens `tel:` et `mailto:` fonctionnels partout où un numéro/e-mail est affiché.

### 4.6 Contenu institutionnel
- Page « À propos » (mission, chiffres clés **vérifiables et cohérents**, engagements).
- Pages légales : Mentions légales, CGV, Politique de confidentialité — contenu réel et juridiquement adapté au pays d'immatriculation de la société (voir 10.2), pas de texte générique substitué.
- Page 404 personnalisée — utilisée **uniquement** pour de vraies erreurs de navigation, jamais comme destination provisoire d'un lien non implémenté (voir 26 et ADR-011).

### 4.7 Newsletter
- Formulaire d'inscription newsletter en pied de page, avec soumission réelle vers un fournisseur d'e-mailing (voir 22.4), état de succès/erreur explicite, validation du format e-mail.

### 4.8 Accessibilité & responsive (transverse, non optionnel)
- Conformité WCAG 2.2 niveau AA (détail section 18) sur l'ensemble des écrans listés ci-dessus.
- Support responsive complet : mobile (360–767px), tablette (768–1023px), desktop (1024px+), incluant un menu de navigation mobile réellement fonctionnel (voir 16.2 — corrige une lacune critique du prototype initial où la navigation mobile était inopérante).

---

## 5. Hors périmètre V1 (out of scope) & roadmap

### 5.1 Explicitement exclu de la V1 (ne pas implémenter sans validation produit)

| Fonctionnalité | Raison de l'exclusion |
|---|---|
| Paiement en ligne / passerelle de paiement | Modèle B2B par devis (voir 3.1) ; aucune donnée de carte bancaire ne doit transiter par la plateforme en V1. |
| Panier d'achat transactionnel avec prix | Aucun prix public (voir 3.1). Ne pas confondre avec la « Liste de devis » (4.3) qui ne contient aucun prix et ne déclenche aucune transaction. |
| Compte utilisateur / authentification (login, inscription) | Non nécessaire pour le parcours RFQ V1. **Important** : si un texte d'interface fait référence à un « compte professionnel », il doit être supprimé ou le compte doit être livré dans le même incrément (voir ADR-010) — ne jamais laisser une promesse d'interface sans fonctionnalité associée. |
| Chat en direct / chatbot automatisé | Le canal conversationnel privilégié du marché cible est WhatsApp (voir 2.3), déjà couvert en 4.5. |
| Marketplace multi-vendeurs | Hors positionnement (1.3). |
| Configurateur de serveur interactif (PC builder) | Complexité hors budget V1 ; peut être évalué en V3. |
| Multi-devise / multi-langue (anglais, autres langues) | Marché cible francophone unique (voir 2.1 et section 11). |
| Avis clients / notation produits | Nécessite une base d'utilisateurs authentifiés pour être crédible (dépend du compte utilisateur, donc V2+). |
| Comparateur de produits côte à côte | Utile mais non essentiel au MVP ; candidat V2. |
| Suivi de commande / statut de livraison en temps réel | Dépend d'une intégration ERP/logistique non spécifiée en V1 ; candidat V2. |

### 5.2 Roadmap indicative (post-V1, non bloquant pour le développement actuel)

- **V2** : compte professionnel (historique des devis, tarifs négociés visibles une fois connecté, statut de commande), avis clients, comparateur de produits, extension catégories `datacenter`, `wireless`, `monitor`, `printers` avec produits réels, ajout de la marque Lenovo.
- **V3** : configurateur de serveur, multi-pays avec devises locales adaptées (si expansion hors zone XAF), portail revendeur dédié (tarifs de gros pour le Persona 2).

**Règle pour l'agent :** ne jamais construire de manière anticipée un élément de la roadmap V2/V3 si cela complexifie ou fragilise le périmètre V1 (ex. ne pas ajouter de champ `price` « au cas où » dans le modèle `Product` — cela doit être une migration explicite et documentée le jour où le besoin est validé).

---

## 6. Architecture globale du système

### 6.1 Décision d'architecture principale : framework avec rendu serveur (SSR/SSG)

**Décision :** HardwareCentral doit être construit avec un framework React à rendu serveur/statique (**Next.js, App Router**), et non comme une Single Page Application 100% client-side.

**Justification (voir ADR-001 en section 27 pour le contexte complet) :**
- Le prototype initial était une SPA React pure (Vite), sans routeur (aucune bibliothèque de routing), avec une seule URL pour l'intégralité du site et un `<html lang="en">` statique alors que tout le contenu est en français. Conséquences mesurées : aucune page produit/catégorie/marque indexable individuellement par les moteurs de recherche, aucun lien profond partageable, bouton « précédent » du navigateur inopérant (il quitte le site au lieu de revenir à l'état précédent), aucune balise `<title>` ou `<meta description>` dynamique par page.
- Pour un catalogue B2B dont l'acquisition de trafic organique (SEO) est un canal d'acquisition stratégique (les acheteurs recherchent des références précises comme « Cisco Catalyst 9300 48 port Cameroun »), l'indexabilité de chaque fiche produit est **non négociable**.
- Next.js permet le rendu statique (SSG/ISR) des pages catalogue/produit/marque à build-time ou à la demande, tout en conservant une expérience interactive côté client (filtres, recherche, liste de devis) via des Client Components ciblés.

### 6.2 Modèle de rendu par type de page

| Page | Stratégie de rendu | Justification |
|---|---|---|
| Accueil (`/`) | SSG (statique, régénération périodique via ISR) | Contenu peu volatile, doit charger instantanément. |
| Catalogue (`/catalogue`) | SSR avec paramètres de recherche (`searchParams`) reflétés dans l'URL | Filtres/tri/pagination doivent être partageables par URL et indexables par catégorie. |
| Fiche produit (`/produit/[slug]`) | SSG à build-time + ISR (revalidation périodique) | Priorité SEO maximale ; contenu produit change rarement. |
| Page marque (`/marques/[brand]`) | SSG + ISR | Idem. |
| Résultats de recherche (`/recherche`) | SSR (dépend de la saisie utilisateur, non pré-générable) | — |
| Liste de devis, Favoris | Client Component pur (données locales `localStorage`, pas de valeur SEO) | Ces pages sont propres à chaque visiteur, ne doivent pas être indexées (`noindex`). |
| Contact, À propos, pages légales | SSG | Contenu statique institutionnel. |

### 6.3 Vue d'ensemble des couches applicatives

```
┌─────────────────────────────────────────────────────────────┐
│  Client (navigateur)                                         │
│  - React Server Components (rendu initial, SEO)               │
│  - Client Components ciblés (interactivité : filtres,         │
│    recherche, liste de devis, favoris, formulaires, méga-menu)│
│  - État local persistant : localStorage (devis, favoris)      │
└───────────────┬────────────────────────────────────────────┘
                │ fetch (Server Actions / Route Handlers)
┌───────────────▼────────────────────────────────────────────┐
│  Couche applicative Next.js (Route Handlers /api/*,           │
│  Server Actions)                                              │
│  - Validation des payloads (Zod)                              │
│  - Anti-spam (honeypot + rate limiting)                       │
│  - Orchestration : envoi e-mail transactionnel, webhook CRM   │
└───────────────┬────────────────────────────────────────────┘
                │
┌───────────────▼────────────────────────────────────────────┐
│  Services externes                                             │
│  - Brevo (e-mail transactionnel + newsletter — voir 22.0)     │
│  - CRM / outil de gestion de leads (webhook — voir 22.1)      │
│  - Open Icecat (médias produit, via le pipeline d'ingestion   │
│    hors ligne uniquement — voir 6.5, jamais appelé en runtime)│
│  - Stockage S3/R2 des médias produit (voir 6.5.4)              │
└─────────────────────────────────────────────────────────────┘
```

### 6.4 Source de données produit

**V1 :** les données produit (`Product`, `Category`) sont gérées comme un **contenu structuré versionné** dans le dépôt de code (fichiers TypeScript/JSON typés, voir section 12), chargé à build-time. Ce choix est délibéré pour la V1 : le volume de SKUs est faible (catalogue curé, pas une place de marché), et cela évite la complexité d'un CMS/back-office tant que le volume ne le justifie pas.

**Condition de bascule vers un CMS headless ou une base de données** (à réévaluer, ne pas anticiper sans validation) : dès que (a) le catalogue dépasse ~50 références, ou (b) une personne non-développeuse doit pouvoir mettre à jour le catalogue de façon autonome. Dans ce cas, migrer vers un CMS headless (ex. Sanity, Payload) ou une base de données (PostgreSQL + Prisma) en conservant strictement le même contrat de types (`Product` — section 12).

**Règle impérative sur les données produit (corrige un défaut critique du prototype initial — voir ADR-004/ADR-005) :**
- Chaque produit DOIT avoir sa propre image réelle. **Il est interdit de réutiliser la photo d'un autre modèle ou d'une autre marque** pour « combler » un produit sans photo. Si une photo réelle n'est pas encore disponible, utiliser un visuel de substitution neutre et **explicitement identifié comme tel** (ex. silhouette générique de la catégorie avec mention « Photo à venir »), jamais la photo d'un produit concurrent ou d'un autre modèle.
- Chaque champ affiché à l'utilisateur (statut de disponibilité, garantie, délai de livraison) DOIT provenir du modèle de données et ne jamais être une valeur codée en dur dans le composant d'affichage.

### 6.5 Pipeline d'ingestion des médias et données produit (photos, informations de base & fiches techniques)

**Décision (voir ADR-022, qui affine ADR-020) :** le pipeline repose sur **deux sources spécialisées, chacune sur son périmètre exclusif** — plus de source unique généraliste :

| Type de contenu | Source exclusive | Source(s) de repli |
|---|---|---|
| Image produit (principale + galerie) | **Amazon Scraper API** (service tiers de scraping structuré — ex. Oxylabs, Bright Data, ScraperAPI, Decodo/Smartproxy) | Portail partenaire/presse officiel du constructeur → capture manuelle |
| Informations de base (titre, marque, modèle, MPN, description courte, caractéristiques générales) | **Amazon Scraper API** | Fiche Icecat (si le produit y figure) → saisie manuelle |
| Fiche technique PDF (datasheet) et documents techniques associés | **Open Icecat** (uniquement) | Portail partenaire/presse officiel du constructeur → capture manuelle |

Ni les images ni les données de base ne sont plus sourcées depuis Icecat dans cette version du spec — son rôle est désormais **strictement borné aux fiches techniques et documents associés**. Comme pour la version précédente du pipeline, aucune de ces sources n'est appelée en direct au moment où un visiteur charge une page : tout passe par un **pipeline d'ingestion automatisé hors ligne**, qui rapatrie chaque média une fois vers un stockage propre au projet (voir ServerBasket cité en ADR-020 comme référence de pratique établie du secteur).

**Important — ce choix a un profil de risque juridique différent de la version précédente du spec, qui reposait uniquement sur Icecat.** Icecat est un canal de distribution que les marques alimentent volontairement pour être redistribué par leurs revendeurs. Amazon Scraper API n'a pas ce statut : c'est un outil d'extraction technique de données publiées sur Amazon par Amazon et par des vendeurs tiers, sans licence de redistribution explicite. Voir 6.5.8 pour le détail du risque et des mitigations recommandées — **à faire valider par un conseil juridique avant mise en production**, ce point n'est pas un simple détail technique.

#### 6.5.1 Vue d'ensemble du workflow (recherche → intégration en base)

```
1. Sélection du produit à cataloguer (marque + référence constructeur/MPN)
                        │
        ┌───────────────┴────────────────┐
        ▼                                  ▼
2a. Requête Amazon Scraper API      2b. Requête Open Icecat
    (image + infos de base)             (datasheet uniquement)
        │                                  │
3a. Résolution ASIN si nécessaire   3b. Résolution fiche Icecat par MPN
    (recherche par marque+modèle        │
    si le MPN seul ne suffit pas)       │
        │                                  │
4a. Téléchargement image(s)          4b. Téléchargement PDF(s)
    haute résolution                     datasheet
        │                                  │
5a. Vérification + dédoublonnage    5b. Détection de version
    (checksum, cf. 6.5.3)               (cf. 6.5.5)
        │                                  │
6a. Upload vers stockage propre     6b. Upload vers stockage propre
    products/{id}/images/               products/{id}/datasheets/
        │                                  │
        └───────────────┬────────────────┘
                         ▼
7. Écriture dans un RAPPORT de synchronisation
   (jamais directement dans les données de production)
                         │
                         ▼
8. REVUE HUMAINE : validation du matching produit,
   des images, des textes, de la fiche technique
                         │
                         ▼
9. Commit dans src/lib/data/products.ts (Git, revue de code standard)
                         │
                         ▼
10. Build / déploiement — le produit apparaît dans le catalogue
```

Aucune étape 7→9 n'est automatique : c'est le garde-fou déjà établi en 16.1 (aucune automatisation ne modifie silencieusement ce qui est affiché aux clients), maintenu à l'identique dans cette version à deux sources.

#### 6.5.2 Récupération des images et informations de base via Amazon Scraper API

« Amazon Scraper API » désigne ici une **catégorie de service tiers** (Oxylabs, Bright Data, ScraperAPI, Decodo, Apify, etc.), pas un produit officiel unique d'Amazon — à distinguer explicitement de l'« Amazon Product Advertising API », qui est le programme officiel d'Amazon réservé aux partenaires affiliés et soumis à des conditions d'usage encore plus restrictives sur la réutilisation des données hors du programme d'affiliation. Le choix du fournisseur précis est un détail d'implémentation (voir 7.1) ; le contrat fonctionnel attendu, lui, est fixé ici.

**Requête :**
1. Résolution de l'ASIN du produit : si l'ASIN est déjà connu (stocké en provenance depuis une ingestion précédente), requête directe sur la fiche produit ; sinon, recherche par marque + référence constructeur (MPN) via l'endpoint de recherche du fournisseur.
2. Si plusieurs ASIN candidats sont retournés (variantes, kits, reconditionné, régions différentes) : **le script ne choisit jamais automatiquement le « plus proche »**. Il consigne tous les candidats dans le rapport de synchronisation ; un humain confirme l'ASIN correct une fois, qui est ensuite mémorisé en provenance pour toutes les resynchronisations futures (évite de refaire cette désambiguïsation à chaque cycle).

**Réponse exploitée :**
- Titre du listing (utilisé comme point de départ pour `name`, jamais recopié tel quel sans relecture — les titres Amazon contiennent souvent des mentions promotionnelles à retirer).
- Marque, modèle.
- Image(s) — généralement plusieurs résolutions par visuel, la plus haute résolution disponible est retenue comme master (voir 6.5.3).
- Bullet points / caractéristiques générales et description — utilisés comme brouillon pour `shortDescription` et `fullDescription`, **toujours relus et reformulés par un humain avant publication** (ni copie verbatim pour des raisons de qualité éditoriale et de cohérence de ton avec le reste du site, ni pour dupliquer un contenu déjà indexé ailleurs — voir 20.4 sur le contenu unique).
- MPN, quand le champ est renseigné sur le listing (il ne l'est pas systématiquement — dans ce cas, le MPN déjà connu côté catalogue interne fait foi).

**Ce que cette source ne fournit pas** (et qui reste hors périmètre de cette étape) : la fiche technique PDF, les spécifications techniques exhaustives structurées (`specs`/`attributes` du modèle produit, section 12), la garantie contractuelle réelle, les certifications — ces champs restent renseignés manuellement ou via une autre source, jamais déduits d'un listing Amazon.

#### 6.5.3 Téléchargement, stockage, optimisation, nommage, déduplication et mise en cache des images

**Téléchargement :** le script télécharge le fichier image en mémoire tampon depuis l'URL retournée par le fournisseur de scraping, vérifie un `Content-Type` et une taille de fichier plausibles (garde-fou contre une réponse malformée), puis calcule un **checksum SHA-256** du contenu **avant** tout upload.

**Déduplication (avec garde-fou métier) :** le checksum est comparé à un index des images déjà stockées.
- S'il correspond à une image déjà associée **au même produit** : rien à faire, l'image n'a pas changé depuis la dernière ingestion (cas normal d'une resynchronisation, voir 6.5.6).
- S'il correspond à une image déjà associée à un **produit différent** : ceci n'est **jamais** silencieusement accepté comme une réutilisation légitime. C'est consigné comme anomalie dans le rapport de synchronisation pour revue humaine — un tel cas signale presque toujours un mauvais matching ASIN (deux références différentes pointées vers le même listing Amazon), à corriger avant publication. Cette règle prolonge explicitement la règle 6.4 (interdiction de réutiliser la photo d'un autre produit) dans le nouveau pipeline à deux sources.

**Nommage :** chemin de fichier stable et indépendant de la source, pour que le site n'ait jamais à changer une URL déjà publiée même si l'ASIN change ou si Amazon retire le listing :
```
products/{product.id}/images/primary.webp
products/{product.id}/images/gallery-{n}.webp
```

**Optimisation :** le master téléchargé est recadré/limité à une dimension maximale raisonnable (ex. 2000px sur le plus grand côté) avant stockage, pour plafonner le poids de stockage et de bande passante ; il est converti en WebP à la volée si le format source diffère. Un seul master haute résolution est conservé par visuel — **c'est `next/image` qui génère les variantes redimensionnées/AVIF à la demande** (cohérent avec 19.2), il n'est pas nécessaire de pré-générer plusieurs tailles à l'ingestion.

**Mise en cache et indépendance vis-à-vis de la source :** une fois uploadée vers le stockage du projet (6.5.4), l'image ne dépend plus jamais de la disponibilité d'Amazon — c'est tout l'intérêt du pipeline hors ligne. Les en-têtes `Cache-Control` servis par le CDN devant le bucket doivent être longs et `immutable` (ex. `public, max-age=31536000, immutable`) puisque le nom de fichier ne change jamais pour un même produit ; toute mise à jour réelle du contenu passe par le mécanisme de resynchronisation contrôlée (6.5.6), jamais par un simple écrasement silencieux du cache.

#### 6.5.4 Stockage (rappel, inchangé sur le principe — voir aussi ADR-020)

Stockage objet **compatible API S3** (Cloudflare R2 recommandé, voir 7.1) — un seul bucket, organisé par préfixe :
```
products/{product.id}/images/…
products/{product.id}/datasheets/…
```
Versioning activé au niveau du bucket, pour permettre un retour arrière en cas d'upload erroné, en complément du versionnement applicatif explicite des datasheets (6.5.5).

#### 6.5.5 Récupération, stockage, versionnement et archivage des fiches techniques via Icecat

**Récupération :** requête Icecat par marque + MPN (identique au mécanisme déjà décrit dans les versions précédentes du spec, désormais borné aux datasheets). La réponse peut contenir plusieurs documents pour un même produit (ex. fiche « QuickSpecs » courte + guide technique complet) — chacun est traité comme une entrée distincte de `Product.datasheets[]`.

**Nommage et versionnement explicite :** contrairement aux images (un seul master écrasé lors des mises à jour), les datasheets sont **versionnées explicitement**, car une fiche technique révisée par le constructeur peut changer des données contractuelles (garantie, certifications) sur lesquelles un client peut s'être appuyé pour une décision d'achat :
```
products/{product.id}/datasheets/{document-slug}-v{version}.pdf
```
Chaque entrée de `ProductDatasheet` (section 12.2) porte un numéro de version et un indicateur `isCurrent`.

**Archivage :** une fiche technique remplacée n'est **jamais supprimée** du stockage — elle passe à `isCurrent: false` et reste accessible par son URL versionnée. C'est une exigence spécifique au contexte B2B de ce projet : un client peut avoir basé une décision d'achat ou un devis sur une version antérieure d'une fiche technique ; pouvoir la retrouver a posteriori (litige, audit, garantie) prime sur l'économie de stockage négligeable que représenterait sa suppression.

#### 6.5.6 Synchronisation et mise à jour

Un job de resynchronisation (déclenché manuellement ou périodiquement, ex. mensuel, via une tâche planifiée) reparcourt le catalogue et, pour chaque produit :
1. Requête Amazon Scraper API sur l'ASIN déjà mémorisé (pas de nouvelle recherche floue) → nouveau checksum d'image comparé à l'existant.
2. Requête Icecat sur le MPN déjà mémorisé → nouveau checksum de datasheet comparé à l'existant.
3. **En cas de différence détectée sur l'un ou l'autre : jamais de remplacement automatique.** Le rapport de synchronisation présente le contenu actuel et le nouveau contenu côte à côte (miniature avant/après pour une image, numéro de version avant/après pour un datasheet) pour arbitrage humain.
4. Sur validation explicite : l'image est mise à jour au même chemin stable (nouvelle version accessible via le versioning du bucket, 6.5.4) ; le datasheet est ajouté comme nouvelle version numérotée, l'ancienne bascule en archive (6.5.5), jamais écrasée.
5. **Si la source d'origine ne répond plus** (listing Amazon retiré, produit disparu d'Icecat) : le média déjà stocké **reste en place et reste la version affichée** — l'indisponibilité de la source ne dégrade jamais l'expérience du site, elle est seulement consignée dans le rapport comme « source de vérification indisponible, à recontrôler manuellement » si l'ancienneté dépasse un seuil raisonnable (ex. 12 mois sans confirmation).

#### 6.5.7 Règles de secours (fallback)

| Situation | Comportement |
|---|---|
| Image introuvable via Amazon Scraper API (pas d'ASIN correspondant, produit non vendu sur Amazon) | Repli sur le portail constructeur, puis capture manuelle ; si aucune des trois n'aboutit, visuel de substitution neutre + `TODO` explicite (règle déjà posée en 6.4), jamais la photo d'un autre produit. |
| Datasheet introuvable via Icecat | Repli sur le portail constructeur, puis capture manuelle ; si aucune des trois n'aboutit, **la section « Fiche technique » n'est simplement pas affichée** sur la fiche produit plutôt que de montrer un lien mort ou un placeholder cliquable sans effet (cohérent avec 16.1 — aucune fausse affordance — et corrige directement le défaut des liens `url: '#'` du prototype initial, ADR-011). |
| Correspondance ambiguë (plusieurs ASIN candidats, produit-kit au lieu du SKU exact) | Jamais de sélection automatique ; candidats consignés pour arbitrage humain (voir 6.5.2). |
| Checksum d'image identique entre deux produits différents | Jamais accepté silencieusement ; anomalie consignée pour revue (voir 6.5.3). |

#### 6.5.8 Recommandations : performance, coûts, bonnes pratiques, aspects juridiques, contraintes techniques

**Performance.** L'intégralité du scraping/de l'ingestion est un traitement hors ligne, sans impact sur la latence perçue par un visiteur (principe déjà établi, reconduit à l'identique). Plafonner la résolution du master téléchargé (6.5.3) limite le coût de stockage et de transformation à la demande par `next/image`.

**Coûts.** Les fournisseurs de scraping Amazon facturent généralement à la requête réussie, de l'ordre de **0,50 à 2,50 USD pour 1 000 requêtes** selon le fournisseur et le palier de volume (les tarifs exacts varient et évoluent — à vérifier au moment du choix du fournisseur). Pour un catalogue de la taille de celui de ce projet (quelques dizaines de références, resynchronisation mensuelle), le coût mensuel est négligeable (de l'ordre de quelques dollars). Ce poste de coût ne devient significatif que si le catalogue grossit de plusieurs ordres de grandeur — à réévaluer si ce cap est franchi. Icecat reste gratuit pour les marques « sponsors » de l'Open Icecat (voir version précédente du spec) ; le stockage R2 est quasi gratuit au volume de ce projet (pas de frais de sortie).

**Bonnes pratiques techniques.**
- Conserver la réponse brute (JSON complet) du fournisseur de scraping et d'Icecat à côté des champs extraits, pour pouvoir ré-dériver un champ plus tard sans re-consommer de quota.
- Traiter chaque produit indépendamment (un échec sur un SKU n'interrompt jamais le traitement des autres — principe déjà établi, reconduit).
- Ne jamais court-circuiter l'étape de revue humaine (6.5.1, étape 8), quel que soit le niveau de confiance retourné par le fournisseur de scraping.

**Aspects juridiques — à lire attentivement avant mise en œuvre.** *(Ceci est une information générale, pas un conseil juridique formel ; une validation par un juriste est recommandée avant la mise en production de ce pipeline, compte tenu de l'usage commercial du site.)*
- **Deux risques distincts, à ne pas confondre :**
  1. **Risque contractuel (conditions d'utilisation d'Amazon).** Les conditions d'utilisation d'Amazon interdisent l'extraction automatisée de données sans autorisation. Passer par un fournisseur de scraping tiers ne supprime pas ce risque contractuel — c'est le fournisseur (et potentiellement vous, en tant qu'utilisateur du service) qui reste exposé à des mesures comme un blocage d'accès ou une mise en demeure.
  2. **Risque de droit d'auteur (copyright).** Les photos produit publiées sur une fiche Amazon appartiennent généralement au fabricant ou au vendeur qui les a mises en ligne, **pas à Amazon**, et **aucune licence de réutilisation sur un autre site marchand n'est accordée par le simple fait qu'une image soit visible publiquement**. Republier ces images sur HardwareCentral constitue une reproduction d'une œuvre protégée, indépendamment de la question du respect des conditions d'utilisation d'Amazon elle-même.
- Ce profil de risque est **qualitativement différent** de celui d'Icecat, qui reste un canal où les marques consentent explicitement à la redistribution par des revendeurs (voir ADR-020) — c'est précisément pour cette raison qu'Icecat est conservé pour les datasheets dans cette version du spec.
- **Options de mitigation, à arbitrer avec l'équipe/le service juridique :**
  a. Utiliser Amazon Scraper API comme **accélérateur de saisie interne** (titre, description brouillon, caractéristiques générales) sans publier l'image récupérée telle quelle — remplacer l'image affichée par une source aux droits clairs (portail constructeur, photographie propre, Icecat pour ce qui reste dans son périmètre) avant publication. C'est l'option la plus prudente par défaut.
  b. Si l'affichage direct de l'image récupérée est néanmoins souhaité, obtenir une confirmation explicite (même informelle, par écrit) du constructeur que l'usage de son imagerie officielle par un revendeur est autorisé, indépendamment du canal par lequel elle a été obtenue.
  c. Conserver systématiquement la provenance (URL source, ASIN, date de récupération — déjà imposé en 6.5.3/12.2) comme piste d'audit, utile en cas de question sur l'origine d'un visuel.
- Ce spec **implémente l'architecture technique demandée** ; la décision de publier ou non une image sourcée via Amazon Scraper API sans étape de remplacement (option a) reste une décision produit/juridique, pas une décision technique, et doit être prise en connaissance de cause.

**Contraintes techniques.**
- Les mesures anti-bot d'Amazon entraînent une variabilité du taux de succès des requêtes ; prévoir une logique de nouvelle tentative avec backoff, et tolérer un échec ponctuel par SKU sans bloquer le script (6.5.1).
- Un listing Amazon peut représenter une variante régionale, un kit ou un lot différent du SKU exact vendu — la vérification humaine du bon matching (6.5.2) n'est pas une formalité, c'est un contrôle qualité nécessaire.
- La dérive entre le catalogue local et l'état actuel d'un listing Amazon/d'une fiche Icecat est normale et acceptée : le stockage local fait autorité, la resynchronisation (6.5.6) est un outil de détection, pas une garantie de fraîcheur en continu.

#### 6.5.9 Modèle de données de provenance (`MediaAsset`)

Chaque média ingéré (image ou datasheet) conserve, en plus du fichier lui-même, sa provenance complète — indispensable pour la déduplication (6.5.3), la resynchronisation ciblée sans nouvelle recherche floue (6.5.6), et pour documenter la source en cas de question sur un visuel (6.5.8) :

```ts
// src/types/index.ts — utilisé par Product.primaryImage, Product.gallery
// et ProductDatasheet (voir 12.2)
export interface MediaAsset {
  url: string;                 // URL finale sur le stockage du projet (jamais l'URL source)
  alt: string;
  width: number;
  height: number;
  provenance: {
    sourceProvider: 'amazon-scraper' | 'icecat' | 'manufacturer-portal' | 'manual-capture';
    sourceUrl: string | null;      // URL d'origine consultée, null si capture manuelle
    sourceIdentifier: string | null; // ASIN (images/infos) ou identifiant Icecat (datasheets)
    fetchedAt: string;             // ISO date de la dernière récupération confirmée
    checksum: string;              // sha256 du fichier, pour la déduplication et la resynchronisation
  };
}
```

Règle de cohérence : `sourceProvider: 'amazon-scraper'` n'est valide que pour `Product.primaryImage`/`Product.gallery` (jamais pour un `ProductDatasheet`) ; `sourceProvider: 'icecat'` n'est valide que pour `ProductDatasheet` depuis cette version du spec (jamais pour une image, voir 6.5). Un agent générant ou validant ces données doit rejeter toute combinaison qui violerait cette règle.

#### 6.5.10 Vérification de liens (santé du stockage propre au projet)

Un script de contrôle périodique (`scripts/verify-media-links.ts`, requête `HEAD` sur chaque URL de média enregistrée dans `products.ts`) vérifie que le **stockage du projet lui-même** reste sain — à ne pas confondre avec la resynchronisation (6.5.6), qui vérifie si la source d'origine (Amazon/Icecat) a changé. Ce contrôle porte uniquement sur vos propres URLs R2 : normalement il ne devrait jamais rien détecter d'anormal, puisque c'est précisément l'objectif du pipeline (6.5.4) — mais il agit comme filet de sécurité pour détecter une suppression accidentelle ou une erreur de configuration du bucket avant qu'un client ne tombe sur un lien cassé, prolongeant ainsi la correction du défaut des liens `datasheet.url: '#'` du prototype initial (ADR-011).

---

## 7. Stack technique & dépendances

### 7.1 Stack retenue

| Domaine | Choix | Version cible | Justification |
|---|---|---|---|
| Framework | Next.js (App Router) | 15.x | SSR/SSG natif, voir 6.1. |
| Langage | TypeScript | 5.8.x, mode `strict: true` | Sécurité de typage, contrat de données partagé front/back. |
| UI | React | 19.x | Aligné avec l'écosystème Next.js 15. |
| Style | Tailwind CSS | 4.x | Conservé du prototype initial — les tokens de design (couleurs, typographie) définis en `@theme` sont une bonne base, réutilisés et complétés (voir section 14). |
| Icônes | lucide-react | dernière stable | Cohérence visuelle, poids léger, arbre d'imports (tree-shakable). |
| Animation | motion (Framer Motion) | dernière stable | Conservé, mais **toute animation doit respecter `prefers-reduced-motion`** (voir 18.9). |
| Validation de formulaires | react-hook-form + zod | dernière stable | Validation typée partagée entre client et Route Handlers. |
| État global léger (devis, favoris) | Zustand (avec middleware `persist` vers `localStorage`) | dernière stable | Plus prévisible qu'un Context API pour un état consommé par de nombreux composants (header, cartes produit, page dédiée) ; le middleware `persist` remplace la fausse promesse de persistance du prototype initial (voir ADR-008). |
| E-mail transactionnel & newsletter | **Brevo** (API + SMTP) | — | Fournisseur unique pour les deux besoins (voir 22.4) : plan gratuit à 300 e-mails/jour partagés entre transactionnel et campagnes, contacts illimités, pas de carte bancaire requise — évite de gérer deux comptes/fournisseurs distincts pour `/api/quote-requests`, `/api/contact-messages` et `/api/newsletter`. |
| Anti-spam formulaires | Honeypot custom + rate limiting (ex. `@upstash/ratelimit`) | — | Voir section 21. |
| Source des images & infos de base produit | **Amazon Scraper API** (service tiers — ex. Oxylabs, Bright Data, ScraperAPI, Decodo) | — | Voir 6.5.2. Consommée uniquement par le script d'ingestion (6.5.1), jamais en direct depuis le site. Voir 6.5.8 pour le cadre juridique à valider avant usage en production. |
| Source des fiches techniques | **Open Icecat** (API) | — | Borné exclusivement aux datasheets PDF depuis cette version du spec — voir 6.5.5. Consommée uniquement par le script d'ingestion, jamais en direct depuis le site. |
| Stockage des médias produit | Stockage objet compatible S3 (**Cloudflare R2** recommandé) | — | Voir 6.5.4 — pas de frais de sortie, API standard non propriétaire, portable vers AWS S3/Backblaze B2 sans réécrire le code. |
| Tests unitaires/composants | Vitest + React Testing Library | dernière stable | Voir section 24. |
| Tests end-to-end | Playwright | dernière stable | Couverture des parcours critiques (section 17). |
| Lint / format | ESLint (config Next.js + `eslint-plugin-jsx-a11y`) + Prettier | dernière stable | `eslint-plugin-jsx-a11y` est **obligatoire** pour prévenir les régressions d'accessibilité (voir section 18). |
| Déploiement | Vercel (ou toute plateforme compatible Next.js avec ISR) | — | Cohérence avec le modèle de rendu hybride (6.2). |

### 7.2 Dépendances explicitement interdites / à ne pas réintroduire

Le prototype initial contenait des dépendances mortes ou non pertinentes pour un site vitrine/catalogue B2B, résultat d'un scaffolding générique non nettoyé. L'agent ne doit **pas** les réintroduire sauf besoin fonctionnel explicite et validé :

- `@google/genai` — aucune fonctionnalité IA générative n'est prévue en V1 ; ne pas ajouter de dépendance à un SDK de modèle de langage sans cas d'usage produit défini.
- `express` / un serveur Node custom — Next.js fournit déjà la couche serveur (Route Handlers) ; un serveur Express parallèle est une source de duplication d'architecture.
- Toute bibliothèque de routing tierce (`react-router-dom`, etc.) — le routing est nativement fourni par l'App Router de Next.js.

### 7.3 Politique de gestion des dépendances

- Toute nouvelle dépendance ajoutée doit être justifiée par un besoin fonctionnel présent dans ce document.
- Audit de sécurité des dépendances (`npm audit` ou équivalent) intégré à la CI (voir 24.5).
- Pas de dépendance dupliquant une capacité déjà couverte par le framework (ex. pas de bibliothèque de fetch additionnelle, `fetch` natif + Server Components suffisent).

---

## 8. Structure des dossiers & organisation du code

### 8.1 Arborescence cible

```
hardwarecentral/
├── src/
│   ├── app/                            # App Router Next.js
│   │   ├── layout.tsx                  # Layout racine (html lang="fr", Header, Footer, WhatsAppBubble)
│   │   ├── page.tsx                    # Accueil (/)
│   │   ├── globals.css                 # Import Tailwind + design tokens (@theme)
│   │   ├── sitemap.ts                  # Génération dynamique sitemap.xml
│   │   ├── robots.ts                   # Génération robots.txt
│   │   ├── catalogue/
│   │   │   └── page.tsx                # /catalogue (SSR, searchParams = filtres)
│   │   ├── produit/
│   │   │   └── [slug]/
│   │   │       ├── page.tsx            # /produit/[slug] (SSG + generateMetadata)
│   │   │       └── not-found.tsx
│   │   ├── marques/
│   │   │   ├── page.tsx                # /marques
│   │   │   └── [brand]/
│   │   │       └── page.tsx            # /marques/[brand]
│   │   ├── recherche/
│   │   │   └── page.tsx                # /recherche (SSR)
│   │   ├── devis/
│   │   │   └── page.tsx                # /devis (Liste de devis — Client Component, noindex)
│   │   ├── favoris/
│   │   │   └── page.tsx                # /favoris (Client Component, noindex)
│   │   ├── a-propos/
│   │   │   └── page.tsx
│   │   ├── contact/
│   │   │   └── page.tsx
│   │   ├── (legal)/
│   │   │   ├── mentions-legales/page.tsx
│   │   │   ├── cgv/page.tsx
│   │   │   └── confidentialite/page.tsx
│   │   ├── api/
│   │   │   ├── quote-requests/route.ts        # POST — soumission demande de devis
│   │   │   ├── contact-messages/route.ts      # POST — soumission formulaire contact
│   │   │   └── newsletter/route.ts            # POST — inscription newsletter
│   │   └── not-found.tsx               # 404 générique (voir 25.4)
│   │
│   ├── components/
│   │   ├── ui/                         # Composants primitifs réutilisables (Button, Input, Badge, Modal, Select, Checkbox, Toast…)
│   │   ├── layout/                     # Header, MegaMenu, MobileNav, Footer, Breadcrumb, WhatsAppBubble
│   │   ├── product/                    # ProductCard, ProductGallery, ProductSpecs, ProductAvailabilityBadge
│   │   ├── catalog/                    # CatalogFilters, CatalogSort, CatalogPagination, CatalogGrid, EmptyState
│   │   ├── forms/                      # QuoteRequestForm, ContactForm, NewsletterForm (+ champs partagés)
│   │   └── sections/                   # Hero, TrustBadges, CategoryGrid, FeaturedProducts, BrandsGrid, NewsletterSection
│   │
│   ├── lib/
│   │   ├── site-config.ts              # SOURCE UNIQUE identité de marque (voir section 10)
│   │   ├── data/
│   │   │   ├── products.ts             # Données produits typées
│   │   │   ├── categories.ts
│   │   │   └── brands.ts
│   │   ├── validation/                 # Schémas Zod partagés (QuoteRequestSchema, ContactMessageSchema…)
│   │   ├── email/                      # Templates + client d'envoi transactionnel (Brevo)
│   │   ├── amazon-scraper-client.ts    # Client Amazon Scraper API (images + infos de base, voir 6.5.2) — consommé uniquement par scripts/
│   │   ├── icecat-client.ts            # Client API Open Icecat (datasheets uniquement, voir 6.5.5) — consommé uniquement par scripts/
│   │   ├── media-storage.ts            # Client d'upload vers le stockage S3/R2 (voir 6.5.4) — idem
│   │   ├── rate-limit.ts
│   │   └── utils.ts                    # Fonctions pures (formatage, slugify, etc.)
│   │
│   ├── store/
│   │   ├── quote-store.ts              # Zustand store — liste de devis (persist localStorage)
│   │   └── favorites-store.ts          # Zustand store — favoris (persist localStorage)
│   │
│   ├── types/
│   │   └── index.ts                    # Types partagés (Product, Category, Brand, MediaAsset, QuoteRequest…)
│   │
│   └── assets/
│       └── images/                     # Assets statiques du site (hors médias produit, voir 6.5)
│
├── scripts/
│   ├── ingest-product-media.ts         # Pipeline d'ingestion Amazon Scraper API (images/infos) + Icecat (datasheets) → stockage propre (voir 6.5.1)
│   └── verify-media-links.ts           # Contrôle périodique des liens du stockage propre (voir 6.5.10)
│
├── public/
│   ├── favicon.ico
│   ├── og-image.jpg
│   └── (fichiers statiques divers)
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .env.example
├── next.config.ts
├── tailwind.config.ts (ou config via @theme si Tailwind v4 CSS-first)
├── tsconfig.json
├── package.json
└── README.md
```

### 8.2 Règles d'organisation

- Un composant = un fichier = un export par défaut nommé (`PascalCase.tsx`), colocalisé avec ses éventuels sous-composants strictement privés dans un sous-dossier `_components/` si nécessaire.
- Les Client Components doivent porter la directive `'use client'` **au niveau le plus bas possible** de l'arbre (ne jamais rendre client tout un layout à cause d'un seul bouton interactif) — impératif pour préserver les bénéfices SSR de la section 6.
- Aucune logique métier (validation, calculs, accès aux données) dans les composants d'UI purs (`components/ui/`) — cette logique vit dans `lib/`.

---

## 9. Conventions de nommage & style de code

### 9.1 Nommage général

| Élément | Convention | Exemple |
|---|---|---|
| Composants React | `PascalCase` | `ProductCard.tsx`, `QuoteRequestForm.tsx` |
| Hooks personnalisés | `useCamelCase` | `useQuoteStore.ts`, `useMediaQuery.ts` |
| Fonctions utilitaires | `camelCase` | `formatCurrencyXAF()`, `slugify()` |
| Types / Interfaces | `PascalCase`, pas de préfixe `I` | `Product`, `QuoteRequestPayload` |
| Constantes globales | `UPPER_SNAKE_CASE` | `MAX_QUOTE_ITEMS`, `DEFAULT_PAGE_SIZE` |
| Fichiers non-composants | `kebab-case.ts` | `site-config.ts`, `rate-limit.ts` |
| Routes (segments App Router) | `kebab-case` en français | `/catalogue`, `/a-propos`, `/mentions-legales` |
| Identifiants de catégorie/marque (`id`) | `kebab-case` anglais technique (stable, jamais affiché tel quel) | `server-storage`, `cctv` |
| Classes CSS (Tailwind) | uniquement des tokens définis (voir section 14) — pas de valeurs arbitraires hors échelle (`bg-[#123456]` interdit) | `bg-teal-600`, `text-graphite-900` |

### 9.2 Style de code TypeScript/React

- `strict: true` dans `tsconfig.json` — aucun `any` implicite ou explicite non justifié par un commentaire.
- Composants fonctionnels uniquement (pas de classes React).
- Props typées via `interface` explicite, jamais `React.FC` (préférer une fonction typée dont le retour est inféré).
- Pas de logique dupliquée entre deux composants qui traitent le même concept (ex. filtrage produit) — voir ADR-007 : le prototype initial dupliquait la logique de recherche entre `CatalogPage` et `SearchResultsPage`. Toute logique de filtrage/recherche doit vivre dans une fonction unique et pure dans `lib/` (ex. `filterProducts(products, criteria)`), testée unitairement et réutilisée partout où c'est nécessaire.
- Commentaires en français (langue du projet), réservés à l'explication du « pourquoi », pas du « quoi » (le code doit être auto-documenté par un nommage clair).

### 9.3 Conventions Git

- Commits au format **Conventional Commits** (`feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `test:`) en anglais technique (convention internationale usuelle pour l'historique Git, indépendante de la langue produit).
- Une branche par fonctionnalité : `feat/quote-request-flow`, `fix/catalog-format-filter`.
- Aucun commit direct sur la branche principale ; revue de code obligatoire avant fusion (voir 24.6).

---

## 10. Identité de marque & Single Source of Truth

### 10.1 Contexte

Le prototype initial affichait **trois identités d'entreprise contradictoires** selon la page consultée : un numéro de téléphone camerounais (+237) dans l'en-tête et la bulle WhatsApp, une adresse postale à Paris (France) sur la page Contact, et une adresse à Dakar (Sénégal) avec un numéro sénégalais (+221) dans le pied de page — accompagnées de trois horaires de disponibilité différents (« 8/5 », « 9h-18h », « 24/7 ») et de deux adresses e-mail différentes sans distinction fonctionnelle. Cette incohérence est un défaut **critique de crédibilité** pour un acheteur B2B qui vérifie systématiquement l'identité légale d'un fournisseur avant de s'engager. Cette section **tranche définitivement** ces éléments et impose une architecture qui rend la récidive impossible.

### 10.2 Identité légale figée (valeurs de référence V1)

| Champ | Valeur figée | Notes |
|---|---|---|
| Raison sociale | HardwareCentral | À affiner avec la forme juridique réelle lors de l'immatriculation (ex. « HardwareCentral SARL ») avant mise en production. |
| Pays du siège social | Cameroun | Choix justifié par le marché cible principal (2.1) et la cohérence avec l'indicatif téléphonique et le canal WhatsApp déjà orientés Cameroun dans le prototype initial. |
| Ville du siège / hub logistique | Douala | Capitale économique et portuaire du Cameroun — cohérent avec une activité de distribution de matériel importé. |
| Adresse complète | *(à renseigner avec l'adresse réelle avant mise en production — placeholder structurel : « Zone Industrielle, Bonabéri, Douala, Cameroun »)* | Ne jamais afficher une adresse dans un autre pays que celui déclaré ci-dessus. |
| Téléphone principal | `+237 6XX XXX XXX` *(à remplacer par le numéro réel avant mise en production)* | Un seul numéro principal, utilisé partout (header, footer, page Contact, `tel:` links). |
| WhatsApp Business | Même numéro que le téléphone principal (ou un numéro dédié explicitement documenté comme tel) | Ne jamais utiliser un numéro différent du téléphone affiché sans le justifier visuellement (ex. libellé « WhatsApp Support »). |
| E-mail commercial (devis, ventes) | `sales@hardwarecentral.com` | Utilisé pour : formulaire de demande de devis. |
| E-mail général (contact, support, partenariats) | `contact@hardwarecentral.com` | Utilisé pour : formulaire de contact général, mentions légales. |
| Devise | XAF (Franc CFA) | Utilisée uniquement si un montant est un jour affiché (ex. dans un devis PDF généré côté back-office — hors périmètre front V1). |

### 10.3 Horaires & niveaux de support (référentiel figé — corrige la contradiction « 8/5 vs 9h-18h vs 24/7 »)

Il existe **deux régimes distincts**, qui ne doivent jamais être confondus dans le contenu :

1. **Horaires commerciaux standards** (ventes, devis, contact général) : **Lundi–Vendredi, 8h–18h (heure d'Afrique de l'Ouest, UTC+1)**. C'est l'horaire à afficher par défaut partout (header, footer, page Contact, modal de devis).
2. **Support technique sous contrat** (réservé aux clients ayant souscrit un contrat de support/SLA après achat) : peut être annoncé comme « disponible 24/7 » **uniquement** dans un contexte qui précise explicitement qu'il s'agit d'un service sous contrat, jamais comme horaire général de disponibilité de l'entreprise. En V1 (pas de portail client), **ne pas afficher de mention « 24/7 »** sur les pages publiques tant que ce service n'est pas contractuellement livrable — préférer un langage honnête : « Support technique dédié pour nos clients sous contrat ».

**Règle de rédaction :** toute mention d'horaire ou de délai de réponse dans un composant (bandeau de réassurance, modal, page contact) doit être formulée en cohérence avec le régime 1 par défaut. Le délai de réponse annoncé après soumission d'un formulaire doit être réaliste et unique sur tout le site (ex. « sous 24h ouvrées » — ne pas annoncer « 2 heures » à un endroit et « dans les plus brefs délais » à un autre sans plus de précision).

### 10.4 Implémentation technique obligatoire : fichier de configuration unique

**Règle non négociable :** toute donnée listée en 10.2 et 10.3 doit être définie **une seule fois** dans `src/lib/site-config.ts`, typée, et importée partout où elle est nécessaire. Il est **interdit** de recopier une chaîne de caractères contenant un numéro de téléphone, une adresse e-mail, une adresse postale ou un horaire directement dans un composant.

```ts
// src/lib/site-config.ts
export const SITE_CONFIG = {
  companyName: 'HardwareCentral',
  legalCountry: 'Cameroun',
  headquartersCity: 'Douala',
  address: {
    line1: 'Zone Industrielle, Bonabéri',
    city: 'Douala',
    country: 'Cameroun',
  },
  phone: {
    display: '+237 6XX XXX XXX',
    e164: '+2376XXXXXXXX', // format utilisé pour tel: et wa.me
  },
  whatsapp: {
    numberE164: '2376XXXXXXXX', // sans "+", format attendu par wa.me
    defaultMessage:
      "Bonjour HardwareCentral, je souhaite avoir plus d'informations sur vos équipements et solutions d'infrastructure.",
  },
  email: {
    sales: 'sales@hardwarecentral.com',
    general: 'contact@hardwarecentral.com',
  },
  businessHours: {
    display: 'Lun–Ven, 8h–18h',
    timezone: 'UTC+1 (Afrique de l\'Ouest)',
  },
  currency: 'XAF',
  locale: 'fr-CM',
} as const;
```

Tout composant nécessitant une de ces informations DOIT faire `import { SITE_CONFIG } from '@/lib/site-config'` — un lint personnalisé (ou une revue de code systématique) doit rejeter toute chaîne littérale ressemblant à un numéro de téléphone (regex `/\+?\d[\d\s]{7,}/`) ou une adresse e-mail codée en dur ailleurs que dans ce fichier.

### 10.5 Référentiel des marques (rappel, voir aussi 3.4)

Le référentiel des marques (`src/lib/data/brands.ts`) est également une source unique consommée par : la grille de marques de l'accueil, le méga-menu, la page « Marques », les filtres du catalogue. Il est interdit de maintenir une liste de marques codée séparément dans plusieurs composants (le prototype initial avait 3 listes de marques légèrement différentes — voir ADR-002).

---

## 11. Internationalisation & langue

### 11.1 Décision : langue unique, français, sans exception

**Règle :** V1 est **mono-langue, français**. Aucun texte anglais ne doit apparaître dans l'interface visible **ni dans les métadonnées techniques** :
- L'attribut `<html lang="fr">` est obligatoire sur le layout racine (le prototype initial avait `lang="en"` alors que 100% du contenu était en français — défaut critique d'accessibilité, voir 18.2 et ADR-012).
- Le `<title>` par défaut doit être une valeur de marque réelle, jamais un texte de scaffolding (« My Google AI Studio App » dans le prototype initial — voir ADR-013).
- Toute micro-copie (libellés d'horaires, mentions de copyright en pied de page, placeholders de formulaire) doit être rédigée en français. Le pied de page doit afficher « Tous droits réservés » et non « All rights reserved ».

### 11.2 Architecture pour une internationalisation future (sans l'implémenter en V1)

Bien que la V1 soit mono-langue, structurer le code pour ne pas bloquer une éventuelle extension multilingue V3 :
- Centraliser toutes les chaînes de caractères visibles dans des objets de contenu par page/section plutôt que de les répartir en JSX brut partout, **sans pour autant introduire une bibliothèque i18n complète (ex. next-intl) en V1** — cela ajouterait une complexité non justifiée par le périmètre actuel. Un simple objet de constantes de contenu par page suffit.
- Ne coder aucune logique métier dépendante du texte français (ex. ne jamais faire de `if (label === 'Disponible')` — utiliser des `enum`/valeurs typées comme `badge.type: 'available'` pour la logique, et réserver le texte français à la couche d'affichage uniquement).

### 11.3 Formats régionaux

- Dates : format `JJ/MM/AAAA` ou en toutes lettres (« 25 juillet 2026 »), jamais `MM/DD/YYYY`.
- Nombres/devises : séparateur de milliers = espace insécable (`1 250 000 FCFA`), jamais de virgule au format anglo-saxon.
- Numéros de téléphone affichés au format international avec indicatif Cameroun : `+237 6XX XXX XXX`.

---

## 12. Modèle de données

### 12.1 Principe directeur

**Règle fondamentale :** toute donnée affichée à l'utilisateur (statut, garantie, délai, spécifications) doit provenir de ce modèle. Aucune valeur d'affichage ne doit être codée en dur dans un composant (voir ADR-005 : le prototype initial affichait un badge « Disponible » et une garantie « 3 ans » identiques et statiques sur **toutes** les fiches produits, quelle que soit la donnée réelle sous-jacente — y compris pour des produits marqués « Sur Commande » avec un stock de 0 dans les données).

**Règle de séparation affichage / filtrage :** les spécifications techniques destinées à l'**affichage libre** (`specs`, texte descriptif riche, ordonné, propre à chaque produit) doivent être strictement séparées des attributs destinés au **filtrage/facettage** (`attributes`, structurés, typés, avec un vocabulaire contrôlé). Cette séparation corrige un bug bloquant du prototype initial : le filtre « Format Châssis » lisait une clé `specs.format` (minuscule) alors que la donnée réelle était stockée sous la clé `specs['Format']` (majuscule, texte libre incluant des valeurs comme « 1U Rackmount » qui ne correspondaient à aucune option de filtre) — rendant le filtre **totalement non fonctionnel** en toutes circonstances (voir ADR-014).

### 12.2 Types TypeScript de référence

```ts
// src/types/index.ts
// NB : le type `MediaAsset` (image/PDF avec provenance et checksum) utilisé
// ci-dessous par `Product` et `ProductDatasheet` est défini en section 6.5.9.

/** Identifiants stables, jamais affichés bruts à l'utilisateur */
export type CategoryId =
  | 'server-storage'
  | 'networking'
  | 'security'
  | 'cctv'
  | 'laptop'
  | 'datacenter'
  | 'wireless'
  | 'monitor'
  | 'printers';

export type BrandCode =
  | 'HPE'
  | 'DELL'
  | 'LENOVO'
  | 'CISCO'
  | 'FORTINET'
  | 'HUAWEI'
  | 'HIKVISION';

export type AvailabilityStatus = 'available' | 'limited' | 'on-order' | 'discontinued';

export type ChassisFormat = '1U' | '2U' | '3U' | '4U' | 'Tower' | 'Desktop' | 'Compact';

export interface Category {
  id: CategoryId;
  name: string;               // Nom d'affichage FR, ex: "Serveurs & Stockage"
  icon: string;                // Nom d'icône lucide-react
  isActive: boolean;           // true seulement si productCount > 0 — calculé, jamais codé en dur (voir 3.5)
}

export interface Brand {
  code: BrandCode;
  name: string;                 // Nom d'affichage officiel, ex: "Dell Technologies"
  shortDescription: string;     // Utilisé sur la page Marques
  logoUrl?: string;             // Logo officiel réel si disponible sous licence, sinon fallback typographique
  isActive: boolean;            // true seulement si au moins un produit publié (voir 3.4)
}

/** Disponibilité — SOURCE UNIQUE de vérité sur le statut d'un produit.
 *  Le composant d'affichage dérive son libellé/couleur de badge à partir
 *  de `status`, jamais l'inverse. */
export interface ProductAvailability {
  status: AvailabilityStatus;
  stockQuantity: number;        // 0 si non disponible immédiatement
  leadTimeDays: number;         // Délai avant expédition si stock = 0
}

export interface ProductWarranty {
  durationLabel: string;        // Ex: "3 ans sur site J+1", "Garantie à vie limitée (LLW)"
  supportTier?: 'standard' | 'premium' | 'mission-critical';
}

/** Fiche technique PDF — utilise MediaAsset (voir 6.5.9) plutôt qu'une URL brute,
 *  pour tracer la provenance et éviter les liens morts ("#") du prototype initial. */
export interface ProductDatasheet extends MediaAsset {
  name: string;
  fileSizeLabel: string;        // Ex: "2.4 MB"
}

export interface Product {
  id: string;                   // slug stable, ex: "hpe-proliant-dl380-gen10-plus"
  sku: string;
  name: string;
  brand: BrandCode;
  category: CategoryId;

  /** Image principale + galerie — MediaAsset (voir 6.5.9), chaque fichier étant
   *  rapatrié une fois par le pipeline d'ingestion (6.5) vers le stockage du
   *  projet. Interdiction de réutiliser l'image d'un autre produit ou d'une
   *  autre marque (voir 6.4). */
  primaryImage: MediaAsset;
  gallery: MediaAsset[];

  shortDescription: string;     // Utilisé sur les cartes produit (catalogue, accueil)
  fullDescription: string;      // Utilisé sur la fiche produit

  /** Affichage libre, ordonné, non utilisé pour le filtrage */
  specs: { label: string; value: string }[];

  /** Filtrage/facettage — vocabulaire contrôlé, jamais du texte libre */
  attributes: {
    chassisFormat?: ChassisFormat;
    rackUnits?: number;         // Ex: 2 pour "2U"
    formFactor?: 'rack' | 'tower' | 'desktop' | 'appliance';
  };

  availability: ProductAvailability;
  warranty: ProductWarranty;
  certifications: string[];
  compatibility: string[];
  datasheets: ProductDatasheet[];

  releaseYear?: number;
  weightKg?: number;
  dimensionsCm?: { height: number; width: number; depth: number };

  isFeatured: boolean;          // Contrôle l'apparition en section "Produits récents" de l'accueil
  publishedAt: string;          // ISO date — permet le tri "Nouveautés"
}

/** Article dans la liste de devis — jamais de prix, uniquement une intention */
export interface QuoteListItem {
  productId: string;
  addedAt: string; // ISO date
}

/** Payload de soumission d'une demande de devis (voir 22.1) */
export interface QuoteRequestPayload {
  fullName: string;
  companyName?: string;
  professionalEmail: string;
  phone?: string;
  message: string;
  productIds: string[];         // Peut être vide (devis "libre" sans produit pré-sélectionné)
  honeypot?: string;            // Champ anti-spam — doit rester vide (voir 21.3)
}

/** Payload du formulaire de contact général (voir 22.3) */
export interface ContactMessagePayload {
  firstName: string;
  lastName: string;
  companyName?: string;
  professionalEmail: string;
  subject: 'devis' | 'support-technique' | 'partenariat' | 'autre';
  message: string;
  honeypot?: string;
}

/** Payload d'inscription newsletter (voir 22.4) */
export interface NewsletterSubscriptionPayload {
  email: string;
  honeypot?: string;
}
```

### 12.3 Règles de validation (Zod — appliquées identiquement côté client `react-hook-form` et côté serveur `Route Handler`)

| Champ | Règle |
|---|---|
| `fullName` / `firstName` / `lastName` | Requis, 2–80 caractères, pas de caractères de contrôle. |
| `professionalEmail` | Requis, format e-mail valide (RFC 5322 simplifié). **Ne pas** rejeter les domaines grand public (gmail, etc.) en V1 — trop restrictif pour le marché cible où de nombreuses PME utilisent des adresses Gmail professionnelles ; simple validation de format. |
| `message` | Requis, 10–2000 caractères. |
| `phone` | Optionnel, si renseigné doit correspondre à un format international plausible (regex souple, pas de validation stricte par pays vu la diversité CEMAC). |
| `productIds` | Tableau de slugs existants dans le catalogue (validation croisée côté serveur contre `lib/data/products.ts`). |
| `honeypot` | DOIT être une chaîne vide ; toute valeur non vide entraîne un rejet silencieux (réponse 200 factice, aucun envoi réel — voir 21.3). |

### 12.4 Statuts de disponibilité — mapping affichage (référentiel figé, à ne jamais dupliquer ailleurs)

| `status` | Libellé affiché | Couleur token (voir section 14) |
|---|---|---|
| `available` | Disponible | `success` |
| `limited` | Stock limité | `warning` |
| `on-order` | Sur commande | `graphite` (neutre) |
| `discontinued` | Fin de commercialisation | `danger` |

Ce mapping vit dans une fonction unique `getAvailabilityDisplay(status: AvailabilityStatus)` dans `lib/utils.ts`, importée par `ProductCard` **et** la fiche produit, garantissant que le badge affiché sur la carte produit du catalogue et celui affiché sur la fiche détaillée sont **toujours identiques pour un même produit** (corrige la contradiction du prototype initial où la carte catalogue pouvait afficher « Sur Commande » tandis que la fiche détaillée du même produit affichait « Disponible » en dur).

---

## 13. Cartographie des routes & structure des URLs

### 13.1 Principe

Chaque route doit correspondre à une URL réelle, navigable, partageable, indexable ou volontairement `noindex` (voir 13.3). Corrige un défaut critique du prototype initial : l'intégralité du site tenait sur une seule URL (`/`), la navigation était gérée par un état React en mémoire (`ViewState`), rendant impossible le partage d'un lien direct vers un produit, l'utilisation du bouton « précédent » du navigateur, ou l'indexation par un moteur de recherche (voir ADR-001).

### 13.2 Table des routes

| URL | Page | Indexable | Paramètres |
|---|---|---|---|
| `/` | Accueil | Oui | — |
| `/catalogue` | Catalogue complet | Oui | `?categorie=`, `?marque=`, `?format=`, `?tri=`, `?page=`, `?q=` (recherche intégrée au catalogue — voir 16.3) |
| `/produit/[slug]` | Fiche produit | Oui | `slug` = `id` du produit (ex. `/produit/hpe-proliant-dl380-gen10-plus`) |
| `/marques` | Annuaire des marques | Oui | — |
| `/marques/[brand]` | Fiche marque | Oui | `brand` = code marque en minuscules (ex. `/marques/hpe`) |
| `/recherche` | Résultats de recherche | Non (`noindex`) — contenu dépendant de la requête utilisateur, dupliqué avec `/catalogue?q=` | `?q=` |
| `/devis` | Liste de devis (panier RFQ) | Non (`noindex`) | — |
| `/favoris` | Favoris sauvegardés | Non (`noindex`) | — |
| `/a-propos` | À propos | Oui | — |
| `/contact` | Contact | Oui | — |
| `/mentions-legales` | Mentions légales | Oui | — |
| `/cgv` | Conditions générales de vente | Oui | — |
| `/confidentialite` | Politique de confidentialité | Oui | — |
| `/404` (fallback automatique Next.js) | Page introuvable | Non | — |

**Décision de simplification :** la route `/recherche` réutilise le **même composant de rendu de grille produit et le même moteur de filtrage** que `/catalogue` (voir 9.2 — fonction unique `filterProducts`). Il ne doit pas exister deux implémentations distinctes de la recherche (corrige ADR-007).

### 13.3 Métadonnées par route

Chaque `page.tsx` de route indexable doit exporter (ou générer dynamiquement via `generateMetadata`) au minimum :
- `title` unique et descriptif (gabarit : `"{Nom de la page} | HardwareCentral"`, et pour une fiche produit : `"{Nom produit} – {Marque} | HardwareCentral"`).
- `description` unique de 120 à 160 caractères.
- `openGraph` (title, description, image, type).
- `alternates.canonical`.
- Pour les routes non indexables (`/devis`, `/favoris`, `/recherche`) : `robots: { index: false, follow: true }`.

### 13.4 Slugs produit

Le `id`/`slug` d'un produit est dérivé de la marque + du nom du modèle, en `kebab-case`, sans le SKU technique (trop opaque pour l'utilisateur et pour le SEO). Ex. : `Cisco Catalyst 9300 48-port PoE+` → `cisco-catalyst-9300-48-port-poe`. Le SKU reste affiché comme donnée (`sku`) mais n'entre pas dans l'URL.

---

## 14. Design System (tokens)

### 14.1 Principe

Le système de tokens visuels du prototype initial (palette « graphite » + « teal », typographies Manrope/IBM Plex) constitue une **base de qualité professionnelle à conserver** — c'est l'un des rares aspects du prototype initial jugés solides lors de l'audit. Cette section la formalise, la complète (états manquants, focus, contrastes) et la corrige là où des paires couleur/fond ne respectaient pas WCAG AA.

### 14.2 Palette de couleurs (tokens `@theme`, Tailwind v4 CSS-first)

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

  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
}
```

### 14.3 Table des paires texte/fond validées WCAG 2.2 AA (à utiliser exclusivement)

**Règle impérative :** tout texte doit utiliser une des paires ci-dessous. Il est interdit d'introduire une combinaison texte/fond non listée sans vérifier son ratio de contraste (minimum 4.5:1 pour le texte courant, 3:1 pour le texte large ≥ 24px ou ≥ 18.66px en gras, et 3:1 pour les composants d'interface/icônes significatives).

| Texte | Fond | Usage | Ratio approx. |
|---|---|---|---|
| `graphite-900` | `white` / `graphite-50` | Texte courant sur fond clair | ~13:1 (excellent) |
| `graphite-600` | `white` / `graphite-50` | Texte secondaire sur fond clair | ~5.9:1 (conforme) |
| `white` | `graphite-900` | Texte sur fond sombre (header, footer, hero) | ~13:1 (excellent) |
| `teal-200` | `graphite-900` | Accents/labels sur fond sombre uniquement | ~8:1 (conforme) |
| `white` | `teal-600` | Texte sur bouton primaire | ~5.4:1 (conforme) |
| `teal-600` | `white` / `teal-50` | Liens et texte d'accent sur fond clair | ~5.9:1 (conforme) |
| `success-text` | `success-bg` | Badges de statut positif | conforme (paire pré-calculée du prototype initial, validée) |
| `warning-text` | `warning-bg` | Badges de statut d'alerte | conforme |
| `danger-text` | `danger-bg` | Badges de statut négatif, messages d'erreur | conforme |

**Corrections explicites par rapport au prototype initial (voir ADR-015) :**
- `teal-200` **ne doit jamais** être utilisé comme couleur de texte sur fond blanc/clair (ratio ≈ 2:1, très insuffisant) — usage réservé au fond sombre (`graphite-900`) uniquement, comme listé ci-dessus.
- L'état de survol des liens texte sur fond clair (ex. « Voir tout », liens de filtre) doit utiliser `teal-800` au survol plutôt que `teal-400` (ratio de `teal-400` sur blanc ≈ 3.4:1, insuffisant pour du texte de taille normale). `teal-800` sur blanc offre un contraste conforme tout en gardant une variation visuelle perceptible par rapport à l'état par défaut `teal-600`.
- Les anneaux de focus (`focus:ring-*`, `focus:border-*`) doivent utiliser `teal-600` ou `teal-800` sur fond clair (pas `teal-200`, insuffisant au regard du critère 1.4.11 Non-text Contrast) ; `teal-200` reste approprié comme anneau de focus sur fond sombre (header, modal à fond `graphite-900`).

### 14.4 Typographie

| Rôle | Police | Graisses chargées | Usage |
|---|---|---|---|
| Titres (`h1`–`h4`, `.font-display`) | Manrope | 700, 800 | Titres de section, titres de page. |
| Corps de texte | IBM Plex Sans | 400, 500, 600 | Paragraphes, libellés, boutons. |
| Données techniques (SKU, specs, code) | IBM Plex Mono | 400, 500, 600 | SKU, tableaux de specs, badges de statut, horodatages. |

**Échelle typographique (tokens Tailwind standards, pas de valeurs arbitraires) :**

| Rôle | Taille mobile | Taille desktop |
|---|---|---|
| H1 page | `text-3xl` (30px) | `text-5xl` (48px) |
| H2 section | `text-2xl` (24px) | `text-3xl` (30px) |
| H3 | `text-lg` (18px) | `text-xl` (20px) |
| Corps | `text-sm` (14px) | `text-base` (16px) |
| Légende / méta | `text-xs` (12px) | `text-xs` (12px) |

**Règle d'accessibilité typographique :** ne jamais descendre sous `text-xs` (12px) pour un contenu informatif (le prototype initial utilisait `text-[10px]` pour certains libellés de formulaire — à proscrire, minimum 12px).

### 14.5 Espacement, rayons, ombres

- Échelle d'espacement : utiliser exclusivement l'échelle Tailwind par défaut (multiples de 4px : `1, 1.5, 2, 3, 4, 6, 8, 10, 12, 16...`) — pas de valeurs arbitraires (`p-[13px]` interdit).
- Rayons : `--radius-sm` (6px) pour les éléments denses (badges, boutons secondaires, champs de formulaire), `--radius-md` (8px) pour les cartes, `--radius-lg` (12px) pour les conteneurs de section/modales.
- Ombres : réserver l'ombre portée aux éléments flottants ou interactifs au survol (cartes produit, modales) — pas d'ombre sur des éléments statiques pour préserver une hiérarchie visuelle claire.

### 14.6 Breakpoints (responsive)

| Nom | Largeur | Usage |
|---|---|---|
| `sm` | 640px | Ajustements mineurs mobile large |
| `md` | 768px | Bascule tablette : apparition de la navigation desktop, grilles 2 colonnes |
| `lg` | 1024px | Bascule desktop complète : sidebar filtres catalogue, grilles 3–4 colonnes |
| `xl` | 1280px | Affinage grilles 4+ colonnes, affichage du bloc téléphone dans le header |

**Règle impérative :** toute fonctionnalité disponible en desktop (navigation par catégorie, recherche, liste de devis, favoris) DOIT avoir un équivalent pleinement fonctionnel en mobile — voir 16.2 (corrige l'absence totale de menu de navigation mobile fonctionnel dans le prototype initial).

### 14.7 Mouvement & animation

- Bibliothèque : `motion` (Framer Motion), transitions de page en fondu/translation légère (`opacity` + `y: 10px`, durée 300ms) — conservé du prototype initial.
- **Règle obligatoire (nouvelle, absente du prototype initial) :** toute animation non essentielle (transitions de page, micro-interactions décoratives) doit être désactivée ou réduite à une simple transition d'opacité lorsque `prefers-reduced-motion: reduce` est détecté (voir 18.9). Implémenter un hook `usePrefersReducedMotion()` consommé par les composants animés.
- Les indicateurs de chargement (spinners, squelettes) sont exemptés de cette règle (ils ne sont pas des animations « décoratives » mais fonctionnelles) mais doivent rester sobres.

### 14.8 Iconographie

- Bibliothèque unique : `lucide-react`. Pas de mélange avec d'autres jeux d'icônes (cohérence de trait/poids visuel).
- Taille standard : `w-4 h-4` (16px) en contexte de texte courant, `w-5 h-5` (20px) pour les icônes de navigation/action principales, `w-6 h-6` (24px) pour les icônes de mise en avant (trust badges, page À propos).
- Toute icône **seule** (sans texte adjacent) utilisée comme contrôle interactif doit avoir un `aria-label` explicite (voir 18.5).

---

## 15. Bibliothèque de composants

Pour chaque composant : rôle, props principales, états obligatoires à implémenter, règles spécifiques. Tout composant listé ici doit exister ; aucun ne peut être livré sans la totalité de ses états applicables.

### 15.1 Composants primitifs (`components/ui/`)

#### `Button`
- **Variantes** : `primary` (fond `teal-600`, texte blanc), `secondary` (bordure `graphite-200`, texte `graphite-900`), `ghost` (texte seul, pas de fond), `destructive` (fond `danger-text` — réservé aux actions de suppression, ex. retrait d'un article de la liste de devis).
- **Tailles** : `sm`, `md`, `lg`.
- **États obligatoires** : `default`, `hover` (assombrissement ou éclaircissement contrôlé du token, jamais une couleur hors palette), `focus-visible` (anneau `ring-2 ring-teal-600 ring-offset-2` sur fond clair / `ring-teal-200` sur fond sombre), `active` (`scale-95` conservé du prototype initial, effet tactile agréable), `disabled` (opacité réduite + `cursor-not-allowed`, jamais un simple changement de couleur seul — doit aussi porter l'attribut HTML `disabled`), `loading` (spinner inline + texte d'état, bouton désactivé pendant le chargement).
- **Implémentation** : toujours un élément `<button>` natif (ou `<a>` si navigation), jamais un `<div onClick>` (voir 18.3 — corrige un défaut systémique du prototype initial où cartes produit, catégories, marques et items de méga-menu étaient des `<div>` cliquables non accessibles au clavier).

#### `Input` / `Textarea` / `Select`
- Doivent toujours être associés à un `<label>` via `htmlFor`/`id` (jamais un label visuellement adjacent mais non lié programmatiquement — corrige un défaut présent dans **tous** les formulaires du prototype initial : modal devis, page Contact, newsletter).
- États : `default`, `hover`, `focus` (bordure `teal-600` + léger anneau, jamais uniquement `teal-200` trop peu contrasté), `disabled`, `error` (bordure `danger-border`, texte d'erreur associé via `aria-describedby`, icône d'alerte), `valid` (optionnel, discret).
- `Select` : si un menu déroulant ne propose qu'une seule option réellement sélectionnable, ce n'est pas un `Select` mais un texte statique — ne jamais livrer un `<select>` à option unique non fonctionnelle (corrige le tri catalogue du prototype initial, voir ADR-016).

#### `Badge`
- Variantes liées aux tokens de statut (`success`, `warning`, `danger`, `neutral`) — voir 12.4 pour le mapping des statuts produit.
- Toujours dérivé d'une donnée (`availability.status`), jamais une valeur statique câblée dans le composant parent.

#### `Modal`
- Doit implémenter : piège de focus (le focus clavier reste dans la modale tant qu'elle est ouverte), fermeture via la touche `Échap`, fermeture au clic sur l'overlay, restitution du focus à l'élément déclencheur à la fermeture, `role="dialog"` + `aria-modal="true"` + `aria-labelledby` pointant vers le titre de la modale.
- États internes gérés par formulaire enfant : `idle`, `submitting` (spinner + désactivation des champs), `success`, `error`.

#### `Toast` / bannière de notification
- Nouveau composant (absent du prototype initial, qui utilisait un texte flottant temporaire non accessible pour le retour de recherche). Utilisé pour confirmer une action rapide non bloquante (ex. « Produit ajouté au devis »).
- Doit être annoncé aux technologies d'assistance via une région `aria-live="polite"`.
- Disparition automatique après 4 secondes **et** fermeture manuelle possible (bouton croix), jamais uniquement automatique (un utilisateur lisant lentement doit pouvoir garder l'information affichée).

### 15.2 Layout (`components/layout/`)

#### `Header`
- Structure conservée du prototype initial (barre supérieure : logo, recherche, actions ; barre inférieure : navigation catégories) — bonne hiérarchie visuelle à conserver.
- **Corrections obligatoires** :
  - Le logo est un vrai lien (`<Link href="/">`), pas un `<div onClick>`.
  - La recherche : `<form role="search">` avec `<label>` (peut être visuellement masqué via une classe utilitaire d'accessibilité type `sr-only`, jamais absent du DOM), soumission au clavier (`Enter`) ET via un bouton de soumission visible (icône loupe cliquable, pas seulement décorative).
  - Indicateur du nombre d'articles dans la liste de devis (badge numérique sur l'icône dédiée), mis à jour en temps réel depuis le store Zustand (15.4 / section 7).
  - CTA permanent « Demander un devis » visible dans la barre d'actions (desktop) — c'est le point d'entrée principal vers le formulaire RFQ (corrige ADR-006 : ce CTA n'existait nulle part dans le prototype initial).
  - Numéro de téléphone affiché = lien `tel:` cliquable, issu de `SITE_CONFIG` (10.4).

#### `MegaMenu`
- Ouverture au survol **et** au clic/`Enter` (clavier), fermeture via `Échap` ou clic extérieur.
- Attributs ARIA : le déclencheur porte `aria-haspopup="true"` et `aria-expanded` synchronisé avec l'état d'ouverture ; le panneau porte `role="menu"`, les items `role="menuitem"`.
- Navigation clavier : `Tab` parcourt les items visibles, `Échap` referme et rend le focus au déclencheur.
- **Corrige un défaut critique** : le prototype initial gérait le méga-menu exclusivement via `onMouseEnter`/`onMouseLeave`, le rendant totalement inopérant au clavier et sur écran tactile (mobile/tablette).

#### `MobileNav`
- Composant à part entière (absent du prototype initial), affiché sous 1024px (`lg`) : bouton hamburger dans le header ouvrant un panneau plein écran ou un tiroir latéral listant toutes les catégories actives, le lien Marques, le lien Devis, le lien Favoris, le lien Contact.
- Doit répliquer 100% des capacités de navigation disponibles en desktop (voir 14.6).
- Fermeture automatique après sélection d'un lien, piège de focus tant que le panneau est ouvert (mêmes règles que `Modal`).

#### `Breadcrumb`
- Chaque segment est un vrai lien (`<Link>`) sauf le dernier (page courante, `aria-current="page"`, non cliquable visuellement distinct).
- **Corrige un défaut** : dans le prototype initial, les segments « Accueil » et « Matériels » du fil d'Ariane du catalogue avaient un style visuel cliquable (`hover:text-teal-600 cursor-pointer`) mais aucun gestionnaire d'événement — un piège d'interaction trompeur (« fausse affordance »).
- Balisage recommandé : `<nav aria-label="Fil d'Ariane"><ol>...</ol></nav>` avec microdonnées `BreadcrumbList` (voir section 20).

#### `WhatsAppBubble`
- Bouton flottant persistant, lien `https://wa.me/{SITE_CONFIG.whatsapp.numberE164}?text=...`, `target="_blank" rel="noopener noreferrer"`, `aria-label` explicite.
- Masqué (ou repositionné) lorsque la `Modal` de devis est ouverte, pour éviter un chevauchement z-index et une confusion de focus.

#### `Footer`
- Coordonnées exclusivement issues de `SITE_CONFIG` (10.4).
- Tous les liens mènent à une page réellement implémentée. **Interdiction formelle** de faire pointer un lien de pied de page vers la page 404 comme solution temporaire (corrige un défaut du prototype initial où « Support Client B2B » et « Centre d'aide » redirigeaient intentionnellement vers l'écran d'erreur 404) — si une page n'est pas prête, soit elle n'apparaît pas dans le footer, soit elle affiche un état « Page en préparation » honnête et distinct du 404 générique.

### 15.3 Produit (`components/product/`)

#### `ProductCard`
- Élément racine : `<Link href="/produit/[slug]">` englobant la carte (pas de `<div onClick>`), avec les actions secondaires (favoris, ajout au devis) en boutons `<button>` internes utilisant `event.preventDefault()`/`stopPropagation()` pour ne pas déclencher la navigation du lien parent.
- Contenu : badge de disponibilité (dérivé, voir 12.4), image (toujours `next/image`, dimensions réelles fournies pour éviter tout saut de mise en page), marque, nom, SKU, jusqu'à 4 spécifications clés (`specs`, pas `attributes`), délai de livraison si `stock = 0`.
- Actions : bouton favoris (icône cœur, `aria-pressed` synchronisé à l'état), bouton « Ajouter au devis » (icône + libellé court, change d'état visuellement — voir `QuoteToggleButton` ci-dessous — une fois l'article ajouté).

#### `QuoteToggleButton`
- Nouveau composant partagé entre `ProductCard` et la fiche produit.
- États : `idle` (« Ajouter au devis »), `added` (« Ajouté ✓ », variante visuelle distincte, action de clic devient « Retirer du devis »).
- Déclenche un `Toast` de confirmation (15.1) lors de l'ajout.

#### `ProductGallery`
- Image principale + vignettes cliquables, chaque vignette est un `<button>` avec `aria-label` (« Voir l'image {n} de {nom du produit} ») et état `aria-pressed`/`aria-current` pour l'image active.

#### `ProductSpecsTable`
- Rendu tabulaire sémantique (`<table>` avec `<th scope="row">` pour chaque libellé de spécification) plutôt qu'une simple grille de `<div>` — meilleure sémantique pour les lecteurs d'écran et les extraits enrichis.

#### `ProductAvailabilityBadge`
- Reçoit uniquement `availability: ProductAvailability` en prop, applique le mapping de 12.4. Ne doit **jamais** accepter de libellé ou de couleur en props directement (empêche structurellement toute réintroduction d'une valeur statique).

### 15.4 Catalogue (`components/catalog/`)

#### `CatalogFilters`
- Filtres à cases à cocher (marque) et boutons de sélection unique (catégorie), plus un filtre « Format châssis » utilisant exclusivement `attributes.chassisFormat` (voir 12.1/12.2 — corrige le bug de filtrage du prototype initial).
- Chaque filtre actif reflété dans l'URL (`searchParams`), permettant un lien partageable vers un résultat filtré précis.
- Bouton « Effacer tout » visible uniquement si au moins un filtre est actif.

#### `CatalogSort`
- Options réelles et pertinentes en l'absence de prix : `Nouveautés` (tri sur `publishedAt` décroissant), `Nom (A → Z)`, `Disponibilité` (disponible → stock limité → sur commande). Minimum 2 options fonctionnelles ; ne jamais livrer un tri à option unique (voir 15.1 `Select`).

#### `CatalogPagination`
- Doit calculer le nombre réel de pages à partir de `Math.ceil(totalResults / pageSize)`. **Ne jamais afficher un numéro de page au-delà du nombre réel de pages disponibles** (corrige un défaut critique du prototype initial où une pagination « 1 2 … 8 » statique s'affichait même lorsque le catalogue ne contenait que quelques produits, chaque clic ne faisant que rejouer une animation de chargement sans changer le contenu affiché).
- Si `totalResults <= pageSize`, le composant `CatalogPagination` ne doit **pas être rendu du tout** (pas de pagination visible s'il n'y a qu'une seule page).
- Numéro de page synchronisé avec `?page=` dans l'URL.

#### `EmptyState`
- Composant générique réutilisé pour : aucun résultat de filtre catalogue, aucun résultat de recherche, aucun produit de marque, aucun favori, aucune donnée dans la liste de devis. Prop `variant` + `title` + `description` + `action` (bouton contextuel).

### 15.5 Formulaires (`components/forms/`)

#### `QuoteRequestForm`
- Champs : nom complet*, société, e-mail professionnel*, téléphone, message*, liste des produits pré-remplie et modifiable (retrait possible) depuis la liste de devis courante.
- Peut être invoqué (a) depuis le header (liste vide, ajout manuel de contexte), (b) depuis une fiche produit (pré-rempli avec ce produit), (c) depuis la page `/devis` (pré-rempli avec tous les articles de la liste).
- États : `idle`, `submitting`, `success` (message de confirmation + délai de réponse cohérent avec 10.3), `error` (message explicite, ne jamais faire disparaître les données saisies par l'utilisateur en cas d'échec réseau).
- Soumission réelle vers `POST /api/quote-requests` (voir 22.1) — **interdiction absolue** de simuler la soumission avec un simple `setTimeout` sans appel réseau réel (corrige le défaut le plus critique identifié dans le prototype initial : ce formulaire existait entièrement dans le code — champs, validation, états de succès/erreur, spinner — mais n'était déclenché par **aucun bouton nulle part dans l'interface**, le rendant totalement inatteignable par un utilisateur, en plus de ne rien transmettre réellement).

#### `ContactForm`
- Mêmes exigences de soumission réelle (voir 22.3). Champ « Sujet » avec options réellement différenciées (dont « Demande de devis », qui doit rediriger en interne vers la même logique que `QuoteRequestForm` ou, a minima, être routée au même e-mail `sales@`).

#### `NewsletterForm`
- Soumission réelle vers un fournisseur d'e-mailing (voir 22.4), jamais un simple `preventDefault()` sans action.

---

## 16. Règles UX transverses

### 16.1 Principe directeur : aucune fausse affordance

Aucun élément d'interface ne doit visuellement suggérer une interactivité (curseur pointer, couleur de lien, effet de survol) sans comporter une action réelle et complète associée. Chaque fois qu'un composant est construit, l'agent doit se poser la question : « si un utilisateur clique ici, que se passe-t-il concrètement ? » Une réponse « rien » ou « une animation sans effet » est un défaut bloquant.

### 16.2 Navigation mobile

- Sous 1024px, la navigation par catégories bascule automatiquement vers `MobileNav` (15.2), accessible via un bouton hamburger explicite dans le header, toujours visible.
- Toutes les actions disponibles en desktop (recherche, devis, favoris, contact) restent accessibles en mobile, soit dans la barre d'action mobile du header, soit dans le panneau `MobileNav`.
- Cible tactile minimale : 44×44px pour tout élément interactif (boutons, liens, cases à cocher) — conforme au critère WCAG 2.2 2.5.8 (Target Size Minimum).

### 16.3 Recherche

- Un seul moteur de filtrage/recherche (`filterProducts`, voir 9.2), utilisé identiquement par `/catalogue?q=` et `/recherche`.
- La recherche porte sur : nom du produit, SKU, marque, description courte.
- Retour utilisateur immédiat : nombre de résultats affiché en permanence au-dessus de la grille (« {n} produit(s) trouvé(s) »), jamais un texte flottant temporaire qui disparaît après 2 secondes indépendamment du résultat réel (corrige le comportement du champ de recherche du header dans le prototype initial, qui affichait « Recherche… » pendant 2 secondes fixes sans lien avec l'état réel de la requête).

### 16.4 Liste de devis (comportement détaillé)

1. Depuis n'importe quelle `ProductCard` ou fiche produit, l'utilisateur clique sur « Ajouter au devis ».
2. Le produit est ajouté au store Zustand persistant (`localStorage`), un `Toast` confirme l'action, le compteur du header s'incrémente immédiatement (mise à jour optimiste, sans rechargement de page).
3. L'utilisateur peut consulter `/devis` à tout moment : liste des produits sélectionnés (miniature, nom, marque, bouton de retrait), CTA « Demander un devis pour ces {n} articles » ouvrant `QuoteRequestForm` pré-rempli.
4. Après soumission réussie, la liste de devis est vidée automatiquement (l'intention a été transmise), avec un message de confirmation explicite affichant le prochain contact attendu (cohérent avec 10.3).

### 16.5 Favoris (comportement détaillé)

- Fonctionnellement indépendant de la liste de devis (un produit peut être en favoris sans être dans une demande de devis, et inversement).
- Persisté réellement en `localStorage` via le store Zustand dédié — **jamais** en `useState` volatile réinitialisé au rafraîchissement de la page. Corrige un défaut du prototype initial où l'interface affichait explicitement le texte « Ces produits sont sauvegardés localement dans votre navigateur », alors que l'implémentation réelle ne persistait rien (`useState<string[]>([])` en mémoire, perdu au moindre rafraîchissement) — un cas de mensonge fonctionnel de l'interface envers l'utilisateur, à proscrire absolument (voir ADR-008).
- Aucune mention d'un « compte professionnel » à créer pour sauvegarder les favoris tant que cette fonctionnalité n'existe pas réellement (voir 5.1) — le texte d'accompagnement de la page Favoris doit se limiter à expliquer que la sélection est conservée sur cet appareil/navigateur.

### 16.6 États de chargement, de succès et d'erreur (règle transverse)

Tout composant asynchrone (soumission de formulaire, changement de filtre déclenchant un rechargement de données) doit gérer explicitement 4 états : `idle`, `loading`, `success`, `error`. Un état `loading` ne doit jamais durer plus longtemps que le temps de traitement réel (pas de délai artificiel ajouté à des fins de « perception de travail » — cette pratique doit rester l'exception, justifiée uniquement par un besoin réel de laisser le temps à une transition visuelle de se terminer, jamais pour simuler un traitement qui n'existe pas).

### 16.7 Affichage honnête des catégories/marques sans produit

Si une catégorie ou une marque doit être mentionnée avant d'avoir des produits publiés (ex. communication anticipée sur un partenariat Lenovo à venir), elle doit porter un badge explicite « Bientôt disponible » et ne jamais être cliquable vers une page vide sans contexte. Elle ne doit **jamais** apparaître dans les filtres actifs du catalogue tant qu'aucun produit n'y est rattaché (voir 3.4, 3.5).

### 16.8 Cohérence des CTA

Toutes les variantes de bouton d'action principale (« Demander un devis », « Ajouter au devis », « Découvrir le catalogue ») utilisent la variante `primary` du composant `Button` (14.2/15.1) de façon strictement identique sur l'ensemble du site — un seul niveau de CTA primaire visible à l'écran à la fois par section, pour préserver la hiérarchie d'action.

---

## 17. Parcours utilisateurs clés (user flows)

### 17.1 Parcours principal : découverte → devis (objectif de conversion primaire)

1. **Entrée** : l'utilisateur arrive sur l'accueil (`/`) via recherche organique, réseau social ou lien direct.
2. Il explore une catégorie active (`CategoryGrid` → `/catalogue?categorie=...`) ou effectue une recherche directe.
3. Il applique des filtres (marque, format châssis) — l'URL se met à jour, le résultat est partageable.
4. Il ouvre une fiche produit (`/produit/[slug]`), consulte les spécifications, le statut de disponibilité réel, télécharge une fiche technique.
5. Il clique « Ajouter au devis » — confirmation immédiate (`Toast`), compteur du header mis à jour.
6. Il répète l'étape 4–5 pour 2 à 3 produits complémentaires (ex. serveur + switch + pare-feu pour un projet d'infrastructure).
7. Il consulte `/devis`, vérifie sa sélection, clique « Demander un devis pour ces 3 articles ».
8. Il remplit `QuoteRequestForm` (nom, société, e-mail pro, téléphone, message libre) et soumet.
9. **Sortie réussie** : confirmation visuelle claire + e-mail de confirmation automatique à l'utilisateur + notification interne réelle (voir 22.1) à l'équipe commerciale sous le délai annoncé en 10.3.

### 17.2 Parcours secondaire : contact direct à faible friction (WhatsApp)

1. L'utilisateur, sur mobile, hésite face à un formulaire complet.
2. Il clique sur la bulle WhatsApp flottante, toujours visible.
3. Il est redirigé vers l'application WhatsApp avec un message pré-rempli vers un **numéro réel et fonctionnel**.
4. Échange direct avec l'équipe commerciale, hors plateforme (aucune trace nécessaire côté site, ce canal est volontairement informel).

### 17.3 Parcours de vérification de crédibilité (Persona 3 — Décideur)

1. Avant de valider un budget, le décideur consulte `/a-propos`.
2. Il vérifie la cohérence entre les chiffres clés affichés (nombre de clients, ancienneté, marques partenaires) et les marques réellement présentes dans le catalogue.
3. Il consulte `/contact` pour vérifier l'existence d'une adresse physique et d'un numéro de téléphone cohérents avec les autres pages du site (header, footer) — **une seule et même identité partout** (voir section 10).
4. Il consulte éventuellement `/mentions-legales` pour la raison sociale et les informations d'immatriculation.

### 17.4 Parcours d'échec géré (produit indisponible)

1. L'utilisateur ouvre une fiche produit avec `availability.status === 'discontinued'` ou `'on-order'` avec un `leadTimeDays` élevé.
2. Le badge de disponibilité reflète honnêtement ce statut (pas de badge « Disponible » optimiste par défaut — voir 12.4).
3. Le CTA « Ajouter au devis » reste disponible (un client peut vouloir un devis même pour un produit sur commande à délai long — c'est une donnée business normale, pas un blocage), mais le délai de livraison réel est visible à proximité immédiate du CTA pour fixer les attentes.

### 17.5 Parcours d'erreur de navigation (404)

1. L'utilisateur suit un lien externe obsolète ou fait une faute de frappe d'URL.
2. Next.js affiche `not-found.tsx` : message clair, lien de retour vers l'accueil, barre de recherche, suggestions de catégories actives.
3. Cette page n'est **jamais** une destination intentionnelle pour un lien interne du site (voir 15.2 `Footer`, 25.4).

---

## 18. Accessibilité (WCAG 2.2 niveau AA)

### 18.1 Portée

La conformité WCAG 2.2 AA est un critère d'acceptation **non négociable** pour toute fonctionnalité livrée, pas une passe d'optimisation a posteriori. `eslint-plugin-jsx-a11y` doit être actif en CI et bloquer la fusion en cas de violation (voir 24.5).

### 18.2 Langue et structure du document

- `<html lang="fr">` sur le layout racine (voir 11.1).
- Un seul `<h1>` par page, hiérarchie de titres sans saut de niveau (`h1` → `h2` → `h3`, jamais `h1` → `h3` directement).
- Landmarks sémantiques : `<header>`, `<nav>`, `<main>`, `<footer>`, `<aside>` (sidebar de filtres catalogue) utilisés correctement, un seul `<main>` par page.
- Lien d'évitement (« Aller au contenu principal ») en tout premier élément focusable de `<body>`, visible au focus clavier.

### 18.3 Opérabilité au clavier

- **Règle systémique** (corrige le défaut le plus répandu du prototype initial) : tout élément déclenchant une action DOIT être un `<button>`, un `<a href>` ou porter `role` + `tabindex="0"` + gestionnaires `onKeyDown` (Entrée/Espace) s'il ne peut structurellement pas être un élément natif. Le prototype initial utilisait systématiquement des `<div onClick>` pour les cartes produit, les cartes catégorie, les logos de marque, les items de méga-menu et les segments de fil d'Ariane — aucun de ces éléments n'était accessible au clavier (pas de focus, pas d'activation via Entrée).
- Ordre de tabulation logique, cohérent avec l'ordre visuel.
- Aucun piège de focus involontaire (hors `Modal`/`MobileNav`, où le piège est intentionnel et documenté en 15.1/15.2).
- Indicateur de focus visible (`:focus-visible`) sur 100% des éléments interactifs, avec un contraste conforme (voir 14.3) — ne jamais utiliser `outline: none` sans remplacement visuel équivalent.

### 18.4 Formulaires

- Association `label`/`input` systématique via `htmlFor`/`id` (voir 15.1 — corrige un défaut présent dans les 3 formulaires du prototype initial : modal devis, page Contact, newsletter).
- Champs obligatoires marqués visuellement (`*`) **et** via `aria-required="true"`.
- Messages d'erreur associés au champ concerné via `aria-describedby`, annoncés via `aria-live="polite"` au niveau du conteneur de formulaire.
- Aucune information transmise uniquement par la couleur (ex. bordure rouge seule) — toujours accompagnée d'un texte ou d'une icône avec alternative textuelle.

### 18.5 Contenu non textuel

- Toute image de produit porte un `alt` descriptif et spécifique (« HPE ProLiant DL380 Gen10 Plus — vue de face », pas seulement le nom brut répété mécaniquement quand plusieurs vignettes sont présentes).
- Les images strictement décoratives (fond du hero) portent `alt=""` et/ou sont posées en `background-image` CSS (hors de l'arbre d'accessibilité).
- Toute icône seule utilisée comme contrôle (bouton favoris, bouton fermeture modale, bulle WhatsApp) porte un `aria-label` explicite en français.

### 18.6 Contraste

- Voir table 14.3, seules ces paires sont autorisées. Toute nouvelle paire doit être vérifiée (outil recommandé : contrôle de contraste automatisé intégré aux tests visuels, voir 24.4).

### 18.7 Menus complexes (méga-menu, modales)

- Voir 15.2 (`MegaMenu`) : `aria-haspopup`, `aria-expanded`, `role="menu"`/`role="menuitem"`, opérable au clic et au clavier.
- Voir 15.1 (`Modal`) : `role="dialog"`, `aria-modal="true"`, piège de focus, fermeture `Échap`.

### 18.8 Cible tactile et espacement

- Taille minimale 44×44px pour toute cible interactive (WCAG 2.2 — 2.5.8), y compris les boutons de fermeture de modale, les vignettes de galerie, les cases à cocher de filtre (zone cliquable étendue au-delà du carré visuel de 16px si nécessaire, via padding sur le `<label>` englobant).

### 18.9 Mouvement et préférences utilisateur

- Respect de `prefers-reduced-motion` (voir 14.7).
- Aucun contenu clignotant plus de 3 fois par seconde.
- Les carrousels/animations automatiques (s'il devait y en avoir en évolution future) doivent être pausables.

### 18.10 Tests d'accessibilité obligatoires avant livraison

- Navigation complète au clavier (Tab/Shift+Tab/Entrée/Échap/flèches où pertinent) sur chaque nouvelle page.
- Test avec un lecteur d'écran (NVDA ou VoiceOver au minimum en test manuel ponctuel) sur les parcours critiques (17.1).
- Audit automatisé (axe-core intégré aux tests Playwright, voir 24.4) sans violation de niveau `critical` ou `serious`.

---

## 19. Performance & Core Web Vitals

### 19.1 Objectifs chiffrés (mesurés en conditions réseau 4G simulées, mobile)

| Métrique | Cible |
|---|---|
| LCP (Largest Contentful Paint) | < 2.5s |
| INP (Interaction to Next Paint) | < 200ms |
| CLS (Cumulative Layout Shift) | < 0.1 |
| TTFB (Time to First Byte) | < 600ms (favorisé par le rendu SSG/ISR, voir 6.2) |
| Poids JS initial (route accueil) | < 200 Ko compressé |

### 19.2 Images

- Toutes les images passent par `next/image` : dimensionnement explicite (`width`/`height` ou `fill` avec conteneur dimensionné) pour éliminer tout CLS lié aux images.
- Formats modernes servis automatiquement (AVIF/WebP avec fallback).
- L'image principale de la fiche produit et l'image du hero sont chargées en priorité (`priority` prop) ; toute image sous la ligne de flottaison est chargée en `lazy` par défaut.
- **Interdiction de hotlink en runtime** vers une source externe (banque d'images génériques type Unsplash, mais aussi Amazon ou Icecat) pour servir une image de produit à un visiteur — voir 6.4 et 6.5. Toute image de produit provient exclusivement du stockage propre au projet (6.5.4), alimenté hors ligne par le pipeline d'ingestion (6.5.1), jamais chargée en direct depuis un domaine tiers au moment de la requête. Les banques d'images génériques restent utilisables uniquement pour de l'imagerie purement illustrative/éditoriale (ex. fond du hero), jamais pour représenter un SKU précis.

### 19.3 Chargement des polices

- `font-display: swap` (déjà en place dans le prototype initial, à conserver) pour éviter un texte invisible pendant le chargement des polices Google Fonts.
- Envisager l'auto-hébergement des polices (`next/font`) plutôt qu'un `@import` vers Google Fonts en runtime, pour réduire une dépendance réseau externe bloquante et améliorer le TTFB perçu — recommandé mais non bloquant en V1.

### 19.4 Découpage du code

- Découpage automatique par route (natif Next.js App Router).
- Les bibliothèques lourdes non nécessaires au rendu initial (ex. logique de formulaire complexe `react-hook-form` + `zod` des modales) sont chargées dans des Client Components isolés, jamais importées dans un Server Component parent qui gonflerait le bundle initial partagé.

### 19.5 Budget de dépendances

- Voir 7.2 : aucune dépendance non utilisée ne doit rester dans `package.json` (corrige la présence de `@google/genai`, `express`, `dotenv` totalement inutilisés dans le prototype initial, qui alourdissaient l'installation et le graphe de dépendances sans aucune fonctionnalité associée).

---

## 20. SEO technique & on-page

### 20.1 Fondations techniques

- `sitemap.xml` généré dynamiquement (`app/sitemap.ts`) incluant toutes les routes indexables de 13.2, régénéré à chaque build/déploiement pour refléter le catalogue courant.
- `robots.txt` généré (`app/robots.ts`) autorisant l'indexation des routes publiques, excluant `/devis`, `/favoris`, `/recherche` (voir 13.2/13.3).
- URL canoniques sur chaque page (`alternates.canonical`).
- Pas de contenu dupliqué : `/recherche` en `noindex` évite la concurrence avec `/catalogue?q=` pour les mêmes requêtes (voir 13.2).

### 20.2 Métadonnées par page

Voir gabarits en 13.3. Règle complémentaire : le `<title>` par défaut du site (balise de fallback) doit être `"HardwareCentral — Équipements IT professionnels pour l'Afrique Centrale"`, jamais un texte de scaffolding technique (corrige ADR-013 : le prototype initial affichait littéralement « My Google AI Studio App » comme titre d'onglet sur 100% des pages).

### 20.3 Données structurées (JSON-LD)

- **Organisation** (`Organization`) sur le layout racine : nom, logo, adresse, coordonnées — issues de `SITE_CONFIG` (10.4), donc automatiquement cohérentes partout.
- **Produit** (`Product`) sur chaque fiche produit : nom, marque, image, description, SKU, disponibilité (`schema:ItemAvailability` mappé depuis `availability.status`). **Ne pas inclure de bloc `offers`/prix** tant qu'aucun prix public n'existe (voir 3.1) — un balisage `Product` sans `offers` reste valide et utile pour l'indexation, il ne faut pas inventer un prix fictif pour satisfaire le schéma.
- **Fil d'Ariane** (`BreadcrumbList`) sur toutes les pages profondes, reflétant exactement la structure de navigation visible (voir 15.2 `Breadcrumb`).
- **FAQPage** (optionnel V2) si une section FAQ est ajoutée à l'avenir.

### 20.4 SEO on-page

- Un seul `<h1>` par page, contenant le mot-clé principal de la page (nom du produit, nom de la catégorie, etc.) — voir 18.2.
- Textes alternatifs d'image descriptifs (voir 18.5) : bénéfice double accessibilité + indexation Google Images.
- Contenu unique par fiche produit (`fullDescription` rédigée spécifiquement, jamais un paragraphe générique dupliqué entre plusieurs produits similaires).
- Maillage interne : chaque fiche produit doit lier vers sa page marque (`/marques/[brand]`) et sa catégorie (`/catalogue?categorie=...`) ; chaque page marque liste ses produits ; la page d'accueil lie vers les catégories et marques actives.

### 20.5 Performance comme facteur SEO

Les objectifs de la section 19 (Core Web Vitals) sont directement des facteurs de classement Google — à traiter comme des exigences SEO autant que des exigences UX.

---

## 21. Sécurité

### 21.1 Principes généraux

- Validation systématique **côté serveur** de toute donnée reçue via un Route Handler, même si elle a déjà été validée côté client (`react-hook-form` + `zod`) — la validation client est un confort UX, jamais une garantie de sécurité (voir schémas partagés en 12.3).
- Aucune clé secrète (API d'e-mailing, webhook CRM) n'est exposée au bundle client — variables préfixées `NEXT_PUBLIC_` réservées aux valeurs réellement publiques (ex. aucune en l'occurrence pour les secrets listés en 22).
- `.env.example` tenu à jour avec toutes les variables nécessaires (nom seulement, jamais de valeur réelle), `.env.local` jamais commité (`.gitignore`, pattern déjà présent dans le prototype initial à conserver).

### 21.2 En-têtes de sécurité HTTP

- `Content-Security-Policy` restrictive (scripts/styles/images autorisés listés explicitement).
- `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` limitant les API navigateur non utilisées (géolocalisation, caméra, micro — aucune n'est nécessaire ici).
- HTTPS forcé en production (géré nativement par la plateforme de déploiement, voir 7.1).

### 21.3 Anti-spam sur les formulaires publics

Les trois formulaires publics (`QuoteRequestForm`, `ContactForm`, `NewsletterForm`) doivent implémenter :
1. **Honeypot** : un champ caché (`display:none`, absent visuellement et de l'ordre de tabulation via `tabIndex={-1}` + `aria-hidden="true"`) que seuls les robots remplissent ; toute valeur non vide entraîne un rejet silencieux (réponse HTTP 200 sans traitement réel, pour ne pas révéler la logique anti-bot à un attaquant).
2. **Rate limiting** côté Route Handler (ex. `@upstash/ratelimit` ou équivalent) : maximum raisonnable de soumissions par adresse IP sur une fenêtre glissante (ex. 5 soumissions / 10 minutes), retour HTTP 429 explicite au-delà.
3. Validation stricte des schémas Zod (12.3) rejetant tout payload malformé avant tout traitement métier.

### 21.4 Gestion des dépendances

- Audit de sécurité automatisé intégré à la CI (voir 24.5), bloquant en cas de vulnérabilité de sévérité haute/critique sans correctif disponible évalué manuellement.
- Mise à jour régulière des dépendances (cadence mensuelle minimum pour les correctifs de sécurité).

### 21.5 Données personnelles

- Les données collectées via les formulaires (nom, e-mail, téléphone, société) sont des données personnelles au sens des réglementations applicables — la politique de confidentialité (`/confidentialite`) doit décrire précisément : finalité de la collecte, durée de conservation, destinataires (équipe commerciale interne, éventuel CRM tiers), droits d'accès/rectification/suppression, et un contact dédié (`SITE_CONFIG.email.general`).
- Pas de tracker publicitaire tiers superflu ; si un outil d'analyse d'audience est ajouté, il doit être mentionné dans la politique de confidentialité et respecter les préférences de consentement si applicable dans les pays de la zone CEMAC ciblée.

---

## 22. Contrat API / Backend

### 22.0 Fournisseur retenu : Brevo (unique, pour le transactionnel et la newsletter)

**Décision (voir ADR-021) :** les trois endpoints ci-dessous utilisent un **fournisseur unique, Brevo**, pour l'envoi d'e-mail transactionnel (22.1, 22.2) *et* la gestion de newsletter (22.3) — plutôt que deux fournisseurs séparés (ex. Resend + Mailchimp). Le plan gratuit de Brevo (300 e-mails/jour partagés entre transactionnel et campagnes, contacts illimités, API + SMTP, sans carte bancaire) couvre largement le volume attendu au lancement, et évite de dupliquer l'intégration (une seule clé API, un seul client dans `lib/email/`). Point de vigilance à surveiller si le volume grandit : le quota de 300/jour est **partagé** entre les trois endpoints — si l'usage dépasse ce seuil, migrer vers un plan payant Brevo plutôt que de réintroduire un second fournisseur.

### 22.1 `POST /api/quote-requests`

- **Payload** : `QuoteRequestPayload` (voir 12.2), validé par le schéma Zod correspondant (12.3).
- **Traitement** :
  1. Rejet si honeypot rempli (21.3) ou rate limit dépassé.
  2. Validation des `productIds` contre le catalogue réel (`lib/data/products.ts`) — retirer silencieusement tout ID invalide plutôt que de rejeter toute la requête.
  3. Envoi d'un e-mail transactionnel (via l'API Brevo) de notification à `SITE_CONFIG.email.sales`, contenant l'intégralité des informations du lead et la liste des produits demandés (nom, SKU, lien direct vers la fiche produit).
  4. Envoi d'un e-mail de confirmation automatique (via Brevo) à `professionalEmail` (accusé de réception, cohérent avec le délai annoncé en 10.3).
  5. (Optionnel V1, recommandé) : webhook vers un outil de gestion de leads/CRM si l'entreprise en utilise un — à définir lors de l'implémentation, structure de payload générique JSON déjà compatible de par le typage `QuoteRequestPayload`.
- **Réponse** : `200 { success: true }` en cas de succès ; `400` si validation échouée (détail des erreurs par champ) ; `429` si rate limit dépassé ; `500` en cas d'échec d'envoi (avec journalisation serveur pour investigation, message générique côté client pour ne pas exposer de détail d'implémentation).

### 22.2 `POST /api/contact-messages`

- **Payload** : `ContactMessagePayload` (12.2).
- **Traitement** : identique dans l'esprit à 22.1 (validation, anti-spam, e-mail transactionnel via Brevo vers `SITE_CONFIG.email.general`, accusé de réception à l'expéditeur). Le champ `subject === 'devis'` doit être routé également vers `SITE_CONFIG.email.sales` en copie.

### 22.3 `POST /api/newsletter`

- **Payload** : `NewsletterSubscriptionPayload` (12.2).
- **Traitement** : validation anti-spam identique, appel à l'API Brevo (endpoint contacts) pour ajouter l'adresse à la liste de diffusion, gestion d'un cas de doublon (adresse déjà inscrite) avec un message neutre (« Vous êtes déjà inscrit ») plutôt qu'une erreur technique brute.
- **Réponse** : `200 { success: true }`, `409` si déjà inscrit (message géré côté UI comme un cas non bloquant, pas une erreur rouge alarmante), `400`/`429`/`500` comme ci-dessus.

### 22.4 Non-objectif de cette section

Cette spécification décrit le **contrat** attendu (entrée/sortie, effets de bord) au-delà du choix de fournisseur déjà tranché en 22.0. Si Brevo devait un jour être remplacé (ex. dépassement durable du plan gratuit sans budget dédié), le contrat ci-dessus reste inchangé — seul `lib/email/` est à réécrire, sans impact sur les Route Handlers ni les schémas Zod.

---

## 23. Gestion d'état applicatif

### 23.1 Principe : l'URL comme source de vérité pour l'état partageable

Tout état qui a une valeur pour un utilisateur tiers à qui l'on partagerait un lien (filtres catalogue, page de pagination, requête de recherche) doit être reflété dans les `searchParams` de l'URL, jamais uniquement dans un état React local. Ceci corrige l'absence totale de routing du prototype initial (voir 6.1/13.1) et découle directement du choix d'architecture Next.js.

### 23.2 État global client (liste de devis, favoris)

- Géré via deux stores Zustand indépendants (`quote-store.ts`, `favorites-store.ts`), chacun avec le middleware `persist` ciblant `localStorage`, sous des clés distinctes (`hc_quote_list`, `hc_favorites`) versionnées (inclure un champ `version` dans le state persisté pour permettre une migration de schéma future sans casser les données existantes des utilisateurs).
- Ces stores sont des Client Components consommateurs (`'use client'`), jamais accédés depuis un Server Component.
- Hydratation : gérer explicitement l'état de chargement initial (`hasHydrated`) pour éviter un flash de contenu incohérent entre le rendu serveur (sans connaissance du `localStorage`) et le rendu client (voir pattern standard Zustand + Next.js SSR).

### 23.3 État de formulaire

- `react-hook-form` pour chaque formulaire (15.5), état local au composant, jamais remonté inutilement dans un store global.

### 23.4 Ce qui ne doit PAS être un état global

- Le contenu du catalogue (produits, catégories, marques) : ce sont des données, pas un état — elles sont chargées via les mécanismes de rendu serveur de Next.js (6.2), pas via un store client dupliquant `lib/data/products.ts`.

---

## 24. Qualité de code, tests & CI

### 24.1 Linting et formatage

- ESLint (config Next.js officielle + `eslint-plugin-jsx-a11y` obligatoire, voir 18.1) exécuté en pré-commit (hook) et en CI, bloquant.
- Prettier pour le formatage automatique, configuration partagée versionnée (`.prettierrc`), pas de débat de style laissé à l'appréciation individuelle.
- TypeScript en mode `strict`, `tsc --noEmit` bloquant en CI (le script `lint` du prototype initial faisait déjà cela — bonne pratique à conserver et étendre avec ESLint).

### 24.2 Tests unitaires

- Couverture obligatoire minimum sur toute logique pure critique : `filterProducts`, `getAvailabilityDisplay`, fonctions de validation Zod, fonctions de formatage (dates, devises).
- Outil : Vitest.

### 24.3 Tests de composants

- React Testing Library pour les composants à logique conditionnelle significative : `CatalogFilters`, `CatalogPagination` (vérifier qu'elle ne s'affiche pas si une seule page — voir 15.4), `QuoteToggleButton`, formulaires (validation, états d'erreur).

### 24.4 Tests end-to-end

- Playwright, couvrant au minimum les parcours de la section 17 :
  - Parcours 17.1 complet (recherche → filtre → fiche produit → ajout devis → soumission formulaire → confirmation), avec vérification qu'un appel réseau réel est déclenché vers `/api/quote-requests` (pas seulement un changement d'état visuel).
  - Navigation clavier complète sur le méga-menu et une modale.
  - Audit `axe-core` intégré sur les pages principales (accueil, catalogue, fiche produit, contact) sans violation `critical`/`serious` (voir 18.10).
  - Vérification de non-régression visuelle des contrastes (voir 14.3) sur les composants de statut (`Badge`).

### 24.5 Intégration continue (CI)

Pipeline bloquant avant toute fusion sur la branche principale :
1. Installation des dépendances (avec vérification de checksum/lockfile).
2. `tsc --noEmit`.
3. ESLint (incluant `jsx-a11y`).
4. Tests unitaires + composants (Vitest).
5. Build de production (`next build`) — doit réussir sans avertissement critique.
6. Tests end-to-end (Playwright) sur un environnement de prévisualisation.
7. Audit de sécurité des dépendances (voir 21.4).

### 24.6 Revue de code

- Aucune fusion directe sans revue (voir 9.3).
- Checklist de revue minimale : conformité à la section 26 (Definition of Done), absence de valeur codée en dur relevant de `SITE_CONFIG` (10.4), absence de nouvel élément interactif non accessible au clavier (18.3), absence de nouvelle dépendance non justifiée (7.3).

---

## 25. Gestion des erreurs & états limites

### 25.1 Erreurs réseau (formulaires, chargement de données)

- Tout appel réseau échoué doit afficher un message d'erreur explicite et actionnable (« La demande n'a pas pu être envoyée, veuillez réessayer ou nous contacter directement via WhatsApp » avec lien direct), jamais un échec silencieux ni une fausse confirmation de succès (voir ADR-006).
- Les données saisies par l'utilisateur dans un formulaire ne doivent jamais être perdues suite à une erreur réseau (pas de réinitialisation du formulaire sur échec).

### 25.2 Erreurs de rendu (React Error Boundaries)

- Un `error.tsx` (Next.js) au niveau racine et au niveau de chaque segment de route à risque (ex. fiche produit) capture les erreurs de rendu inattendues, affiche un message générique convivial + bouton de rechargement, sans exposer de trace technique à l'utilisateur final (la trace est journalisée côté serveur).

### 25.3 Produit introuvable

- Si un `slug` de produit dans l'URL ne correspond à aucun produit du catalogue, `app/produit/[slug]/not-found.tsx` s'affiche (statut HTTP 404 réel, pas un simple message conditionnel sur une page 200 — corrige un pattern fragile du prototype initial où un produit introuvable affichait un message d'erreur sur la même route sans changer le statut HTTP, ce qui est incorrect pour le SEO et les outils de monitoring).

### 25.4 Page 404 générique

- Doit uniquement être atteinte via une véritable erreur de navigation (URL invalide/obsolète), jamais utilisée comme destination temporaire pour une fonctionnalité non implémentée (voir 15.2 `Footer`, ADR-011). Si une page n'est pas prête, elle ne doit tout simplement pas être liée depuis le reste du site.

### 25.5 États vides

- Voir `EmptyState` (15.4) — chaque liste potentiellement vide (résultats de recherche, résultats de filtre, produits d'une marque, favoris, liste de devis) a un état vide dédié, avec un message contextuel et une action de sortie claire (jamais un espace blanc silencieux).

---

## 26. Checklist de non-régression (Definition of Done)

Cette checklist est dérivée **directement** des défauts constatés lors de l'audit du prototype initial. Aucune fonctionnalité ne doit être considérée « terminée » tant que chaque point applicable n'est pas vérifié.

### 26.1 Fonctionnel
- [ ] Chaque élément visuellement cliquable (curseur pointer, effet hover) déclenche une action réelle et complète (voir 16.1).
- [ ] Chaque formulaire soumet réellement ses données à un endpoint réel (`/api/*`) et gère les 4 états `idle/submitting/success/error` (voir 16.6).
- [ ] Chaque contrôle de tri/filtre propose au moins 2 options réellement différenciantes, ou n'est pas affiché (voir 15.1, 15.4).
- [ ] La pagination ne s'affiche que si plusieurs pages existent réellement, et navigue réellement entre des sous-ensembles de résultats distincts (voir 15.4).
- [ ] Aucun lien (footer, breadcrumb, navigation) ne pointe vers une page non implémentée ou vers la 404 comme solution de repli (voir 15.2, 25.4).
- [ ] Chaque badge de statut produit (disponibilité, garantie) est calculé depuis les données réelles du produit affiché, jamais une valeur statique (voir 12.1, 12.4).
- [ ] La liste de devis et les favoris persistent réellement après un rafraîchissement de page (voir 16.4, 16.5, 23.2).
- [ ] Aucun texte d'interface ne fait référence à une fonctionnalité inexistante (ex. compte utilisateur non implémenté) (voir 5.1, ADR-010).

### 26.2 Cohérence des données
- [ ] Les coordonnées de l'entreprise (téléphone, e-mail, adresse, horaires) affichées sur toute page proviennent exclusivement de `SITE_CONFIG` (voir 10.4) — recherche automatisée de chaînes littérales suspectes en revue de code.
- [ ] La liste des marques actives est strictement identique entre l'accueil, le méga-menu, la page Marques et les filtres catalogue (voir 3.4).
- [ ] Aucune catégorie/marque sans produit publié n'apparaît comme active dans la navigation (voir 3.5, 16.7).
- [ ] Chaque image de produit est propre à ce produit exact, jamais réutilisée d'un autre modèle/marque (voir 6.4).

### 26.3 Accessibilité
- [ ] `lang="fr"` présent, aucun texte anglais résiduel (voir 11.1).
- [ ] Navigation clavier complète testée sur la fonctionnalité livrée (voir 18.3, 24.4).
- [ ] Tous les champs de formulaire ont un `label` associé (voir 18.4).
- [ ] Contraste conforme sur tout nouveau texte/composant (voir 14.3, 18.6).
- [ ] Audit `axe-core` sans violation critique/sérieuse (voir 24.4).

### 26.4 SEO
- [ ] La page dispose d'une URL propre, indexable si applicable (voir 13.2), avec `title`/`description`/`canonical` uniques (voir 13.3, 20.2).
- [ ] Le `sitemap.xml` reflète la nouvelle page si indexable (voir 20.1).

### 26.5 Performance
- [ ] Toute image passe par `next/image` avec dimensions explicites (voir 19.2).
- [ ] Aucune nouvelle dépendance non utilisée ajoutée au bundle (voir 7.3, 19.5).

### 26.6 Sécurité
- [ ] Tout nouveau formulaire public implémente honeypot + rate limiting + validation serveur (voir 21.3).
- [ ] Aucun secret exposé côté client (voir 21.1).

---

## 27. Journal des décisions (ADR) — traçabilité vs prototype initial

Chaque entrée documente : le constat fait sur le prototype initial (généré via une plateforme de prototypage IA, non production-ready), la décision prise dans ce document, et la ou les sections qui l'appliquent. Cette traçabilité permet à l'agent de comprendre **pourquoi** une règle existe et d'éviter de la « simplifier » par inadvertance lors d'un futur refactoring.

**ADR-001 — Absence totale de routing / URLs**
Constat : le prototype était une SPA sans bibliothèque de routing, un seul état React (`ViewState`) pilotant l'affichage, une seule URL pour tout le site, bouton « précédent » du navigateur inopérant, aucun lien profond partageable.
Décision : migration vers Next.js App Router avec URLs réelles par page, SSR/SSG selon le type de contenu.
Sections : 6, 13.

**ADR-002 — Listes de marques dupliquées et incohérentes**
Constat : trois listes de marques légèrement différentes coexistaient (grille d'accueil à 6 marques sans Lenovo, méga-menu avec des sous-listes différentes par catégorie, page Marques à 7 marques incluant Lenovo sans aucun produit associé).
Décision : référentiel unique des marques (`lib/data/brands.ts`), consommé partout, avec règle d'activation conditionnée à la présence de produits publiés.
Sections : 3.4, 10.5, 15.2.

**ADR-003 — Positionnement B2B/B2C ambigu**
Constat : le pied de page mentionnait « Système d'approvisionnement B2B et B2C direct » alors que 100% du reste du contenu (formulaires, CTA, ton, catalogue) ciblait exclusivement une audience professionnelle B2B.
Décision : positionnement strictement B2B, toute mention B2C supprimée.
Section : 3.2.

**ADR-004 — Réutilisation d'images entre produits différents**
Constat : la même photographie de serveur HPE était utilisée pour représenter un serveur Dell concurrent ; la même photo de commutateur Cisco représentait aussi un pare-feu Fortinet et un commutateur HPE Aruba ; une photo de baie de stockage représentait aussi une station de travail tour — le code source contenait littéralement le commentaire « Reuse generated server mockup » assumant ce raccourci.
Décision : interdiction stricte de réutilisation d'image entre produits ; fallback honnête si photo réelle indisponible.
Section : 6.4.

**ADR-005 — Données de statut/garantie statiques sur la fiche produit**
Constat : la fiche produit affichait un badge « Disponible » et une mention « Garantie Pro — 3 Ans constructeur » identiques et codés en dur pour **tous** les produits, y compris ceux dont les données réelles indiquaient un stock à 0, un statut « Sur Commande », ou une garantie contractuelle différente (ex. 1 an pour un pare-feu Fortinet, garantie à vie pour un switch Cisco/Aruba) — créant une contradiction directe avec le badge affiché une étape plus tôt sur la carte produit du catalogue.
Décision : toute donnée affichée dérive strictement du modèle `Product` (12.1, 12.4), jamais d'une valeur statique.
Sections : 12, 15.3.

**ADR-006 — Absence de mécanisme de conversion fonctionnel (le défaut le plus critique identifié)**
Constat : le site comportait une modale complète « Parler à un expert » (champs, validation, états de succès/erreur, simulation d'envoi) mais **aucun bouton nulle part dans l'interface ne l'ouvrait** — fonctionnalité entièrement inatteignable. Par ailleurs, le formulaire de contact et le formulaire d'inscription newsletter ne transmettaient réellement aucune donnée (succès simulé côté client uniquement), et le numéro WhatsApp était un placeholder non fonctionnel. Résultat : sur un site dont l'unique objectif métier est la génération de leads B2B, aucun des cinq canaux de contact proposés n'était réellement opérationnel.
Décision : CTA « Demander un devis » intégré de façon permanente et visible (header, fiche produit, page Liste de devis) ; tous les formulaires soumettent réellement leurs données à des endpoints réels avec notification e-mail effective ; numéro WhatsApp réel et fonctionnel.
Sections : 3.3, 4.3, 15.5, 22.

**ADR-007 — Logique de recherche/filtrage dupliquée**
Constat : `CatalogPage` et `SearchResultsPage` implémentaient chacune leur propre logique de filtrage par mot-clé, de façon indépendante et non factorisée, avec un risque de divergence de comportement dans le temps.
Décision : fonction unique `filterProducts`, réutilisée par toutes les surfaces de recherche/filtrage.
Sections : 9.2, 13.2, 16.3.

**ADR-008 — Promesse de persistance non tenue (favoris)**
Constat : la page « Favoris » affichait explicitement le texte « Ces produits sont sauvegardés localement dans votre navigateur », alors que l'état des favoris était un simple `useState` React en mémoire, perdu à chaque rafraîchissement de page — l'interface mentait sur son propre comportement.
Décision : persistance réelle via store Zustand + middleware `persist` (`localStorage`).
Sections : 16.5, 23.2.

**ADR-009 — Catégories vides affichées comme actives**
Constat : 4 des 9 catégories du référentiel (`datacenter`, `wireless`, `monitor`, `printers`) ne contenaient aucun produit mais apparaissaient normalement dans la grille de catégories de l'accueil et le méga-menu, menant systématiquement à un état vide.
Décision : une catégorie n'est affichée dans la navigation que si elle contient au moins un produit publié.
Section : 3.5.

**ADR-010 — Référence à une fonctionnalité de compte utilisateur inexistante**
Constat : le message d'accompagnement de la page Favoris invitait à « créer un compte professionnel » pour une sauvegarde permanente — fonctionnalité totalement absente du reste du site (aucune UI de login/inscription nulle part).
Décision : le compte utilisateur est explicitement hors périmètre V1 (section 5.1) ; aucune micro-copie ne doit y faire référence tant qu'il n'est pas livré.
Sections : 5.1, 16.5.

**ADR-011 — Page 404 utilisée comme destination provisoire**
Constat : deux liens du pied de page (« Support Client B2B », « Centre d'aide ») redirigeaient intentionnellement et systématiquement vers la page d'erreur 404, au lieu d'être simplement omis ou marqués comme à venir.
Décision : aucun lien interne ne doit cibler intentionnellement un état d'erreur ; une page non prête n'est pas liée.
Sections : 15.2, 25.4.

**ADR-012 — Attribut de langue incorrect**
Constat : `<html lang="en">` alors que 100% du contenu textuel du site était rédigé en français, invalidant la prononciation par lecteur d'écran et la classification linguistique par les moteurs de recherche.
Décision : `<html lang="fr">` obligatoire.
Sections : 11.1, 18.2.

**ADR-013 — Titre de page de scaffolding non remplacé**
Constat : la balise `<title>` affichait littéralement « My Google AI Studio App » sur l'intégralité du site, valeur par défaut du gabarit de prototypage jamais personnalisée.
Décision : titre de marque réel avec gabarit dynamique par page.
Sections : 11.1, 20.2.

**ADR-014 — Filtre « Format Châssis » non fonctionnel**
Constat : le filtre lisait la clé `specs.format` (minuscule) alors que la donnée réelle était stockée sous la clé `specs['Format']` (majuscule) contenant en outre du texte libre (« 1U Rackmount ») ne correspondant à aucune des options de filtre proposées (« 1U », « 2U », « Tower ») — rendant le filtre garanti non fonctionnel dans 100% des cas, silencieusement (aucune erreur, juste un résultat toujours vide).
Décision : séparation stricte entre `specs` (affichage libre) et `attributes` (filtrage, vocabulaire contrôlé et typé).
Section : 12.1, 12.2.

**ADR-015 — Contrastes de couleur insuffisants**
Constat : le token `teal-200` utilisé comme couleur de texte sur fond clair (ratio ≈ 2:1) et `teal-400` utilisé comme couleur de survol de lien sur fond blanc (ratio ≈ 3.4:1) ne respectaient pas le seuil WCAG AA de 4.5:1 pour le texte courant.
Décision : table de paires texte/fond pré-validées (14.3), `teal-200` réservé au fond sombre, `teal-800` comme couleur de survol sur fond clair.
Sections : 14.3, 18.6.

**ADR-016 — Contrôle de tri à option unique**
Constat : le menu déroulant « Trier par » du catalogue ne proposait qu'une seule option (« Popularité / Pertinence »), les options de tri par prix ayant été retirées suite à la suppression du champ prix sans que le composant ne soit adapté (le code source contenait le commentaire explicite « Cannot sort by price anymore »).
Décision : un contrôle de tri doit proposer au moins deux options réellement différenciantes et pertinentes au contexte sans prix (nouveautés, alphabétique, disponibilité), ou ne pas être affiché du tout.
Sections : 15.1, 15.4.

**ADR-017 — Identité d'entreprise contradictoire (téléphone, adresse, e-mail, horaires)**
Constat : trois identités d'entreprise différentes coexistaient selon la page : numéro camerounais (+237) en en-tête et bulle WhatsApp, adresse à Paris (France) sur la page Contact, adresse à Dakar (Sénégal) avec numéro sénégalais (+221) en pied de page, et trois formulations d'horaires contradictoires (« 8/5 », « 9h-18h », « 24/7 ») selon l'endroit — un défaut de crédibilité majeur pour un acheteur B2B vérifiant l'identité légale d'un fournisseur.
Décision : identité légale unique figée (Cameroun, Douala), source de configuration centralisée `SITE_CONFIG` interdisant toute recopie locale de ces données.
Section : 10.

**ADR-018 — Pagination factice**
Constat : le composant de pagination du catalogue affichait systématiquement « 1 2 … 8 » quel que soit le nombre réel de résultats (le catalogue ne contenait alors que 8 produits au total), le numéro de page sélectionné n'étant jamais utilisé pour découper réellement la liste affichée — cliquer sur une page rejouait simplement une animation de chargement sans changer le contenu.
Décision : pagination calculée dynamiquement (`Math.ceil(total / pageSize)`), masquée si une seule page suffit.
Section : 15.4.

**ADR-019 — Dépendances mortes issues du scaffolding**
Constat : `package.json` incluait `@google/genai` (SDK IA générative, aucun appel dans le code), `express` et `dotenv` (serveur Node parallèle non nécessaire à une application Next.js/Vite front-end), résidus d'un gabarit de prototypage générique non nettoyé.
Décision : suppression de ces dépendances ; toute nouvelle dépendance doit être justifiée par un besoin fonctionnel documenté dans ce spec.
Sections : 7.2, 7.3.

**ADR-020 — Sourcing des photos produit et fiches techniques : pipeline d'ingestion plutôt que saisie manuelle ou hotlink en direct**
*(⚠️ Le choix du fournisseur de sourcing décrit ci-dessous a été révisé par ADR-022 — le principe du pipeline hors ligne reste valable, seule la hiérarchie des sources a changé.)*
Constat : le prototype initial réutilisait la photo d'un produit pour en représenter un autre (voir ADR-004) et laissait des liens de fiche technique morts (`url: '#'`, voir ADR-011). Une correction naïve — hotlinker en direct une source externe à chaque chargement de page — a été envisagée mais écartée après vérification du comportement d'acteurs établis du secteur (ex. ServerBasket héberge systématiquement ses visuels produit sur son propre domaine, jamais en lien direct vers un tiers) : le hotlink en runtime introduit une dépendance de disponibilité/latence vis-à-vis d'un service externe à chaque requête utilisateur, sans bénéfice réel.
Décision (à l'origine) : hiérarchie de sources unique (Open Icecat en priorité pour images et datasheets, portail constructeur en repli, capture manuelle en dernier recours), rapatriées **une fois** par un script d'ingestion autonome vers un stockage compatible S3 propre au projet (Cloudflare R2 recommandé), avec traçabilité de provenance et checksum par fichier, jamais d'écriture automatique directe dans les données de production sans revue humaine. Ce principe de pipeline hors ligne + stockage propre + revue humaine reste la règle actuelle (voir 6.5) ; seule la source utilisée pour les images a changé (voir ADR-022).
Sections : 6.4, 6.5, 12.2, 19.2.

**ADR-021 — Fournisseur e-mail unique (Brevo) pour le transactionnel et la newsletter**
Constat : la section 22 envisageait initialement deux fournisseurs distincts (ex. Resend pour le transactionnel, Brevo/Mailchimp pour la newsletter), doublant l'intégration (deux comptes, deux clés API, deux clients dans `lib/email/`) pour un besoin qu'un seul outil peut couvrir à ce stade de volume.
Décision : fournisseur unique, Brevo, pour `/api/quote-requests`, `/api/contact-messages` et `/api/newsletter` (plan gratuit : 300 e-mails/jour partagés, contacts illimités, API + SMTP). Le contrat d'API (entrée/sortie des Route Handlers) reste inchangé si ce choix devait évoluer plus tard.
Sections : 7.1, 22.0, 22.4.

**ADR-022 — Séparation des sources : Amazon Scraper API pour images/infos de base, Icecat borné aux datasheets**
Constat : la hiérarchie de sources unique définie par ADR-020 (Icecat pour tout) sous-couvrait certaines marques moins présentes dans Open Icecat (ex. Fortinet, Huawei, Hikvision — voir déjà noté en 6.5.1 de la version précédente), en particulier pour l'image principale.
Décision : deux sources spécialisées et exclusives sur leur périmètre — **Amazon Scraper API** (service tiers de scraping structuré) pour les images produit et les informations de base (titre, marque, modèle, MPN si disponible, description, caractéristiques générales), **Open Icecat conservé uniquement** pour les fiches techniques PDF et documents associés. Le principe du pipeline hors ligne, du stockage propre versionné, de la traçabilité de provenance et de la revue humaine obligatoire (hérité d'ADR-020) est conservé à l'identique pour les deux sources (voir 6.5).
Point de vigilance explicitement documenté (à la demande, non un oubli) : ce choix a un profil de risque juridique différent de la version Icecat-only — Icecat est un canal de distribution consenti par les marques, tandis qu'Amazon Scraper API extrait des données publiées sur Amazon sans licence de redistribution explicite (risque de rupture des conditions d'utilisation d'Amazon et risque de droit d'auteur sur les images, potentiellement détenues par le fabricant ou le vendeur ayant publié l'annonce). Voir 6.5.8 pour l'analyse détaillée et les options de mitigation recommandées ; validation juridique recommandée avant mise en production.
Sections : 6.5 (intégralement révisée), 7.1, 8.1, 12.2, 19.2.

---



## 28. Glossaire

| Terme | Définition dans le contexte HardwareCentral |
|---|---|
| **RFQ** | *Request For Quote* — demande de devis ; modèle commercial central du site (pas de vente directe en ligne, voir 3.1). |
| **Liste de devis** | Sélection de produits en cours de constitution par l'utilisateur, destinée à être transmise via `QuoteRequestForm` ; distincte des favoris (voir 16.4 vs 16.5). |
| **Favoris** | Sélection personnelle de produits « à consulter plus tard », sans intention d'achat immédiate, persistée localement (voir 16.5). |
| **SSOT** | *Single Source of Truth* — principe imposant qu'une donnée (identité d'entreprise, référentiel de marques, logique de filtrage) n'existe qu'à un seul endroit dans le code, consommé partout ailleurs (voir 10.4, 3.4, 9.2). |
| **Attributs (`attributes`)** | Champs structurés et typés d'un produit, dédiés au filtrage/facettage (ex. `chassisFormat`), à ne jamais confondre avec `specs` (voir 12.1). |
| **Specs (`specs`)** | Spécifications techniques en texte libre ordonné, destinées uniquement à l'affichage sur la fiche produit, jamais utilisées pour du filtrage programmatique (voir 12.1). |
| **CEMAC** | Communauté Économique et Monétaire de l'Afrique Centrale — zone de couverture commerciale cible (Cameroun, Gabon, Congo, Tchad, RCA, Guinée Équatoriale), voir 2.1. |
| **ADR** | *Architecture Decision Record* — entrée du journal des décisions (section 27) traçant un choix d'architecture/produit et sa justification. |
| **MediaAsset** | Type structuré (image ou PDF) incluant sa provenance et son checksum, utilisé pour tout média produit stocké via le pipeline d'ingestion (voir 6.5.9). |
| **Pipeline d'ingestion** | Script autonome (`scripts/ingest-product-media.ts`) qui rapatrie une fois les images/infos (Amazon Scraper API) et les datasheets (Icecat) vers le stockage du projet — jamais exécuté au moment où un visiteur charge une page (voir 6.5). |
| **Amazon Scraper API** | Catégorie de service tiers de scraping structuré (ex. Oxylabs, Bright Data, ScraperAPI, Decodo — à distinguer de l'Amazon Product Advertising API, programme officiel réservé aux affiliés) utilisée comme source exclusive des images produit et des informations de base (voir 6.5.2). |
| **ASIN** | *Amazon Standard Identification Number* — identifiant unique d'un listing Amazon, mémorisé en provenance (`MediaAsset.provenance.sourceIdentifier`) pour cibler les resynchronisations sans nouvelle recherche floue (voir 6.5.2, 6.5.6). |
| **Open Icecat** | Catalogue ouvert de fiches produit syndiqué directement par les marques constructeurs — depuis ADR-022, source **exclusive** des fiches techniques PDF (datasheets), n'est plus utilisé pour les images (voir 6.5.5). |
| **Fausse affordance** | Élément d'interface suggérant visuellement une interactivité sans action réelle associée (ex. curseur pointer sur un texte sans gestionnaire d'événement) — anti-pattern strictement interdit (voir 16.1). |

---

## Clôture du document

Ce document constitue la spécification maîtresse et la source de vérité unique du projet HardwareCentral. Toute décision d'implémentation non couverte explicitement doit être résolue par analogie avec les principes directeurs énoncés (cohérence des données via configuration centralisée, absence de fausse affordance, accessibilité et SEO non négociables, honnêteté fonctionnelle de l'interface envers l'utilisateur) plutôt que par une convention générique de framework non contextualisée à ce produit.

Toute évolution majeure de périmètre, de modèle de données ou d'architecture doit donner lieu à une mise à jour de ce document (nouvelle entrée ADR en section 27 si elle corrige ou remplace une décision existante), afin qu'il reste, dans la durée, le reflet fidèle et unique de l'état voulu du produit.

**Fin du document — version 1.0.0**
