/**
 * Dunbar NLP utilities (client-only, local-first).
 * Zero network calls. Pure functions usable in browser.
 *
 * Exports:
 * - stripDiacritics, normalizeText
 * - detectLang
 * - tokenize, ngrams
 * - removeStopwords
 * - computeTfIdf, topKeywordsForDocs
 * - extractLocations
 * - extractTopics (beta, with graceful fallback)
 *
 * Notes:
 * - We reuse stopword lists from the 'stopword' package (already in deps).
 * - We avoid heavy stemming here; Minisearch in dunbar-search.js already does FR stemming for search.
 */

import { fr as FR_LIST, en as EN_LIST } from 'stopword';

// ---------- Normalization ----------

/** Remove diacritics but preserve base letters (é → e). */
export function stripDiacritics(s = '') {
  try {
    return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  } catch {
    // Fallback for environments missing normalize()
    return s;
  }
}

/**
 * Normalize text for analysis:
 * - lowercases
 * - optionally strip diacritics
 * - collapses whitespace
 * - preserves hashtags when requested
 */
export function normalizeText(text = '', { removeDiacritics = true, preserveHashtags = true } = {}) {
  let t = String(text || '').toLowerCase();
  if (removeDiacritics) t = stripDiacritics(t);
  if (!preserveHashtags) t = t.replace(/#/g, ' ');
  // collapse whitespace
  t = t.replace(/\s+/g, ' ').trim();
  return t;
}

// ---------- Language detection (simple heuristic) ----------

const FR_STOP_SET = new Set(FR_LIST || []);
const EN_STOP_SET = new Set(EN_LIST || []);

/**
 * Very light lang detection: compare stopword hits FR vs EN.
 * Returns 'fr' | 'en' | null (if undecided).
 */
export function detectLang(text = '') {
  const norm = normalizeText(text, { removeDiacritics: true, preserveHashtags: false });
  const tokens = (norm.match(/[\p{L}\p{N}]+/gu) || []).filter(Boolean);
  let frScore = 0;
  let enScore = 0;
  for (const t of tokens) {
    if (FR_STOP_SET.has(t)) frScore++;
    if (EN_STOP_SET.has(t)) enScore++;
  }
  if (frScore === 0 && enScore === 0) return null;
  if (frScore > enScore) return 'fr';
  if (enScore > frScore) return 'en';
  return null;
}

// ---------- Tokenization, stopwords, n-grams ----------

/**
 * Tokenize text:
 * - keeps hashtags (#word) if keepHashtags=true
 * - returns lowercase tokens
 */
export function tokenize(text = '', { keepHashtags = true, removeDiacritics = true } = {}) {
  const hashtags = keepHashtags ? (text.match(/#[\p{L}\p{N}_-]+/gu) || []).map((t) => t.toLowerCase()) : [];
  const norm = normalizeText(text.replace(/#/g, ' '), { removeDiacritics, preserveHashtags: false });
  const words = (norm.match(/[\p{L}\p{N}][\p{L}\p{N}'’_-]*/gu) || []).map((w) => w.toLowerCase());
  // dedupe while preserving order for hashtags
  const seen = new Set();
  const out = [];
  for (const h of hashtags) {
    if (!seen.has(h)) {
      seen.add(h);
      out.push(h);
    }
  }
  for (const w of words) {
    if (!seen.has(w)) {
      seen.add(w);
      out.push(w);
    }
  }
  return out;
}

/** Generate n-grams (array of strings joined by space) from a token array. */
export function ngrams(tokens = [], n = 2) {
  const res = [];
  for (let i = 0; i <= tokens.length - n; i++) {
    res.push(tokens.slice(i, i + n).join(' '));
  }
  return res;
}

/** Remove stopwords per language (keeps hashtags always). */
export function removeStopwords(tokens = [], lang = null) {
  if (!lang) return tokens;
  const set = lang === 'fr' ? FR_STOP_SET : lang === 'en' ? EN_STOP_SET : null;
  if (!set) return tokens;
  return tokens.filter((t) => t.startsWith('#') || !set.has(t));
}

// ---------- TF-IDF + keywords ----------

/**
 * Build per-document TF-IDF vectors.
 * docs: [{ id, text }]
 * returns:
 * {
 *   termsByDoc: Map(id -> Map(term -> tfidf)),
 *   df: Map(term -> docFreq),
 *   idf: Map(term -> idf),
 *   tokensByDoc: Map(id -> tokens),
 * }
 */
export function computeTfIdf(
  docs = [],
  { lang = null, includeNGrams = false, nGramSizes = [2], maxVocab = 5000 } = {}
) {
  const tokensByDoc = new Map();
  const termFreqByDoc = new Map();
  const df = new Map();

  // 1) tokenize + local term frequencies
  for (const d of docs) {
    const toks = removeStopwords(tokenize(d.text || '', { keepHashtags: true, removeDiacritics: true }), lang);
    const withN = [toks];
    if (includeNGrams) {
      for (const n of nGramSizes) withN.push(ngrams(toks, n));
    }
    const all = withN.flat();
    tokensByDoc.set(d.id, all);
    const tf = new Map();
    for (const t of all) {
      tf.set(t, (tf.get(t) || 0) + 1);
    }
    termFreqByDoc.set(d.id, tf);
    // update document frequency
    for (const term of new Set(all)) {
      df.set(term, (df.get(term) || 0) + 1);
    }
  }

  // 2) vocabulary capping (optional)
  if (maxVocab && df.size > maxVocab) {
    // keep most frequent terms across docs
    const topTerms = Array.from(df.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxVocab)
      .map(([t]) => t);
    const keep = new Set(topTerms);
    for (const [docId, tf] of termFreqByDoc.entries()) {
      for (const term of Array.from(tf.keys())) {
        if (!keep.has(term)) tf.delete(term);
      }
    }
    for (const term of Array.from(df.keys())) {
      if (!keep.has(term)) df.delete(term);
    }
  }

  // 3) compute IDF
  const N = docs.length || 1;
  const idf = new Map();
  for (const [term, dfi] of df.entries()) {
    const val = Math.log((N + 1) / (dfi + 1)) + 1; // smooth IDF
    idf.set(term, val);
  }

  // 4) compute TF-IDF per doc (normalize with augmented TF)
  const termsByDoc = new Map();
  for (const [docId, tf] of termFreqByDoc.entries()) {
    let tfMax = 1;
    for (const v of tf.values()) tfMax = Math.max(tfMax, v);
    const vec = new Map();
    for (const [term, freq] of tf.entries()) {
      const tfw = 0.5 + (0.5 * freq) / tfMax;
      const score = tfw * (idf.get(term) || 0);
      vec.set(term, score);
    }
    termsByDoc.set(docId, vec);
  }

  return { termsByDoc, df, idf, tokensByDoc };
}

/**
 * Get top keywords per doc.
 * returns array: [{ id, keywords: Array<[term, score]> }]
 */
export function topKeywordsForDocs(docs = [], { lang = null, topK = 8, includeNGrams = false } = {}) {
  const { termsByDoc } = computeTfIdf(docs, { lang, includeNGrams });
  const res = [];
  for (const d of docs) {
    const vec = termsByDoc.get(d.id) || new Map();
    const sorted = Array.from(vec.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, topK);
    res.push({ id: d.id, keywords: sorted });
  }
  return res;
}

// ---------- Locations (offline gazetteer) ----------

const MINI_GAZETTEER = [
  // Countries (FR/EN names)
  { type: 'country', name: 'france', aliases: ['république française'], iso2: 'FR' },
  { type: 'country', name: 'germany', aliases: ['deutschland', 'allemagne'], iso2: 'DE' },
  { type: 'country', name: 'spain', aliases: ['españa', 'espagne'], iso2: 'ES' },
  { type: 'country', name: 'united states', aliases: ['usa', 'us', 'etats-unis', 'états-unis', 'u.s.'], iso2: 'US' },
  { type: 'country', name: 'united kingdom', aliases: ['uk', 'u.k.', 'royaume-uni', 'britain'], iso2: 'GB' },
  { type: 'country', name: 'italy', aliases: ['italia', 'italie'], iso2: 'IT' },
  { type: 'country', name: 'belgium', aliases: ['belgique'], iso2: 'BE' },
  { type: 'country', name: 'switzerland', aliases: ['schweiz', 'suisse', 'svizzera'], iso2: 'CH' },

  // Cities (sample, extend as needed)
  { type: 'city', name: 'paris', country: 'FR', aliases: [] },
  { type: 'city', name: 'lyon', country: 'FR', aliases: [] },
  { type: 'city', name: 'marseille', country: 'FR', aliases: [] },
  { type: 'city', name: 'berlin', country: 'DE', aliases: [] },
  { type: 'city', name: 'barcelona', country: 'ES', aliases: ['barcelone'] },
  { type: 'city', name: 'london', country: 'GB', aliases: ['londres'] },
  { type: 'city', name: 'geneva', country: 'CH', aliases: ['genève', 'geneve'] },
  { type: 'city', name: 'brussels', country: 'BE', aliases: ['bruxelles'] },
];

/** Escape regex special chars */
function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Extract location mentions using a small offline gazetteer.
 * Returns unique matches: [{ type, name, country?, iso2? }]
 */
export function extractLocations(text = '', { gazetteer = MINI_GAZETTEER } = {}) {
  const normText = ' ' + normalizeText(text, { removeDiacritics: true, preserveHashtags: true }) + ' ';
  const found = [];
  const seen = new Set();

  for (const entry of gazetteer) {
    const names = [entry.name, ...(entry.aliases || [])]
      .map((n) => stripDiacritics(n.toLowerCase().trim()))
      .filter(Boolean);
    for (const n of names) {
      // match on word boundaries in normalized text
      const pattern = new RegExp(`(^|\\s)${escapeRegExp(n)}(\\s|[.,;:!?])`, 'i');
      if (pattern.test(normText)) {
        const key = `${entry.type}:${entry.name}:${entry.country || entry.iso2 || ''}`;
        if (!seen.has(key)) {
          seen.add(key);
          found.push({
            type: entry.type,
            name: entry.name,
            country: entry.country,
            iso2: entry.iso2,
          });
        }
        break; // avoid duplicate alias hits
      }
    }
  }
  return found;
}

// ---------- Topics (beta) ----------

/**
 * Try to extract topics with a dynamic import of 'lda' if available.
 * If not, fall back to a simple co-occurrence-based grouping derived from TF-IDF.
 *
 * docs: [{ id, text }]
 * returns: Array<{ terms: Array<[term, score]>, documents: Array<id> }>
 */
export async function extractTopics(
  docs = [],
  { topics = 5, termsPerTopic = 6, lang = null } = {}
) {
  // Attempt dynamic LDA if user installs a tiny LDA package like 'lda'
  try {
    const mod = await import('lda'); // will throw if not installed
    const lda = mod.default || mod;
    // 'lda' expects an array of documents (strings). Signature: lda(docs, numberOfTopics, termsPerTopic, alpha?, eta?, random?)
    const topicSets = lda(
      docs.map((d) => String(d.text || '')),
      topics,
      termsPerTopic
    );
    // topicSets: Array of Array<{ term, probability } | [term, prob] >
    return topicSets.map((topic) => {
      const terms = topic.map((t) => {
        if (Array.isArray(t)) return [t[0], t[1]];
        if (t && typeof t === 'object') return [t.term, t.probability ?? t.prob];
        return [String(t), 0];
      });
      return { terms, documents: [] };
    });
  } catch {
    // Fallback: build pseudo-topics from TF-IDF heads
    return fallbackTopics(docs, { topics, termsPerTopic, lang });
  }
}

function fallbackTopics(docs, { topics = 5, termsPerTopic = 6, lang = null } = {}) {
  const { termsByDoc } = computeTfIdf(docs, { lang, includeNGrams: false });
  // Global scores
  const global = new Map();
  for (const [, vec] of termsByDoc.entries()) {
    for (const [term, score] of vec.entries()) {
      global.set(term, (global.get(term) || 0) + score);
    }
  }
  const topTerms = Array.from(global.entries()).sort((a, b) => b[1] - a[1]).slice(0, topics);
  const topicsOut = [];
  for (const [headTerm, headScore] of topTerms) {
    // collect co-occurring terms from docs that contain the head
    const co = new Map();
    const docIds = new Set();
    for (const [docId, vec] of termsByDoc.entries()) {
      if (vec.has(headTerm)) {
        docIds.add(docId);
        for (const [term, s] of vec.entries()) {
          if (term === headTerm) continue;
          co.set(term, (co.get(term) || 0) + s);
        }
      }
    }
    const topCo = Array.from(co.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, Math.max(0, termsPerTopic - 1));
    topicsOut.push({
      terms: [[headTerm, headScore], ...topCo],
      documents: Array.from(docIds),
    });
  }
  return topicsOut;
}

export default {
  stripDiacritics,
  normalizeText,
  detectLang,
  tokenize,
  ngrams,
  removeStopwords,
  computeTfIdf,
  topKeywordsForDocs,
  extractLocations,
  extractTopics,
};
