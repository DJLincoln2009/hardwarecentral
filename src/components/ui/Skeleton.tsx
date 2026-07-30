interface SkeletonProps {
  className?: string;
  /** Hauteur en pixels ou classe Tailwind, ex: "h-4" */
  height?: string;
  /** Largeur : classe Tailwind ou pourcentage, ex: "w-full" ou "w-3/4" */
  width?: string;
  /** Nombre de lignes (pour les blocs de texte) */
  lines?: number;
}

function Skeleton({ className = '', height = 'h-4', width = 'w-full', lines }: SkeletonProps) {
  if (lines && lines > 1) {
    return (
      <div className="flex flex-col gap-2" aria-hidden="true">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`animate-pulse rounded-sm bg-graphite-100 ${height} ${i === lines - 1 ? 'w-3/4' : width}`}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-sm bg-graphite-100 ${height} ${width} ${className}`}
    />
  );
}

export default Skeleton;
