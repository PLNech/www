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
    relationships: Array.from(f.relationships || []),
    events: Array.isArray(f.events) ? f.events.map(ev => ({
      id: ev.id,
      date: ev.date,
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
    relationships: new Set(Array.isArray(f.relationships) ? f.relationships : []),
    events: Array.isArray(f.events) ? f.events.map(ev => ({
      id: ev.id,
      date: ev.date,
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
