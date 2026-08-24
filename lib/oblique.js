/* oblique — data load, fuzzy search, daily card, localStorage, deal queue.
   Pure helpers: no React, no window at module scope. All browser APIs are
   called inside functions so SSR doesn't touch them. */

import strategies from '@/content/oblique/strategies.json';

export const CARDS = strategies.cards;
export const COUNT = strategies.count;

// Quick id -> card lookup. Cards are 1-indexed and dense, so a plain object
// over an array is the right shape for arbitrary-id lookups from URLs/storage.
const BY_ID = Object.create(null);
for (const c of CARDS) BY_ID[c.id] = c;

export function cardById(id) {
  const n = Number(id);
  if (!Number.isFinite(n)) return null;
  return BY_ID[n] || null;
}

export function ordinalOf(card) {
  return String(card.id).padStart(3, '0') + '/' + COUNT;
}

/* ── daily card ──
   Deterministic from the date so everyone draws the same card on the same day,
   and a given day always yields the same card. Seed folds y/m/d into one int. */
export function dailyCard(cards = CARDS) {
  const now = new Date();
  const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
  return cards[seed % cards.length];
}

export function todayString() {
  const now = new Date();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${m}-${d}`;
}

/* ── fuzzy search ──
   Normalize (lowercase, strip diacritics) then match either by subsequence
   (query chars appear in order) or plain includes. includes-matches rank
   first because they're stronger hits. Empty query returns everything. */
export function normalize(s) {
  return String(s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

function isSubsequence(query, text) {
  let i = 0;
  for (let j = 0; j < text.length && i < query.length; j++) {
    if (text[j] === query[i]) i++;
  }
  return i === query.length;
}

export function searchCards(query, cards = CARDS) {
  const q = normalize(query).trim();
  if (!q) return cards.slice();
  const hits = [];
  const subs = [];
  for (const c of cards) {
    const t = normalize(c.text);
    if (t.includes(q)) hits.push(c);
    else if (isSubsequence(q, t)) subs.push(c);
  }
  return hits.concat(subs);
}

/* ── localStorage helpers ──
   Each key is JSON. Reads swallow errors (private mode, quota, SSR) and return
   the fallback; writes are best-effort. */

const KEYS = {
  favorites: 'oblique_favorites',
  kept: 'oblique_kept',
  last: 'oblique_last',
  queue: 'oblique_queue',
  dailySeen: 'oblique_daily_seen',
};

function readJSON(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota / private mode — state still lives in React, just not persisted */
  }
}

export const storage = {
  getFavorites: () => {
    const v = readJSON(KEYS.favorites, []);
    return Array.isArray(v) ? v : [];
  },
  setFavorites: (ids) => writeJSON(KEYS.favorites, ids),

  getKept: () => {
    const v = readJSON(KEYS.kept, []);
    return Array.isArray(v) ? v : [];
  },
  setKept: (ids) => writeJSON(KEYS.kept, ids),

  getLast: () => readJSON(KEYS.last, null),
  setLast: (id) => writeJSON(KEYS.last, id),

  getQueue: () => {
    const v = readJSON(KEYS.queue, []);
    return Array.isArray(v) ? v : [];
  },
  setQueue: (ids) => writeJSON(KEYS.queue, ids),

  getDailySeen: () => readJSON(KEYS.dailySeen, ''),
  setDailySeen: (s) => writeJSON(KEYS.dailySeen, s),
};

/* ── deal queue ──
   Fisher-Yates over all ids. No-repeat until exhausted: we pop from the back
   of a shuffled list; when empty, reshuffle. The queue is persisted so a
   refresh mid-deck doesn't reset the no-repeat guarantee. */
export function shuffleIds(ids = CARDS.map((c) => c.id)) {
  const a = ids.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = a[i];
    a[i] = a[j];
    a[j] = tmp;
  }
  return a;
}

// Ensure a non-empty queue exists; rebuild when empty or malformed.
export function ensureQueue() {
  let q = storage.getQueue();
  const valid = q.filter((id) => cardById(id) != null);
  if (valid.length === 0) {
    q = shuffleIds();
    storage.setQueue(q);
    return q;
  }
  if (valid.length !== q.length) {
    storage.setQueue(valid);
  }
  return valid;
}

// Draw the next id from the queue (popping from the back), reshuffling if
// needed. Optionally exclude an id (e.g. avoid repeating the current card as
// the very next draw) — excluded id is skipped and pushed to a fresh shuffle.
export function drawFromQueue(excludeId = null) {
  let q = ensureQueue();
  // pop from back
  let id = q.pop();
  // skip the excluded card if it's the one we'd draw; push it aside.
  if (id === excludeId && q.length > 0) {
    const alt = q.pop();
    q.push(id);
    id = alt;
  }
  storage.setQueue(q);
  storage.setLast(id);
  if (q.length === 0) {
    // rebuild for next time so the very next draw isn't blocked
    const fresh = shuffleIds();
    storage.setQueue(fresh);
  }
  return id;
}

/* ── URL hash ──
   Parse /oblique#42, /oblique#browse, /oblique#draw. Returns
   { mode: 'draw'|'browse', cardId: number|null }. */
export function parseHash(hash) {
  const h = String(hash || '').replace(/^#/, '').trim();
  if (!h) return { mode: 'draw', cardId: null };
  if (h === 'browse') return { mode: 'browse', cardId: null };
  if (h === 'draw') return { mode: 'draw', cardId: null };
  if (/^\d+$/.test(h)) {
    const id = Number(h);
    if (cardById(id)) return { mode: 'draw', cardId: id };
  }
  return { mode: 'draw', cardId: null };
}

export function shareUrl(id) {
  if (typeof window === 'undefined') return `/oblique#${id}`;
  return window.location.origin + '/oblique#' + id;
}
