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

export default function EventsTab({ friends, addEvent, updateEvent, selectedEventId, eventIndex, openEvent }) {
  // Creation form state
  const [date, setDate] = useState(todayISO());
  const [notes, setNotes] = useState('');
  const [location, setLocation] = useState('');
  const [title, setTitle] = useState('');
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
  const canCreate = selectedCount > 0 && notes.trim().length > 0 && title.trim().length > 0;

  const createEvent = () => {
    if (!canCreate) return;
    const dateISO = new Date(date).toISOString();
    addEvent({
      date: dateISO,
      title: title.trim(),
      notes: notes.trim(),
      location: location.trim() || undefined,
      participants: Array.from(selected),
    });
    // reset minimal fields, keep filter/selection to ease batch creation
    setNotes('');
  };

  // Timeline groups from merged eventIndex
  const groups = useMemo(() => groupEventsByDay(eventIndex), [eventIndex]);

  // Selected event editor state
  const selectedEvent = useMemo(
    () => (selectedEventId ? (eventIndex || []).find((e) => e.id === selectedEventId) : null),
    [eventIndex, selectedEventId]
  );
  const [edit, setEdit] = useState(() => ({
    id: null,
    date: todayISO(),
    title: '',
    notes: '',
    location: '',
    participants: new Set(),
  }));
  // Hydrate editor when selected changes
  useMemo(() => {
    if (!selectedEvent) return edit;
    const e = selectedEvent;
    setEdit({
      id: e.id,
      date: e.date,
      title: e.title || '',
      notes: e.notes || '',
      location: e.location || '',
      participants: new Set(e.participants || []),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEventId]);

  const toggleEditParticipant = (id) => {
    setEdit((prev) => {
      const p = new Set(prev.participants);
      if (p.has(id)) p.delete(id);
      else p.add(id);
      return { ...prev, participants: p };
    });
  };

  const canSaveEdit = !!edit.id && String(edit.title || '').trim() && String(edit.notes || '').trim();

  const saveEdit = () => {
    if (!canSaveEdit) return;
    updateEvent?.(edit.id, {
      date: edit.date,
      title: edit.title.trim(),
      notes: edit.notes.trim(),
      location: edit.location.trim() || undefined,
      participants: Array.from(edit.participants),
    });
  };

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
          <input
            className={styles.input}
            placeholder="Title (required)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: '100%' }}
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

      {/* Timeline + Editor */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>Timeline</div>

        {/* Event Editor */}
        {selectedEvent ? (
          <div className={styles.card} style={{ marginBottom: 12 }}>
            <div className={styles.cardHeader}><span>Edit Event</span></div>
            <div className={styles.row} style={{ marginBottom: 8, flexWrap: 'wrap' }}>
              <input
                lang="fr-FR"
                type="date"
                className={styles.input}
                value={edit.date}
                onChange={(e) => setEdit({ ...edit, date: e.target.value })}
              />
              <input
                className={styles.input}
                placeholder="Location (optional)"
                value={edit.location}
                onChange={(e) => setEdit({ ...edit, location: e.target.value })}
                style={{ minWidth: 160 }}
              />
            </div>
            <div className={styles.row} style={{ marginBottom: 8 }}>
              <input
                className={styles.input}
                placeholder="Title (required)"
                value={edit.title}
                onChange={(e) => setEdit({ ...edit, title: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>
            <div className={styles.row} style={{ marginBottom: 8 }}>
              <textarea
                className={styles.textarea}
                placeholder="Notes (required)"
                value={edit.notes}
                onChange={(e) => setEdit({ ...edit, notes: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>

            <div className={styles.card} style={{ marginTop: 8 }}>
              <div className={styles.cardHeader}>
                <span>Participants ({edit.participants.size})</span>
                <input
                  className={styles.input}
                  placeholder="Filter…"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                />
              </div>
              <div className={styles.scroll}>
                {filteredFriends.map((f) => {
                  const checked = edit.participants.has(f.id);
                  return (
                    <label key={f.id} className={styles.switchRow} style={{ cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleEditParticipant(f.id)}
                      />
                      <span style={{ fontWeight: 600, marginLeft: 8 }}>{f.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className={styles.row} style={{ marginTop: 12 }}>
              <button className={styles.btn} onClick={saveEdit} disabled={!canSaveEdit}>
                Save Changes
              </button>
            </div>
          </div>
        ) : null}
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
                    <div
                      style={{ fontWeight: 700, cursor: 'pointer' }}
                      onClick={() => openEvent?.(e)}
                      title="Open event details"
                    >
                      {e.title || '(untitled)'}
                    </div>
                    <div className={styles.itemMeta}>{names.join(', ') || 'Unknown'}</div>
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
