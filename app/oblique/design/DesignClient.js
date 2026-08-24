'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import {
  Fraunces,
  Space_Mono,
  Cormorant_Garamond,
  JetBrains_Mono,
  EB_Garamond,
  IBM_Plex_Mono,
  Spectral,
  Spline_Sans_Mono,
} from 'next/font/google';
import styles from '@/styles/oblique.design.module.css';
import strategies from '@/content/oblique/strategies.json';

// Geist_Mono isn't reliably exposed via next/font/google; Spline_Sans_Mono is the
// documented fallback for the Spectral × mono pairing.
const fraunces = Fraunces({ subsets: ['latin'], axes: ['opsz', 'SOFT', 'WONK'], display: 'swap', variable: '--font-ob-fraunces' });
const spaceMono = Space_Mono({ subsets: ['latin'], weight: ['400', '700'], display: 'swap', variable: '--font-ob-space-mono' });
const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['400', '500', '600'], display: 'swap', variable: '--font-ob-cormorant' });
const jetbrains = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500'], display: 'swap', variable: '--font-ob-jetbrains' });
const ebGaramond = EB_Garamond({ subsets: ['latin'], weight: ['400', '500'], display: 'swap', variable: '--font-ob-eb-garamond' });
const ibmPlexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], display: 'swap', variable: '--font-ob-ibm-plex-mono' });
const spectral = Spectral({ subsets: ['latin'], weight: ['400', '500'], display: 'swap', variable: '--font-ob-spectral' });
const splineMono = Spline_Sans_Mono({ subsets: ['latin'], weight: ['400', '500'], display: 'swap', variable: '--font-ob-spline-mono' });

const fontVars = [fraunces.variable, spaceMono.variable, cormorant.variable, jetbrains.variable, ebGaramond.variable, ibmPlexMono.variable, spectral.variable, splineMono.variable].join(' ');

const CARDS = strategies.cards;
const COUNT = strategies.count;

const SAMPLE = { text: 'A line has two sides', ordinal: '042/187', hex: '䷂' };

const PALETTES = [
  { key: 'void', name: 'Void + paper', cls: styles.palVoid },
  { key: 'amber', name: 'Amber CRT', cls: styles.palAmber },
  { key: 'iridescent', name: 'Iridescent oil-on-paper', cls: styles.palIridescent },
  { key: 'aurora', name: 'Aurora-glass', cls: styles.palAurora },
  { key: 'fused', name: 'Fused 5th', cls: styles.palFused },
];

const PAIRINGS = [
  { name: 'Fraunces × Space Mono', serif: 'var(--font-ob-fraunces)', mono: 'var(--font-ob-space-mono)', vars: `${fraunces.variable} ${spaceMono.variable}` },
  { name: 'Cormorant × JetBrains Mono', serif: 'var(--font-ob-cormorant)', mono: 'var(--font-ob-jetbrains)', vars: `${cormorant.variable} ${jetbrains.variable}` },
  { name: 'EB Garamond × IBM Plex Mono', serif: 'var(--font-ob-eb-garamond)', mono: 'var(--font-ob-ibm-plex-mono)', vars: `${ebGaramond.variable} ${ibmPlexMono.variable}` },
  { name: 'Spectral × Spline Sans Mono', serif: 'var(--font-ob-spectral)', mono: 'var(--font-ob-spline-mono)', vars: `${spectral.variable} ${splineMono.variable}` },
];

// Flower-of-Life line motif — 19 circles on a triangular lattice (hex distance ≤ 2).
const FLOWER_R = 13;
function flowerCenters() {
  const out = [];
  for (let i = -2; i <= 2; i++) {
    for (let j = -2; j <= 2; j++) {
      const k = -i - j;
      if (Math.max(Math.abs(i), Math.abs(j), Math.abs(k)) > 2) continue;
      out.push({ x: FLOWER_R * (i + j / 2), y: FLOWER_R * j * (Math.sqrt(3) / 2) });
    }
  }
  return out;
}
const FLOWER_CENTERS = flowerCenters();

function FlowerOfLife({ size = 160, stroke = 'rgba(126,232,208,0.6)', className }) {
  const c = FLOWER_CENTERS;
  const viewBox = 100;
  return (
    <svg width={size} height={size} viewBox={`-${viewBox} -${viewBox} ${viewBox * 2} ${viewBox * 2}`} className={className} aria-hidden="true">
      <g fill="none" stroke={stroke} strokeWidth="0.8">
        {c.map((p, idx) => (
          <circle key={idx} cx={p.x} cy={p.y} r={FLOWER_R} />
        ))}
      </g>
    </svg>
  );
}

function CardSpecimen({ palette, sample = SAMPLE }) {
  const isAmber = palette.key === 'amber';
  const isIridescent = palette.key === 'iridescent';
  const isAurora = palette.key === 'aurora';
  const isFused = palette.key === 'fused';
  const hasFoil = isIridescent || isFused;
  const hasAurora = isAurora || isFused;

  const inner = (
    <div className={`${styles.tileCard} ${isAmber ? `${styles.scanlines} ${styles.grain}` : ''} ${hasAurora ? '' : ''}`}>
      {hasAurora && (
        <span className={styles.auroraBg} aria-hidden="true">
          <motion.span
            className={styles.auroraBlob}
            animate={{ x: [0, 18, -12, 0], y: [0, -14, 10, 0], scale: [1, 1.08, 0.96, 1] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          />
        </span>
      )}
      <span className={styles.tileHex} aria-hidden="true">{sample.hex}</span>
      <span className={styles.tileLabel}>{palette.name}</span>
      <p className={styles.tileText}>{sample.text}</p>
      <span className={styles.tileFooter}>{sample.ordinal} · {sample.hex}</span>
    </div>
  );

  if (hasFoil) {
    return (
      <div className={styles.foilWrap}>
        <motion.span
          className={styles.foilLayer}
          animate={{ rotate: isIridescent ? [0, 360] : [0, 360] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
          aria-hidden="true"
        />
        {inner}
      </div>
    );
  }
  return inner;
}

function AnatomyCard({ variant, sample = SAMPLE }) {
  return (
    <div className={`${styles.anatomyCard} ${styles.glass}`}>
      {variant !== 'minimal' && (
        <span className={styles.geoBg} aria-hidden="true">
          <FlowerOfLife size={150} stroke="rgba(126,232,208,0.5)" />
        </span>
      )}
      {variant === 'rich' || variant === 'richmeta' ? (
        <span className={styles.anatomyHexTop} aria-hidden="true">{sample.hex}</span>
      ) : null}
      {variant === 'nofav' ? <span className={styles.anatomyHexTop} aria-hidden="true">{sample.hex}</span> : null}
      <p className={styles.anatomyText}>{sample.text}</p>
      <span className={styles.anatomyMeta}>
        <span>{sample.ordinal}</span>
        {variant === 'rich' || variant === 'richmeta' ? <span className={styles.anatomyFav}>◆ fav</span> : null}
        {variant === 'richmeta' ? <span>iv/187</span> : null}
        {variant === 'richmeta' ? <span>↗ share</span> : null}
        {variant === 'minimal' ? <span>{sample.hex}</span> : null}
      </span>
    </div>
  );
}

export default function ObliqueDesignLab() {
  const [expanded, setExpanded] = useState(null); // palette key or null
  const [activePair, setActivePair] = useState(3); // spectral × spline default
  const [mode, setMode] = useState(null); // 'flip' | 'toss' | null
  const [draw, setDraw] = useState(0); // draw counter
  const [card, setCard] = useState(null);
  const reduce = useReducedMotion();
  const bannerRef = useRef(null);

  const { scrollYProgress } = useScroll({ target: bannerRef, offset: ['start start', 'end start'] });
  const bannerY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -24]);
  const bannerOpacity = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 0.6]);

  const pick = () => {
    const next = CARDS[Math.floor(Math.random() * CARDS.length)];
    setCard(next);
    setDraw((d) => d + 1);
  };

  const toggleExpand = (key) => setExpanded((cur) => (cur === key ? null : key));

  const flipVariants = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { rotateY: 180, opacity: 0.4 },
        animate: { rotateY: 0, opacity: 1, rotateZ: -2 },
        exit: { opacity: 0, rotateY: 0 },
      };
  const flipTransition = reduce
    ? { duration: 0.3 }
    : { type: 'spring', stiffness: 120, damping: 14 };

  const tossVariants = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { x: 500, y: -300, rotate: 45, scale: 0.5, opacity: 0 },
        animate: { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 },
        exit: { opacity: 0, scale: 0.85, x: -260 },
      };
  const tossTransition = reduce
    ? { duration: 0.3 }
    : { type: 'spring', stiffness: 90, damping: 12, mass: 0.85 };

  const drawnOrdinal = card ? `${String(card.id).padStart(3, '0')}/${COUNT}` : null;

  return (
    <div className={`${styles.page} ${fontVars}`}>
      <header className={styles.banner}>
        <span className={styles.bannerBrand}>
          <b>OBlique</b> <i>· design lab — pick a direction</i>
        </span>
        <a className={styles.bannerBack} href="/">← back to /</a>
      </header>

      {/* banner parallax strip */}
      <div ref={bannerRef} style={{ position: 'relative', overflow: 'hidden' }}>
        <motion.div
          style={{ y: bannerY, opacity: bannerOpacity }}
          className={styles.main}
        >
          <div style={{ padding: 'clamp(2.5rem, 8vw, 4rem) 0 1rem' }}>
            <p className={styles.sectionNum}>01 — 04 / specimens for a forthcoming deck</p>
            <h2 className={styles.sectionTitle}>Oblique Strategies, in five lights</h2>
            <p className={styles.sectionLede}>
              Eno &amp; Schmidt&rsquo;s deck, re-cast five ways. Tap a tile to expand it. Toggle type. Inspect the
              anatomy. Then draw a card.
            </p>
          </div>
        </motion.div>
      </div>

      <main className={styles.main}>
        {/* ── §1 PALETTE TILES ── */}
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionNum}>01 / palettes</span>
            <h3 className={styles.sectionTitle}>Five directions, one sample</h3>
            <p className={styles.sectionLede}>Tap a tile to expand a full-size specimen. Tap again to collapse.</p>
          </div>
          <div
            className={styles.tilesGrid}
            style={{
              '--ob-font-serif': PAIRINGS[activePair].serif,
              '--ob-font-mono': PAIRINGS[activePair].mono,
            }}
          >
            {PALETTES.map((p) => (
              <motion.button
                key={p.key}
                type="button"
                layout={!reduce}
                className={`${styles.tile} ${p.cls} ${expanded === p.key ? styles.tileExpanded : ''}`}
                onClick={() => toggleExpand(p.key)}
                aria-expanded={expanded === p.key}
                transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 260, damping: 30 }}
              >
                <CardSpecimen palette={p} />
              </motion.button>
            ))}
          </div>
        </section>

        {/* ── §2 TYPOGRAPHY ── */}
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionNum}>02 / typography</span>
            <h3 className={styles.sectionTitle}>Four serif × mono pairings</h3>
            <p className={styles.sectionLede}>Pick a pairing — it re-types the palette tiles above.</p>
          </div>

          <div className={styles.pairToggle} role="radiogroup" aria-label="Typography pairing">
            {PAIRINGS.map((pair, idx) => (
              <span key={pair.name}>
                <input
                  type="radio"
                  id={`pair-${idx}`}
                  name="pairing"
                  className={styles.pairRadio}
                  checked={activePair === idx}
                  onChange={() => setActivePair(idx)}
                />
                <label htmlFor={`pair-${idx}`} className={styles.pairRadioLabel}>{pair.name}</label>
              </span>
            ))}
          </div>

          <div className={styles.pairGrid}>
            {PAIRINGS.map((pair) => (
              <div key={pair.name} className={`${styles.pairSpecimen} ${pair.vars}`}>
                <p className={styles.pairName}>{pair.name}</p>
                <p className={styles.pairSerif} style={{ fontFamily: pair.serif }}>{SAMPLE.text}</p>
                <p className={styles.pairMono} style={{ fontFamily: pair.mono }}>{SAMPLE.ordinal} · {SAMPLE.hex}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── §3 ANATOMY ── */}
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionNum}>03 / card anatomy</span>
            <h3 className={styles.sectionTitle}>Four faces, aurora-glass default</h3>
            <p className={styles.sectionLede}>Minimal, rich-disciplined, rich+meta, and no-on-card-fav.</p>
          </div>

          <div className={styles.anatomyGrid}>
            <div>
              <p className={styles.anatomyName}>Minimal</p>
              <AnatomyCard variant="minimal" />
            </div>
            <div>
              <p className={styles.anatomyName}>Rich-disciplined</p>
              <AnatomyCard variant="rich" />
            </div>
            <div>
              <p className={styles.anatomyName}>Rich + meta</p>
              <AnatomyCard variant="richmeta" />
            </div>
            <div>
              <p className={styles.anatomyName}>No on-card fav</p>
              <AnatomyCard variant="nofav" />
            </div>
          </div>

          <div className={styles.geoDivider} aria-hidden="true">
            <FlowerOfLife size={120} stroke="rgba(126,232,208,0.7)" />
          </div>
        </section>

        {/* ── §4 REVEAL PLAYGROUND ── */}
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionNum}>04 / reveal playground</span>
            <h3 className={styles.sectionTitle}>Draw a card from {COUNT}</h3>
            <p className={styles.sectionLede}>Tarot flip, or physics toss. Re-draws animate out → in.</p>
          </div>

          <div className={styles.revealStage}>
            {!card && !mode && <p className={styles.revealHint}>choose a reveal ↓</p>}
            <div className={styles.revealScene}>
              <AnimatePresence mode="wait">
                {card && mode === 'flip' && (
                  <motion.div
                    key={`flip-${draw}`}
                    className={styles.flipCard}
                    initial={flipVariants.initial}
                    animate={flipVariants.animate}
                    exit={flipVariants.exit}
                    transition={flipTransition}
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    <div className={`${styles.flipFace} ${styles.flipBack}`}>
                      <span className={styles.flipBackHex} aria-hidden="true">{card.hex}</span>
                    </div>
                    <div className={`${styles.flipFace} ${styles.flipFront}`}>
                      <span className={styles.drawHex} aria-hidden="true">{card.hex}</span>
                      <p className={styles.drawText}>{card.text}</p>
                      <span className={styles.drawFooter}>{drawnOrdinal} · {card.hex}</span>
                    </div>
                  </motion.div>
                )}
                {card && mode === 'toss' && (
                  <motion.div
                    key={`toss-${draw}`}
                    className={styles.tossCard}
                    initial={tossVariants.initial}
                    animate={tossVariants.animate}
                    exit={tossVariants.exit}
                    transition={tossTransition}
                  >
                    <span className={styles.drawHex} aria-hidden="true">{card.hex}</span>
                    <p className={styles.drawText}>{card.text}</p>
                    <span className={styles.drawFooter}>{drawnOrdinal} · {card.hex}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className={styles.revealButtons}>
            <button
              type="button"
              className={styles.revealBtn}
              onClick={() => { setMode('flip'); pick(); }}
            >3D tarot flip</button>
            <button
              type="button"
              className={styles.revealBtn}
              onClick={() => { setMode('toss'); pick(); }}
            >Physics toss</button>
            <span className={styles.revealCounter}>draws: {draw}</span>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        oblique · design lab · {CARDS.length} strategies on file
      </footer>
    </div>
  );
}
