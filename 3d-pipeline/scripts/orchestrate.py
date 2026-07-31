import sys
import subprocess
from pathlib import Path

PIPELINE_DIR = Path(__file__).resolve().parent.parent
REPO_DIR = PIPELINE_DIR.parent


def run(step: str, slug: str) -> None:
    python = sys.executable
    if step in ("all", "refs"):
        subprocess.run(
            [python, str(PIPELINE_DIR / "scripts" / "download_refs.py"), slug],
            cwd=PIPELINE_DIR,
            check=True,
        )
    if step in ("all", "gen"):
        subprocess.run(
            [python, str(PIPELINE_DIR / "scripts" / "generate_3d.py"), slug],
            cwd=PIPELINE_DIR,
            check=True,
        )
    if step in ("all", "render"):
        subprocess.run(
            [
                "blender",
                "--background",
                str(PIPELINE_DIR / "scripts" / "render_blender.py"),
                "--",
                slug,
                str(PIPELINE_DIR / "work"),
                str(PIPELINE_DIR / "outputs"),
            ],
            cwd=PIPELINE_DIR,
            check=True,
        )
    if step in ("all", "sync"):
        subprocess.run(
            ["npx", "tsx", "scripts/upload-3d-renders.ts", slug],
            cwd=REPO_DIR,
            check=True,
        )


if __name__ == "__main__":
    if len(sys.argv) < 2:
        raise SystemExit("Usage: python orchestrate.py <slug> [--steps refs|gen|render|sync]")
    slug = sys.argv[1]
    steps = sys.argv[2] if len(sys.argv) > 2 else "all"
    run(steps, slug)
    print(f"Pipeline {slug} terminé ({steps}).")
