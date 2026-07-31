import sys

from orchestrate import run

# Étape d'upload seule — exige un rendu existant dans outputs/.
# Le rapport produit est relu et committé manuellement (jamais d'écriture
# directe dans products.ts).
if __name__ == "__main__":
    slug = sys.argv[1]
    run("sync", slug)
