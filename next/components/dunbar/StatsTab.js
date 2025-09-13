import React from 'react';
import styles from '@/styles/dunbar.module.css';
import { isoDate } from '@/lib/dunbar';
import { detectLang, topKeywordsForDocs, extractLocations } from '@/lib/dunbar-nlp';

export default function StatsTab({ stats, anniversaries = [], eventIndex = [], openFriend }) {
  if (!stats) return null;
  const items = [
    { label: 'Connections', value: stats.connections },
    { label: 'Active Friends (90d)', value: stats.activeFriends },
    { label: 'Total Events', value: stats.totalEvents },
    { label: 'Avg Events / Friend', value: stats.avgEventsPerFriend },
  ];

  // Aggregate text insights (local-only): top keywords and locations across all events
  const textInsights = React.useMemo(() => {
    const docs = (eventIndex || []).map((e) => ({
      id: e.id,
      text: `${e.title || ''} ${e.notes || ''} ${e.location || ''}`,
    }));
    if (!docs.length) return { topTerms: [], topLocations: [] };

    const corpusText = docs.map((d) => d.text).join(' ');
    const lang = detectLang(corpusText) || null;

    // Aggregate keywords by summing TF-IDF heads across docs
    const perDoc = topKeywordsForDocs(docs, { lang, topK: 8 });
    const agg = new Map();
    for (const d of perDoc) {
      for (const [term, score] of d.keywords) {
        agg.set(term, (agg.get(term) || 0) + score);
      }
    }
    const topTerms = Array.from(agg.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([term, score]) => ({ term, score }));

    // Count location mentions (unique per event)
    const locCounts = new Map();
    for (const e of eventIndex || []) {
      const locs = extractLocations(`${e.title || ''} ${e.notes || ''} ${e.location || ''}`).map((l) => l.name);
      for (const name of new Set(locs)) {
        locCounts.set(name, (locCounts.get(name) || 0) + 1);
      }
    }
    const topLocations = Array.from(locCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name, count }));

    return { topTerms, topLocations };
  }, [eventIndex]);

  // Group upcoming anniversaries by date (YYYY-MM-DD)
  const grouped = anniversaries.reduce((acc, it) => {
    const k = isoDate(it.date);
    acc.set(k, [...(acc.get(k) || []), it]);
    return acc;
  }, new Map());
  const annivDays = Array.from(grouped.entries()).sort(
    (a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime()
  );

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>Statistics</div>
      <div className={styles.statsGrid}>
        {items.map((it) => (
          <div key={it.label} className={styles.statCard}>
            <div className={styles.statLabel}>{it.label}</div>
            <div className={styles.statValue}>{it.value}</div>
          </div>
        ))}
      </div>

      {(textInsights.topTerms.length > 0 || textInsights.topLocations.length > 0) && (
        <div style={{ marginTop: 16 }}>
          <div className={styles.cardHeader}><span>Text Insights</span></div>
          {textInsights.topTerms.length > 0 ? (
            <div style={{ marginBottom: 8 }}>
              <div className={styles.itemMeta} style={{ marginBottom: 4 }}>Top keywords</div>
              <div className={styles.tagRow}>
                {textInsights.topTerms.map(({ term }) => (
                  <span key={term} className={styles.tagChip}>{term}</span>
                ))}
              </div>
            </div>
          ) : null}
          {textInsights.topLocations.length > 0 ? (
            <div>
              <div className={styles.itemMeta} style={{ marginBottom: 4 }}>Top locations</div>
              <div className={styles.tagRow}>
                {textInsights.topLocations.map(({ name, count }) => (
                  <span key={name} className={styles.tagChip}>📍 {name} × {count}</span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}

      {annivDays.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div className={styles.cardHeader}>
            <span>À venir (21 jours) — Anniversaires</span>
          </div>
          <div className={styles.timeline}>
            {annivDays.map(([day, items]) => (
              <div key={day} className={styles.timelineGroup}>
                <div className={styles.timelineDate}>{day}</div>
                {items.map((it, idx) => (
                  <div key={day + '-' + idx} className={styles.timelineEvent}>
                    <div
                      style={{ fontWeight: 700, cursor: 'pointer' }}
                      title="Ouvrir la fiche ami·e"
                      onClick={() => openFriend?.(it.friendId)}
                    >
                      {it.friendName}
                    </div>
                    <div style={{ color: '#555' }}>{it.label}</div>
                    {/* Anchor event preview if provided */}
                    {it.anchorTitle || (it.anchorTags && it.anchorTags.length > 0) ? (
                      <div style={{ marginTop: 4 }}>
                        {it.anchorTitle ? (
                          <div style={{ color: '#333' }} title="Événement d’ancrage">
                            « {it.anchorTitle} »
                          </div>
                        ) : null}
                        {Array.isArray(it.anchorTags) && it.anchorTags.length > 0 ? (
                          <div className={styles.tagRow}>
                            {it.anchorTags.slice(0, 8).map((t) => (
                              <span key={t} className={styles.tagChip}>#{t}</span>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
