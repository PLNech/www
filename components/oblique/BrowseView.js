'use client';

/* BROWSE mode — the index.
   Realtime typotolerant search (subsequence or includes, includes ranked
   first), match count, favorites-only toggle, responsive grid with generous
   desktop breathing room. Tap a card → focused overlay with the full card
   (flip-in), share + favorite. Keyboard: Enter opens, Escape closes. */

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import ObliqueCard from './ObliqueCard';
import { searchCards, cardById, storage } from '@/lib/oblique';
import styles from '@/styles/oblique.module.css';

const FLIP_SPRING = { type: 'spring', stiffness: 42, damping: 22, mass: 1.3 };

export default function BrowseView({ cards, favorites, setFavorites, onShare }) {
  const reduce = useReducedMotion();
  const [query, setQuery] = useState('');
  const [favOnly, setFavOnly] = useState(false);
  const [openId, setOpenId] = useState(null);
  const [toast, setToast] = useState('');
  const overlayBtnRef = useRef(null);
  const sentinelRef = useRef(null);
  const [visibleCount, setVisibleCount] = useState(16);

  const results = useMemo(() => {
    let base = searchCards(query, cards);
    if (favOnly) base = base.filter((c) => favorites.includes(c.id));
    return base;
  }, [query, favOnly, favorites, cards]);

  const openCard = openId ? cardById(openId) : null;

  const toggleFav = useCallback(
    (id) => {
      setFavorites((prev) => {
        const has = prev.includes(id);
        const next = has ? prev.filter((i) => i !== id) : [...prev, id];
        storage.setFavorites(next);
        return next;
      });
    },
    [setFavorites]
  );

  // incremental rendering: filter restarts from the top, sentinel bumps the
  // window as the reader scrolls. Keeps mobile browse from mounting all 187
  // cards at once.
  useEffect(() => {
    setVisibleCount(16);
  }, [query, favOnly]);

  useEffect(() => {
    if (!sentinelRef.current) return undefined;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((n) => n + 16);
        }
      },
      { rootMargin: '240px' }
    );
    obs.observe(sentinelRef.current);
    return () => obs.disconnect();
  }, [visibleCount, results.length]);

  // overlay keyboard: focus in on open, Escape closes.
  useEffect(() => {
    if (!openId) return undefined;
    overlayBtnRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') setOpenId(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openId]);

  const onShareCard = useCallback(
    (id) => {
      onShare?.(id);
      setToast('copied');
      window.setTimeout(() => setToast(''), 1400);
    },
    [onShare]
  );

  // Browse grid cards: compact, keyboard-accessible. Enter opens the overlay.
  const onKeyDownCard = (e, id) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setOpenId(id);
    }
  };

  return (
    <div className={styles.browse}>
      <div className={styles.browseBar}>
        <input
          className={styles.searchInput}
          type="search"
          placeholder="chercher une stratégie…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Rechercher"
          spellCheck={false}
          autoComplete="off"
        />
        <span className={styles.matchCount}>
          187 → {results.length.toString().padStart(3, '0')}
        </span>
        <button
          type="button"
          className={`${styles.pill} ${favOnly ? styles.pillOn : ''}`}
          onClick={() => setFavOnly((v) => !v)}
          aria-pressed={favOnly}
        >
          ♥ favoris
        </button>
      </div>

      {results.length === 0 ? (
        <p className={styles.browseEmpty}>aucune carte ne correspond.</p>
      ) : (
        <>
          <div className={styles.grid}>
            {results.slice(0, visibleCount).map((c) => {
              const fav = favorites.includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  className={styles.gridCard}
                  onClick={() => setOpenId(c.id)}
                  onKeyDown={(e) => onKeyDownCard(e, c.id)}
                  aria-label={`Ouvrir : ${c.text}`}
                >
                  <ObliqueCard
                    card={c}
                    faceUp
                    favorited={fav}
                    variant="browse"
                  />
                </button>
              );
            })}
          </div>
          {visibleCount < results.length && (
            <div ref={sentinelRef} className={styles.sentinel}>
              scroll for more · {results.length - visibleCount} remaining
            </div>
          )}
        </>
      )}

      {toast && <span className={styles.toast}>{toast}</span>}

      {/* focused overlay */}
      <AnimatePresence>
        {openCard && (
          <motion.div
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setOpenId(null)}
            role="dialog"
            aria-modal="true"
            aria-label={openCard.text}
          >
            <motion.div
              className={styles.overlayCard}
              initial={{ scale: 0.86, y: 24, rotateZ: -1.5 }}
              animate={{ scale: 1, y: 0, rotateZ: -1.5 }}
              exit={{ scale: 0.86, y: 24, opacity: 0 }}
              transition={reduce ? { duration: 0.18 } : FLIP_SPRING}
              onClick={(e) => e.stopPropagation()}
            >
              <ObliqueCard
                card={openCard}
                faceUp
                favorited={favorites.includes(openCard.id)}
                onToggleFav={() => toggleFav(openCard.id)}
                variant="draw"
              />
              <div className={styles.overlayActions}>
                <button
                  ref={overlayBtnRef}
                  type="button"
                  className={styles.ghostBtn}
                  onClick={() => onShareCard(openCard.id)}
                >
                  ↗ share
                </button>
                <button
                  type="button"
                  className={styles.ghostBtn}
                  onClick={() => setOpenId(null)}
                >
                  ✕ close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
