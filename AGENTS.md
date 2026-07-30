# Instructions du projet HardwareCentral

Avant toute action, lis intégralement :
- docs/HARDWARECENTRAL_AGENT_SPEC.md (règles, architecture, design system, ADR)
- docs/HARDWARECENTRAL_IMPLEMENTATION_GUIDE.md (feuille de route, phase en cours)

Règles non négociables à ne jamais oublier en cours de session :
- Aucune donnée de contact (téléphone, e-mail, adresse, horaires) codée en dur ailleurs que dans src/lib/site-config.ts (section 10 du spec).
- Aucun élément interactif sans véritable logique fonctionnelle derrière (section 16.1 du spec) — pas de bouton, filtre, tri ou pagination décoratif.
- Aucune donnée affichée (statut, garantie, délai) codée en dur : tout provient du modèle Product (section 12).
- Avant de déclarer une phase terminée, vérifie-la contre les critères de sortie correspondants dans HARDWARECENTRAL_IMPLEMENTATION_GUIDE.md.
- Si une information réelle manque (téléphone, clé API, matching produit), pose un TODO explicite plutôt que d'inventer une valeur.
- Amazon Scraper API est réservé aux images et infos de base ; Icecat est réservé aux datasheets (section 6.5 du spec) — ne jamais inverser ni mélanger les deux.
- Le script d'ingestion (scripts/ingest-product-media.ts) n'écrit jamais directement dans products.ts : il produit un rapport relu et committé manuellement (section 6.5.1 du spec).
- Les wireframes (docs/HARDWARECENTRAL_WIREFRAMES.html) sont la référence structurelle visuelle. Avant de construire une page ou un composant, ouvre l'écran correspondant et respecte l'ordre des blocs, les composants présents/absents, et les états conditionnels.
- Les wireframes sont en basse fidélité — les couleurs, polices et espacements viennent exclusivement de la section 14 du spec.
- Avant toute tâche touchant à l'UI, un composant, une couleur, une police ou un
espacement : relis docs/DESIGN.md (tokens + bibliothèque de composants) et
docs/HARDWARECENTRAL_WIREFRAMES.html (structure de l'écran concerné, ancre
#screen-N). N'improvise jamais un token ou un pattern hors de ces deux fichiers.