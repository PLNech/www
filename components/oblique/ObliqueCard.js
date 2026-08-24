'use client';

/* The card: frosted glass, iridescent foil edge, a per-card sacred-geometry
   co-star (see SacredGeometry — the figure is derived from the card's id and
   hexagram, so no two of the 187 wear the same one), I Ching hexagram
   filigree, ◆ favorite indicator. Supports a 3D tarot flip
   (face-down → face-up) and a tighter static face used in the browse grid.

   Flip is CHILLED: spring stiffness 42 / damping 22 / mass 1.3 — the lab's
   120/14 was too bouncy, so this lands soft. Lands with a -1.5deg roll. Under
   prefers-reduced-motion the flip becomes a fade (function intact). */

import { motion, useReducedMotion } from 'framer-motion';
import SacredGeometry from './SacredGeometry';
import { ordinalOf } from '@/lib/oblique';
import styles from '@/styles/oblique.module.css';

const FLIP_SPRING = { type: 'spring', stiffness: 42, damping: 22, mass: 1.3 };

// Card back: the card's own figure at higher opacity and unmasked (no text to
// protect) + a large faint hexagram, so the back reads as a real tarot back,
// not a blank.
function CardBack({ card }) {
  return (
    <div className={styles.cardBack}>
      <SacredGeometry
        className={styles.cardBackFlower}
        opacity={0.32}
        strokeWidth={1.1}
        seed={card.id}
        hex={card.hex}
        variant="back"
      />
      <span className={styles.cardBackHex}>{card.hex}</span>
      <span className={styles.cardBackMark}>oblique</span>
    </div>
  );
}

// Card face: hex filigree top-left, the card's figure behind the text — masked
// quiet in the middle so it never fights the words, and legible on top of that
// via a denser text patch + text-shadow halo — strategy text, favorite ◆.
function CardFace({ card, favorited, onToggleFav, showFavButton = true, onClick }) {
  return (
    <div className={styles.cardFace} onClick={onClick}>
      <SacredGeometry
        className={styles.cardFaceFlower}
        opacity={0.22}
        strokeWidth={0.9}
        seed={card.id}
        hex={card.hex}
        variant="face"
      />
      <span className={styles.cardHex} aria-hidden="true">{card.hex}</span>
      <span className={styles.cardOrdinal}>{ordinalOf(card)}</span>
      <div className={styles.cardTextPatch}>
        <p className={styles.cardText}>{card.text}</p>
      </div>
      {showFavButton && (
        <button
          type="button"
          className={`${styles.favBtn} ${favorited ? styles.favOn : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFav?.();
          }}
          aria-pressed={favorited}
          aria-label={favorited ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          ◆
        </button>
      )}
      {!showFavButton && favorited && (
        <span className={`${styles.favMark} ${styles.favOn}`} aria-label="favori">◆</span>
      )}
    </div>
  );
}

/**
 * ObliqueCard
 * @param {object} card        the strategy card
 * @param {boolean} faceUp     initial face state
 * @param {boolean} favorited
 * @param {function} onToggleFav
 * @param {boolean} animate    wrap flip in AnimatePresence (draw-mode reveal)
 * @param {string}  variant    'draw' | 'browse' (compact)
 */
export default function ObliqueCard({
  card,
  faceUp = true,
  favorited = false,
  onToggleFav,
  variant = 'draw',
  onClick,
}) {
  const reduce = useReducedMotion();
  const isDraw = variant === 'draw';

  // For reduced-motion or browse variant we skip the 3D flip and fade/none.
  if (!isDraw || reduce) {
    return (
      <div className={`${styles.card} ${isDraw ? styles.cardDraw : styles.cardBrowse}`}>
        <CardFace
          card={card}
          favorited={favorited}
          onToggleFav={onToggleFav}
          showFavButton={isDraw}
          onClick={onClick}
        />
        <span className={styles.foilEdge} aria-hidden="true" />
      </div>
    );
  }

  // 3D flip reveal — preserve-3d so back and front share the same space.
  return (
    <div className={`${styles.card} ${styles.cardDraw} ${styles.card3d}`}>
      <motion.div
        className={styles.cardInner}
        initial={{ rotateY: 180 }}
        animate={{ rotateY: faceUp ? 0 : 180 }}
        transition={FLIP_SPRING}
        style={{ transformStyle: 'preserve-3d' }}
        onAnimationComplete={() => {
          // settle the gentle resting tilt once the flip lands
        }}
      >
        {/* settled tilt applied to the face-up state via CSS animation hook */}
        <div
          className={`${styles.cardHalf} ${styles.cardHalfBack}`}
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <CardBack card={card} />
        </div>
        <div
          className={`${styles.cardHalf} ${styles.cardHalfFront} ${faceUp ? styles.tilted : ''}`}
          style={{ backfaceVisibility: 'hidden' }}
        >
          <CardFace
            card={card}
            favorited={favorited}
            onToggleFav={onToggleFav}
            showFavButton
          />
          <span className={styles.foilEdge} aria-hidden="true" />
        </div>
      </motion.div>
    </div>
  );
}
