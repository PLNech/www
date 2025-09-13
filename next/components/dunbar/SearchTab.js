import { useEffect, useMemo, useState } from 'react';
import styles from '@/styles/dunbar.module.css';
import {
  buildSearchIndexes,
  querySearch,
  extractTagsFromText,
  suggestTags,
  suggestPersons,
} from '@/lib/dunbar-search';

export default function SearchTab({ friends, openFriend, openEvent }) {
  const [q, setQ] = useState('');
  const [includeTags, setIncludeTags] = useState(new Set());
  const [excludeTags, setExcludeTags] = useState(new Set());
  const [includePersons, setIncludePersons] = useState(new Set());
  const [excludePersons, setExcludePersons] = useState(new Set());
  const [indexes, setIndexes] = useState(null);

  // Build indexes when friends change
  useEffect(() => {
    setIndexes(buildSearchIndexes(friends || []));
  }, [friends]);

  const onToggleSet = (set, value) => {
    const s = new Set(set);
    const v = String(value).trim();
    if (!v) return set;
    if (s.has(v)) s.delete(v);
    else s.add(v);
    return s;
  };

  const addIncTag = (t) => setIncludeTags((s) => onToggleSet(s, t));
  const addExcTag = (t) => setExcludeTags((s) => onToggleSet(s, t));
  const addIncPerson = (p) => setIncludePersons((s) => onToggleSet(s, p));
  const addExcPerson = (p) => setExcludePersons((s) => onToggleSet(s, p));

  const clearFacets = () => {
    setIncludeTags(new Set());
    setExcludeTags(new Set());
    setIncludePersons(new Set());
    setExcludePersons(new Set());
  };

  const results = useMemo(() => {
    if (!indexes) return { friends: [], events: [] };
    return querySearch(indexes, q, {
      includeTags,
      excludeTags,
      includePersons,
      excludePersons,
    });
  }, [indexes, q, includeTags, excludeTags, includePersons, excludePersons]);

  // Render notes with inline #tags highlighted
  const renderNotesWithTags = (text = '') => {
    const re = /(#([\p{L}\p{N}_-]+))/gu;
    const parts = [];
    let lastIndex = 0;
    let m;
    while ((m = re.exec(text))) {
      if (m.index > lastIndex) {
        parts.push(<span key={`t-${lastIndex}`}>{text.slice(lastIndex, m.index)}</span>);
      }
      const full = m[1];
      parts.push(
        <span key={`tag-${m.index}`} className={styles.tagChip} style={{ marginRight: 6 }}>
          {full}
        </span>
      );
      lastIndex = m.index + full.length;
    }
    if (lastIndex < text.length) {
      parts.push(<span key={`t-end`}>{text.slice(lastIndex)}</span>);
    }
    return <>{parts}</>;
  };

  const tagSuggestions = useMemo(() => (indexes ? suggestTags(indexes, q) : []), [indexes, q]);
  const personSuggestions = useMemo(() => (indexes ? suggestPersons(indexes, q) : []), [indexes, q]);

  return (
    <div className={styles.twoCol} style={{ gap: 16 }}>
      {/* Facets / Query */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span>Recherche</span>
          <button className={styles.btnSecondary} onClick={clearFacets}>Reset filtres</button>
        </div>
        <div className={styles.row} style={{ marginBottom: 8, flexWrap: 'wrap' }}>
          <input
            className={styles.input}
            placeholder="Rechercher (texte, #tags, personnes)…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{ minWidth: 260, flex: 1 }}
          />
        </div>
        {indexes && (
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Suggestions #tags</div>
            <div className={styles.row} style={{ flexWrap: 'wrap' }}>
              {tagSuggestions.map((t) => (
                <button
                  key={t}
                  className={styles.btnSecondary}
                  onClick={() => addIncTag(t)}
                  title="Inclure ce tag"
                >
                  #{t}
                </button>
              ))}
            </div>
            <div style={{ fontSize: 12, color: '#666', margin: '8px 0 4px' }}>Suggestions personnes</div>
            <div className={styles.row} style={{ flexWrap: 'wrap' }}>
              {personSuggestions.map((p) => (
                <button
                  key={p}
                  className={styles.btnSecondary}
                  onClick={() => addIncPerson(p)}
                  title="Inclure cette personne"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Active facets */}
        <div style={{ marginTop: 8 }}>
          <div className={styles.cardHeader}><span>Filtres actifs</span></div>
          <div style={{ fontSize: 12, color: '#333', marginBottom: 4 }}>Inclure</div>
          <div className={styles.row} style={{ flexWrap: 'wrap' }}>
            {Array.from(includeTags).map((t) => (
              <button key={`inc-t-${t}`} className={styles.btnSecondary} onClick={() => addIncTag(t)}>#{t} ✕</button>
            ))}
            {Array.from(includePersons).map((p) => (
              <button key={`inc-p-${p}`} className={styles.btnSecondary} onClick={() => addIncPerson(p)}>{p} ✕</button>
            ))}
          </div>
          <div style={{ fontSize: 12, color: '#333', margin: '8px 0 4px' }}>Exclure</div>
          <div className={styles.row} style={{ flexWrap: 'wrap' }}>
            {Array.from(excludeTags).map((t) => (
              <button key={`exc-t-${t}`} className={styles.btnSecondary} onClick={() => addExcTag(t)}>#{t} ✕</button>
            ))}
            {Array.from(excludePersons).map((p) => (
              <button key={`exc-p-${p}`} className={styles.btnSecondary} onClick={() => addExcPerson(p)}>{p} ✕</button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span>Résultats</span>
        </div>
        <div className={styles.twoCol} style={{ gap: 12 }}>
          <div className={styles.card}>
            <div className={styles.cardHeader}><span>Ami·es</span></div>
            <div className={styles.listScroll} style={{ maxHeight: '50vh' }}>
              {(results.friends || []).map((f) => (
                <div key={f.id} className={styles.listItem} onClick={() => openFriend?.(f.refId)}>
                  <div className={styles.itemTitle}>{f.name}</div>
                  {(f.tags && f.tags.length) ? (
                    <div className={styles.tagRow}>
                      {f.tags.slice(0, 8).map((t) => (
                        <span key={t} className={styles.tagChip}>#{t}</span>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
              {(!results.friends || results.friends.length === 0) && (
                <div style={{ padding: 8, color: '#666' }}>Aucune correspondance.</div>
              )}
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardHeader}><span>Événements</span></div>
            <div className={styles.listScroll} style={{ maxHeight: '50vh' }}>
              {(results.events || []).map((e) => (
                <div key={e.id} className={styles.timelineEvent}>
                  <div className={styles.timelineDate}>{e.date}</div>
                  <div
                    style={{ fontWeight: 700, cursor: 'pointer' }}
                    onClick={() => openEvent?.(e)}
                    title="Ouvrir l’événement"
                  >
                    {e.title || '(untitled)'}
                  </div>
                  <div style={{ whiteSpace: 'pre-wrap' }}>
                    {renderNotesWithTags(e.notes || '')}
                  </div>
                  {e.location ? <div style={{ color: '#555', marginTop: 4 }}>📍 {e.location}</div> : null}
                  <div className={styles.itemMeta}>Avec {(e.participantNames || []).join(', ')}</div>
                  {(e.tags && e.tags.length) ? (
                    <div className={styles.tagRow}>
                      {e.tags.slice(0, 10).map((t) => (
                        <span key={t} className={styles.tagChip}>#{t}</span>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
              {(!results.events || results.events.length === 0) && (
                <div style={{ padding: 8, color: '#666' }}>Aucune correspondance.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
