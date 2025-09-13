import MiniSearch from 'minisearch';
import { fr as FR_LIST } from 'stopword';
import { FrenchStemmer } from 'snowball-stemmers';

// Utilities for FR-friendly tokenization and #tag extraction

const FR_STOP = new Set(FR_LIST || []);
let stemmer;
try {
  // Prefer constructor form; some builds ship a class
  stemmer = new FrenchStemmer();
} catch (e) {
  // Fallback: library may export a plain object with stem(), or nothing usable
  if (FrenchStemmer && typeof FrenchStemmer.stem === 'function') {
    stemmer = FrenchStemmer;
  } else {
    stemmer = { stem: (w) => w };
  }
}

export function extractTagsFromText(text = '') {
  const tags = new Set();
  const re = /#([\p{L}\p{N}_-]+)/gu;
  let m;
  while ((m = re.exec(text))) {
    tags.add(m[1].toLowerCase());
  }
  return Array.from(tags);
}

function stripDiacritics(s) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function tokenizeFr(text = '') {
  // Keep hashtags verbatim, otherwise split on non-letters/digits
  const hashtagTokens = (text.match(/#[\p{L}\p{N}_-]+/gu) || []).map(t => t.toLowerCase());
  const raw = stripDiacritics(text.toLowerCase()).replace(/#/g, ' ');
  const parts = raw.split(/[^a-z0-9]+/g).filter(Boolean);

  // remove stopwords and stem
  const filtered = parts.filter(w => !FR_STOP.has(w));
  const stemmed = filtered.map(w => {
    try {
      return stemmer.stem(w);
    } catch {
      return w;
    }
  });

  return [...new Set([...hashtagTokens, ...stemmed])];
}

// Build docs from friends and events

export function buildSearchData(friends = []) {
  const friendDocs = [];
  const eventDocs = [];
  const tagSet = new Set();
  const personSet = new Set();

  const friendMap = new Map();
  for (const f of friends) friendMap.set(f.id, f);

  for (const f of friends) {
    personSet.add(f.name);

    // Aggregate tags from events + friend notes + rich profile
    const aggTags = new Set();
    const addTagsFrom = (txt) => {
      for (const t of extractTagsFromText(txt || '')) aggTags.add(t);
    };
    addTagsFrom(f.notes);
    addTagsFrom(f.likes);
    addTagsFrom(f.dislikes);
    addTagsFrom(f.foodLikes);
    addTagsFrom(f.foodDislikes);
    addTagsFrom(f.futureIdeas);
    addTagsFrom(f.quotes);

    for (const ev of f.events || []) addTagsFrom(ev.notes);

    // Compose an extended notes blob to improve recall
    const profileBlob = [
      f.notes,
      f.likes,
      f.dislikes,
      f.foodLikes,
      f.foodDislikes,
      f.futureIdeas,
      f.quotes,
      f.workplace,
      f.schedule,
      f.carModel,
    ]
      .filter(Boolean)
      .join(' \n');

    const friendDoc = {
      id: `friend:${f.id}`,
      kind: 'friend',
      refId: f.id,
      name: f.name || '',
      notes: profileBlob,
      tags: Array.from(aggTags),
      lastInteraction: f.lastInteraction || null,
    };
    friendDocs.push(friendDoc);
    for (const t of friendDoc.tags) tagSet.add(t);
  }

  // Build de-duplicated events index from shared event ids
  const dedup = new Map();
  for (const f of friends) {
    for (const e of f.events || []) {
      if (!dedup.has(e.id)) {
        dedup.set(e.id, {
          ...e,
          participants: new Set(e.participants || []),
        });
      } else {
        const cur = dedup.get(e.id);
        for (const pid of e.participants || []) cur.participants.add(pid);
      }
    }
  }

  for (const e of dedup.values()) {
    const names = [];
    for (const pid of e.participants) {
      const p = friendMap.get(pid);
      if (p) names.push(p.name);
    }
    const tags = extractTagsFromText(e.notes || '');
    for (const t of tags) tagSet.add(t);

    eventDocs.push({
      id: `event:${e.id}`,
      kind: 'event',
      refId: e.id,
      notes: e.notes || '',
      location: e.location || '',
      tags,
      participantNames: names,
      date: e.date,
    });
  }

  return { friendDocs, eventDocs, tagSet: Array.from(tagSet), personSet: Array.from(personSet) };
}

function makeMiniSearch(docs, fields, storeFields, boosts = {}) {
  const ms = new MiniSearch({
    fields,
    storeFields,
    searchOptions: {
      prefix: true,
      fuzzy: 0.25,
      boost: boosts,
      extractField: (doc, fieldName) => {
        const val = doc[fieldName];
        if (Array.isArray(val)) return val.join(' ');
        return String(val ?? '');
      },
      processTerm: (term, _field) => {
        // Preserve hashtags as-is; otherwise stemming pipeline
        if (term.startsWith('#')) return term;
        const t = stripDiacritics(term.toLowerCase());
        if (!t || FR_STOP.has(t)) return null;
        try {
          return stemmer.stem(t);
        } catch {
          return t;
        }
      },
    },
  });
  ms.addAll(docs);
  return ms;
}

export function buildSearchIndexes(friends = []) {
  const { friendDocs, eventDocs, tagSet, personSet } = buildSearchData(friends);

  const friendIndex = makeMiniSearch(friendDocs, ['name', 'notes', 'tags'], ['id', 'kind', 'refId', 'name', 'tags'], {
    name: 3,
    tags: 2,
  });
  const eventIndex = makeMiniSearch(
    eventDocs,
    ['notes', 'location', 'tags', 'participantNames'],
    ['id', 'kind', 'refId', 'tags', 'participantNames', 'date'],
    { tags: 2, participantNames: 1.5 }
  );

  return { friendIndex, eventIndex, tagSet, personSet, friendDocs, eventDocs };
}

// Faceted search with include/exclude tag/person filters
export function querySearch(indexes, query, facets = {}) {
  const {
    includeTags = new Set(),
    excludeTags = new Set(),
    includePersons = new Set(), // names
    excludePersons = new Set(),
  } = facets;

  const q = String(query || '').trim();
  const friendRes = q ? indexes.friendIndex.search(q) : indexes.friendDocs;
  const eventRes = q ? indexes.eventIndex.search(q) : indexes.eventDocs;

  const filterDoc = (doc) => {
    const tags = new Set((doc.tags || []).map((t) => t.toLowerCase()));
    // Persons only for events
    const persons = new Set((doc.participantNames || []).map((n) => n.toLowerCase()));
    // Includes
    for (const t of includeTags) if (!tags.has(String(t).toLowerCase())) return false;
    for (const p of includePersons) if (!persons.has(String(p).toLowerCase())) return false;
    // Excludes
    for (const t of excludeTags) if (tags.has(String(t).toLowerCase())) return false;
    for (const p of excludePersons) if (persons.has(String(p).toLowerCase())) return false;
    return true;
  };

  const friends = friendRes
    .map((r) => (r.id ? indexes.friendDocs.find((d) => d.id === r.id) : r))
    .filter(Boolean)
    .filter(filterDoc);

  const events = eventRes
    .map((r) => (r.id ? indexes.eventDocs.find((d) => d.id === r.id) : r))
    .filter(Boolean)
    .filter(filterDoc);

  return { friends, events };
}

// Suggestions for tags/persons
export function suggestTags(indexes, prefix = '') {
  const p = String(prefix || '').toLowerCase().replace(/^#/, '');
  if (!p) return indexes.tagSet.slice(0, 20);
  return indexes.tagSet.filter((t) => t.startsWith(p)).slice(0, 20);
}

export function suggestPersons(indexes, prefix = '') {
  const p = String(prefix || '').toLowerCase();
  if (!p) return indexes.personSet.slice(0, 20);
  return indexes.personSet.filter((name) => name.toLowerCase().startsWith(p)).slice(0, 20);
}
