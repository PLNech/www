import { useEffect, useMemo, useRef, useState } from 'react';
import styles from '@/styles/dunbar.module.css';
import { isoDate, sortEventsDesc } from '@/lib/dunbar';


export default function FriendDetail({
  friend,
  friends,
  onToggleRel,   // (aId, bId) => void
  onAddEvent,    // ({ date, notes, participants[], location? }) => void
}) {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [location, setLocation] = useState('');
  const relScrollRef = useRef(null);

  // Scroll preservation for toggles: store + restore scrollTop across updates
  const beforeToggle = useRef(0);
  const restorePending = useRef(false);
  useEffect(() => {
    if (restorePending.current && relScrollRef.current) {
      const st = beforeToggle.current;
      // Restore next tick
      const id = setTimeout(() => {
        try {
          relScrollRef.current.scrollTop = st;
        } catch {}
        restorePending.current = false;
      }, 0);
      return () => clearTimeout(id);
    }
  });

  const others = useMemo(() => {
    if (!friend) return [];
    return friends.filter((f) => f.id !== friend.id);
  }, [friend, friends]);

  const friendRelSet = useMemo(() => {
    return friend ? friend.relationships || new Set() : new Set();
  }, [friend]);

  const eventsDesc = useMemo(() => {
    if (!friend) return [];
    return sortEventsDesc(friend.events);
  }, [friend]);

  const onToggle = (targetId) => {
    if (!friend) return;
    if (relScrollRef.current) beforeToggle.current = relScrollRef.current.scrollTop;
    restorePending.current = true;
    onToggleRel?.(friend.id, targetId);
  };

  const submitEvent = () => {
    if (!friend) return;
    const dateISO = new Date(date).toISOString();
    const n = notes.trim();
    if (!dateISO || !n) return;
    onAddEvent?.({
      date: dateISO,
      notes: n,
      location: location.trim() || undefined,
      participants: [friend.id],
    });
    // reset notes only; keep date for faster entry
    setNotes('');
  };

  if (!friend) {
    return (
      <div className={styles.card}>
        <div className={styles.cardHeader}>Friend details</div>
        <div style={{ color: '#666' }}>Select a friend from the list to view and edit details.</div>
      </div>
    );
  }

  const evCount = Array.isArray(friend.events) ? friend.events.length : 0;
  const connCount = friend.relationships ? friend.relationships.size : 0;

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span>{friend.name}</span>
        <span className={styles.badge}>{evCount} events · {connCount} connections</span>
      </div>

      <div className={styles.twoCol} style={{ gap: 12 }}>
        {/* Relationships */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span>Relationships ({others.length})</span>
          </div>
          <div ref={relScrollRef} className={styles.scroll}>
            {others.map((o) => {
              const onRel = friendRelSet.has(o.id);
              return (
                <div key={o.id} className={styles.switchRow}>
                  <div style={{ minWidth: 160, fontWeight: 600 }}>{o.name}</div>
                  <div
                    className={`${styles.switch} ${onRel ? styles.switchOn : ''}`}
                    onClick={() => onToggle(o.id)}
                    title={onRel ? 'Connected — click to remove' : 'Not connected — click to connect'}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className={`${styles.knob} ${onRel ? styles.knobOn : ''}`} />
                  </div>
                </div>
              );
            })}
            {others.length === 0 && (
              <div style={{ padding: 8, color: '#666' }}>No other friends to connect yet.</div>
            )}
          </div>
        </div>

        {/* Events */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span>Events</span>
          </div>

          {/* Add Event */}
          <div className={styles.row} style={{ marginBottom: 8, flexWrap: 'wrap' }}>
            <input
              type="date"
              className={styles.input}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <input
              className={styles.input}
              placeholder="Location (optional)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              style={{ minWidth: 160 }}
            />
          </div>
          <div className={styles.row} style={{ marginBottom: 8 }}>
            <textarea
              className={styles.textarea}
              placeholder="Notes (required)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
          <div className={styles.row} style={{ marginBottom: 12 }}>
            <button className={styles.btn} onClick={submitEvent} disabled={!notes.trim()}>
              Add Event
            </button>
          </div>

          {/* Timeline */}
          <div className={styles.timeline}>
            {eventsDesc.map((e) => (
              <div key={e.id + e.date} className={styles.timelineEvent}>
                <div className={styles.timelineDate}>
                  {isoDate(e.date)}
                </div>
                <div style={{ whiteSpace: 'pre-wrap' }}>{e.notes}</div>
                {e.location ? (
                  <div style={{ color: '#555', marginTop: 4 }}>📍 {e.location}</div>
                ) : null}
              </div>
            ))}
            {eventsDesc.length === 0 && (
              <div style={{ color: '#666' }}>No events yet — add your first memory above.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
