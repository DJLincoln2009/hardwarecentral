import { Shield, Truck, Clock, Headphones, type LucideIcon } from 'lucide-react';

interface TrustBadge {
  icon: LucideIcon;
  title: string;
  description: string;
}

const badges: TrustBadge[] = [
  { icon: Shield, title: 'Équipements authentiques', description: 'Matériel neuf, sous garantie constructeur' },
  { icon: Truck, title: 'Livraison en CEMAC', description: 'Transport sécurisé, suivi de colis inclus' },
  { icon: Clock, title: 'Devis sous 48-72h ouvrées', description: 'Engagement de réponse rapide' },
  { icon: Headphones, title: 'Support technique dédié', description: 'Assistance pour nos clients sous contrat' },
];

function TrustBadges() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {badges.map((badge) => (
        <div
          key={badge.title}
          className="group flex items-start gap-3 min-h-[44px] rounded-2xl border border-border bg-surface p-4 shadow-xs transition-all duration-300 ease-[var(--ease-out-expo)] hover:-translate-y-1 hover:border-border-strong hover:shadow-lg sm:gap-3.5 sm:p-5"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700 transition-all duration-300 ease-[var(--ease-out-expo)] group-hover:bg-teal-600 group-hover:text-white dark:bg-teal-500/15 dark:text-teal-300 dark:group-hover:bg-teal-500 sm:h-11 sm:w-11">
            <badge.icon className="h-5 w-5 max-sm:h-4 max-sm:w-4" aria-hidden="true" />
          </span>
          <span>
            <p className="text-sm font-semibold text-foreground max-sm:text-xs">{badge.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted max-sm:text-[11px] max-sm:mt-0.5">{badge.description}</p>
          </span>
        </div>
      ))}
    </div>
  );
}

export default TrustBadges;
