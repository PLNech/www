import FleursClient from './FleursClient';

export const metadata = {
  title: { absolute: 'La Fête des Fleurs' },
  description: 'Invitation — La Fête des Fleurs, 21 mars, Jour du Printemps. Dès 17 h.',
  openGraph: {
    title: 'La Fête des Fleurs',
    description: '21 mars · Jour du Printemps · Dès 17 h · Éclosion collective.',
    type: 'website',
    images: [{ url: 'https://me.nech.pl/og-fleurs.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'La Fête des Fleurs',
    description: '21 mars · Jour du Printemps · Dès 17 h',
    images: ['https://me.nech.pl/og-fleurs.png'],
  },
};

export default function FleursPage() {
  return <FleursClient />;
}
