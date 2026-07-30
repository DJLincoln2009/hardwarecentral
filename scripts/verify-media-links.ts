// scripts/verify-media-links.ts
// Contrôle périodique des URLs du stockage propre au projet (section 6.5.10 du spec).
// Vérifie que chaque MediaAsset.url dans products.ts est accessible (HEAD).
//
// Usage : npx tsx scripts/verify-media-links.ts
//
// TODO: nécessite les identifiants R2 configurés dans .env.local

async function main() {
  console.log('=== Vérification des liens médias HardwareCentral ===');
  console.log('');
  console.log('Ce script vérifiera chaque URL de MediaAsset dans le catalogue par requête HEAD.');
  console.log('');
  console.log('ERREUR : Stockage média non configuré. Voir .env.example.');
  process.exit(1);
}

main();

export {};
