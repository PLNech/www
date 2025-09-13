import { useEffect, useMemo, useRef, useState } from 'react';
import styles from '@/styles/dunbar.module.css';
import { useDunbarStore } from '@/components/dunbar/useDunbarStore';
import dynamic from 'next/dynamic';
import { makeExportPayload } from '@/lib/dunbar';

// Lazy-load heavy tabs if needed (Network uses d3)
const NetworkTab = dynamic(() => import('@/components/dunbar/NetworkTab'), { ssr: false });
const OrbitsTab = dynamic(() => import('@/components/dunbar/OrbitsTab'), { ssr: false });
const EventsTab = dynamic(() => import('@/components/dunbar/EventsTab'), { ssr: false });

// Lightweight components
import FriendsList from '@/components/dunbar/FriendsList';
import FriendDetail from '@/components/dunbar/FriendDetail';
import StatsTab from '@/components/dunbar/StatsTab';

const PASSWORD = 'freehugs4all';

function Tabs({ tab, setTab }) {
  const items = [
    { id: 'friends', label: 'Friends' },
    { id: 'events', label: 'Events' },
    { id: 'orbits', label: 'Orbits' },
    { id: 'network', label: 'Network' },
    { id: 'stats', label: 'Stats' },
  ];
  return (
    <div className={styles.tabs}>
      {items.map((it) => (
        <button
          key={it.id}
          className={`${styles.tabBtn} ${tab === it.id ? styles.tabActive : ''}`}
          onClick={() => setTab(it.id)}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}

export default function DunbarApp() {
  const { state, friends, selectedFriendId, actions, derived } = useDunbarStore();
  const [tab, setTab] = useState('friends');
  const [authed, setAuthed] = useState(false);
  const [lockError, setLockError] = useState('');
  const friendsListScrollRef = useRef(0);
  const fileInputRef = useRef(null);

  // Password gate: prompt once per session
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.sessionStorage.getItem('dunbarAuthed');
    if (stored === '1') {
      setAuthed(true);
      return;
    }
    // show lock UI; user presses "Unlock" to prompt
  }, []);

  const handleUnlock = () => {
    if (typeof window === 'undefined') return;
    const ans = window.prompt('Enter password for Dunbar');
    if (ans === PASSWORD) {
      window.sessionStorage.setItem('dunbarAuthed', '1');
      setAuthed(true);
      setLockError('');
    } else {
      setLockError('Wrong password. Try again.');
    }
  };

  const selectedFriend = useMemo(() => friends.find((f) => f.id === selectedFriendId) || null, [friends, selectedFriendId]);

  // Export / Import
  const onExport = () => {
    try {
      const payload = makeExportPayload(state);
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'dunbar-export.json';
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      // eslint-disable-next-line no-alert
      alert('Export failed');
    }
  };
  const onImportClick = () => fileInputRef.current?.click();
  const onImportFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      actions.loadFromPayload(json);
    } catch {
      // eslint-disable-next-line no-alert
      alert('Invalid import file');
    } finally {
      e.target.value = '';
    }
  };

  // Navigation from viz → friend detail
  const openFriendDetail = (friendId) => {
    actions.selectFriend(friendId);
    setTab('friends');
  };

  if (!authed) {
    return (
      <div className={styles.lockWrap}>
        <h2 className={styles.title}>Dunbar</h2>
        <p>Privacy-first relationship navigator. Local-only storage.</p>
        <button className={styles.btn} onClick={handleUnlock}>Unlock</button>
        {lockError ? <div style={{ color: '#b91c1c', marginTop: 8 }}>{lockError}</div> : null}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.row}>
          <h1 className={styles.title}>Dunbar</h1>
          <span className={styles.badge}>{friends.length} friends</span>
        </div>
        <div className={styles.toolbar}>
          <button className={styles.btnSecondary} onClick={onExport}>Export</button>
          <button className={styles.btnSecondary} onClick={onImportClick}>Import</button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            onChange={onImportFile}
            style={{ display: 'none' }}
          />
          <button className={styles.btnSecondary} onClick={actions.resetData}>Reset Data</button>
        </div>
      </div>

      <Tabs tab={tab} setTab={setTab} />

      {tab === 'friends' && (
        <div className={styles.twoCol}>
          <div>
            <FriendsList
              friends={friends}
              selectedFriendId={selectedFriendId}
              onSelect={(id) => actions.selectFriend(id)}
              onAddFriend={(name) => actions.addFriend(name)}
              onRemoveFriend={(id) => actions.removeFriend(id)}
              onRename={(id, name) => actions.renameFriend(id, name)}
              // preserve list scroll when opening/closing detail
              onSaveScroll={(y) => (friendsListScrollRef.current = y)}
              initialScroll={friendsListScrollRef.current}
              getConnectionCount={(id) => derived ? null : null}
            />
          </div>
          <div>
            <FriendDetail
              friend={selectedFriend}
              friends={friends}
              onToggleRel={(a, b) => actions.toggleRelationship(a, b)}
              onAddEvent={(payload) => actions.addEvent(payload)}
              onRename={(id, name) => actions.renameFriend(id, name)}
              // scroll preservation inside relationship list handled internally
            />
          </div>
        </div>
      )}

      {tab === 'events' && (
        <EventsTab
          friends={friends}
          addEvent={(payload) => actions.addEvent(payload)}
          eventIndex={derived.eventIndex}
        />
      )}

      {tab === 'orbits' && (
        <OrbitsTab
          friends={friends}
          buckets={derived.orbitBuckets}
          openFriendDetail={openFriendDetail}
        />
      )}

      {tab === 'network' && (
        <NetworkTab
          friends={friends}
          toggleRel={(a, b) => actions.toggleRelationship(a, b)}
          openFriendDetail={openFriendDetail}
        />
      )}

      {tab === 'stats' && (
        <StatsTab stats={derived.stats} />
      )}
    </div>
  );
}
