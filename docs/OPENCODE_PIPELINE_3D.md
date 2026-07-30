# Pipeline IA + 3D pour visuels produits — Instructions pour OpenCode

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
│   └── orchestrate.py
├── work/                            # fichiers intermédiaires (refs, .glb)
│   └── <slug-produit>/
└── outputs/                         # rendus finaux
    └── <slug-produit>/
        └── render.png
```

---

## Étape 0 — Fichier de configuration produits

Créer `products.yaml`. C'est la source de vérité pour le batch — chaque
produit du catalogue HardwareCentral y a une entrée.

```yaml
products:
  - slug: dell-precision-3490
    name: "Dell Precision 3490"
    brand: dell
    reference_images:
      - "https://exemple-constructeur.com/dell-precision-3490-hero.jpg"
      - "https://exemple-distributeur.com/dell-precision-3490-angle.jpg"
    render:
      style: "studio produit, fond neutre, angle 3/4"
```

OpenCode doit valider que chaque URL est bien accessible (HTTP 200,
`Content-Type` image/*) avant de continuer.

---

## Étape 1 — `scripts/download_refs.py`

Rôle : télécharger les images listées dans `products.yaml` pour un slug
donné, les valider, et les stocker dans `work/<slug>/refs/`.

```python
import sys
import yaml
import requests
from pathlib import Path

def load_product(slug: str, config_path: str = "products.yaml") -> dict:
    with open(config_path) as f:
        config = yaml.safe_load(f)
    for p in config["products"]:
        if p["slug"] == slug:
            return p
    raise ValueError(f"Produit inconnu: {slug}")

def download_refs(product: dict, base_dir: str = "work") -> list[Path]:
    out_dir = Path(base_dir) / product["slug"] / "refs"
    out_dir.mkdir(parents=True, exist_ok=True)
    saved = []
    for i, url in enumerate(product["reference_images"]):
        resp = requests.get(url, timeout=15)
        resp.raise_for_status()
        content_type = resp.headers.get("Content-Type", "")
        if "image" not in content_type:
            raise ValueError(f"URL non-image ({content_type}): {url}")
        ext = ".jpg" if "jpeg" in content_type else ".png"
        path = out_dir / f"ref_{i}{ext}"
        path.write_bytes(resp.content)
        saved.append(path)
    return saved

if __name__ == "__main__":
    slug = sys.argv[1]
    product = load_product(slug)
    paths = download_refs(product)
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

---

## Étape 3 — `scripts/render_blender.py`

Rôle : importer le `.glb`, appliquer un éclairage HDRI, cadrer une caméra,
et exporter un rendu PNG. Ce script s'exécute **à l'intérieur de Blender**,
pas avec le Python système.

```python
import sys
import bpy
from pathlib import Path

def build_scene(glb_path: str, hdri_path: str, output_path: str,
                 engine: str = "BLENDER_EEVEE_NEXT"):
    bpy.ops.wm.read_factory_settings(use_empty=True)

    # Import du mesh
    bpy.ops.import_scene.gltf(filepath=glb_path)

    # Éclairage HDRI (studio_small.hdr téléchargé depuis polyhaven.com, CC0)
    world = bpy.context.scene.world or bpy.data.worlds.new("World")
    bpy.context.scene.world = world
    world.use_nodes = True
    nt = world.node_tree
    env_tex = nt.nodes.new("ShaderNodeTexEnvironment")
    env_tex.image = bpy.data.images.load(hdri_path)
    nt.links.new(env_tex.outputs["Color"], nt.nodes["Background"].inputs["Color"])

    # Caméra simple, cadrage 3/4 sur l'objet
    bpy.ops.object.camera_add(location=(2.2, -2.2, 1.6),
                               rotation=(1.15, 0, 0.78))
    bpy.context.scene.camera = bpy.context.object

    # Réglages rendu — Eevee par défaut : léger, adapté à un poste sans GPU dédié
    scene = bpy.context.scene
    scene.render.engine = engine
    scene.render.resolution_x = 1920
    scene.render.resolution_y = 1080
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

**Critère de validation** : `outputs/<slug>/render.png` existe et fait plus
de quelques dizaines de Ko (pas une image vide/noire).

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

---

## Gestion des erreurs — points d'attention pour OpenCode

- **Téléchargement d'images** : gérer les 404, redirections, et types de
  contenu invalides (`download_refs.py` doit lever une erreur explicite,
  pas échouer silencieusement).
- **Génération 3D via Space HF gratuit** : pas de SLA, file d'attente
  variable, signature d'API instable dans le temps. Prévoir un `try/except`
  avec message clair invitant à vérifier l'onglet "Use via API" du space
  si l'appel échoue.
- **Rendu Blender** : si `outputs/<slug>/render.png` est absent ou vide
  après exécution, considérer l'étape comme un échec dans `orchestrate.py`.
- **Batch complet** : `run_all()` doit continuer sur les produits suivants
  même si un produit échoue, et lister les échecs à la fin (déjà implémenté
  ci-dessus).

---

## Point d'attention légal

Si le chemin gratuit (Space HF ou tier gratuit Meshy) est utilisé, les
modèles générés peuvent être soumis à une licence type CC BY (attribution
requise) ou à des conditions de partage public selon le service. Avant tout
usage commercial à grande échelle sur HardwareCentral, vérifier les CGU du
service utilisé. Vérifier également les conditions d'usage de l'imagerie
produit des marques partenaires (HPE, Dell, Fortinet, Cisco, Huawei,
Hikvision) avant de vous baser sur leurs photos officielles comme
référence.

---

## Checklist de validation finale (produit test : Dell Precision 3490)

- [ ] `products.yaml` contient l'entrée `dell-precision-3490` avec au moins
      une URL d'image valide
- [ ] `download_refs.py` télécharge et enregistre l'image sans erreur
- [ ] `generate_3d.py` produit un `.glb` non vide (chemin gratuit HF testé
      en premier, chemin Meshy en fallback si clé API fournie)
- [ ] `render_blender.py` produit un rendu PNG non vide, cadré correctement
- [ ] `orchestrate.py dell-precision-3490` exécute les 3 étapes sans
      intervention manuelle
- [ ] `orchestrate.py --all` traite le reste du catalogue et rapporte les
      échecs éventuels

## Extensions futures (hors scope immédiat)

- Intégration directe du rendu final dans le pipeline Payload CMS de
  HardwareCentral (upload automatique vers Cloudflare R2)
- Rendu Cycles GPU via notebook Google Colab pour une qualité supérieure
  sur les fiches produit mises en avant
- Cache/skip automatique si `outputs/<slug>/render.png` existe déjà et que
  `products.yaml` n'a pas changé pour ce produit
