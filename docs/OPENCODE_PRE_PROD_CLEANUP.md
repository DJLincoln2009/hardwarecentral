# HardwareCentral — Nettoyage final avant mise en production

**Contexte :** ce document fait suite à `OPENCODE_AUDIT_FIXES.md` (déjà traité) et au ré-audit du code réel effectué après ce premier passage. Il ne couvre que ce qui a été découvert *pendant* ou *après* la correction précédente — pas une reprise des points déjà résolus (domaine, SSR catalogue, split HP/HPE, etc., tous vérifiés corrects dans le code).

**Portée volontairement restreinte.** Ce n'est pas un audit complet, c'est une liste de finition. Un item = une correction ciblée.

---

## 0. Instructions d'exécution

1. Après chaque item : `npx tsc --noEmit && npm run lint && npx vitest run` doivent rester propres.
2. **Item 1 (rotation ImageKit) et Item 2 (purge d'historique Git) ne doivent PAS être exécutés automatiquement sans confirmation explicite de Lincoln juste avant.** La purge d'historique réécrit `main` et nécessite un `push --force` coordonné — ce n'est pas une action à lancer en autonomie même si le reste de ce document est traité sans supervision. Pour ces deux items, préparer les commandes exactes et les commit/diffs proposés, mais s'arrêter avant `push --force` en attendant le feu vert.
3. Tout le reste (items 3 à 6) peut être traité normalement, un commit par item.

---

## 1. 🔴 Retirer la clé ImageKit en clair de `docs/SECURITY_SECRET_ROTATION.md`

**Constat :** ce fichier contenait la valeur réelle `***REMOVED***` (clé privée ImageKit) en clair, déjà commitée et poussée sur `main` (dépôt public). Cette valeur a depuis été remplacée par un placeholder lors de la purge (item 2).

**Correction (peut être faite immédiatement, sans attendre la confirmation de l'item 2) :**
1. Remplacer la valeur réelle dans le fichier par un placeholder explicite, par exemple :
   ```
   IMAGEKIT_PRIVATE_KEY : <régénérée le [date] — ne plus jamais coller une clé réelle dans un fichier suivi par Git>
   ```
2. Ajouter en tête du fichier une note datée confirmant que cette clé précise a été régénérée (ou, si ce n'est pas encore fait, un `⚠️ ROTATION EN ATTENTE` bien visible) — pour que quiconque relit ce fichier plus tard sache si l'action a réellement été faite, pas seulement documentée.
3. Committer ce changement isolément (pas mélangé à d'autres corrections), pour que le diff soit facile à auditer.

**Rappel humain (hors périmètre agent) :** la clé doit être régénérée dans le dashboard ImageKit *avant ou en même temps* que ce commit — éditer le fichier ne neutralise pas une clé déjà exposée, seule la rotation côté ImageKit le fait.

---

## 2. 🔴 Purger l'historique Git (deux fuites, une seule passe)

**Constat :** `git log --all -p` confirme que les valeurs suivantes restent récupérables dans l'historique du dépôt public actuel :
- `***REMOVED***` (Oxylabs + Icecat, `amazon-scraper/scraper.py` et `src/lib/icecat-client.ts` dans leurs versions antérieures)
- `***REMOVED***` (ImageKit, introduite par `docs/SECURITY_SECRET_ROTATION.md`, voir item 1)

**Préparer, sans exécuter le `push --force` :**
```bash
# Après rotation confirmée des 3 identifiants (Oxylabs, Icecat, ImageKit) :
pip install git-filter-repo --break-system-packages   # ou brew/apt selon l'environnement

git filter-repo --replace-text <(cat << 'EOF'
***REMOVED***==>***REMOVED***
***REMOVED***==>***REMOVED***
***REMOVED***==>***REMOVED***
***REMOVED***==>***REMOVED***
EOF
)

# Vérification avant push (patterns remplacés par ***REMOVED*** lors de la purge) :
git log --all -p | grep -c "***REMOVED***\|***REMOVED***\|***REMOVED***"
# doit retourner 0

git push origin main --force
```

**Ne pas exécuter `git push --force` sans confirmation explicite de Lincoln.** Préparer la commande, vérifier localement que le `grep` de contrôle retourne bien 0 après le `filter-repo`, puis s'arrêter et signaler que tout est prêt pour le push.

**Après le push forcé** (à documenter dans `docs/SECURITY_SECRET_ROTATION.md`) : toute personne ayant cloné le dépôt avant cette date devra re-cloner plutôt que `git pull` — un historique réécrit ne se rebase pas proprement sur un fork existant.

---

## 3. 🟠 `3d-pipeline/scripts/generate_3d.py` — risque d'épuisement du quota HF gratuit

**Fichier :** `3d-pipeline/scripts/generate_3d.py`, fonction `generate_3d(ref_images, out_dir, runs: int = 25)`

**Constat :** valeur par défaut `runs=25` — jusqu'à 25 appels à `client.predict()` par image de référence, par produit. Sur les 27 produits featured, un premier lancement non prudent peut consommer des centaines d'appels au Space TRELLIS gratuit avant même de savoir si le pipeline fonctionne de bout en bout.

**Correction :**
1. Réduire la valeur par défaut à `runs: int = 2`.
2. Exposer `runs` en argument CLI optionnel dans le bloc `if __name__ == "__main__":` (ex. `python generate_3d.py <slug> --runs 5`) pour permettre d'augmenter ponctuellement sans toucher au code une fois le pipeline validé.
3. Ajouter un message d'avertissement affiché avant le premier appel si `runs > 5` : `print(f"⚠ {runs} runs demandés — chaque run consomme le quota gratuit du Space. Confirmer avant de continuer sur plusieurs produits.")`

**Critère de validation :** `python 3d-pipeline/scripts/generate_3d.py dell-poweredge-r760` sans argument ne déclenche plus que 2 appels par image de référence.

---

## 4. 🟠 `3d-pipeline/scripts/render_blender.py` — résolution de sortie trop basse

**Fichier :** `3d-pipeline/scripts/render_blender.py`

**Constat :** `scene.render.resolution_x = 512` / `resolution_y = 512`. Le cadrage caméra adaptatif (bounding box + FOV + contrainte `TRACK_TO`) est correctement implémenté — c'est uniquement la résolution de sortie qui est insuffisante pour un usage fiche produit/carte catalogue en haute densité d'écran.

**Correction :**
```python
scene.render.resolution_x = 1600
scene.render.resolution_y = 1600
```
Retirer aussi la ligne dupliquée `scene.render.film_transparent = True` (présente deux fois, lignes 36 et 39 — harmless mais à nettoyer).

**Point à trancher visuellement, pas à corriger aveuglément :** l'éclairage HDRI prévu dans `OPENCODE_PIPELINE_3D.md` v1.1 a été remplacé par un éclairage manuel (Sun + Area). Ne pas réintroduire l'HDRI automatiquement — lancer d'abord un rendu test à la nouvelle résolution avec l'éclairage actuel, et ne réintroduire l'HDRI (`assets/hdri/studio_small.hdr`, polyhaven.com CC0) que si le rendu manuel paraît trop plat à l'œil sur des surfaces métalliques (châssis serveur, capots laptop).

---

## 5. 🟡 Hygiène de dépôt — fichiers qui n'auraient jamais dû être commités

**Constat :**
- `.next-start.log`, `.next-start-err.log` : sortie brute de lancement du serveur de dev, commitée.
- `amazon-scraper/__pycache__/*.pyc` : toujours suivis par Git malgré la présence de `__pycache__/` et `*.pyc` dans `.gitignore` (ajouter une règle à `.gitignore` n'arrête pas de suivre un fichier déjà tracké).

**Correction :**
```bash
git rm --cached .next-start.log .next-start-err.log
git rm -r --cached amazon-scraper/__pycache__
```
Puis ajouter à `.gitignore` :
```
.next-start*.log
```
(`__pycache__/` et `*.pyc` y sont déjà présents — seul le `git rm --cached` manquait.)

**Note :** les anciennes versions de ces `.pyc` restent dans l'historique et seront traitées par la purge de l'item 2 si vous ajoutez leur contenu binaire à la liste `--replace-text`, mais un fichier binaire ne se filtre pas par remplacement de texte — si vous voulez les faire disparaître aussi de l'historique, utiliser `git filter-repo --path amazon-scraper/__pycache__ --invert-paths` en plus, dans la même passe que l'item 2.

---

## 6. 🟡 `docs/PROGRESS.md` — corriger une affirmation inexacte

**Fichier :** `docs/PROGRESS.md`, ligne Phase 0

**Constat :** le tableau affirme *« Raison sociale : HardwareCentral (`site-config.ts` → `legalName`) »*. Il n'existe aucun champ `legalName` dans `src/lib/site-config.ts` — seulement `companyName: 'HardwareCentral'`, qui est un nom commercial, pas une raison sociale au sens légal.

**Correction :** corriger cette ligne pour refléter l'état réel — soit en retirant la mention `legalName` inexistante, soit en la marquant explicitement comme non résolue (cohérent avec `/mentions-legales` qui affiche déjà honnêtement « informations en cours de finalisation »). Ne pas ajouter un faux champ `legalName` juste pour faire correspondre le journal au code — la vraie raison sociale n'est toujours pas connue, ce n'est pas à l'agent de la déterminer.

---

## Definition of Done

- [ ] `docs/SECURITY_SECRET_ROTATION.md` ne contient plus aucune valeur de clé réelle.
- [ ] Commandes de purge d'historique préparées et vérifiées localement (`grep` de contrôle → 0), **push --force en attente de confirmation explicite**.
- [ ] `generate_3d.py` : `runs` par défaut à 2, configurable en CLI, avertissement si > 5.
- [ ] `render_blender.py` : sortie 1600×1600, ligne dupliquée retirée.
- [ ] `.next-start*.log` et `amazon-scraper/__pycache__` untracked, `.gitignore` complété.
- [ ] `PROGRESS.md` ne contient plus d'affirmation contredite par le code réel.
- [ ] `npx tsc --noEmit`, `npm run lint`, `npx vitest run` toujours propres après tous ces changements.
