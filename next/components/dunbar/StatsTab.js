import React from 'react';
import styles from '@/styles/dunbar.module.css';
import { isoDate } from '@/lib/dunbar';

export default function StatsTab({ stats, anniversaries = [] }) {
  if (!stats) return null;
  const items = [
    { label: 'Connections', value: stats.connections },
    { label: 'Active Friends (90d)', value: stats.activeFriends },
    { label: 'Total Events', value: stats.totalEvents },
    { label: 'Avg Events / Friend', value: stats.avgEventsPerFriend },
  ];

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
                    <div style={{ fontWeight: 700 }}>{it.friendName}</div>
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
