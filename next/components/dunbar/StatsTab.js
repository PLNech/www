import React from 'react';
import styles from '@/styles/dunbar.module.css';

export default function StatsTab({ stats }) {
  if (!stats) return null;
  const items = [
    { label: 'Connections', value: stats.connections },
    { label: 'Active Friends (90d)', value: stats.activeFriends },
    { label: 'Total Events', value: stats.totalEvents },
    { label: 'Avg Events / Friend', value: stats.avgEventsPerFriend },
  ];
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
    </div>
  );
}
