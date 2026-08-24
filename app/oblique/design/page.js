import DesignClient from './DesignClient';

// Internal design lab: five palettes, four type pairings, four card anatomies.
// Kept out of sitemaps by having no inbound links — it is a working surface.
export const metadata = {
  title: { absolute: 'Oblique — Design Lab' },
  description: "Oblique Strategies design lab — five palette directions, typography pairings, card anatomy, and reveal playground. Pick a direction.",
  robots: { index: false, follow: false },
};

export const viewport = {
  themeColor: "#0d1117",
};

export default function ObliqueDesignPage() {
  return <DesignClient />;
}
