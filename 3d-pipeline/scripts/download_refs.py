import sys
import yaml
import requests
from io import BytesIO
from pathlib import Path
from urllib.parse import urlparse
from PIL import Image

MIN_DIMENSION = 800


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
            img.verify()
            img = Image.open(BytesIO(resp.content))
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
