'use client';

/* DRAW mode — the ritual.
   Deal a card (random from the no-repeat queue, or the daily card on first
   load of the day). Reveal via 3D flip with a chilled spring. Drag gestures:
   ← discard + deal next, → favorite + deal next, ↑ stash to kept-spread + deal
   next. On commit, a tiny haptic. Kept-spread grows as you stash. */

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import ObliqueCard from './ObliqueCard';
import { cardById, drawFromQueue, storage } from '@/lib/oblique';
import styles from '@/styles/oblique.module.css';

const SWIPE_THRESHOLD = 120;

function vibrate(ms) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(ms);
    } catch {
      /* no-op */
    }
  }
}

export default function DrawView({
  cards,
  favorites,
  setFavorites,
  kept,
  setKept,
  initialCardId,
  dailyCaption,
  onShare,
}) {
  const reduce = useReducedMotion();
  const [currentId, setCurrentId] = useState(() => initialCardId ?? storage.getLast());
  const [faceUp, setFaceUp] = useState(false); // start face-down, flip in
  const [exitDir, setExitDir] = useState(null); // 'left'|'right'|'up'|null
  const [toast, setToast] = useState('');

  const card = cardById(currentId) || cards[0];
  const favorited = favorites.includes(card.id);

  // First mount: if we were handed a daily/shared card, show it; otherwise the
  // queue's current state. Either way we flip in.
  useEffect(() => {
    setFaceUp(false);
    const t = setTimeout(() => setFaceUp(true), 120);
    return () => clearTimeout(t);
  }, [currentId]);

  const dealNext = useCallback(
    (opts = {}) => {
      const excludeId = opts.exclude ?? currentId;
      const nextId = drawFromQueue(excludeId);
      setExitDir(opts.exit || null);
      // After the out-animation window, swap the card. The [currentId] effect
      // below drives the face-down → flip-in for the new card; exitDir drives
      // the outgoing card's fly-off via AnimatePresence.
      window.setTimeout(() => {
        setCurrentId(nextId);
        setExitDir(null);
      }, opts.exit ? 260 : 0);
    },
    [currentId]
  );

  // redo: just deal another without swipe
  const onRedo = useCallback(() => {
    vibrate(8);
    dealNext({ exclude: currentId });
  }, [dealNext, currentId]);

  const toggleFav = useCallback(() => {
    setFavorites((prev) => {
      const has = prev.includes(card.id);
      const next = has ? prev.filter((i) => i !== card.id) : [...prev, card.id];
      storage.setFavorites(next);
      return next;
    });
  }, [card, setFavorites]);

  // Drag end → snap to a direction or spring back.
  const onDragEnd = useCallback(
    (e, info) => {
      const { x, y } = info.offset;
      if (x < -SWIPE_THRESHOLD) {
        vibrate(12);
        dealNext({ exit: 'left', exclude: card.id });
      } else if (x > SWIPE_THRESHOLD) {
        vibrate(12);
        // favorite + deal next
        setFavorites((prev) => {
          const next = prev.includes(card.id) ? prev : [...prev, card.id];
          storage.setFavorites(next);
          return next;
        });
        dealNext({ exit: 'right', exclude: card.id });
      } else if (y < -SWIPE_THRESHOLD) {
        vibrate(12);
        setKept((prev) => {
          const next = prev.includes(card.id) ? prev : [...prev, card.id];
          storage.setKept(next);
          return next;
        });
        dealNext({ exit: 'up', exclude: card.id });
      }
    },
    [card, dealNext, setFavorites, setKept]
  );

  const exitVariants = {
    left: { x: '-130vw', opacity: 0, transition: { duration: 0.28, ease: 'easeIn' } },
    right: { x: '130vw', opacity: 0, transition: { duration: 0.28, ease: 'easeIn' } },
    up: { y: '-130vh', opacity: 0, transition: { duration: 0.28, ease: 'easeIn' } },
  };

  const onShareCard = useCallback(() => {
    onShare?.(card.id);
    setToast('copied');
    window.setTimeout(() => setToast(''), 1400);
  }, [card, onShare]);

  const onRemoveKept = useCallback(
    (id) => {
      setKept((prev) => {
        const next = prev.filter((i) => i !== id);
        storage.setKept(next);
        return next;
      });
    },
    [setKept]
  );

  const onViewKept = useCallback((id) => {
    // swapping id triggers the [currentId] effect → flip-in
    setCurrentId(id);
  }, []);

  return (
    <div className={styles.draw}>
      <div className={styles.drawStage}>
        {dailyCaption && <p className={styles.dailyCaption}>✦ {dailyCaption}</p>}

        <AnimatePresence mode="wait" custom={exitDir}>
          <motion.div
            key={currentId}
            className={styles.drawCardWrap}
            custom={exitDir}
            drag={!reduce}
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.7}
            onDragEnd={reduce ? undefined : onDragEnd}
            exit={exitDir ? exitVariants[exitDir] : { opacity: 0, scale: 0.94 }}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
            whileTap={reduce ? undefined : { cursor: 'grabbing' }}
          >
            {/* directional drag hints that brighten with drag */}
            <span className={`${styles.swipeHint} ${styles.swipeLeft}`}>← new</span>
            <span className={`${styles.swipeHint} ${styles.swipeRight}`}>♥ fav</span>
            <span className={`${styles.swipeHint} ${styles.swipeUp}`}>↑ keep</span>

            <ObliqueCard
              card={card}
              faceUp={faceUp}
              favorited={favorited}
              onToggleFav={toggleFav}
              variant="draw"
            />
          </motion.div>
        </AnimatePresence>

        <div className={styles.drawActions}>
          <button type="button" className={styles.ghostBtn} onClick={onRedo} aria-label="Repiocher">
            redo ↻
          </button>
          <button type="button" className={styles.ghostBtn} onClick={onShareCard} aria-label="Partager">
            ↗ share
          </button>
        </div>

        <p className={styles.drawHint}>
          glisse ← nouveau · → favori · ↑ garde
        </p>

        {toast && <span className={styles.toast}>{toast}</span>}
      </div>

      {/* kept-spread: stashed cards, horizontal scroll */}
      <div className={styles.kept}>
        <p className={styles.keptHeader}>
          kept · {kept.length.toString().padStart(2, '0')}
        </p>
        {kept.length === 0 ? (
          <p className={styles.keptEmpty}>glisse ↑ pour garder une carte</p>
        ) : (
          <div className={styles.keptRow}>
            {kept.map((id) => {
              const c = cardById(id);
              if (!c) return null;
              return (
                <div key={id} className={styles.keptChip}>
                  <button
                    type="button"
                    className={styles.keptChipBody}
                    onClick={() => onViewKept(id)}
                    aria-label={`Revoir : ${c.text}`}
                  >
                    <span className={styles.keptChipHex}>{c.hex}</span>
                    <span className={styles.keptChipText}>{c.text}</span>
                  </button>
                  <button
                    type="button"
                    className={styles.keptRemove}
                    onClick={() => onRemoveKept(id)}
                    aria-label="Retirer"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
