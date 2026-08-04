import argparse
import json
import time
import gradio_client as gc
from pathlib import Path

HF_SPACE = "microsoft/TRELLIS"
API_NAME = "/generate_3d"

# TODO (réseau limité): vérifier que le Space TRELLIS expose toujours
# l'api_name "/generate_3d" — l'API des Spaces HF peut changer sans préavis.
# Si l'appel échoue, inspecter la doc du Space (gradio_client Client.view_api()).


def generate_3d(ref_images: list[Path], out_dir: Path, runs: int = 2) -> Path:
    client = gc.Client(HF_SPACE)
    first = True
    last_path = None
    fov = None

    if runs > 5:
        print(
            f"⚠ {runs} runs demandés — chaque run consomme le quota gratuit du "
            "Space. Confirmer avant de continuer sur plusieurs produits."
        )

    for i, img in enumerate(ref_images):
        img_dir = out_dir / img.stem
        img_dir.mkdir(parents=True, exist_ok=True)

        for r in range(runs):
            target = img_dir / f"run_{r}.mp4"
            if target.exists():
                print(f"  déjà généré: {target} — skip")
                last_path = target
                continue

            start = time.time()
            print(f"  [{i + 1}/{len(ref_images)}] run {r}/{runs} pour {img.stem} …")
            result = client.predict(
                img.as_posix(),
                "25",
                28,
                api_name=API_NAME,
            )

            video = None
            if isinstance(result, tuple):
                state = result[0]
                video = state["video"]
            else:
                video = result["video"]

            if isinstance(video, tuple):
                video = video[0]
            if isinstance(video, gc.handle_file.FileHandle):
                video = video.path

            Path(video).rename(target)
            if isinstance(state, dict):
                fov = state.get("fov", fov)
            print(f"    → {target} ({time.time() - start:.0f}s)")
            last_path = target
            if first:
                time.sleep(1)
                first = False

    if last_path is None:
        raise RuntimeError("Aucune génération réussie")
    (out_dir / "model_metadata.json").write_text(
        json.dumps({"fov": fov, "runs": runs, "ref_images": len(ref_images)})
    )
    return last_path


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Génération TRELLIS pour un produit")
    parser.add_argument("slug")
    parser.add_argument(
        "--runs",
        type=int,
        default=2,
        help="Nombre de runs TRELLIS par image de référence (défaut: 2)",
    )
    args = parser.parse_args()
    slug = args.slug
    refs_dir = Path("work") / slug / "refs"
    out_dir = Path("work") / slug / "generated"
    refs = sorted(refs_dir.glob("ref_*"))
    if not refs:
        raise SystemExit(f"Aucune référence dans {refs_dir}")
    print(f"Génération TRELLIS pour {slug} ({len(refs)} référence(s))")
    generate_3d(refs, out_dir, runs=args.runs)
