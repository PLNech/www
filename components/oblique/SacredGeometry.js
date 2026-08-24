'use client';

/* Per-card sacred geometry — a deterministic composition, one per strategy.
   Every card used to wear the same 19-circle Flower of Life; now each of the
   187 gets its own figure, derived only from its id and its I Ching hexagram.
   Same card, same figure, forever — and identical between the prerendered HTML
   and the hydrated client, which is why there is no Math.random anywhere here.

   The figure is a co-star, never the lead: a radial mask keeps the middle of
   the card quiet so the strategy text always wins. See QUIET_* below.

   `opacity` is applied via inline style on the <svg> so the same component can
   go from ~22% (card face, legible) down to ~6% (page ambient). */

import { useMemo } from 'react';
import styles from '@/styles/oblique.module.css';

// mulberry32 — 32-bit seeded PRNG, ~10 lines and good enough for picking
// parameters. Returns a function yielding floats in [0, 1).
function mulberry32(a) {
  let t = a >>> 0;
  return function next() {
    t = (t + 0x6d2b79f5) >>> 0;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

// The viewBox half-span is fixed for every card, whatever the ring count, so
// the pattern always carries the same visual weight inside the card frame.
const SPAN = 120;
const VB = 126;

/* Quiet zone. The face SVG is sized at 120% of the card with inset -10%, so the
   card's own edge sits at 1/1.2 ≈ 0.833 of the SVG half-span. To keep the
   central ~55% of the CARD quiet we mask out to 0.55 × 0.833 ≈ 0.46 of the
   SVG half-span — these two numbers are in different frames on purpose.
   The mask floor is a grey, not black: a whisper of pattern survives under the
   text, which reads as depth where a hole would read as a mistake. */
const QUIET_INNER = 0.46; // fraction of the SVG half-span held at the floor
const QUIET_OUTER = 0.66; // fraction where the pattern reaches full strength
const QUIET_FLOOR = 0.28; // ≤ 0.30 of edge strength, per the legibility brief

/* Ring emphasis. The baseline sits just under full so the emphasized ring has
   somewhere to go, but close enough that the edges keep the strength the
   single-flower version had at opacity 0.22. */
const STROKE_BASE = 0.86;
const STROKE_EMPH = 1;

const DASHES = ['3 5', '1 4', '6 4', '2 3 8 3'];

const r2 = (n) => Math.round(n * 100) / 100;

// Vertices of a regular n-gon (or of a {n/skip} star polygon) as an SVG path.
function polygonPath(n, radius, phase, skip = 1) {
  const pts = [];
  const order = [];
  let i = 0;
  do {
    order.push(i);
    i = (i + skip) % n;
  } while (i !== 0 && order.length < n);
  for (const k of order) {
    const a = phase + (2 * Math.PI * k) / n;
    pts.push(`${r2(radius * Math.cos(a))},${r2(radius * Math.sin(a))}`);
  }
  return `M${pts.join('L')}Z`;
}

/* Fold the card id and its hexagram into a figure. The two are correlated (the
   deck assigns hexagrams in order) but mixing both gives the codepoint a real
   say in rotation and in which overlay shows up. */
function composition(seed, hex) {
  const cp = typeof hex === 'string' && hex.length ? hex.codePointAt(0) : 0x4dc0;
  const rand = mulberry32((seed >>> 0) * 2654435761 + cp);

  const rings = 1 + Math.floor(rand() * 3); // 1..3 concentric rings
  // Circles per ring: pentagonal through enneagonal packing. Rings after the
  // first may step up by one, which is what makes the lattices interlock oddly.
  const counts = [];
  const base = 5 + Math.floor(rand() * 5); // 5..9
  for (let k = 0; k < rings; k += 1) {
    counts.push(Math.min(9, base + (rand() < 0.45 ? k : 0)));
  }

  const radiusRatio = 0.62 + rand() * 0.38; // circle radius vs ring spacing
  const spacing = SPAN / (rings + radiusRatio);
  // Rotation: the hexagram picks a 12th-turn phase, the PRNG nudges it off-grid.
  const rot = (cp % 12) * (Math.PI / 6) + (rand() - 0.5) * (Math.PI / 9);
  const ringTwist = (rand() - 0.5) * (Math.PI / 7); // per-ring counter-rotation

  const emphRing = Math.floor(rand() * (rings + 1)) - 1; // -1 = the centre circle
  const dashRing = rand() < 0.55 ? Math.floor(rand() * rings) : -1;
  const dash = DASHES[Math.floor(rand() * DASHES.length)];

  // Overlaid polygon: a triangle, hexagon or enneagram star, or nothing at all.
  const overlayRoll = rand();
  let overlay = null;
  if (overlayRoll < 0.72) {
    const kind = (cp + Math.floor(rand() * 3)) % 3;
    const spec =
      kind === 0
        ? { n: 3, skip: 1 }
        : kind === 1
          ? { n: 6, skip: 1 }
          : { n: 9, skip: 4 }; // {9/4} enneagram
    overlay = {
      ...spec,
      radius: spacing * (rings - 0.15 + rand() * 0.5),
      phase: rot + (rand() - 0.5) * (Math.PI / 5),
    };
  }

  const circles = [];
  circles.push({ cx: 0, cy: 0, r: r2(spacing * radiusRatio), ring: -1 });
  for (let k = 1; k <= rings; k += 1) {
    const count = counts[k - 1];
    const dist = spacing * k;
    const phase = rot + ringTwist * k;
    // Outer rings thin their circles slightly so the figure breathes outward.
    const rad = spacing * radiusRatio * (1 - 0.08 * (k - 1));
    for (let i = 0; i < count; i += 1) {
      const a = phase + (2 * Math.PI * i) / count;
      circles.push({
        cx: r2(dist * Math.cos(a)),
        cy: r2(dist * Math.sin(a)),
        r: r2(rad),
        ring: k - 1,
      });
    }
  }

  return { circles, overlay, emphRing, dashRing, dash };
}

/**
 * SacredGeometry
 * @param {number} seed      card id (1..187) — the whole figure hangs off this
 * @param {string} hex       the card's I Ching hexagram glyph
 * @param {string} variant   'face' (quiet centre, text lives there) | 'back'
 *                           (unmasked — nothing to protect). Anything else is
 *                           treated as a face, so a future ambient/divider use
 *                           gets the quiet centre by default.
 */
export default function SacredGeometry({
  className = '',
  opacity = 0.22,
  strokeWidth = 1,
  seed = 0,
  hex = '',
  variant = 'face',
}) {
  const fig = useMemo(() => composition(seed, hex), [seed, hex]);

  // The back carries no text, so it goes unmasked and shows its overlay always.
  const quiet = variant !== 'back';
  const uid = `${seed}-${variant}`;
  const gradId = `obq-grad-${uid}`;
  const maskId = `obq-mask-${uid}`;

  const byRing = new Map();
  for (const c of fig.circles) {
    if (!byRing.has(c.ring)) byRing.set(c.ring, []);
    byRing.get(c.ring).push(c);
  }

  return (
    <svg
      className={`${styles.flower} ${className}`}
      viewBox={`${-VB} ${-VB} ${2 * VB} ${2 * VB}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      aria-hidden="true"
      style={{ opacity }}
    >
      {quiet && (
        <defs>
          {/* Greyscale mask: black hides, white shows. Radius 50% of the rect
              equals the viewBox half-span, so the stop offsets below read
              directly as fractions of that half-span. */}
          <radialGradient id={gradId}>
            <stop offset="0%" stopColor="#fff" stopOpacity={QUIET_FLOOR} />
            <stop offset={`${QUIET_INNER * 100}%`} stopColor="#fff" stopOpacity={QUIET_FLOOR} />
            <stop offset={`${QUIET_OUTER * 100}%`} stopColor="#fff" stopOpacity="1" />
            <stop offset="100%" stopColor="#fff" stopOpacity="1" />
          </radialGradient>
          <mask id={maskId} maskUnits="userSpaceOnUse" x={-VB} y={-VB} width={2 * VB} height={2 * VB}>
            <rect x={-VB} y={-VB} width={2 * VB} height={2 * VB} fill={`url(#${gradId})`} />
          </mask>
        </defs>
      )}

      <g mask={quiet ? `url(#${maskId})` : undefined}>
        {[...byRing.entries()].map(([ring, list]) => (
          <g
            key={ring}
            strokeOpacity={ring === fig.emphRing ? STROKE_EMPH : STROKE_BASE}
            strokeDasharray={ring === fig.dashRing ? fig.dash : undefined}
          >
            {list.map((c, i) => (
              <circle key={i} cx={c.cx} cy={c.cy} r={c.r} />
            ))}
          </g>
        ))}
        {fig.overlay && (
          <path
            d={polygonPath(fig.overlay.n, fig.overlay.radius, fig.overlay.phase, fig.overlay.skip)}
            strokeOpacity={variant === 'back' ? 0.8 : 0.55}
          />
        )}
      </g>
    </svg>
  );
}
