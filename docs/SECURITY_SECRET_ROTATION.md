# Rotation des secrets & purge de l'historique Git — Actions humaines requises

> **Statut de rotation — 2026-08-04 :** les trois identifiants exposés ci-dessous ont été
> **régénérés/rotés côté fournisseurs** (Oxylabs, Icecat, ImageKit) et les nouvelles valeurs
> ont été reportées dans `.env.local` (jamais commité). L'historique Git a été purgé via
> `git filter-repo --replace-text` (valeurs remplacées par `***REMOVED***` partout) et le
> `push --force` a été effectué. Vérification locale : `grep` de contrôle → **0 occurrence**
> sur l'intégralité des objets Git. Toute personne ayant cloné avant cette date doit
> **re-cloner** plutôt que `git pull`.

Action humaine à réaliser **en parallèle** du plan `OPENCODE_AUDIT_FIXES.md` (item 1.1).
Ce document est écrit pour être exécuté par le propriétaire du dépôt (`***REMOVED***`),
pas par l'agent de code — il réécrit l'historique partagé et touche des comptes tiers.

## 1. Identifiants exposés (confirmés dans l'historique Git)

| Service | Identifiant exposé | Risque |
|---|---|---|
| Oxylabs (scraping payant) | `OXYLABS_USERNAME` + `OXYLABS_PASSWORD` (format « nom + année ») | Facturation frauduleuse, suspension du compte. Le mot de passe suit un format réutilisable : ne plus jamais le réutiliser ailleurs. |
| Icecat (compte personnel) | `ICECAT_USERNAME` + `ICECAT_PASSWORD` | Prise de contrôle du compte, abus de quota. |
| ImageKit | `IMAGEKIT_PRIVATE_KEY` (clé privée d'upload) | Upload non autorisé sur le compte ImageKit. |

Ils sont présents dans **tous les commits** de `main`, y compris dans un binaire
compilé `amazon-scraper/__pycache__/scraper.cpython-314.pyc`.

## 2. Rotation immédiate (à faire maintenant, sans attendre le reste)

1. **Oxylabs** : changer le mot de passe dans le dashboard Oxylabs.
2. **Icecat** : changer le mot de passe du compte Icecat.
3. **ImageKit** : régénérer `IMAGEKIT_PRIVATE_KEY` dans le dashboard ImageKit.
4. Reporter les nouvelles valeurs dans `.env.local` (jamais commité).

## 3. Purge de l'historique Git

Prérequis : `pip install git-filter-repo` (ou télécharger le binaire
https://github.com/newren/git-filter-repo). Une sauvegarde de la branche doit
exister avant toute manipulation.

```bash
# 1. Clone miroir (sur une machine, hors du dépôt de travail)
git clone --mirror https://github.com/***REMOVED***/hardwarecentral.git hardwarecentral.git
cd hardwarecentral.git

# 2. Fichier de remplacement des secrets (un par ligne, texte exact)
cat > secrets.txt <<'EOF'
***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
EOF

# 3. Réécriture : remplacement des secrets dans les fichiers texte +
#    suppression des binaires compilés qui contiennent les secrets en clair
git filter-repo --force \
  --replace-text secrets.txt \
  --invert-paths \
  --path-glob 'amazon-scraper/__pycache__/*'

# 4. Contrôle : plus aucun identifiant dans l'historique réécrit
git grep -i "***REMOVED***\|***REMOVED***" $(git rev-list --all) || echo "OK, historique propre"

# 5. Pousser avec force (réécriture de l'historique partagé — tous les clones
#    existants devront être re-clonés)
git push --force --all
git push --force --tags

# 6. GitHub : invalider les caches qui pourraient contenir l'ancien historique
#    et supprimer les références orphelines (PRs/forks) vers d'anciens commits.
```

Variante BFG (uniquement pour la suppression des binaires `.pyc`) :
`java -jar bfg.jar --delete-folders '__pycache__' --no-blob-protection`.

## 4. Contrôles après purge

```bash
git grep -i "***REMOVED***\|***REMOVED***" $(git rev-list --all)   # doit être vide
```

## 5. Garde-fou CI

Le job `secrets-scan` (gitleaks) ajouté dans `.github/workflows/ci.yml` échouera
sur toute régression future de ce type.
