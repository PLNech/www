import CosmicFestClient from './CosmicFestClient';

const DESCRIPTION =
  "cosmicfest_v2.67Hz · 20–23 août 2026, Labenne-Océan. Deux états, un seul système : on s'intrique. Live coding ParVagues, dj set Nesta Flex, visuels shipow. Sur invitation.";
const SHARE_BLURB =
  "20–23 août 2026, Labenne-Océan. On s'intrique sur 67 hertz. Sur invitation.";
const HERO = '/images/cosmicfest/hero.jpg';

// Ported from the v2 page's <Head> — App Router carries this as metadata instead.
export const metadata = {
  title: { absolute: 'cosmicfest_v2.67Hz' },
  description: DESCRIPTION,
  openGraph: {
    title: 'cosmicfest_v2.67Hz',
    description: SHARE_BLURB,
    type: 'website',
    images: [HERO],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'cosmicfest_v2.67Hz',
    description: SHARE_BLURB,
    images: [HERO],
  },
};

export const viewport = {
  themeColor: '#1a1330',
};

export default function CosmicFestPage() {
  return <CosmicFestClient />;
}
