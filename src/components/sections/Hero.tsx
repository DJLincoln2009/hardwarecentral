import Link from 'next/link';

function Hero() {
  return (
    <section className="bg-graphite-900 px-4 py-16 md:py-24">
      <div className="mx-auto max-w-7xl text-center">
        <h1 className="text-3xl font-bold text-white font-display md:text-5xl">
          Équipements IT professionnels pour l&apos;Afrique Centrale
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-graphite-200 md:text-lg">
          Plateforme de référence pour l&apos;acquisition de serveurs, stockage, réseau, sécurité
          et vidéosurveillance au Cameroun et dans la zone CEMAC.
        </p>
        <Link
          href="/catalogue"
          className="mt-8 inline-flex rounded-md bg-teal-600 px-6 py-3 text-base font-medium text-white hover:bg-teal-800 transition-colors focus-visible:ring-2 focus-visible:ring-teal-200 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          Découvrir le catalogue
        </Link>
      </div>
    </section>
  );
}

export default Hero;
