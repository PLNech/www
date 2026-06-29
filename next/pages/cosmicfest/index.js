import Head from 'next/head';
import Image from 'next/image';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Archivo, Martian_Mono } from 'next/font/google';
import styles from '../../styles/cosmicfest.module.css';
import Countdown from '../../components/cosmicfest/Countdown';
import EntanglementField from '../../components/cosmicfest/EntanglementField';

const sans = Archivo({ subsets: ['latin'], axes: ['wdth'], display: 'swap', variable: '--font-cf-sans' });
const mono = Martian_Mono({ subsets: ['latin'], display: 'swap', variable: '--font-cf-mono' });

const JOUR_J = '2026-08-22T18:00:00+02:00';

const LINEUP = [
  { name: 'ParVagues', real: 'PLN', role: 'live coding · breakbeat → techno nujazz', emoji: '💻' },
  { name: 'Nesta Flex', real: 'Antoine', role: 'dj set', emoji: '🎛️' },
  { name: 'shipow', real: 'Kévin', role: 'projection visuelle', emoji: '🖼️' },
];

const PROGRAMME = [
  { e: '🌞', t: 'chillance absolue' },
  { e: '🍖', t: 'bbq' },
  { e: '🏖️', t: 'plage' },
  { e: '🛹', t: 'skate' },
  { e: '🏄', t: 'surf' },
  { e: '🎵', t: 'musique' },
];

const PACKING = [
  { e: '🏕️', t: 'tente & camping (si besoin)' },
  { e: '🩳', t: 'maillot de bain' },
  { e: '🧖', t: 'serviette' },
  { e: '🛹', t: 'skate / surf' },
  { e: '🎸', t: 'instruments' },
];

const SOUVENIRS = [
  { src: '/images/cosmicfest/v0_parvagues_lineup.jpg', alt: 'v0 · ParVagues en live coding' },
  { src: '/images/cosmicfest/v0_hugo.jpg', alt: 'v0 · Hugo à la guitare' },
  { src: '/images/cosmicfest/v0_off_01.jpg', alt: 'v0 · le off, au bunker' },
  { src: '/images/cosmicfest/v0_off_03.jpg', alt: 'v0 · nuit sur la plage' },
];

const MAILTO =
  'mailto:cosmic@nech.pl' +
  '?subject=' +
  encodeURIComponent('je suis chaud · cosmicfest_v2.67Hz') +
  '&body=' +
  encodeURIComponent('salut ! je viens.\n\nmon côté cosmique : ...\n+1 : oui / non\narrivée prévue : ...\n');

export default function CosmicFest() {
  const [modal, setModal] = useState(null); // { src, alt }
  const rootRef = useRef(null);
  const closeBtnRef = useRef(null);
  const lastFocusRef = useRef(null);

  const openModal = useCallback((img) => {
    lastFocusRef.current = document.activeElement;
    setModal(img);
    document.body.style.overflow = 'hidden';
  }, []);
  const closeModal = useCallback(() => {
    setModal(null);
    document.body.style.overflow = '';
    // Return focus to the thumbnail that opened the lightbox.
    if (lastFocusRef.current?.focus) lastFocusRef.current.focus();
  }, []);

  // Esc closes the lightbox; focus moves into the dialog on open.
  useEffect(() => {
    if (!modal) return undefined;
    closeBtnRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && closeModal();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modal, closeModal]);

  // Scroll reveals — only armed when JS is ready AND motion is allowed, so content
  // is never gated behind a transition that fails to fire on headless / no-JS renders.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !('IntersectionObserver' in window)) return undefined;

    root.classList.add(styles.jsReady);
    const targets = root.querySelectorAll(`.${styles.reveal}`);
    const reveal = (el) => el.classList.add(styles.revealIn);
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            reveal(entry.target);
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    targets.forEach((t) => io.observe(t));
    // Safety net: if the observer never fires (background tab, headless render, edge
    // browsers), nothing must stay hidden. Reveal everything after a beat regardless.
    const safety = setTimeout(() => targets.forEach(reveal), 2500);
    return () => {
      io.disconnect();
      clearTimeout(safety);
    };
  }, []);

  return (
    <div ref={rootRef} className={`${styles.page} ${sans.variable} ${mono.variable}`}>
      <Head>
        <title>cosmicfest_v2.67Hz</title>
        <meta
          name="description"
          content="cosmicfest_v2.67Hz · 20–23 août 2026, Labenne-Océan. Deux états, un seul système : on s'intrique. Live coding ParVagues, dj set Nesta Flex, visuels shipow. Sur invitation."
        />
        <meta name="theme-color" content="#1a1330" />
        <meta property="og:title" content="cosmicfest_v2.67Hz" />
        <meta property="og:description" content="20–23 août 2026, Labenne-Océan. On s'intrique sur 67 hertz. Sur invitation." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/images/cosmicfest/hero.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="cosmicfest_v2.67Hz" />
        <meta name="twitter:description" content="20–23 août 2026, Labenne-Océan. On s'intrique sur 67 hertz. Sur invitation." />
        <meta name="twitter:image" content="/images/cosmicfest/hero.jpg" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        {/* ── HERO ── */}
        <header className={styles.hero}>
          <EntanglementField className={styles.heroCanvas} />
          <div className={styles.heroInner}>
            <span className={styles.freq}>
              <span className={styles.freqDot} aria-hidden="true" />
              cosmicfest <b>v2.67Hz</b> · 2026
            </span>
            <h1 className={styles.wordmark}>
              <em>cosmicfest</em>
            </h1>
            <p className={styles.heroTagline}>
              deux états, un seul système. on s&rsquo;intrique sur 67&nbsp;hertz, le temps d&rsquo;un été à
              Labenne-Océan.
            </p>
            <div className={styles.heroMeta}>
              <span>20 → 23 août 2026</span>
              <span>Labenne-Océan</span>
              <span>jour J · samedi 22</span>
            </div>
            <div className={styles.heroActions}>
              <a className={styles.ctaButton} href={MAILTO}>
                réponds à l&rsquo;invitation
              </a>
              <a className={styles.ctaGhost} href="#sejour">
                le séjour ↓
              </a>
            </div>
          </div>
          <span className={styles.scrollCue}>défile</span>
        </header>

        {/* ── INTRICATION ── */}
        <section className={`${styles.section} ${styles.concept} ${styles.reveal}`}>
          <p className={styles.stamp}>// intrication</p>
          <p className={styles.conceptQuote}>
            deux <span className={styles.a}>entités</span> séparées par la distance, liées si fort
            qu&rsquo;elles communiquent <span className={styles.b}>à l&rsquo;instant</span> et ne forment plus
            qu&rsquo;un.
          </p>
        </section>

        {/* ── LINEUP ── */}
        <section className={`${styles.section} ${styles.reveal}`}>
          <p className={styles.stamp}>// point d&rsquo;orgue</p>
          <h2 className={styles.sectionTitle}>le 22 août, dans le jardin</h2>
          <ul className={styles.lineup}>
            {LINEUP.map((act) => (
              <li key={act.name} className={styles.lineupRow}>
                <span className={styles.lineupName}>
                  {act.name} <span className={styles.lineupReal}>~ {act.real}</span>
                </span>
                <span className={styles.lineupRole}>
                  {act.emoji} {act.role}
                </span>
              </li>
            ))}
          </ul>
          <p className={styles.lineupGuests}>
            <b>+ special guests</b> — inscriptions ouvertes (ramène ton set, ton instrument, ton chaos)
          </p>
        </section>

        {/* ── SÉJOUR ── */}
        <section id="sejour" className={`${styles.section} ${styles.reveal}`}>
          <h2 className={styles.sectionTitle}>quatre jours pleins</h2>
          <p className={styles.sectionLede}>
            Du 20 au 23 août 2026 à Labenne-Océan, plus chaude et plus cosmique que la v0. Arrivée
            possible dès le 15 pour les plus pressés. Point d&rsquo;orgue le samedi 22.
          </p>
          <div className={styles.chips}>
            {PROGRAMME.map((p) => (
              <span key={p.t} className={styles.chip}>
                {p.e} {p.t}
              </span>
            ))}
          </div>
        </section>

        {/* ── HÉBERGEMENT ── */}
        <section className={`${styles.section} ${styles.reveal}`}>
          <h2 className={styles.sectionTitle}>où poser ses ondes</h2>
          <div className={styles.defs}>
            <div className={styles.def}>
              <span className={styles.defKey}>maison</span>
              <span className={styles.defVal}>
                <p>10 places à l&rsquo;intérieur, premiers arrivés premiers couchés.</p>
              </span>
            </div>
            <div className={styles.def}>
              <span className={styles.defKey}>jardin</span>
              <span className={styles.defVal}>
                <p>Plante ta tente. Apporte ton matériel de camping dans ce cas.</p>
              </span>
            </div>
            <div className={styles.def}>
              <span className={styles.defKey}>van</span>
              <span className={styles.defVal}>
                <p>Gare-le dans le jardin, branche-toi à la vibe.</p>
              </span>
            </div>
            <div className={styles.def}>
              <span className={styles.defKey}>capacité</span>
              <span className={styles.defVal}>
                <p>16 personnes au total.</p>
                <p className={styles.sub}>+1 bienvenue : partenaires, copines, copains.</p>
              </span>
            </div>
          </div>
        </section>

        {/* ── VENIR ── */}
        <section className={`${styles.section} ${styles.reveal}`}>
          <h2 className={styles.sectionTitle}>rejoindre la vague</h2>
          <div className={styles.defs}>
            <div className={styles.def}>
              <span className={styles.defKey}>gare de Labenne</span>
              <span className={styles.defVal}>
                <p>Arrive ici, je viens te chercher en voiture.</p>
              </span>
            </div>
            <div className={styles.def}>
              <span className={styles.defKey}>gare de Bayonne</span>
              <span className={styles.defVal}>
                <p>Prends le train Bayonne → Labenne (15 min), je te récupère.</p>
                <p className={styles.sub}>Des taxis attendent aussi à la gare de Bayonne.</p>
              </span>
            </div>
          </div>
        </section>

        {/* ── À PRÉVOIR ── */}
        <section className={`${styles.section} ${styles.reveal}`}>
          <h2 className={styles.sectionTitle}>dans le sac</h2>
          <div className={styles.packGrid}>
            {PACKING.map((p) => (
              <div key={p.t} className={styles.packItem}>
                <span aria-hidden="true">{p.e}</span>
                <span>{p.t}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── SOUVENIRS V0 ── */}
        <section className={`${styles.section} ${styles.souvenirs} ${styles.reveal}`}>
          <p className={styles.stamp}>// souvenirs</p>
          <h2 className={styles.sectionTitle}>l&rsquo;an dernier, la v0</h2>
          <p className={styles.sectionLede}>
            On s&rsquo;était déjà bien intriqués. Le set complet de ParVagues, et quelques images du off
            au bunker.
          </p>

          <div className={styles.audioPlayersContainer}>
            <div className={`${styles.audioEmbed} ${styles.bandcampPlayer}`}>
              <iframe
                title="ParVagues · live@cosmicfest (Bandcamp)"
                style={{ border: 0, width: '100%', height: '470px' }}
                src="https://bandcamp.com/EmbeddedPlayer/album=644862623/size=large/bgcol=181320/linkcol=2eb8d6/tracklist=true/artwork=small/transparent=true/"
                seamless
                loading="lazy"
              />
            </div>
            <div className={`${styles.audioEmbed} ${styles.soundcloudPlayer}`}>
              <iframe
                title="ParVagues · Live@cosmicfest (SoundCloud)"
                width="100%"
                height="380"
                scrolling="no"
                frameBorder="no"
                allow="autoplay"
                loading="lazy"
                src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/2121089043&color=%23b5179e&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true"
              />
            </div>
          </div>

          <div className={styles.gallery}>
            {SOUVENIRS.map((photo) => (
              <button
                key={photo.src}
                type="button"
                className={styles.galleryItem}
                onClick={() => openModal(photo)}
                aria-label={`Agrandir : ${photo.alt}`}
              >
                <Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 640px) 50vw, 25vw" style={{ objectFit: 'cover' }} />
                <span className={styles.galleryCaption}>{photo.alt}</span>
              </button>
            ))}
          </div>
        </section>

        {/* ── RSVP ── */}
        <section className={`${styles.section} ${styles.rsvp} ${styles.reveal}`}>
          <p className={styles.stamp}>// jour J · samedi 22 août 2026</p>
          <h2 className={styles.sectionTitle}>tu es chaud ?</h2>
          <div className={styles.countdownContainer}>
            <Countdown targetDate={JOUR_J} />
          </div>
          <a className={styles.ctaButton} href={MAILTO}>
            réponds à l&rsquo;invitation
          </a>
          <p className={styles.waitlistMessage}>
            Une réponse avant le <b>1er août</b>, ce serait top. Pas de billetterie : cosmicfest, c&rsquo;est
            sur invitation. <b>Riders, come to the storm.</b>
          </p>
        </section>
      </main>

      {/* ── LIGHTBOX ── */}
      {modal && (
        <div
          className={styles.modalOverlay}
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-label={modal.alt}
        >
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button ref={closeBtnRef} className={styles.modalCloseButton} onClick={closeModal} aria-label="Fermer">
              &times;
            </button>
            <div className={styles.modalImageContainer}>
              {/* Full-size view of a local asset: plain img is more reliable here than the
                  optimizer, which chokes on the large source at full width. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={modal.src} alt={modal.alt} />
            </div>
            <p className={styles.modalCaption}>{modal.alt}</p>
          </div>
        </div>
      )}

      <footer className={styles.footer}>
        <a href="/parvagues/">
          vibe ~ <b>parvagues</b>
        </a>
      </footer>
    </div>
  );
}
