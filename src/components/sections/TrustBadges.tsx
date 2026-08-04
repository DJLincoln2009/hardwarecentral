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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {badges.map((badge) => (
        <div
          key={badge.title}
          className="group flex items-start gap-3.5 rounded-2xl border border-border bg-surface p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-md"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700 transition-colors duration-200 group-hover:bg-teal-600 group-hover:text-white">
            <badge.icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <span>
            <p className="text-sm font-semibold text-foreground">{badge.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted">{badge.description}</p>
          </span>
        </div>
      ))}
    </div>
  );
}

export default TrustBadges;
