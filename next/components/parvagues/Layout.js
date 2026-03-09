import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { Syne } from 'next/font/google';
import { useState, useEffect } from 'react';
import { FaEnvelope, FaInstagram, FaYoutube, FaGithub } from 'react-icons/fa';
import { SiBluesky, SiMastodon } from 'react-icons/si';

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  display: 'swap',
  weight: ['400', '600', '700', '800'],
});

const socials = [
  { href: 'https://instagram.com/parvagues.mp3', icon: FaInstagram, label: 'Instagram' },
  { href: 'https://bsky.app/profile/nech.pl', icon: SiBluesky, label: 'Bluesky' },
  { href: 'https://github.com/parvagues', icon: FaGithub, label: 'GitHub' },
  { href: 'https://youtube.com/@parvagues', icon: FaYoutube, label: 'YouTube' },
  { href: 'https://chaos.social/@PixelNoir', icon: SiMastodon, label: 'Mastodon' },
];

export default function Layout({ children, title = 'ParVagues' }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className={`${syne.variable} min-h-screen bg-[var(--surface)] text-[var(--text-primary)] selection:bg-[var(--neon-high)]/30 selection:text-white`}>
      <Head>
        <title>{title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="ParVagues - Livecoding de musique électronique. Ondes binaires, plages sonores." />
        <meta property="og:title" content={title} />
        <meta property="og:type" content="music.musician" />
        <link rel="icon" href="/images/parvagues/logo.png" />
      </Head>

      {/* Header */}
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-[var(--surface)]/95 backdrop-blur-md border-b border-white/[0.06]'
            : ''
        }`}
      >
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/parvagues" className="flex items-center gap-3 group">
            <Image
              src="/images/parvagues/logo.png"
              alt="ParVagues"
              width={28}
              height={28}
              className="transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(217,0,255,0.5)]"
            />
            <span
              className="font-display font-bold text-xs tracking-[0.15em] uppercase transition-opacity duration-500"
              style={{ opacity: scrolled ? 1 : 0 }}
            >
              ParVagues
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-[11px] tracking-[0.2em] uppercase">
            {['tour', 'music', 'video', 'booking'].map((id) => (
              <a
                key={id}
                href={`#${id}`}
                className="text-[var(--text-muted)] hover:text-white transition-colors duration-300"
              >
                {id}
              </a>
            ))}
          </nav>

          <a
            href="#booking"
            className="flex items-center gap-2 px-4 py-2 text-[11px] tracking-[0.15em] uppercase border border-white/20 rounded-full hover:bg-white hover:text-[var(--surface)] transition-all duration-300"
          >
            <FaEnvelope className="w-3 h-3" />
            <span className="hidden sm:inline">Book</span>
          </a>
        </div>
      </header>

      <main>{children}</main>

      {/* Footer */}
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
