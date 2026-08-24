'use client';

/* /oblique — Brian Eno & Peter Schmidt's "Oblique Strategies" creative deck.
   Hybrid DRAW (ritual draw + swipe gestures + kept-spread) and BROWSE (fuzzy
   searchable index). State lives in localStorage + URL hash; no DB/account.
   Hash routes: #draw / #browse / #<id> (deep link to a specific card). */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Fraunces, Space_Mono } from 'next/font/google';
import styles from '@/styles/oblique.module.css';
import AuroraBackground from '@/components/oblique/AuroraBackground';
import DrawView from '@/components/oblique/DrawView';
import BrowseView from '@/components/oblique/BrowseView';
import {
  CARDS,
  COUNT,
  storage,
  parseHash,
  dailyCard,
  todayString,
  shareUrl,
} from '@/lib/oblique';

// Fraunces variable serif — all custom axes. No fixed weight (variable font).
// CSS var names are intentionally distinct from design.js's to avoid scope bleed.
// next/font emits the resolved font-family string into --font-ob-serif /
// --font-ob-mono on the page root; our CSS reads those into the --ob-serif /
// --ob-mono family stacks. Names differ from design.js on purpose.
const fraunces = Fraunces({
  subsets: ['latin'],
  axes: ['opsz', 'SOFT', 'WONK'],
  display: 'swap',
  variable: '--font-ob-serif',
});
const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-ob-mono',
});

const HOST_HINT = 'me.nech.pl';

export default function ObliquePage() {
  const [mode, setMode] = useState('draw'); // 'draw' | 'browse'
  const [favorites, setFavorites] = useState([]);
  const [kept, setKept] = useState([]);
  const [initialCardId, setInitialCardId] = useState(null);
  const [dailyCaption, setDailyCaption] = useState('');
  const [booted, setBooted] = useState(false);
  const lastHash = useRef('');

  // Boot: hydrate state from localStorage, resolve hash + daily-card rules.
  useEffect(() => {
    setFavorites(storage.getFavorites());
    setKept(storage.getKept());

    const parsed = parseHash(window.location.hash);
    let startCardId = null;
    let caption = '';

    if (parsed.mode === 'browse') {
      setMode('browse');
    } else {
      setMode('draw');
      if (parsed.cardId) {
        // shared deep link → that specific card
        startCardId = parsed.cardId;
      } else {
        const today = todayString();
        const seen = storage.getDailySeen();
        if (seen !== today) {
          // first visit of the day → auto-deal the daily card
          const d = dailyCard();
          startCardId = d.id;
          caption = "today's card";
          storage.setDailySeen(today);
          storage.setLast(d.id);
        } else {
          // already seen today → resume last-drawn, or a fresh DEAL prompt (null)
          const last = storage.getLast();
          startCardId = last;
        }
      }
    }
    setInitialCardId(startCardId);
    setDailyCaption(caption);
    lastHash.current = window.location.hash || '';
    setBooted(true);
  }, []);

  // Hash sync: external hashchange (back/forward, shared link) updates state.
  useEffect(() => {
    const onHash = () => {
      const parsed = parseHash(window.location.hash);
      if (parsed.mode === 'browse') setMode('browse');
      else {
        setMode('draw');
        if (parsed.cardId) {
          setInitialCardId(parsed.cardId);
          setDailyCaption('');
        }
      }
      lastHash.current = window.location.hash || '';
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // When our state changes, reflect into the hash (without clobbering a deep
  // link id unless we're switching modes explicitly).
  const pushHash = useCallback(
    (h) => {
      if (window.location.hash === h) return;
      lastHash.current = h;
      // replaceState avoids polluting history with every mode flip
      history.replaceState(null, '', h ? `#${h}` : window.location.pathname);
    },
    []
  );

  const switchMode = useCallback(
    (m) => {
      setMode(m);
      pushHash(m === 'browse' ? 'browse' : 'draw');
    },
    [pushHash]
  );

  // Share: copy deep link to clipboard.
  const onShare = useCallback(async (id) => {
    const url = shareUrl(id);
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      /* clipboard blocked — the toast still flashes; the URL is the source of truth */
    }
  }, []);

  return (
    <div className={`${styles.page} ${fraunces.variable} ${spaceMono.variable}`}>
      <AuroraBackground />

      <main className={styles.main}>
        <header className={styles.topBar}>
          <div className={styles.wordmarkWrap}>
            <h1 className={styles.wordmark}>OBlique</h1>
            <p className={styles.tagline}>
              {COUNT} stratégies · Eno &amp; Schmidt · 1975–
            </p>
          </div>
          <div className={styles.modeToggle} role="tablist" aria-label="Mode">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'draw'}
              className={`${styles.tabBtn} ${mode === 'draw' ? styles.tabOn : ''}`}
              onClick={() => switchMode('draw')}
            >
              DRAW
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'browse'}
              className={`${styles.tabBtn} ${mode === 'browse' ? styles.tabOn : ''}`}
              onClick={() => switchMode('browse')}
            >
              BROWSE
            </button>
          </div>
        </header>

        <section className={styles.stage}>
          {booted && mode === 'draw' && (
            <DrawView
              cards={CARDS}
              favorites={favorites}
              setFavorites={setFavorites}
              kept={kept}
              setKept={setKept}
              initialCardId={initialCardId}
              dailyCaption={dailyCaption}
              onShare={onShare}
            />
          )}
          {booted && mode === 'browse' && (
            <BrowseView
              cards={CARDS}
              favorites={favorites}
              setFavorites={setFavorites}
              onShare={onShare}
            />
          )}
          {!booted && <div className={styles.boot} aria-hidden="true" />}
        </section>
      </main>

      <footer className={styles.footer}>
        <span className={styles.footerMono}>
          {HOST_HINT}/oblique · {' '}<a href="/parvagues/">parvagues</a>
        </span>
      </footer>
    </div>
  );
}
