import { useEffect, useMemo, useRef, useState } from 'react';
import styles from '@/styles/dunbar.module.css';
import { isoDate, sortEventsDesc, extractTags, eventSlug } from '@/lib/dunbar';


export default function FriendDetail({
  friend,
  friends,
  onToggleRel,   // (aId, bId) => void
  onAddEvent,    // ({ date, notes, participants[], location? }) => void
  onRename,      // (id, name) => void
  onSetBirthday, // (id, ymd) => void
  onSetNotes,    // (id, notes) => void
  onUpdateFriend, // (id, patch) => void
}) {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [location, setLocation] = useState('');
  const [title, setTitle] = useState('');
  const [friendNotes, setFriendNotes] = useState('');
  const [birthday, setBirthday] = useState('');
  const relScrollRef = useRef(null);

  // Inline rename for friend's name
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const startEditName = () => {
    if (!friend) return;
    setEditing(true);
    setEditName(friend.name || '');
  };
  const commitEditName = () => {
    if (!friend) return;
    const n = (editName || '').trim();
    if (n) onRename?.(friend.id, n);
    setEditing(false);
  };
  const cancelEditName = () => {
    setEditing(false);
    setEditName('');
  };

  // Sync friend notes and birthday when selection changes
  useEffect(() => {
    if (!friend) {
      setFriendNotes('');
      setBirthday('');
      return;
    }
    setFriendNotes(friend.notes || '');
    setBirthday(friend.birthday || '');
  }, [friend]);

  const saveFriendNotes = () => {
    if (!friend) return;
    onSetNotes?.(friend.id, friendNotes);
  };
  const saveBirthday = (val) => {
    if (!friend) return;
    const v = (val || '').slice(0, 10);
    setBirthday(v);
    onSetBirthday?.(friend.id, v);
  };

  // Rich profile helpers
  const patch = (p) => {
    if (!friend) return;
    onUpdateFriend?.(friend.id, p);
  };

  // Important dates
  const [idate, setIDate] = useState('');
  const [ilabel, setILabel] = useState('');
  const addImportantDate = () => {
    if (!friend) return;
    const d = (idate || '').slice(0, 10);
    if (!d) return;
    const arr = Array.isArray(friend.importantDates) ? [...friend.importantDates] : [];
    arr.push({ date: d, label: ilabel || '' });
    patch({ importantDates: arr });
    setIDate('');
    setILabel('');
  };
  const removeImportantDate = (idx) => {
    if (!friend) return;
    const arr = (friend.importantDates || []).filter((_, i) => i !== idx);
    patch({ importantDates: arr });
  };

  // Gifts
  const [g, setG] = useState({ date: '', occasion: '', description: '', image: '' });
  const addGift = () => {
    if (!friend) return;
    const arr = Array.isArray(friend.gifts) ? [...friend.gifts] : [];
    arr.push({
      date: (g.date || '').slice(0, 10),
      occasion: g.occasion || '',
      description: g.description || '',
      image: g.image || '',
    });
    patch({ gifts: arr });
    setG({ date: '', occasion: '', description: '', image: '' });
  };
  const removeGift = (idx) => {
    if (!friend) return;
    const arr = (friend.gifts || []).filter((_, i) => i !== idx);
    patch({ gifts: arr });
  };

  // Postcards
  const [pc, setPC] = useState({ date: '', location: '', description: '', image: '' });
  const addPostcard = () => {
    if (!friend) return;
    const arr = Array.isArray(friend.postcards) ? [...friend.postcards] : [];
    arr.push({
      date: (pc.date || '').slice(0, 10),
      location: pc.location || '',
      description: pc.description || '',
      image: pc.image || '',
    });
    patch({ postcards: arr });
    setPC({ date: '', location: '', description: '', image: '' });
  };
  const removePostcard = (idx) => {
    if (!friend) return;
    const arr = (friend.postcards || []).filter((_, i) => i !== idx);
    patch({ postcards: arr });
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
    const t = title.trim();
    if (!dateISO || !t || !n) return;
    onAddEvent?.({
      date: dateISO,
      title: t,
      notes: n,
      location: location.trim() || undefined,
      participants: [friend.id],
    });
    // reset notes/title only; keep date for faster entry
    setNotes('');
    setTitle('');
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
        <span>
          {editing ? (
            <input
              className={styles.input}
              value={editName}
              autoFocus
              onChange={(e) => setEditName(e.target.value)}
              onBlur={commitEditName}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  commitEditName();
                } else if (e.key === 'Escape') {
                  e.preventDefault();
                  cancelEditName();
                }
              }}
              style={{ maxWidth: 260 }}
            />
          ) : (
            <span
              title="Click to rename"
              onClick={startEditName}
              style={{ cursor: 'text', fontWeight: 600 }}
            >
              {friend.name}
            </span>
          )}
        </span>
        <span className={styles.badge}>{evCount} events · {connCount} connections</span>
      </div>

      <div className={styles.row} style={{ gap: 8, margin: '8px 0', flexWrap: 'wrap' }}>
        <label style={{ fontSize: 12, color: '#555' }}>Anniv:</label>
        <input
          lang="fr-FR"
          type="date"
          className={styles.input}
          value={birthday || ''}
          onChange={(e) => saveBirthday(e.target.value)}
        />
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

        {/* Friend Notes */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span>Notes (ami)</span>
          </div>
          <div className={styles.row} style={{ marginBottom: 8 }}>
            <textarea
              className={styles.textarea}
              placeholder="Notes libres sur l’ami·e (thèmes, centres d’intérêt, etc.)"
              value={friendNotes}
              onChange={(e) => setFriendNotes(e.target.value)}
              onBlur={saveFriendNotes}
              style={{ width: '100%' }}
            />
          </div>
        </div>

        {/* Profil */}
        <div className={styles.card}>
          <div className={styles.cardHeader}><span>Profil</span></div>

          {/* Likes/Dislikes */}
          <div className={styles.row} style={{ marginBottom: 8, flexWrap: 'wrap' }}>
            <input className={styles.input} placeholder="Aime"
              value={friend?.likes || ''} onChange={(e) => patch({ likes: e.target.value })} style={{ minWidth: 200 }}/>
            <input className={styles.input} placeholder="N'aime pas"
              value={friend?.dislikes || ''} onChange={(e) => patch({ dislikes: e.target.value })} style={{ minWidth: 200 }}/>
          </div>

          {/* Food */}
          <div className={styles.row} style={{ marginBottom: 8, flexWrap: 'wrap' }}>
            <input className={styles.input} placeholder="Aime (nourriture/boissons)"
              value={friend?.foodLikes || ''} onChange={(e) => patch({ foodLikes: e.target.value })} style={{ minWidth: 240 }}/>
            <input className={styles.input} placeholder="N'aime pas (nourriture/boissons)"
              value={friend?.foodDislikes || ''} onChange={(e) => patch({ foodDislikes: e.target.value })} style={{ minWidth: 240 }}/>
          </div>

          {/* General info */}
          <div className={styles.row} style={{ marginBottom: 8, flexWrap: 'wrap' }}>
            <input className={styles.input} placeholder="Mot de passe Wi‑Fi"
              value={friend?.wifiPassword || ''} onChange={(e) => patch({ wifiPassword: e.target.value })}/>
            <input className={styles.input} placeholder="Modèle de voiture"
              value={friend?.carModel || ''} onChange={(e) => patch({ carModel: e.target.value })}/>
            <input className={styles.input} placeholder="Lieu de travail"
              value={friend?.workplace || ''} onChange={(e) => patch({ workplace: e.target.value })}/>
            <input className={styles.input} placeholder="Emploi du temps"
              value={friend?.schedule || ''} onChange={(e) => patch({ schedule: e.target.value })}/>
          </div>

          {/* Future ideas & quotes */}
          <div className={styles.row} style={{ marginBottom: 8 }}>
            <textarea className={styles.textarea} placeholder="Idées d'activités/sorties futures"
              value={friend?.futureIdeas || ''} onChange={(e) => patch({ futureIdeas: e.target.value })} style={{ width: '100%' }}/>
          </div>
          <div className={styles.row} style={{ marginBottom: 8 }}>
            <textarea className={styles.textarea} placeholder="Phrases cultes / blagues"
              value={friend?.quotes || ''} onChange={(e) => patch({ quotes: e.target.value })} style={{ width: '100%' }}/>
          </div>

          {/* Important dates */}
          <div className={styles.cardHeader}><span>Dates importantes</span></div>
          <div className={styles.row} style={{ marginBottom: 6, flexWrap: 'wrap' }}>
            <input lang="fr-FR" type="date" className={styles.input} value={idate} onChange={(e) => setIDate(e.target.value)}/>
            <input className={styles.input} placeholder="Label" value={ilabel} onChange={(e) => setILabel(e.target.value)}/>
            <button className={styles.btn} onClick={addImportantDate} disabled={!idate}>Ajouter</button>
          </div>
          <div className={styles.listScroll} style={{ maxHeight: '25vh' }}>
            {(friend?.importantDates || []).map((d, idx) => (
              <div key={idx} className={styles.switchRow}>
                <div style={{ minWidth: 120, fontWeight: 600 }}>{d?.date || ''}</div>
                <div style={{ flex: 1 }}>{d?.label || ''}</div>
                <button className={styles.btnSecondary} onClick={() => removeImportantDate(idx)}>Supprimer</button>
              </div>
            ))}
            {(friend?.importantDates || []).length === 0 && <div style={{ padding: 8, color: '#666' }}>Aucune date.</div>}
          </div>

          {/* Gifts */}
          <div className={styles.cardHeader}><span>Cadeaux offerts</span></div>
          <div className={styles.row} style={{ marginBottom: 6, flexWrap: 'wrap' }}>
            <input lang="fr-FR" type="date" className={styles.input} value={g.date} onChange={(e) => setG({ ...g, date: e.target.value })}/>
            <input className={styles.input} placeholder="Occasion" value={g.occasion} onChange={(e) => setG({ ...g, occasion: e.target.value })}/>
            <input className={styles.input} placeholder="Description" value={g.description} onChange={(e) => setG({ ...g, description: e.target.value })} style={{ minWidth: 240 }}/>
            <input className={styles.input} placeholder="Image URL" value={g.image} onChange={(e) => setG({ ...g, image: e.target.value })}/>
            <button className={styles.btn} onClick={addGift} disabled={!g.date && !g.description}>Ajouter</button>
          </div>
          <div className={styles.listScroll} style={{ maxHeight: '25vh' }}>
            {(friend?.gifts || []).map((x, idx) => (
              <div key={idx} className={styles.switchRow}>
                <div style={{ minWidth: 110, fontWeight: 600 }}>{x?.date || ''}</div>
                <div style={{ flex: 1 }}>{x?.occasion ? `${x.occasion} — ` : ''}{x?.description || ''}</div>
                {x?.image ? <a href={x.image} target="_blank" rel="noreferrer" className={styles.itemMeta}>image</a> : null}
                <button className={styles.btnSecondary} onClick={() => removeGift(idx)}>Supprimer</button>
              </div>
            ))}
            {(friend?.gifts || []).length === 0 && <div style={{ padding: 8, color: '#666' }}>Aucun cadeau.</div>}
          </div>

          {/* Postcards */}
          <div className={styles.cardHeader}><span>Cartes postales</span></div>
          <div className={styles.row} style={{ marginBottom: 6, flexWrap: 'wrap' }}>
            <input lang="fr-FR" type="date" className={styles.input} value={pc.date} onChange={(e) => setPC({ ...pc, date: e.target.value })}/>
            <input className={styles.input} placeholder="Lieu" value={pc.location} onChange={(e) => setPC({ ...pc, location: e.target.value })}/>
            <input className={styles.input} placeholder="Description" value={pc.description} onChange={(e) => setPC({ ...pc, description: e.target.value })} style={{ minWidth: 240 }}/>
            <input className={styles.input} placeholder="Image URL" value={pc.image} onChange={(e) => setPC({ ...pc, image: e.target.value })}/>
            <button className={styles.btn} onClick={addPostcard}>Ajouter</button>
          </div>
          <div className={styles.listScroll} style={{ maxHeight: '25vh' }}>
            {(friend?.postcards || []).map((x, idx) => (
              <div key={idx} className={styles.switchRow}>
                <div style={{ minWidth: 110, fontWeight: 600 }}>{x?.date || ''}</div>
                <div style={{ flex: 1 }}>{x?.location ? `${x.location} — ` : ''}{x?.description || ''}</div>
                {x?.image ? <a href={x.image} target="_blank" rel="noreferrer" className={styles.itemMeta}>image</a> : null}
                <button className={styles.btnSecondary} onClick={() => removePostcard(idx)}>Supprimer</button>
              </div>
            ))}
            {(friend?.postcards || []).length === 0 && <div style={{ padding: 8, color: '#666' }}>Aucune carte.</div>}
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
          <div className={styles.row} style={{ marginBottom: 12 }}>
            <button className={styles.btn} onClick={submitEvent} disabled={!title.trim() || !notes.trim()}>
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
                <div
                  style={{ fontWeight: 700, cursor: 'pointer' }}
                  onClick={() => (window.location.href = `/dunbar/event/${eventSlug(e)}`)}
                  title="Open event details"
                >
                  {e.title || '(untitled)'}
                </div>
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
