import ObliqueClient from './ObliqueClient';

// The old Pages <Head> lived inside the component; App Router carries it here.
const DESCRIPTION =
  "Oblique Strategies — Brian Eno & Peter Schmidt. 187 stratégies pour contourner le blocage créatif. Tire une carte, glisse, garde.";
const SHARE_BLURB = "187 stratégies créatives d'Eno & Schmidt. Tire une carte.";

export const metadata = {
  title: { absolute: 'OBlique — 187 stratégies' },
  description: DESCRIPTION,
  openGraph: {
    title: "Oblique Strategies",
    description: SHARE_BLURB,
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: "Oblique Strategies",
    description: SHARE_BLURB,
  },
};

export const viewport = {
  themeColor: "#0d1117",
};

export default function ObliquePage() {
  return <ObliqueClient />;
}
