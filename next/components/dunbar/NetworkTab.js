import dynamic from 'next/dynamic';
import styles from '@/styles/dunbar.module.css';

/**
 * NetworkTab — wrapper that mounts the high-UX graph (react-force-graph-2d)
 * No edit mode. Hover → tooltip, click → open profile.
 */
const NetworkGraph = dynamic(() => import('@/components/dunbar/NetworkGraph'), { ssr: false });

export default function NetworkTab({ friends, openFriendDetail }) {
  return (
    <div className={styles.card} style={{ padding: 8 }}>
      <div className={styles.cardHeader}>
        <span>Network</span>
      </div>
      <NetworkGraph
        friends={friends}
        onOpenFriend={(id) => openFriendDetail?.(id)}
      />
    </div>
  );
}
