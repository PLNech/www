import { useMemo, useState } from 'react';
import styles from '@/styles/dunbar.module.css';
import {
  todayISO,
  yesterdayISO,
  weekAgoISO,
  startOfMonthISO,
  groupEventsByDay,
  isoDate,
} from '@/lib/dunbar';
import { extractTags } from '@/lib/dunbar';

export default function EventsTab({ friends, addEvent, eventIndex }) {
  // Creation form state
  const [date, setDate] = useState(todayISO());
  const [notes, setNotes] = useState('');
  const [location, setLocation] = useState('');
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState(() => new Set());

  const friendMap = useMemo(() => {
    const m = new Map();
    for (const f of friends) m.set(f.id, f);
    return m;
  }, [friends]);

  const filteredFriends = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return friends;
    return friends.filter((f) => f.name.toLowerCase().includes(q));
  }, [friends, filter]);

  const toggleFriend = (id) => {
    const s = new Set(selected);
    if (s.has(id)) s.delete(id);
    else s.add(id);
    setSelected(s);
  };

  const selectedCount = selected.size;
  const canCreate = selectedCount > 0 && notes.trim().length > 0;

  const createEvent = () => {
    if (!canCreate) return;
    const dateISO = new Date(date).toISOString();
    addEvent({
      date: dateISO,
      notes: notes.trim(),
      location: location.trim() || undefined,
      participants: Array.from(selected),
    });
    // reset minimal fields, keep filter/selection to ease batch creation
    setNotes('');
  };

  // Timeline groups from merged eventIndex
  const groups = useMemo(() => groupEventsByDay(eventIndex), [eventIndex]);

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

  return (
    <div className={styles.twoCol} style={{ gap: 16 }}>
      {/* New Event Builder */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span>New Event</span>
        </div>
        <div className={styles.row} style={{ gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
          <button className={styles.btnSecondary} onClick={() => setDate(todayISO())}>Today</button>
          <button className={styles.btnSecondary} onClick={() => setDate(yesterdayISO())}>Yesterday</button>
          <button className={styles.btnSecondary} onClick={() => setDate(weekAgoISO())}>Week Ago</button>
          <button className={styles.btnSecondary} onClick={() => setDate(startOfMonthISO())}>Start of Month</button>
        </div>
        <div className={styles.row} style={{ marginBottom: 8, flexWrap: 'wrap' }}>
          <input
            lang="fr-FR"
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

        <div className={styles.card} style={{ marginTop: 8 }}>
          <div className={styles.cardHeader}>
            <span>Friends ({selectedCount} selected)</span>
            <input
              className={styles.input}
              placeholder="Search friends…"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          <div className={styles.scroll}>
            {filteredFriends.map((f) => {
              const checked = selected.has(f.id);
              return (
                <label key={f.id} className={styles.switchRow} style={{ cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleFriend(f.id)}
                  />
                  <span style={{ fontWeight: 600, marginLeft: 8 }}>{f.name}</span>
                </label>
              );
            })}
            {filteredFriends.length === 0 && (
              <div style={{ padding: 8, color: '#666' }}>No matches.</div>
            )}
          </div>
        </div>

        <div className={styles.row} style={{ marginTop: 12 }}>
          <button className={styles.btn} onClick={createEvent} disabled={!canCreate}>
            Create Event
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>Timeline</div>
        <div className={styles.timeline}>
          {groups.map((g) => (
            <div key={g.dateKey} className={styles.timelineGroup}>
              <div className={styles.timelineDate}>{g.label}</div>
              {g.items.map((e) => {
                const names = (e.participants || [])
                  .map((id) => friendMap.get(id)?.name)
                  .filter(Boolean);
                return (
                  <div key={e.id + e.date} className={styles.timelineEvent}>
                    <div><strong>{names.join(', ') || 'Unknown'}</strong></div>
                    <div style={{ whiteSpace: 'pre-wrap' }}>
                      {renderNotesWithTags(e.notes || '')}
                    </div>
                    {e.location ? (
                      <div style={{ color: '#555', marginTop: 4 }}>📍 {e.location}</div>
                    ) : null}
                    {/* Tag chips */}
                    {(() => {
                      const tags = extractTags(e.notes || '');
                      return tags.length ? (
                        <div className={styles.tagRow}>
                          {tags.slice(0, 10).map((t) => (
                            <span key={t} className={styles.tagChip}>#{t}</span>
                          ))}
                        </div>
                      ) : null;
                    })()}
                    <div style={{ color: '#888', marginTop: 4, fontSize: 12 }}>
                      {isoDate(e.date)}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
          {groups.length === 0 && (
            <div style={{ color: '#666' }}>No events yet — create one on the left.</div>
          )}
        </div>
      </div>
    </div>
  );
}
