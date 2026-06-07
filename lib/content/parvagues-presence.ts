/**
 * ParVagues presence — the single seam for the artist's platform links.
 *
 * These are hardcoded here today, lifted into one place. Later a separate
 * tooling project will emit a `presence.json` SSOT; when it lands, swap the
 * body of `getParvaguesPresence()` to read that file and nothing downstream
 * should need to change.
 *
 * Deliberately minimal: this is NOT a schema and NOT a place to invent links.
 * It holds only links that already exist in the repo. Components are not yet
 * wired to it — that rewire happens when presence.json actually arrives.
 */

export type PresenceLink = {
  /** stable platform key, e.g. 'instagram' | 'youtube' */
  platform: string;
  label: string;
  href: string;
};

const PRESENCE: PresenceLink[] = [
  { platform: 'instagram', label: 'Instagram', href: 'https://instagram.com/parvagues.mp3' },
  { platform: 'gitlab', label: 'GitLab', href: 'http://nech.pl/Tidal' },
  { platform: 'youtube', label: 'YouTube', href: 'https://youtube.com/@parvagues' },
  { platform: 'mastodon', label: 'Mastodon', href: 'https://chaos.social/@PixelNoir' },
];

export function getParvaguesPresence(): PresenceLink[] {
  return PRESENCE;
}
