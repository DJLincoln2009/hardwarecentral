import type { Metadata } from 'next';
import SearchContent from './SearchContent';

export const metadata: Metadata = {
  title: 'Recherche',
  robots: { index: false, follow: true },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <SearchContent searchParams={searchParams} />;
}
