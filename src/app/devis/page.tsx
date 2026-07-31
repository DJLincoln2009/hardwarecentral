import type { Metadata } from 'next';
import DevisContent from './DevisContent';

export const metadata: Metadata = {
  title: 'Liste de devis',
  robots: { index: false, follow: false },
};

export default function DevisPage() {
  return <DevisContent />;
}
