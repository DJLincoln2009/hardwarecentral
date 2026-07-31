# Pipeline IA + 3D pour visuels produits — Instructions pour OpenCode

**Version 1.1** — révisée après réconciliation avec le code réel du dépôt `hardwarecentral` (types `MediaAsset`, pipeline d'ingestion existant `scripts/ingest-product-media.ts`, discipline « jamais d'écriture automatique en production » déjà actée en ADR-020 du spec). La v1.0 (architecture en 4 étapes, scripts Python, structure de dossier) reste la base — cette révision **ajoute** une étape d'intégration manquante et **corrige** cinq points techniques identifiés en relecture critique. Chaque changement est marqué `🆕` pour rester traçable.

## Contexte

Ce document décrit un pipeline à construire pour générer des visuels produits
**photoréalistes et 100% nouveaux** pour HardwareCentral (catalogue B2B IT,
BTS), à partir d'images de référence trouvées en ligne (constructeur,
distributeurs). Le pipeline part d'une ou plusieurs images 2D d'un produit et
produit une image de rendu 3D final utilisable sur les fiches produit.

**Cas de test de référence : Dell Precision 3490.** Une fois validé sur ce
produit, le pipeline doit être généralisable à tout le catalogue (HPE, Dell,
Fortinet, Cisco, Huawei, Hikvision).

Contrainte matérielle : la machine de développement est un Dell Latitude
7320 sous **Windows 11**, CPU Intel 11ᵉ Gen (i5-1135G7 ou i7-1185G7),
graphics **Intel Iris Xe intégrés** (pas de GPU dédié), RAM généralement
16 Go. C'est nettement plus capable qu'un poste d'entrée de gamme : Eevee
tourne sans souci, et un rendu Cycles CPU ponctuel (un produit à la fois)
reste réaliste en local. Le déport vers du cloud gratuit (Hugging Face
Spaces pour la génération 3D, Colab pour du Cycles GPU) garde son intérêt
surtout pour le traitement en batch de tout le catalogue, mais n'est plus
une nécessité absolue pour un rendu isolé.

## Objectif pour OpenCode

Construire un pipeline scriptable, exécutable en CLI, qui prend en entrée un
produit (nom + URLs d'images de référence) et produit en sortie une image
PNG photoréaliste du produit, sans étape manuelle dans l'UI d'un outil tiers.

🆕 **Objectif complété :** ce PNG doit ensuite être réellement raccordé au
catalogue Next.js (`src/lib/data/products/*.ts`) — voir Étape 5. Un pipeline
qui produit des rendus dans `outputs/` sans jamais les faire apparaître sur
le site ne résout pas le problème constaté (239 produits sur 240 affichent
actuellement « Image non disponible »).

---

## 🆕 Sourcing des images de référence — précision nécessaire avant d'exécuter le pipeline

`products.yaml` (Étape 0 ci-dessous) invite à renseigner des
`reference_images` en mélangeant sites constructeur et sites distributeurs.
Ces deux sources n'ont pas le même profil de risque :

- **Portail presse/média officiel du constructeur** (ex. section « presse »
  ou « media kit » de hpe.com, dell.com, cisco.com…) : ces images sont
  généralement mises à disposition explicitement pour être réutilisées par
  des revendeurs/partenaires dans un contexte commercial — c'est la source à
  privilégier en premier.
- **Site d'un distributeur tiers** (grossiste, autre revendeur, marketplace) :
  ces images appartiennent le plus souvent au distributeur ou au
  constructeur, sans droit de réutilisation accordé à un tiers non
  partenaire — **à éviter comme source de référence**, même si le rendu
  final est techniquement « une nouvelle image générée par IA ». Une
  reconstruction 3D fidèle d'un produit à partir d'une seule photo n'efface
  pas nécessairement le fait que le design du produit lui-même reste la
  propriété intellectuelle du constructeur : le point d'attention légal déjà
  présent en fin de ce document (licence CC BY des meshes générés) doit être
  lu comme un minimum, pas comme l'unique risque.

**Correction attendue pour `products.yaml`** : ne renseigner que des URLs
provenant du domaine officiel de la marque du produit (`hpe.com`, `dell.com`,
`fortinet.com`, `cisco.com`, `huawei.com`, `hikvision.com`, ou leurs
sous-domaines presse/média dédiés). `download_refs.py` doit refuser
(erreur explicite, pas un simple warning) toute URL dont le domaine ne
correspond pas à celui de la marque déclarée du produit dans
`products.yaml` — ajouter un champ `brand_domains` en tête de fichier de
config pour ce contrôle.

---

## Architecture du pipeline

```
products.yaml
     │
     ▼
[1] download_refs.py      → télécharge et valide les images de référence
     │
     ▼
[2] generate_3d.py         → image(s) 2D → mesh 3D texturé (.glb)
     │   (Hugging Face Space gratuit, avec fallback Meshy API si clé dispo)
     ▼
[3] render_blender.py      → import .glb, HDRI, caméra, rendu → .png
     │   (exécuté en headless via `blender --background --python`)
     ▼
[4] orchestrate.py         → enchaîne 1→2→3 pour un ou tous les produits
     │
     ▼
outputs/<slug-produit>/render.png
     │
     ▼
🆕 [5] sync_to_catalog.py  → rapport de correspondance rendu ↔ produit,
     │   upload ImageKit, jamais d'écriture directe dans products.ts
     ▼
🆕 Revue humaine → commit manuel dans src/lib/data/products/*.ts
```

---

## Environnement à préparer

```powershell
# Blender (rendu headless, gratuit, open-source)
winget install BlenderFoundation.Blender
# ou télécharger directement depuis blender.org si winget n'est pas dispo

# Python
python -m venv .venv
.venv\Scripts\activate
pip install requests gradio_client pyyaml pillow
```

Fichier `requirements.txt` à créer à la racine du projet :
```
requests
gradio_client
pyyaml
pillow
```

🆕 **Remarque** : `pillow` figurait déjà dans la v1.0 mais n'était utilisé
nulle part dans les scripts fournis — voir la correction apportée à
`download_refs.py` ci-dessous, qui l'utilise désormais réellement pour
valider la résolution des images de référence.

---

## Structure de dossier attendue

```
3d-pipeline/
├── requirements.txt
├── products.yaml
├── assets/
│   └── hdri/
│       └── studio_small.hdr        # téléchargé depuis polyhaven.com (gratuit, CC0)
├── scripts/
│   ├── download_refs.py
│   ├── generate_3d.py
│   ├── render_blender.py
│   ├── orchestrate.py
│   └── sync_to_catalog.py          # 🆕
├── work/                            # fichiers intermédiaires (refs, .glb)
│   └── <slug-produit>/
├── outputs/                         # rendus finaux
│   └── <slug-produit>/
│       └── render.png
└── sync-reports/                    # 🆕 rapports de correspondance, revus à la main
    └── <date>.json
```

🆕 **Ajouter à `.gitignore`** : `3d-pipeline/work/`, `3d-pipeline/outputs/`
(fichiers binaires volumineux, intermédiaires ou régénérables — ne doivent
pas être versionnés). `3d-pipeline/sync-reports/` reste versionné : c'est un
artefact de traçabilité léger (JSON), cohérent avec le principe déjà
appliqué au rapport de `scripts/ingest-product-media.ts`.

---

## Étape 0 — Fichier de configuration produits

Créer `products.yaml`. C'est la source de vérité pour le batch — chaque
produit du catalogue HardwareCentral y a une entrée.

```yaml
brand_domains:              # 🆕 utilisé par download_refs.py pour valider la source
  dell: dell.com
  hpe: hpe.com
  hp: hp.com
  fortinet: fortinet.com
  cisco: cisco.com
  huawei: huawei.com
  hikvision: hikvision.com

products:
  - slug: dell-precision-3490
    name: "Dell Precision 3490"
    brand: dell
    reference_images:
      - "https://www.dell.com/.../dell-precision-3490-hero.jpg"   # 🆕 domaine constructeur uniquement
    render:
      style: "studio produit, fond neutre, angle 3/4"
```

OpenCode doit valider que chaque URL est bien accessible (HTTP 200,
`Content-Type` image/*) **et** que son domaine correspond à `brand_domains[brand]`
🆕 avant de continuer.

---

## Étape 1 — `scripts/download_refs.py`

Rôle : télécharger les images listées dans `products.yaml` pour un slug
donné, les valider, et les stocker dans `work/<slug>/refs/`.

🆕 **Trois corrections apportées à la version v1.0** :
1. Validation du domaine source (voir section précédente).
2. Validation de résolution minimale via `pillow` (une vignette basse
   résolution produit un mesh 3D de mauvaise qualité) — `pillow` était une
   dépendance déclarée mais inutilisée en v1.0.
3. Une URL en échec ne fait plus échouer tout le produit si au moins une
   autre référence est valide — seul un produit avec **zéro** image valide
   doit lever une erreur.

```python
import sys
import yaml
import requests
from io import BytesIO
from pathlib import Path
from urllib.parse import urlparse
from PIL import Image

MIN_DIMENSION = 800  # px — sous ce seuil, la reconstruction 3D est peu fiable

def load_config(config_path: str = "products.yaml") -> dict:
    with open(config_path) as f:
        return yaml.safe_load(f)

def load_product(slug: str, config: dict) -> dict:
    for p in config["products"]:
        if p["slug"] == slug:
            return p
    raise ValueError(f"Produit inconnu: {slug}")

def validate_domain(url: str, brand: str, brand_domains: dict) -> None:
    expected = brand_domains.get(brand)
    if not expected:
        raise ValueError(f"Marque inconnue dans brand_domains: {brand}")
    host = urlparse(url).netloc.lower()
    if not (host == expected or host.endswith(f".{expected}")):
        raise ValueError(
            f"URL refusée — domaine '{host}' ne correspond pas au constructeur "
            f"attendu '{expected}' pour la marque '{brand}'. Seules les images "
            f"provenant du site officiel du constructeur sont acceptées."
        )

def download_refs(product: dict, brand_domains: dict, base_dir: str = "work") -> list[Path]:
    out_dir = Path(base_dir) / product["slug"] / "refs"
    out_dir.mkdir(parents=True, exist_ok=True)
    saved = []
    errors = []

    for i, url in enumerate(product["reference_images"]):
        try:
            validate_domain(url, product["brand"], brand_domains)
            resp = requests.get(url, timeout=15)
            resp.raise_for_status()
            content_type = resp.headers.get("Content-Type", "")
            if "image" not in content_type:
                raise ValueError(f"URL non-image ({content_type}): {url}")

            img = Image.open(BytesIO(resp.content))
            img.verify()  # rejette un fichier corrompu malgré un Content-Type correct
            img = Image.open(BytesIO(resp.content))  # verify() consomme le flux, on réouvre
            if min(img.size) < MIN_DIMENSION:
                raise ValueError(
                    f"Image trop petite ({img.size[0]}x{img.size[1]}px, "
                    f"minimum {MIN_DIMENSION}px sur le plus petit côté): {url}"
                )

            ext = ".jpg" if "jpeg" in content_type else ".png"
            path = out_dir / f"ref_{i}{ext}"
            path.write_bytes(resp.content)
            saved.append(path)
        except Exception as e:
            errors.append(f"{url} → {e}")

    if not saved:
        raise ValueError(
            f"Aucune image de référence valide pour {product['slug']}. Erreurs:\n"
            + "\n".join(errors)
        )
    if errors:
        print(f"⚠ {len(errors)} référence(s) ignorée(s) pour {product['slug']}:")
        for e in errors:
            print(f"  - {e}")

    return saved

if __name__ == "__main__":
    slug = sys.argv[1]
    config = load_config()
    product = load_product(slug, config)
    paths = download_refs(product, config["brand_domains"])
    print(f"{len(paths)} image(s) téléchargée(s) pour {slug}")
    for p in paths:
        print(f"  - {p}")
```

**Critère de validation** : `python scripts/download_refs.py dell-precision-3490`
crée bien les fichiers dans `work/dell-precision-3490/refs/`.

---

## Étape 2 — `scripts/generate_3d.py`

Rôle : convertir la meilleure image de référence en mesh 3D texturé (`.glb`).

Deux chemins possibles. OpenCode doit implémenter les deux avec un
mécanisme de fallback : si une variable d'environnement `MESHY_API_KEY` est
définie, utiliser l'API Meshy (payante, plus fiable) ; sinon, utiliser un
Space Hugging Face gratuit via `gradio_client`.

```python
import os
import sys
from pathlib import Path

def generate_3d_via_hf(image_path: Path, out_path: Path) -> Path:
    """Chemin gratuit : Space Hugging Face public (image-to-3D)."""
    from gradio_client import Client, file

    # NOTE pour OpenCode : le nom exact du space et de l'endpoint API
    # doit être vérifié sur la page HF du space choisi, onglet
    # "Use via API" en bas de page — ces paramètres changent selon le space.
    client = Client("microsoft/TRELLIS")
    result = client.predict(
        image=file(str(image_path)),
        api_name="/generate_3d",
    )
    glb_path = Path(result if isinstance(result, str) else result[0])
    out_path.write_bytes(glb_path.read_bytes())
    return out_path

def generate_3d_via_meshy(image_path: Path, out_path: Path, api_key: str) -> Path:
    """Chemin payant : API Meshy (nécessite compte Pro+)."""
    import requests
    import time
    import base64

    img_b64 = base64.b64encode(image_path.read_bytes()).decode()
    resp = requests.post(
        "https://api.meshy.ai/openapi/v1/image-to-3d",
        headers={"Authorization": f"Bearer {api_key}"},
        json={
            "image_url": f"data:image/jpeg;base64,{img_b64}",
            "enable_pbr": True,
            "should_texture": True,
            "target_formats": ["glb"],
        },
        timeout=30,
    )
    resp.raise_for_status()
    task_id = resp.json()["result"]

    # Polling jusqu'à complétion
    while True:
        status = requests.get(
            f"https://api.meshy.ai/openapi/v1/image-to-3d/{task_id}",
            headers={"Authorization": f"Bearer {api_key}"},
            timeout=15,
        ).json()
        if status["status"] == "SUCCEEDED":
            glb_url = status["model_urls"]["glb"]
            glb_resp = requests.get(glb_url, timeout=30)
            out_path.write_bytes(glb_resp.content)
            return out_path
        if status["status"] == "FAILED":
            raise RuntimeError(f"Échec génération Meshy: {status}")
        time.sleep(5)

def generate_3d(slug: str, base_dir: str = "work") -> Path:
    refs_dir = Path(base_dir) / slug / "refs"
    image_path = sorted(refs_dir.glob("ref_*"))[0]  # première image = référence principale
    out_path = Path(base_dir) / slug / "model.glb"

    api_key = os.environ.get("MESHY_API_KEY")
    if api_key:
        print("Utilisation de l'API Meshy (payant)")
        return generate_3d_via_meshy(image_path, out_path, api_key)
    else:
        print("Pas de MESHY_API_KEY détectée — utilisation du Space HF gratuit")
        return generate_3d_via_hf(image_path, out_path)

if __name__ == "__main__":
    slug = sys.argv[1]
    result = generate_3d(slug)
    print(f"Mesh généré : {result}")
```

**Critère de validation** : un fichier `work/<slug>/model.glb` non vide
existe après exécution.

**Note pour OpenCode** : les Spaces Hugging Face communautaires changent
fréquemment de signature d'API. Avant d'exécuter en batch sur tout le
catalogue, faire un test unitaire sur `dell-precision-3490` et inspecter la
réponse brute (`print(result)`) pour confirmer le format retourné.

🆕 **Avant tout lancement en mode `--all`**, exécuter ce test unitaire sur
2 ou 3 produits de marques différentes (pas seulement Dell) et vérifier
manuellement le `.glb` obtenu (ouverture dans Blender ou un viewer glTF en
ligne) — un Space communautaire gratuit peut fonctionner pour une catégorie
de produit (ex. laptop) et mal se comporter sur une autre géométrie très
différente (ex. caméra dôme Hikvision, baie de brassage réseau). Consigner
les échecs par catégorie dans le rapport de synchronisation (Étape 5) plutôt
que de les découvrir en fin de batch complet.

---

## Étape 3 — `scripts/render_blender.py`

Rôle : importer le `.glb`, appliquer un éclairage HDRI, cadrer une caméra,
et exporter un rendu PNG. Ce script s'exécute **à l'intérieur de Blender**,
pas avec le Python système.

🆕 **Deux corrections apportées à la version v1.0** :
1. **Caméra adaptative** : la v1.0 plaçait la caméra à une position/rotation
   fixe quelle que soit la taille de l'objet importé. Le catalogue
   HardwareCentral va d'un point d'accès mural compact à un rack de stockage
   pleine hauteur — une caméra fixe cadre correctement un sous-ensemble de
   produits et mal les autres (trop loin/trop près, objet coupé). La
   fonction calcule désormais la boîte englobante du mesh importé et
   positionne caméra + distance focale en conséquence.
2. **Fond transparent** : la v1.0 laissait l'environnement HDRI visible en
   arrière-plan du rendu. Pour un usage e-commerce (carte produit sur fond
   blanc du site, cohérent avec les pratiques du secteur — photo produit
   isolée sur fond neutre plutôt que scène en contexte), le film de rendu
   est configuré en transparent ; l'éclairage HDRI reste utilisé uniquement
   pour l'éclairage/les reflets, pas comme arrière-plan visible. Le PNG
   obtenu, avec canal alpha, se compose proprement sur n'importe quel fond
   de carte produit du site.

```python
import sys
import bpy
from mathutils import Vector
from pathlib import Path

def get_scene_bounds():
    """Boîte englobante de tous les objets mesh importés (repère monde)."""
    min_co = Vector((float("inf"),) * 3)
    max_co = Vector((float("-inf"),) * 3)
    for obj in bpy.context.scene.objects:
        if obj.type != "MESH":
            continue
        for corner in obj.bound_box:
            world_co = obj.matrix_world @ Vector(corner)
            min_co = Vector(min(a, b) for a, b in zip(min_co, world_co))
            max_co = Vector(max(a, b) for a, b in zip(max_co, world_co))
    center = (min_co + max_co) / 2
    size = max((max_co - min_co).length, 0.01)
    return center, size

def build_scene(glb_path: str, hdri_path: str, output_path: str,
                 engine: str = "BLENDER_EEVEE_NEXT"):
    bpy.ops.wm.read_factory_settings(use_empty=True)

    # Import du mesh
    bpy.ops.import_scene.gltf(filepath=glb_path)

    # 🆕 Cadrage caméra adaptatif basé sur la taille réelle de l'objet
    center, size = get_scene_bounds()
    distance = size * 1.8  # marge autour de l'objet, quel que soit son échelle
    cam_offset = Vector((distance * 0.85, -distance * 0.85, distance * 0.55))
    bpy.ops.object.camera_add(location=center + cam_offset)
    camera = bpy.context.object
    direction = center - camera.location
    camera.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
    bpy.context.scene.camera = camera

    # Éclairage HDRI (studio_small.hdr téléchargé depuis polyhaven.com, CC0)
    world = bpy.context.scene.world or bpy.data.worlds.new("World")
    bpy.context.scene.world = world
    world.use_nodes = True
    nt = world.node_tree
    env_tex = nt.nodes.new("ShaderNodeTexEnvironment")
    env_tex.image = bpy.data.images.load(hdri_path)
    nt.links.new(env_tex.outputs["Color"], nt.nodes["Background"].inputs["Color"])

    # Réglages rendu — Eevee par défaut : léger, adapté à un poste sans GPU dédié
    scene = bpy.context.scene
    scene.render.engine = engine
    scene.render.resolution_x = 1600
    scene.render.resolution_y = 1600  # 🆕 carré, cohérent avec les cartes produit du site
    scene.render.film_transparent = True  # 🆕 fond transparent — HDRI utilisé pour l'éclairage seul
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"  # 🆕 requis pour conserver l'alpha
    scene.render.filepath = output_path
    bpy.ops.render.render(write_still=True)

if __name__ == "__main__":
    # Arguments passés après `--` sur la ligne de commande Blender
    argv = sys.argv[sys.argv.index("--") + 1:]
    glb_path, hdri_path, output_path = argv
    build_scene(glb_path, hdri_path, output_path)
```

Commande d'exécution (PowerShell) :
```powershell
blender --background --python scripts/render_blender.py -- `
  work/dell-precision-3490/model.glb `
  assets/hdri/studio_small.hdr `
  outputs/dell-precision-3490/render.png
```
Si `blender` n'est pas reconnu comme commande, redémarrer le terminal après
l'installation via `winget`, ou utiliser le chemin complet vers
`blender.exe` (typiquement sous `C:\Program Files\Blender Foundation\Blender <version>\`).

**Critère de validation** : `outputs/<slug>/render.png` existe, fait plus de
quelques dizaines de Ko, et 🆕 possède un canal alpha exploitable (vérifiable
via `Image.open(path).mode == "RGBA"` avec Pillow — le produit doit se
détacher proprement d'un fond uni, sans rectangle de couleur d'environnement
visible autour de lui).

**Note performance** : `BLENDER_EEVEE_NEXT` reste le choix par défaut pour
sa rapidité, en particulier en traitement batch sur tout le catalogue. Pour
un rendu isolé où la qualité prime (ex. produit mis en avant), `CYCLES` en
mode CPU est réaliste sur ce hardware (11ᵉ Gen Intel) — compter un temps de
rendu plus long mais sans nécessité de déport cloud. Le GPU Iris Xe intégré
n'est pas garanti comme device Cycles supporté par Blender (le support
oneAPI cible surtout les GPU Intel Arc dédiés) : ne pas configurer
`scene.cycles.device = 'GPU'` sans avoir vérifié au préalable que Blender
détecte bien un device compatible sur ce poste. En cas de doute, le mode
CPU reste le choix sûr. Le déport vers Colab (GPU gratuit) garde son
intérêt pour du rendu Cycles en volume sur tout le catalogue.

---

## Étape 4 — `scripts/orchestrate.py`

Rôle : enchaîner les 3 étapes pour un slug donné, ou pour tout
`products.yaml` en mode batch.

```python
import subprocess
import sys
import yaml
from pathlib import Path

def run_pipeline(slug: str):
    print(f"=== Pipeline pour {slug} ===")
    subprocess.run(["python", "scripts/download_refs.py", slug], check=True)
    subprocess.run(["python", "scripts/generate_3d.py", slug], check=True)

    out_dir = Path("outputs") / slug
    out_dir.mkdir(parents=True, exist_ok=True)
    subprocess.run([
        "blender", "--background", "--python", "scripts/render_blender.py", "--",
        f"work/{slug}/model.glb",
        "assets/hdri/studio_small.hdr",
        f"outputs/{slug}/render.png",
    ], check=True)
    print(f"=== Terminé : outputs/{slug}/render.png ===")

def run_all():
    with open("products.yaml") as f:
        config = yaml.safe_load(f)
    failures = []
    for product in config["products"]:
        try:
            run_pipeline(product["slug"])
        except subprocess.CalledProcessError as e:
            print(f"ÉCHEC pour {product['slug']}: {e}")
            failures.append(product["slug"])
    if failures:
        print(f"\n{len(failures)} échec(s): {failures}")

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--all":
        run_all()
    else:
        run_pipeline(sys.argv[1])
```

Usage :
```bash
python scripts/orchestrate.py dell-precision-3490   # un seul produit
python scripts/orchestrate.py --all                  # tout le catalogue
```

🆕 **Réalisme d'échelle avant de lancer `--all` sur 240 produits** :
chaque produit enchaîne un appel réseau (téléchargement réf.), un appel à un
Space Hugging Face gratuit (file d'attente non garantie, potentiellement
plusieurs minutes par produit aux heures de forte demande) puis un rendu
Blender local. Sur ce poste (pas de GPU dédié), prévoir un ordre de grandeur
de plusieurs heures pour l'intégralité du catalogue, pas quelques minutes.
Prioriser dans `products.yaml` : d'abord les produits `isFeatured: true` et
ceux affichés en page d'accueil (cohérent avec `src/lib/data/products/*.ts`),
puis le reste par ordre de `publishedAt`. Ne pas lancer `--all` sans
supervision la première fois — lancer sur un lot de 10-15 produits, valider
visuellement les rendus, puis étendre.

---

## 🆕 Étape 5 — `scripts/sync_to_catalog.py` (intégration au site — obligatoire, pas une extension future)

Rôle : faire le pont entre `outputs/<slug>/render.png` et le catalogue
Next.js réel, **sans jamais écrire directement dans
`src/lib/data/products/*.ts`** — même discipline que
`scripts/ingest-product-media.ts` déjà en place dans le dépôt principal
(spec section 6.5.1 : révision humaine obligatoire avant tout commit dans
les données de production).

```python
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

def build_sync_report(outputs_dir: str = "outputs") -> dict:
    """Associe chaque rendu produit à son slug, sans toucher au code Next.js."""
    entries = []
    for product_dir in sorted(Path(outputs_dir).iterdir()):
        render = product_dir / "render.png"
        if render.exists() and render.stat().st_size > 0:
            entries.append({
                "productId": product_dir.name,
                "renderPath": str(render),
                "status": "ready_for_upload",
            })
        else:
            entries.append({
                "productId": product_dir.name,
                "renderPath": None,
                "status": "missing_or_empty",
            })
    return {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "totalProducts": len(entries),
        "ready": sum(1 for e in entries if e["status"] == "ready_for_upload"),
        "entries": entries,
    }

if __name__ == "__main__":
    report = build_sync_report()
    out_path = Path("sync-reports") / f"{datetime.now().strftime('%Y%m%d-%H%M%S')}.json"
    out_path.parent.mkdir(exist_ok=True)
    out_path.write_text(json.dumps(report, indent=2, ensure_ascii=False))
    print(f"Rapport écrit : {out_path}")
    print(f"{report['ready']}/{report['totalProducts']} rendus prêts à l'upload")
```

**Puis, côté dépôt principal (TypeScript, pas Python)** — réutiliser
l'infrastructure d'upload déjà existante (`src/lib/imagekit.ts`,
`createImageKitClient().uploadImage()`) plutôt que d'en écrire une nouvelle :
un petit script `scripts/upload-3d-renders.ts` lit le rapport JSON produit
par `sync_to_catalog.py`, uploade chaque PNG prêt vers ImageKit sous
`products/{productId}/images/primary-3d.png`, et **écrit un second rapport**
(jamais directement dans `products.ts`) listant, pour chaque produit,
l'URL ImageKit obtenue et le `MediaAsset` complet à coller manuellement —
charge à un humain de relire ce rapport et de committer le changement dans
`src/lib/data/products/*.ts`, exactement comme le prévoit déjà le workflow
en 10 étapes de la section 6.5.1 du spec.

🆕 **Évolution de type nécessaire** (`src/types/index.ts`) pour distinguer
honnêtement un rendu généré par IA d'une vraie photo produit ou d'un
placeholder SVG plat :
```ts
export type ImageSource = 'real' | 'ai-render' | 'placeholder';  // ajout de 'ai-render'
export type ImageProvider =
  | 'amazon-scraper'
  | 'icecat'
  | 'manufacturer-portal'
  | 'manual-capture'
  | 'branded-placeholder'
  | 'ai-3d-render';  // 🆕
```
Un produit dont l'image vient de ce pipeline doit avoir
`imageSource: 'ai-render'` et `provenance.sourceProvider: 'ai-3d-render'` —
jamais `'real'`, pour ne pas laisser croire qu'il s'agit de la photo exacte
du produit vendu (cohérent avec le principe d'honnêteté fonctionnelle déjà
imposé ailleurs dans le spec — pas de donnée qui fait croire à autre chose
que ce qu'elle est).

**Sur la fiche produit**, quand `imageSource === 'ai-render'`, afficher une
micro-mention discrète (ex. « Visuel généré, produit réel non contractuel
sur cette image ») plutôt que de laisser croire à une photo officielle —
plus honnête que la mention actuelle « Image non disponible » (qui est
exacte mais dégrade la confiance) et plus honnête qu'une image muette
présentée sans distinction avec une vraie photo.

---

## Gestion des erreurs — points d'attention pour OpenCode

- **Téléchargement d'images** : gérer les 404, redirections, et types de
  contenu invalides (`download_refs.py` doit lever une erreur explicite,
  pas échouer silencieusement). 🆕 Une référence individuelle en échec ne
  doit plus faire échouer tout le produit si une autre référence est valide.
- **Génération 3D via Space HF gratuit** : pas de SLA, file d'attente
  variable, signature d'API instable dans le temps. Prévoir un `try/except`
  avec message clair invitant à vérifier l'onglet "Use via API" du space
  si l'appel échoue.
- **Rendu Blender** : si `outputs/<slug>/render.png` est absent ou vide
  après exécution, considérer l'étape comme un échec dans `orchestrate.py`.
- **Batch complet** : `run_all()` doit continuer sur les produits suivants
  même si un produit échoue, et lister les échecs à la fin (déjà implémenté
  ci-dessus).
- 🆕 **Intégration catalogue** : `sync_to_catalog.py` et
  `upload-3d-renders.ts` ne doivent jamais faire planter le build du site —
  ce sont des scripts hors ligne, exécutés manuellement, complètement
  déconnectés du pipeline `next build`.

---

## Point d'attention légal

Si le chemin gratuit (Space HF ou tier gratuit Meshy) est utilisé, les
modèles générés peuvent être soumis à une licence type CC BY (attribution
requise) ou à des conditions de partage public selon le service. Avant tout
usage commercial à grande échelle sur HardwareCentral, vérifier les CGU du
service utilisé. Vérifier également les conditions d'usage de l'imagerie
produit des marques partenaires (HPE, Dell, Fortinet, Cisco, Huawei,
Hikvision) avant de vous baser sur leurs photos officielles comme
référence. 🆕 Voir aussi la section « Sourcing des images de référence »
en tête de ce document, qui restreint désormais les sources acceptées aux
domaines officiels des constructeurs.

---

## Checklist de validation finale (produit test : Dell Precision 3490)

- [ ] `products.yaml` contient l'entrée `dell-precision-3490` avec au moins
      une URL d'image valide, hébergée sur le domaine officiel Dell
- [ ] `download_refs.py` télécharge, valide la résolution et enregistre
      l'image sans erreur
- [ ] `generate_3d.py` produit un `.glb` non vide (chemin gratuit HF testé
      en premier, chemin Meshy en fallback si clé API fournie)
- [ ] `render_blender.py` produit un rendu PNG non vide, cadré correctement
      **quelle que soit la taille de l'objet**, avec fond transparent
- [ ] `orchestrate.py dell-precision-3490` exécute les 3 étapes sans
      intervention manuelle
- [ ] 🆕 `sync_to_catalog.py` produit un rapport JSON correct
- [ ] 🆕 le rendu apparaît réellement sur `hardware-central.com` (ou son
      environnement de preview Vercel) après upload ImageKit + édition
      manuelle de `products.ts` — pas seulement présent localement dans
      `outputs/`
- [ ] `orchestrate.py --all` traite le reste du catalogue par lots
      (10-15 produits à la fois, pas en une seule passe) et rapporte les
      échecs éventuels

## Extensions futures (hors scope immédiat)

- Intégration directe du rendu final dans le pipeline Payload CMS de
  HardwareCentral (upload automatique vers Cloudflare R2) — si/quand ce
  CMS est effectivement adopté (voir stack recommandée du spec, section 7)
- Rendu Cycles GPU via notebook Google Colab pour une qualité supérieure
  sur les fiches produit mises en avant
- Cache/skip automatique si `outputs/<slug>/render.png` existe déjà et que
  `products.yaml` n'a pas changé pour ce produit
- Script `check_hf_space.py` de test de santé (ping + petit appel de test)
  à exécuter avant tout lancement `--all`, pour détecter en amont qu'un
  Space a changé de signature ou est hors service
