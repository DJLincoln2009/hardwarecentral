import type { Metadata } from 'next';
import FavorisContent from './FavorisContent';

export const metadata: Metadata = {
  title: 'Favoris',
  robots: { index: false, follow: false },
};

export default function FavorisPage() {
  return <FavorisContent />;
}
