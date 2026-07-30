import { Shield, Truck, Clock, Headphones } from 'lucide-react';

const badges = [
  { icon: Shield, title: 'Équipements authentiques', description: 'Matériel neuf, sous garantie constructeur' },
  { icon: Truck, title: 'Livraison en CEMAC', description: 'Transport sécurisé, suivi de colis inclus' },
  { icon: Clock, title: 'Devis sous 24h ouvrées', description: 'Engagement de réponse rapide' },
  { icon: Headphones, title: 'Support technique dédié', description: 'Assistance pour nos clients sous contrat' },
];

function TrustBadges() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {badges.map((badge) => (
        <div key={badge.title} className="flex flex-col items-center gap-2 text-center">
          <badge.icon className="h-6 w-6 text-teal-600" aria-hidden="true" />
          <p className="text-sm font-semibold text-graphite-900">{badge.title}</p>
          <p className="text-xs text-graphite-500">{badge.description}</p>
        </div>
      ))}
    </div>
  );
}

export default TrustBadges;
