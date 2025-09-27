import { useEffect, useMemo, useRef, useState } from 'react';
import styles from '@/styles/dunbar.module.css';
import { useDunbarStore } from '@/components/dunbar/useDunbarStore';
import dynamic from 'next/dynamic';
import { makeExportPayload } from '@/lib/dunbar';
import { generateDemoPayload } from '@/lib/dunbar-demo';
import { useRouter } from 'next/router';
import { friendSlug, eventSlug, resolveFriendBySlug } from '@/lib/dunbar';

// Lazy-load heavy tabs if needed (Network uses d3)
const NetworkTab = dynamic(() => import('@/components/dunbar/NetworkTab'), { ssr: false });
const OrbitsTab = dynamic(() => import('@/components/dunbar/OrbitsTab'), { ssr: false });
const EventsTab = dynamic(() => import('@/components/dunbar/EventsTab'), { ssr: false });

// Lightweight components
import FriendsList from '@/components/dunbar/FriendsList';
import FriendDetail from '@/components/dunbar/FriendDetail';
import StatsTab from '@/components/dunbar/StatsTab';
import SearchTab from '@/components/dunbar/SearchTab';

const PASSWORD = 'freehugs4all';

function Tabs({ tab, onTabChange }) {
  const items = [
    { id: 'friends', label: 'Friends' },
    { id: 'search', label: 'Search' },
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
          onClick={() => onTabChange?.(it.id)}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}

export default function DunbarApp() {
  const router = useRouter();
  const { state, friends, selectedFriendId, actions, derived } = useDunbarStore();
  const [tab, setTab] = useState('friends');
  const [authed, setAuthed] = useState(false);
  const [lockError, setLockError] = useState('');
  // Slug resolution banner for not found / collisions
  const [notFoundSlug, setNotFoundSlug] = useState('');
  const [collisionCandidates, setCollisionCandidates] = useState([]);
  const friendsListScrollRef = useRef(0);
  const fileInputRef = useRef(null);

  // Password gate: prompt once per session
  // Dev convenience: auto-unlock on localhost or NODE_ENV=development to enable automated preview
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.sessionStorage.getItem('dunbarAuthed');
    const isDev = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';
    if (stored === '1' || isDev) {
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

  const onDemo = () => {
    if (typeof window !== 'undefined') {
      const ok = window.confirm('Remplacer les données actuelles par une démo de 50 profils ?');
      if (!ok) return;
    }
    const payload = generateDemoPayload(50);
    actions.loadFromPayload(payload);
  };

  // Navigation from viz → friend detail
  const openFriendDetail = (friendId) => {
    actions.selectFriend(friendId);
    setTab('friends');
    const f = friends.find((x) => x.id === friendId);
    if (f) {
      router.push(`/dunbar/friends/${friendSlug(f)}`, undefined, { shallow: true });
    }
  };

  const openEventDetail = (evLike) => {
    // evLike may be from merged index or minimal shape
    const id = evLike?.id;
    const e = (derived.eventIndex || []).find((x) => x.id === id) || evLike;
    if (!e) return;
    setTab('events');
    actions.selectEvent(e.id);
    router.push(`/dunbar/event/${eventSlug(e)}`, undefined, { shallow: true });
  };

  // Deep-link handling: friend/event + section routes hydrate initial tab/selection
  useEffect(() => {
    if (!router) return;
    const as = router.asPath || '';

    // Path-based deep links (only set tab when path encodes a section)
    if (/\/dunbar\/friends(\/?$|\/)/.test(as)) {
      setTab('friends');
    } else if (/\/dunbar\/network(\/?$|\/)/.test(as)) {
      setTab('network');
    } else if (/\/dunbar\/orbits(\/?$|\/)/.test(as)) {
      setTab('orbits');
    } else if (/\/dunbar(\/?$)/.test(as)) {
      // Root explicit → events
      setTab('events');
    }
    // Note: no path for 'search' or 'stats' on purpose; do not override tab in those cases.

    // friend by pretty slug under /dunbar/friends/:slug
    const friendPretty = as.match(/\/dunbar\/friends\/([^/?#]+)/);
    if (friendPretty) {
      const slug = friendPretty[1];
      const { match, collisions } = resolveFriendBySlug(friends, slug);
      if (match) {
        actions.selectFriend(match.id);
        setNotFoundSlug('');
        setCollisionCandidates([]);
        setTab('friends');
      } else if (collisions.length > 1) {
        // present chooser and suggest deduplication
        setNotFoundSlug(slug);
        setCollisionCandidates(collisions);
        setTab('friends');
      } else {
        // not found → show banner and stay on friends list
        setNotFoundSlug(slug);
        setCollisionCandidates([]);
        setTab('friends');
      }
      return;
    }

    // legacy friend route (/dunbar/friend/:slug-idSuffix) — keep for backward compat
    const friendLegacy = as.match(/\/dunbar\/friend\/([^/?#]+)/);
    if (friendLegacy) {
      const slug = friendLegacy[1];
      // Try pretty resolver first (in case suffix-less was typed)
      const { match, collisions } = resolveFriendBySlug(friends, slug);
      if (match) {
        actions.selectFriend(match.id);
        setNotFoundSlug('');
        setCollisionCandidates([]);
        setTab('friends');
        return;
      }
      // Fallback to suffix-based lookup (last 6 chars of id)
      const suff = slug.split('-').pop();
      const f = friends.find((x) => String(x.id).endsWith(suff));
      if (f) {
        actions.selectFriend(f.id);
        setTab('friends');
        return;
      }
      setNotFoundSlug(slug);
      setCollisionCandidates(collisions || []);
      setTab('friends');
      return;
    }

    // event route (kept)
    const eventMatch = as.match(/\/dunbar\/event\/([^/?#]+)/);
    if (eventMatch) {
      const slug = eventMatch[1];
      const suff = slug.split('-').pop();
      const e = (derived.eventIndex || []).find((x) => String(x.id).endsWith(suff));
      if (e) {
        setTab('events');
        actions.selectEvent(e.id);
      }
      return;
    }
  }, [router?.asPath, friends, derived.eventIndex, actions]);

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

  // Path-only URL sync per spec:
  // /dunbar (events) • /dunbar/friends • /dunbar/friends/:slug • /dunbar/orbits • /dunbar/network
  // Note: search & stats have no dedicated paths; don't touch URL for them to avoid snap-back.
  const handleTabChange = (nextTab) => {
    setTab(nextTab);
    if (nextTab === 'friends') {
      router.replace('/dunbar/friends', undefined, { shallow: true, scroll: false });
    } else if (nextTab === 'orbits') {
      router.replace('/dunbar/orbits', undefined, { shallow: true, scroll: false });
    } else if (nextTab === 'network') {
      router.replace('/dunbar/network', undefined, { shallow: true, scroll: false });
    } else if (nextTab === 'events') {
      router.replace('/dunbar', undefined, { shallow: true, scroll: false });
    }
    // For 'search' and 'stats' do nothing to URL (stay on current path)
  };

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
          <button className={styles.btnSecondary} onClick={onDemo}>Demo</button>
          <button className={styles.btnSecondary} onClick={actions.resetData}>Reset Data</button>
        </div>
      </div>

      {/* Not-found / collisions banner (friends slug) */}
      {notFoundSlug ? (
        <div className={styles.banner} style={{ marginBottom: 8 }}>
          {collisionCandidates.length > 1 ? (
            <>
              Multiple friends share the slug “{notFoundSlug}”. This is suspicious — consider renaming duplicates.
              <div className={styles.row} style={{ marginTop: 6, flexWrap: 'wrap' }}>
                {collisionCandidates.slice(0, 6).map((f) => (
                  <button
                    key={f.id}
                    className={styles.btnSecondary}
                    onClick={() => {
                      actions.selectFriend(f.id);
                      setNotFoundSlug('');
                      setCollisionCandidates([]);
                      // update URL to pretty /dunbar/friends/:slug for the chosen one
                      router.push(`/dunbar/friends/${friendSlug(f)}`, undefined, { shallow: true });
                    }}
                  >
                    Open “{f.name}”
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>Friend “{notFoundSlug}” not found. Showing Friends list.</>
          )}
        </div>
      ) : null}

      <Tabs tab={tab} onTabChange={handleTabChange} />

      {tab === 'friends' && (
        <div className={styles.twoCol}>
          <div>
            <FriendsList
              friends={friends}
              selectedFriendId={selectedFriendId}
              onSelect={(id) => {
                actions.selectFriend(id);
                const f = friends.find((x) => x.id === id);
                if (f) {
                  // Pretty URL for friend selection within Friends tab (no remount)
                  router.replace(
                    `/dunbar/friends/${friendSlug(f)}`,
                    undefined,
                    { shallow: true, scroll: false }
                  );
                }
              }}
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
              onUpdateEvent={(id, patch) => actions.updateEvent(id, patch)}
              onRename={(id, name) => actions.renameFriend(id, name)}
              onSetBirthday={(id, ymd) => actions.setBirthday(id, ymd)}
              onSetNotes={(id, notes) => actions.setFriendNotes(id, notes)}
              onUpdateFriend={(id, patch) => actions.updateFriend(id, patch)}
              // scroll preservation inside relationship list handled internally
            />
          </div>
        </div>
      )}

      {tab === 'search' && (
        <SearchTab
          friends={friends}
          openFriend={openFriendDetail}
          openEvent={openEventDetail}
        />
      )}

      {tab === 'events' && (
        <EventsTab
          friends={friends}
          addEvent={(payload) => actions.addEvent(payload)}
          updateEvent={(id, patch) => actions.updateEvent(id, patch)}
          selectedEventId={state.selectedEventId}
          eventIndex={derived.eventIndex}
          openEvent={openEventDetail}
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
        <StatsTab
          stats={derived.stats}
          anniversaries={derived.anniversaries}
          eventIndex={derived.eventIndex}
          openFriend={openFriendDetail}
        />
      )}
    </div>
  );
}
