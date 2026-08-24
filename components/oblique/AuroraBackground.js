'use client';

/* Ambient aurora + paper-grain for the oblique page.
   Three large blurred radial blobs drifting slowly via framer-motion loops.
   Honors prefers-reduced-motion (static) and prefers-reduced-data (frozen, no
   animation cost). Built from few elements with big blur to stay cheap on
   low-end Android — repaints are bounded to these three transform-animated
   layers. */

import { motion, useReducedMotion } from 'framer-motion';
import styles from '@/styles/oblique.module.css';

const BLOBS = [
  {
    color: 'rgba(15, 181, 181, 0.55)', // deep teal #0fb5-ish
    size: '62vmax',
    keyframes: {
      x: ['-8vw', '12vw', '-4vw', '-8vw'],
      y: ['-6vh', '8vh', '14vh', '-6vh'],
      scale: [1, 1.18, 0.92, 1],
    },
    duration: 28,
  },
  {
    color: 'rgba(124, 58, 237, 0.50)', // purple #7c3aed
    size: '54vmax',
    keyframes: {
      x: ['10vw', '-12vw', '6vw', '10vw'],
      y: ['10vh', '-4vh', '12vh', '10vh'],
      scale: [0.9, 1.12, 1.04, 0.9],
    },
    duration: 32,
  },
  {
    color: 'rgba(79, 70, 229, 0.42)', // indigo
    size: '46vmax',
    keyframes: {
      x: ['-4vw', '8vw', '-14vw', '-4vw'],
      y: ['12vh', '10vh', '-8vh', '12vh'],
      scale: [1.04, 0.86, 1.16, 1.04],
    },
    duration: 24,
  },
];

// Tiny repeating SVG turbulence as a data URI — grain at ~4% over the scene.
// FeTurbulence baseFrequency ~0.9 gives a fine paper texture.
const GRAIN_URI =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'>" +
      "<filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/>" +
      "<feColorMatrix type='saturate' values='0'/></filter>" +
      "<rect width='100%' height='100%' filter='url(%23n)' opacity='0.5'/></svg>"
  );

export default function AuroraBackground() {
  const reduce = useReducedMotion();
  // prefers-reduced-data: freeze aurora to skip the animation cost entirely.
  const reducedData =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-data: reduce)').matches;
  const frozen = reduce || reducedData;

  return (
    <div className={styles.aurora} aria-hidden="true">
      {BLOBS.map((b, i) => (
        <motion.div
          key={i}
          className={styles.auroraBlob}
          style={{
            background: `radial-gradient(circle, ${b.color} 0%, transparent 62%)`,
            width: b.size,
            height: b.size,
          }}
          animate={frozen ? undefined : b.keyframes}
          transition={
            frozen
              ? undefined
              : { duration: b.duration, repeat: Infinity, ease: 'easeInOut' }
          }
        />
      ))}
      <div className={styles.grain} style={{ backgroundImage: `url("${GRAIN_URI}")` }} />
    </div>
  );
}
