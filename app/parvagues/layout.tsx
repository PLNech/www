import { Syne } from 'next/font/google';
import { FaInstagram, FaYoutube, FaGitlab } from 'react-icons/fa';
import { SiMastodon } from 'react-icons/si';
import ParvaguesHeader from '@/components/parvagues/ParvaguesHeader';
import RevealController from '@/components/parvagues/RevealController';

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  display: 'swap',
  weight: ['400', '600', '700', '800'],
});

const socials = [
  { href: 'https://instagram.com/parvagues.mp3', icon: FaInstagram, label: 'Instagram' },
  { href: 'http://nech.pl/Tidal', icon: FaGitlab, label: 'GitLab' },
  { href: 'https://youtube.com/@parvagues', icon: FaYoutube, label: 'YouTube' },
  { href: 'https://chaos.social/@PixelNoir', icon: SiMastodon, label: 'Mastodon' },
];

export const metadata = {
  title: { absolute: 'ParVagues' },
  description:
    'ParVagues - Livecoding de musique électronique. Ondes binaires, plages sonores.',
  // NOTE: the old shell set og:type="music.musician" via a raw <meta>; Next's
  // typed Metadata API rejects that value, so we inherit the root "website"
  // default for now. Phase 2 (ParVagues redesign) can revisit OG semantics.
  icons: { icon: '/images/parvagues/logo.png' },
};

export default function ParvaguesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      data-theme="parvagues"
      className={`parvagues-root ${syne.variable} noise-overlay min-h-screen bg-[var(--surface)] text-[var(--text-primary)] selection:bg-[var(--neon-high)]/30 selection:text-white`}
    >
      <RevealController />
      <ParvaguesHeader />

      <main>{children}</main>

      <footer className="border-t border-white/[0.06] py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col items-center gap-8">
            <div className="flex items-center gap-6">
              {socials.map(({ href, icon: Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--text-muted)] hover:text-white transition-colors duration-300"
                  aria-label={label}
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
            <div className="text-center">
              <p className="text-[var(--text-muted)] text-xs tracking-wider">
                © {new Date().getFullYear()} ParVagues
              </p>
              <a
                href="mailto:parvagues@nech.pl"
                className="text-[var(--text-muted)] hover:text-[var(--neon-high)] text-xs tracking-wider transition-colors"
              >
                parvagues@nech.pl
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
