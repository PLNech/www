// Dunbar shared utilities — keep UI components lean and consistent.
// Import via: import { ... } from '@/lib/dunbar';

// Locale & time zone defaults (French, Paris)
export const LOCALE = 'fr-FR';
export const TIMEZONE = 'Europe/Paris';

// ------------------------------
// Internal helpers for timezone-safe local dates
// ------------------------------
function partsInTZ(dateLike, timeZone = TIMEZONE) {
  const d = dateLike instanceof Date ? dateLike : new Date(dateLike);
  if (isNaN(d.getTime())) return null;
  const fmt = new Intl.DateTimeFormat(LOCALE, {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  // fr-FR gives dd/mm/yyyy — use formatToParts to recompose safely
  const parts = fmt.formatToParts(d);
  const map = Object.fromEntries(parts.map(p => [p.type, p.value]));
  // Ensure 2-digit month/day
  const yyyy = map.year;
  const mm = map.month;
  const dd = map.day;
  return { yyyy, mm, dd };
}

function ymdInTZ(dateLike, timeZone = TIMEZONE) {
  const p = partsInTZ(dateLike, timeZone);
  if (!p) return '';
  return `${p.yyyy}-${p.mm}-${p.dd}`;
}

// ------------------------------
// Dates & text formatting
// ------------------------------
export function isoDate(dateLike, timeZone = TIMEZONE) {
  return ymdInTZ(dateLike, timeZone);
}

export function fullDateLabel(dateLike, locale = LOCALE, timeZone = TIMEZONE) {
  try {
    const d = dateLike instanceof Date ? dateLike : new Date(dateLike);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString(locale, {
      timeZone,
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return '';
  }
}

export function firstWords(text, n = 3) {
  if (!text) return '';
  const words = String(text).trim().split(/\s+/);
  return words.slice(0, n).join(' ');
}

// Extract hashtags (lowercased, without #)
export function extractTags(text = '') {
  const tags = new Set();
  const re = /#([\p{L}\p{N}_-]+)/gu;
  let m;
  while ((m = re.exec(text))) {
    tags.add(m[1].toLowerCase());
  }
  return Array.from(tags);
}

// Slugify helper for URLs
export function slugify(text = '') {
  const s = String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return s || 'x';
}

// Event slug helper: stable and mostly human — title slug + short id suffix
export function eventSlug(evOrTitle, idMaybe) {
  if (typeof evOrTitle === 'object' && evOrTitle) {
    const title = evOrTitle.title || '';
    const id = evOrTitle.id || '';
    return `${slugify(title)}-${String(id).slice(-6)}`;
  }
  const title = String(evOrTitle || '');
  const id = String(idMaybe || '');
  return `${slugify(title)}-${id.slice(-6)}`;
}

// Friend slug helper: name slug + short id suffix
export function friendSlug(friendOrName, idMaybe) {
  if (typeof friendOrName === 'object' && friendOrName) {
    const name = friendOrName.name || '';
    const id = friendOrName.id || '';
    return `${slugify(name)}-${String(id).slice(-6)}`;
  }
  const name = String(friendOrName || '');
  const id = String(idMaybe || '');
  return `${slugify(name)}-${id.slice(-6)}`;
}

// Quick-date helpers (ISO YYYY-MM-DD) — Paris local calendar
export function todayISO() {
  return isoDate(new Date(), TIMEZONE);
}
export function yesterdayISO() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return isoDate(d, TIMEZONE);
}
export function weekAgoISO() {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return isoDate(d, TIMEZONE);
}
export function startOfMonthISO() {
  const d = new Date();
  d.setDate(1);
  return isoDate(d, TIMEZONE);
}

// ------------------------------
// Events helpers
// ------------------------------

// Sort newest first by date
export function sortEventsDesc(events) {
  return [...(events || [])].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

// Group events (array) by local Paris day (YYYY-MM-DD). Returns [{ dateKey, label, items }]
export function groupEventsByDay(events, locale = LOCALE, timeZone = TIMEZONE) {
  const groups = new Map();
  for (const e of events || []) {
    const key = isoDate(e.date, timeZone);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(e);
  }
  const out = [];
  for (const [dateKey, items] of groups.entries()) {
    out.push({
      dateKey,
      label: fullDateLabel(dateKey, locale, timeZone),
      items: sortEventsDesc(items),
    });
  }
  // Sort groups by day (newest first)
  out.sort((a, b) => new Date(b.dateKey).getTime() - new Date(a.dateKey).getTime());
  return out;
}

// ------------------------------
// Orbits helpers (positions & colors)
// ------------------------------
export function distributeOnCircle(ids = [], radius = 100, cx = 0, cy = 0, startAngle = 0) {
  const n = ids.length || 1;
  const step = (2 * Math.PI) / n;
  const pos = new Map();
  ids.forEach((id, i) => {
    const angle = startAngle + i * step;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    pos.set(id, { x, y, angle });
  });
  return pos;
}

// Activity color coding based on last-90-days interaction counts
export function colorByActivity(count90) {
  if (count90 >= 5) return '#2c5530'; // dark green
  if (count90 >= 2) return '#5a9960'; // medium green
  return '#a0c0a0'; // light green
}

// ------------------------------
// Network helpers
// ------------------------------
export function degreeMap(friends = []) {
  const m = new Map();
  for (const f of friends) {
    m.set(f.id, (f.relationships && f.relationships.size) || 0);
  }
  return m;
}

export function edgesFromFriends(friends = []) {
  // Build unique undirected edges [a,b] with a < b to avoid duplicates
  const seen = new Set();
  const edges = [];
  for (const f of friends) {
    for (const to of f.relationships || []) {
      const a = String(f.id);
      const b = String(to);
      if (a === b) continue;
      const key = a < b ? `${a}::${b}` : `${b}::${a}`;
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push([a, b]);
    }
  }
  return edges;
}

// ------------------------------
// Math & drawing helpers
// ------------------------------
export const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
export const lerp = (a, b, t) => a + (b - a) * t;

// Canvas label drawing with white stroke for contrast
export function drawLabel(ctx, text, x, y, color = '#333', fontPx = 12) {
  ctx.save();
  ctx.font = `${fontPx}px system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif`;
  ctx.lineWidth = Math.max(2, fontPx / 4);
  ctx.strokeStyle = '#fff';
  ctx.strokeText(text, x, y);
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
  ctx.restore();
}

// ------------------------------
// Versioned import/export helpers
// ------------------------------
export const DATA_VERSION = '1.0.0';
export const DATA_SCHEMA = 'dunbar-v1';

// Prepare JSON-safe snapshot (relationships as arrays)
export function makeExportPayload(state) {
  const friends = (state.friends || []).map(f => ({
    id: f.id,
    name: f.name,
    birthday: f.birthday || null,
    notes: f.notes || '',
    // rich profile
    likes: Array.isArray(f.likes) ? f.likes : (f.likes ? String(f.likes).split(/[,\\n]/).map(s => s.trim()).filter(Boolean) : []),
    dislikes: Array.isArray(f.dislikes) ? f.dislikes : (f.dislikes ? String(f.dislikes).split(/[,\\n]/).map(s => s.trim()).filter(Boolean) : []),
    foodLikes: f.foodLikes || '',
    foodDislikes: f.foodDislikes || '',
    wifiPassword: f.wifiPassword || '',
    carModel: f.carModel || '',
    workplace: f.workplace || '',
    schedule: f.schedule || '',
    futureIdeas: Array.isArray(f.futureIdeas) ? f.futureIdeas : (f.futureIdeas ? String(f.futureIdeas).split(/[,\n]/).map(s => s.trim()).filter(Boolean) : []),
    quotes: Array.isArray(f.quotes) ? f.quotes : (f.quotes ? String(f.quotes).split(/[,\n]/).map(s => s.trim()).filter(Boolean) : []),
    projects: Array.isArray(f.projects) ? f.projects : (f.projects ? String(f.projects).split(/[,\n]/).map(s => s.trim()).filter(Boolean) : []),
    importantDates: Array.isArray(f.importantDates) ? f.importantDates.map(x => ({
      date: x?.date || null,
      label: x?.label || '',
    })) : [],
    gifts: Array.isArray(f.gifts) ? f.gifts.map(x => ({
      date: x?.date || null,
      occasion: x?.occasion || '',
      description: x?.description || '',
      image: x?.image || '',
    })) : [],
    postcards: Array.isArray(f.postcards) ? f.postcards.map(x => ({
      date: x?.date || null,
      location: x?.location || '',
      description: x?.description || '',
      image: x?.image || '',
    })) : [],
    relationships: Array.from(f.relationships || []),
    events: Array.isArray(f.events) ? f.events.map(ev => ({
      id: ev.id,
      date: ev.date,
      title: ev.title || '',
      notes: ev.notes,
      location: ev.location,
      participants: Array.isArray(ev.participants) ? [...ev.participants] : [],
    })) : [],
  }));
  return {
    schema: DATA_SCHEMA,
    version: DATA_VERSION,
    savedAt: new Date().toISOString(),
    selectedFriendId: state.selectedFriendId || null,
    friends,
  };
}

export function normalizeImportedPayload(payload) {
  if (!payload) throw new Error('Empty payload');
  // Accept same schema or a minimal legacy shape { friends, selectedFriendId }
  const friendsRaw = Array.isArray(payload.friends) ? payload.friends : [];
  const friends = friendsRaw.map(f => ({
    id: f.id,
    name: f.name || '',
    birthday: f.birthday || null,
    notes: f.notes || '',
    // rich profile (defaults)
    likes: Array.isArray(f.likes) ? f.likes : (f.likes ? String(f.likes).split(/[,\\n]/).map(s => s.trim()).filter(Boolean) : []),
    dislikes: Array.isArray(f.dislikes) ? f.dislikes : (f.dislikes ? String(f.dislikes).split(/[,\\n]/).map(s => s.trim()).filter(Boolean) : []),
    foodLikes: f.foodLikes || '',
    foodDislikes: f.foodDislikes || '',
    wifiPassword: f.wifiPassword || '',
    carModel: f.carModel || '',
    workplace: f.workplace || '',
    schedule: f.schedule || '',
    futureIdeas: Array.isArray(f.futureIdeas) ? f.futureIdeas : (f.futureIdeas ? String(f.futureIdeas).split(/[,\n]/).map(s => s.trim()).filter(Boolean) : []),
    quotes: Array.isArray(f.quotes) ? f.quotes : (f.quotes ? String(f.quotes).split(/[,\n]/).map(s => s.trim()).filter(Boolean) : []),
    projects: Array.isArray(f.projects) ? f.projects : (f.projects ? String(f.projects).split(/[,\n]/).map(s => s.trim()).filter(Boolean) : []),
    importantDates: Array.isArray(f.importantDates) ? f.importantDates.map(x => ({
      date: x?.date || null,
      label: x?.label || '',
    })) : [],
    gifts: Array.isArray(f.gifts) ? f.gifts.map(x => ({
      date: x?.date || null,
      occasion: x?.occasion || '',
      description: x?.description || '',
      image: x?.image || '',
    })) : [],
    postcards: Array.isArray(f.postcards) ? f.postcards.map(x => ({
      date: x?.date || null,
      location: x?.location || '',
      description: x?.description || '',
      image: x?.image || '',
    })) : [],
    relationships: new Set(Array.isArray(f.relationships) ? f.relationships : []),
    events: Array.isArray(f.events) ? f.events.map(ev => ({
      id: ev.id,
      date: ev.date,
      title: ev.title || '',
      notes: ev.notes || '',
      location: ev.location,
      participants: Array.isArray(ev.participants) ? ev.participants : [],
    })) : [],
    lastInteraction: null, // computed by store
  }));
  return {
    friends,
    selectedFriendId: payload.selectedFriendId || null,
  };
}

// ------------------------------
// Anniversaries helpers (birthday / half-birthday / 6m-12m since first/last events)
// ------------------------------
function parseYMD(ymd) {
  if (!ymd) return null;
  // Interpret as UTC midnight to avoid TZ drift across locales
  const [y, m, d] = String(ymd).split('-').map(v => parseInt(v, 10));
  if (!y || !m || !d) return null;
  return new Date(Date.UTC(y, (m - 1), d));
}

function toYMD(date) {
  if (!date || isNaN(date.getTime())) return '';
  // Keep using local Paris label elsewhere; for storage we use YYYY-MM-DD UTC
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(date.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function addMonthsUTC(date, n) {
  const d = new Date(date.getTime());
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth();
  const day = d.getUTCDate();
  // Move to first of target month then clamp day
  const target = new Date(Date.UTC(y, m + n, 1));
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(day, lastDay));
  return target;
}

function daysDiffUTC(a, b) {
  const MS = 24 * 60 * 60 * 1000;
  const at = Date.UTC(a.getUTCFullYear(), a.getUTCMonth(), a.getUTCDate());
  const bt = Date.UTC(b.getUTCFullYear(), b.getUTCMonth(), b.getUTCDate());
  return Math.round((bt - at) / MS);
}

function nextMultipleMonthAnniv(baseYMD, stepMonths, today = new Date()) {
  const base = parseYMD(baseYMD);
  if (!base) return null;
  let candidate = new Date(base.getTime());
  // Increase by step until >= today
  while (candidate < today) {
    candidate = addMonthsUTC(candidate, stepMonths);
  }
  return candidate;
}

function nextBirthday(birthdayYMD, today = new Date()) {
  const b = parseYMD(birthdayYMD);
  if (!b) return null;
  const year = today.getUTCFullYear();
  let next = new Date(Date.UTC(year, b.getUTCMonth(), b.getUTCDate()));
  if (next < today) {
    next = new Date(Date.UTC(year + 1, b.getUTCMonth(), b.getUTCDate()));
  }
  return next;
}

function nextHalfBirthday(birthdayYMD, today = new Date()) {
  const b = parseYMD(birthdayYMD);
  if (!b) return null;
  const nextB = nextBirthday(birthdayYMD, today);
  const half = addMonthsUTC(nextB, -6); // the previous half-birthday relative to next birthday
  // Ensure we pick the next upcoming within the next cycle
  if (half >= today) return half;
  return addMonthsUTC(half, 12);
}

/**
 * Compute upcoming anniversaries in the next `windowDays` days.
 * Returns sorted array of:
 * { date: 'YYYY-MM-DD', friendId, friendName, kind: 'birthday'|'half-birthday'|'first-6m'|'first-12m'|'last-6m'|'last-12m', label }
 */
export function computeUpcomingAnniversaries(friends = [], windowDays = 21) {
  const today = new Date();
  const items = [];

  for (const f of friends || []) {
    // birthday + half-birthday
    if (f.birthday) {
      const nb = nextBirthday(f.birthday, today);
      const nh = nextHalfBirthday(f.birthday, today);
      if (nb) {
        const d = daysDiffUTC(today, nb);
        if (d >= 0 && d <= windowDays) {
          items.push({
            date: toYMD(nb),
            friendId: f.id,
            friendName: f.name,
            kind: 'birthday',
            label: `Anniversaire de ${f.name}`,
          });
        }
      }
      if (nh) {
        const d = daysDiffUTC(today, nh);
        if (d >= 0 && d <= windowDays) {
          items.push({
            date: toYMD(nh),
            friendId: f.id,
            friendName: f.name,
            kind: 'half-birthday',
            label: `Demi‑anniversaire de ${f.name}`,
          });
        }
      }
    }

    // First & last event anchors
    if (Array.isArray(f.events) && f.events.length) {
      const evs = (f.events || [])
        .map(e => ({ ...e, _t: parseYMD(e.date) }))
        .filter(e => !!e._t)
        .sort((a, b) => a._t - b._t);
      const first = evs.length ? evs[0]._t : null;
      const last = evs.length ? evs[evs.length - 1]._t : null;
      const firstEv = evs.length ? evs[0] : null;
      const lastEv = evs.length ? evs[evs.length - 1] : null;

      if (first) {
        const n6 = nextMultipleMonthAnniv(toYMD(first), 6, today);
        const n12 = nextMultipleMonthAnniv(toYMD(first), 12, today);
        if (n6) {
          const d = daysDiffUTC(today, n6);
          if (d >= 0 && d <= windowDays) {
            items.push({
              date: toYMD(n6),
              friendId: f.id,
              friendName: f.name,
              kind: 'first-6m',
              label: `6 mois depuis le 1er événement avec ${f.name}`,
              anchorTitle: firstEv ? firstWords(firstEv.notes || '', 5) : '',
              anchorTags: firstEv ? extractTags(firstEv.notes || '') : [],
            });
          }
        }
        if (n12) {
          const d = daysDiffUTC(today, n12);
          if (d >= 0 && d <= windowDays) {
            items.push({
              date: toYMD(n12),
              friendId: f.id,
              friendName: f.name,
              kind: 'first-12m',
              label: `1 an depuis le 1er événement avec ${f.name}`,
              anchorTitle: firstEv ? firstWords(firstEv.notes || '', 5) : '',
              anchorTags: firstEv ? extractTags(firstEv.notes || '') : [],
            });
          }
        }
      }

      if (last) {
        const n6 = nextMultipleMonthAnniv(toYMD(last), 6, today);
        const n12 = nextMultipleMonthAnniv(toYMD(last), 12, today);
        if (n6) {
          const d = daysDiffUTC(today, n6);
          if (d >= 0 && d <= windowDays) {
            items.push({
              date: toYMD(n6),
              friendId: f.id,
              friendName: f.name,
              kind: 'last-6m',
              label: `6 mois depuis le dernier événement avec ${f.name}`,
              anchorTitle: lastEv ? firstWords(lastEv.notes || '', 5) : '',
              anchorTags: lastEv ? extractTags(lastEv.notes || '') : [],
            });
          }
        }
        if (n12) {
          const d = daysDiffUTC(today, n12);
          if (d >= 0 && d <= windowDays) {
            items.push({
              date: toYMD(n12),
              friendId: f.id,
              friendName: f.name,
              kind: 'last-12m',
              label: `1 an depuis le dernier événement avec ${f.name}`,
              anchorTitle: lastEv ? firstWords(lastEv.notes || '', 5) : '',
              anchorTags: lastEv ? extractTags(lastEv.notes || '') : [],
            });
          }
        }
      }
    }
  }

  items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  return items;
}
