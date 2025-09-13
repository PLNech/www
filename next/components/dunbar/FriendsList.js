import { useEffect, useMemo, useRef, useState } from 'react';
import styles from '@/styles/dunbar.module.css';
import { extractLocations } from '@/lib/dunbar-nlp';

export default function FriendsList({
  friends,
  selectedFriendId,
  onSelect,
  onAddFriend,
  onRemoveFriend,
  onRename,        // (id, name) => void
  onSaveScroll,    // (scrollTop:number) => void
  initialScroll = 0,
}) {
  const [name, setName] = useState('');
  const [filter, setFilter] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const scrollRef = useRef(null);

  // Restore scroll position when mounting / when list changes (preserve UX)
  useEffect(() => {
    if (!scrollRef.current) return;
    // Next tick to allow DOM layout to settle
    const id = setTimeout(() => {
      try {
        scrollRef.current.scrollTop = initialScroll || 0;
      } catch {}
    }, 0);
    return () => clearTimeout(id);
  }, [friends, initialScroll]);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return friends;
    return friends.filter((f) => f.name.toLowerCase().includes(q));
  }, [friends, filter]);

  // Offline location mentions per friend (from notes + events)
  const locByFriend = useMemo(() => {
    const m = new Map();
    for (const f of friends) {
      let text = '';
      text += ' ' + (f.notes || '');
      for (const ev of f.events || []) {
        text += ' ' + (ev.title || '') + ' ' + (ev.notes || '') + ' ' + (ev.location || '');
      }
      const locs = extractLocations(text).map((l) => l.name);
      const uniq = Array.from(new Set(locs));
      m.set(f.id, uniq);
    }
    return m;
  }, [friends]);

  const handleAdd = () => {
    const n = name.trim();
    if (!n) return;
    onAddFriend?.(n);
    setName('');
  };

  const onClickItem = (id) => {
    // Save current scroll before navigating to detail
    if (scrollRef.current) onSaveScroll?.(scrollRef.current.scrollTop);
    onSelect?.(id);
  };

  // Inline rename helpers
  const startEdit = (id, currentName) => {
    setEditingId(id);
    setEditName(currentName || '');
  };
  const commitEdit = () => {
    if (!editingId) return;
    const n = editName.trim();
    if (n) onRename?.(editingId, n);
    setEditingId(null);
    setEditName('');
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  return (
    <div>
      <div className={styles.card} style={{ marginBottom: 12 }}>
        <div className={styles.cardHeader}>
          <span>Friends ({friends.length})</span>
          <div className={styles.row}>
            <input
              className={styles.input}
              placeholder="Filter..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
        </div>
        <div className={styles.row}>
          <input
            className={styles.input}
            placeholder="Add a friend by name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdd();
            }}
          />
          <button className={styles.btn} onClick={handleAdd} disabled={!name.trim()}>
            Add
          </button>
        </div>
      </div>

      <div className={styles.list}>
        <div ref={scrollRef} className={styles.listScroll}>
          {filtered.map((f) => {
            const evCount = Array.isArray(f.events) ? f.events.length : 0;
            const connCount = f.relationships ? f.relationships.size : 0;
            const isSel = f.id === selectedFriendId;
            const isEditing = editingId === f.id;
            return (
              <div
                key={f.id}
                className={styles.listItem}
                onClick={() => onClickItem(f.id)}
                style={isSel ? { background: '#f5fbf7' } : undefined}
              >
                {isEditing ? (
                  <input
                    className={styles.input}
                    value={editName}
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={commitEdit}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        commitEdit();
                      } else if (e.key === 'Escape') {
                        e.preventDefault();
                        cancelEdit();
                      }
                    }}
                    style={{ maxWidth: 220 }}
                  />
                ) : (
                  <div
                    className={styles.itemTitle}
                    title="Click to rename"
                    onClick={(e) => {
                      e.stopPropagation();
                      startEdit(f.id, f.name);
                    }}
                    style={{ cursor: 'text' }}
                  >
                    {f.name}
                  </div>
                )}
                <div className={styles.itemMeta}>
                  &nbsp;·&nbsp;{evCount} events · {connCount} connections
                  {(() => {
                    const locs = locByFriend.get(f.id) || [];
                    return locs.length ? <> · 📍 {locs.slice(0, 2).join(', ')}</> : null;
                  })()}
                </div>
                <div className={styles.itemRight} aria-hidden>›</div>
                <button
                  className={styles.btnSecondary}
                  style={{ marginLeft: 8 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    const ok = window.confirm(`Remove ${f.name}? This doesn’t delete events from others.`);
                    if (!ok) return;
                    onRemoveFriend?.(f.id);
                  }}
                >
                  Remove
                </button>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div style={{ padding: 12, color: '#666' }}>
              {friends.length === 0
                ? 'No friends yet — add your first contact above.'
                : 'No matches for your filter.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
