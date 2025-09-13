import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import { normalizeImportedPayload, isoDate } from '@/lib/dunbar';
import { computeUpcomingAnniversaries } from '@/lib/dunbar';

const LS_KEY = 'dunbar-state-v1';

// Helpers
const uuid = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `id_${Date.now()}_${Math.random().toString(36).slice(2)}`);
const nowISO = () => new Date().toISOString();

function serializeState(state) {
  const friends = state.friends.map((f) => ({
    ...f,
    relationships: Array.from(f.relationships || []),
  }));
  return JSON.stringify({ friends, selectedFriendId: state.selectedFriendId });
}

function deserializeState(json) {
  try {
    const data = JSON.parse(json);
    if (!data || !Array.isArray(data.friends)) return null;
    const friends = data.friends.map((f) => ({
      ...f,
      relationships: new Set(f.relationships || []),
      events: Array.isArray(f.events) ? f.events : [],
    }));
    return { friends, selectedFriendId: data.selectedFriendId || null };
  } catch {
    return null;
  }
}

function computeLastInteraction(friend) {
  if (!friend.events || friend.events.length === 0) return null;
  const max = friend.events.reduce((acc, e) => {
    const t = new Date(e.date).getTime();
    return Math.max(acc, isNaN(t) ? 0 : t);
  }, 0);
  return max ? new Date(max).toISOString() : null;
}

const initialState = {
  friends: [],
  selectedFriendId: null,
  selectedEventId: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'LOAD': {
      return action.payload || state;
    }
    case 'ADD_FRIEND': {
      const name = String(action.payload?.name || '').trim();
      if (!name) return state;
      const newFriend = {
        id: uuid(),
        name,
        birthday: null,
        notes: '',
        // rich profile fields
        likes: [],
        dislikes: [],
        foodLikes: '',
        foodDislikes: '',
        wifiPassword: '',
        carModel: '',
        workplace: '',
        schedule: '',
        futureIdeas: [],
        quotes: [],
        projects: [],
        importantDates: [], // [{ date: 'YYYY-MM-DD', label: string }]
        gifts: [],          // [{ date, occasion, description, image }]
        postcards: [],      // [{ date, location, description, image }]
        relationships: new Set(),
        events: [],
        lastInteraction: null,
      };
      return { ...state, friends: [...state.friends, newFriend] };
    }
    case 'REMOVE_FRIEND': {
      const id = action.payload?.id;
      if (!id) return state;
      const friends = state.friends
        .filter((f) => f.id !== id)
        .map((f) => {
          if (f.relationships?.has(id)) {
            const rel = new Set(f.relationships);
            rel.delete(id);
            return { ...f, relationships: rel };
          }
          return f;
        });
      return {
        ...state,
        friends,
        selectedFriendId: state.selectedFriendId === id ? null : state.selectedFriendId,
      };
    }
    case 'RENAME_FRIEND': {
      const { id, name } = action.payload || {};
      if (!id) return state;
      const n = String(name || '').trim();
      if (!n) return state;
      const friends = state.friends.map((f) => (f.id === id ? { ...f, name: n } : f));
      return { ...state, friends };
    }
    case 'SET_BIRTHDAY': {
      const { id, birthday } = action.payload || {};
      if (!id) return state;
      const b = birthday ? String(birthday).slice(0, 10) : null;
      const friends = state.friends.map((f) => (f.id === id ? { ...f, birthday: b } : f));
      return { ...state, friends };
    }
    case 'SET_FRIEND_NOTES': {
      const { id, notes } = action.payload || {};
      if (!id) return state;
      const friends = state.friends.map((f) => (f.id === id ? { ...f, notes: String(notes || '') } : f));
      return { ...state, friends };
    }
    case 'SELECT_FRIEND': {
      const id = action.payload?.id ?? null;
      return { ...state, selectedFriendId: id };
    }
    case 'SELECT_EVENT': {
      const id = action.payload?.id ?? null;
      return { ...state, selectedEventId: id };
    }
    case 'TOGGLE_REL': {
      const a = action.payload?.aId;
      const b = action.payload?.bId;
      if (!a || !b || a === b) return state;
      const friends = state.friends.map((f) => {
        if (f.id === a) {
          const rel = new Set(f.relationships || []);
          rel.has(b) ? rel.delete(b) : rel.add(b);
          return { ...f, relationships: rel };
        }
        if (f.id === b) {
          const rel = new Set(f.relationships || []);
          rel.has(a) ? rel.delete(a) : rel.add(a);
          return { ...f, relationships: rel };
        }
        return f;
      });
      return { ...state, friends };
    }
    case 'ADD_EVENT': {
      const { date, title, notes, participants = [], location } = action.payload || {};
      // Normalize to YYYY-MM-DD (Paris local semantics handled at render/grouping time)
      const dateStr = typeof date === 'string' ? date.slice(0, 10) : isoDate(date);
      if (!dateStr || !String(title || '').trim() || !String(notes || '').trim() || !participants.length) return state;

      const eventId = uuid();
      // Create one logical event id applied to each participant for deduplication across views
      const friends = state.friends.map((f) => {
        if (participants.includes(f.id)) {
          const ev = {
            id: eventId,
            date: dateStr,
            title: String(title),
            notes: String(notes),
            location: location ? String(location) : undefined,
            participants: [...participants],
          };
          const events = Array.isArray(f.events) ? [...f.events, ev] : [ev];
          const lastInteraction = computeLastInteraction({ ...f, events });
          return { ...f, events, lastInteraction };
        }
        return f;
      });
      return { ...state, friends, selectedEventId: eventId };
    }
    case 'UPDATE_EVENT': {
      const { id, patch } = action.payload || {};
      if (!id || !patch) return state;

      // Find a canonical copy of the event to merge with
      let canonical = null;
      for (const f of state.friends) {
        const found = (f.events || []).find((e) => e.id === id);
        if (found) {
          canonical = found;
          break;
        }
      }
      if (!canonical) return state;

      const nextParticipants = Array.isArray(patch.participants)
        ? [...patch.participants]
        : [...(canonical.participants || [])];

      // Normalized updated event object
      const updated = {
        ...canonical,
        ...patch,
        participants: nextParticipants,
      };

      const participantSet = new Set(nextParticipants);

      const friends = state.friends.map((f) => {
        const hasBefore = (f.events || []).some((e) => e.id === id);
        const shouldHave = participantSet.has(f.id);

        // Remove if no longer participant
        if (hasBefore && !shouldHave) {
          const events = (f.events || []).filter((e) => e.id !== id);
          const lastInteraction = computeLastInteraction({ ...f, events });
          return { ...f, events, lastInteraction };
        }

        // Add if newly participant
        if (!hasBefore && shouldHave) {
          const events = Array.isArray(f.events) ? [...f.events, updated] : [updated];
          const lastInteraction = computeLastInteraction({ ...f, events });
          return { ...f, events, lastInteraction };
        }

        // Update if present and still participant
        if (hasBefore && shouldHave) {
          const events = (f.events || []).map((e) => (e.id === id ? updated : e));
          const lastInteraction = computeLastInteraction({ ...f, events });
          return { ...f, events, lastInteraction };
        }

        // Neither before nor after → unchanged
        return f;
      });

      return { ...state, friends };
    }
    case 'UPDATE_FRIEND': {
      const { id, patch } = action.payload || {};
      if (!id || !patch) return state;
      const friends = state.friends.map((f) => (f.id === id ? { ...f, ...patch } : f));
      return { ...state, friends };
    }
    case 'RESET': {
      return { ...initialState };
    }
    default:
      return state;
  }
}

/**
 * Dunbar data store with localStorage persistence and derived helpers.
 */
export function useDunbarStore() {
  const didInitRef = useRef(false);
  const [state, dispatch] = useReducer(reducer, initialState);

  // Load persisted state (client-only)
  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;
    if (typeof window === 'undefined') return;
    const raw = window.localStorage.getItem(LS_KEY);
    const loaded = raw ? deserializeState(raw) : null;
    if (loaded) {
      // Patch lastInteraction on load
      const patched = {
        ...loaded,
        friends: loaded.friends.map((f) => ({
          ...f,
          lastInteraction: computeLastInteraction(f),
        })),
      };
      dispatch({ type: 'LOAD', payload: patched });
    }
  }, []);

  // Auto-save to localStorage on change
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const serialized = serializeState(state);
      window.localStorage.setItem(LS_KEY, serialized);
    } catch {
      // ignore
    }
  }, [state]);

  // Actions
  const addFriend = useCallback((name) => dispatch({ type: 'ADD_FRIEND', payload: { name } }), []);
  const removeFriend = useCallback((id) => dispatch({ type: 'REMOVE_FRIEND', payload: { id } }), []);
  const selectFriend = useCallback((id) => dispatch({ type: 'SELECT_FRIEND', payload: { id } }), []);
  const toggleRelationship = useCallback((aId, bId) => dispatch({ type: 'TOGGLE_REL', payload: { aId, bId } }), []);
  const addEvent = useCallback((payload) => dispatch({ type: 'ADD_EVENT', payload }), []);
  const selectEvent = useCallback((id) => dispatch({ type: 'SELECT_EVENT', payload: { id } }), []);
  const updateEvent = useCallback((id, patch) => dispatch({ type: 'UPDATE_EVENT', payload: { id, patch } }), []);
  const resetData = useCallback(() => {
    if (typeof window !== 'undefined') {
      const ok = window.confirm('This will clear all Dunbar data. Continue?');
      if (!ok) return;
      window.localStorage.removeItem(LS_KEY);
    }
    dispatch({ type: 'RESET' });
  }, []);

  const renameFriend = useCallback((id, name) => {
    dispatch({ type: 'RENAME_FRIEND', payload: { id, name } });
  }, []);

  const setBirthday = useCallback((id, birthday) => {
    dispatch({ type: 'SET_BIRTHDAY', payload: { id, birthday } });
  }, []);

  const setFriendNotes = useCallback((id, notes) => {
    dispatch({ type: 'SET_FRIEND_NOTES', payload: { id, notes } });
  }, []);

  const loadFromPayload = useCallback((payload) => {
    try {
      const normalized = normalizeImportedPayload(payload);
      const patched = {
        ...normalized,
        friends: normalized.friends.map((f) => ({
          ...f,
          lastInteraction: computeLastInteraction(f),
        })),
      };
      dispatch({ type: 'LOAD', payload: patched });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Dunbar import failed', e);
    }
  }, []);

  // Derived helpers
  const friendMap = useMemo(() => {
    const m = new Map();
    for (const f of state.friends) m.set(f.id, f);
    return m;
  }, [state.friends]);

  const getFriendById = useCallback((id) => friendMap.get(id) || null, [friendMap]);

  const getConnectionCount = useCallback(
    (id) => {
      const f = friendMap.get(id);
      return f?.relationships ? f.relationships.size : 0;
    },
    [friendMap]
  );

  const getEventCount = useCallback(
    (id) => {
      const f = friendMap.get(id);
      return Array.isArray(f?.events) ? f.events.length : 0;
    },
    [friendMap]
  );

  // Stats
  const stats = useMemo(() => {
    const friends = state.friends;
    let edges = 0;
    let totalEvents = 0;
    const now = Date.now();
    const ninety = 90 * 24 * 60 * 60 * 1000;
    let activeFriends = 0;
    for (const f of friends) {
      edges += (f.relationships?.size || 0);
      const evCount = Array.isArray(f.events) ? f.events.length : 0;
      totalEvents += evCount;
      const hasRecent = (f.events || []).some((e) => now - new Date(e.date).getTime() <= ninety);
      if (hasRecent) activeFriends += 1;
    }
    const uniqueConnections = Math.floor(edges / 2);
    const avgEvents = friends.length ? +(totalEvents / friends.length).toFixed(2) : 0;
    return {
      connections: uniqueConnections,
      activeFriends,
      totalEvents,
      avgEventsPerFriend: avgEvents,
    };
  }, [state.friends]);

  // Orbits (close = 5+ in 90d OR 10+ in 365d OR 20+ total)
  const orbitBuckets = useMemo(() => {
    const now = Date.now();
    const ninety = 90 * 24 * 60 * 60 * 1000;
    const year = 365 * 24 * 60 * 60 * 1000;

    const metrics = state.friends.map((f) => {
      const evs = Array.isArray(f.events) ? f.events : [];
      let c90 = 0;
      let c365 = 0;
      for (const e of evs) {
        const t = new Date(e.date).getTime();
        if (!isNaN(t)) {
          const dt = now - t;
          if (dt <= ninety) c90 += 1;
          if (dt <= year) c365 += 1;
        }
      }
      const total = evs.length;
      return { id: f.id, c90, c365, total };
    });

    const inner = [];
    const middle = [];
    const outer = [];
    for (const m of metrics) {
      const isInner = m.c90 >= 5 || m.c365 >= 10 || m.total >= 20;
      if (isInner) inner.push(m.id);
      else if (m.c90 >= 2) middle.push(m.id);
      else outer.push(m.id);
    }
    return { inner, middle, outer };
  }, [state.friends]);

  // Event index by id across all friends (for timeline dedup)
  const eventIndex = useMemo(() => {
    const idx = new Map();
    for (const f of state.friends) {
      for (const e of f.events || []) {
        if (!idx.has(e.id)) {
          idx.set(e.id, { ...e, participants: new Set(e.participants || []) });
        } else {
          const curr = idx.get(e.id);
          for (const pid of e.participants || []) curr.participants.add(pid);
        }
      }
    }
    // Normalize participants back to array
    const merged = Array.from(idx.values()).map((e) => ({ ...e, participants: Array.from(e.participants) }));
    return merged;
  }, [state.friends]);

  // Anniversaries and reminders (next 21 days)
  const anniversaries = useMemo(() => {
    return computeUpcomingAnniversaries(state.friends, 21);
  }, [state.friends]);

  const updateFriend = useCallback((id, patch) => {
    dispatch({ type: 'UPDATE_FRIEND', payload: { id, patch } });
  }, []);

  return {
    state,
    friends: state.friends,
    selectedFriendId: state.selectedFriendId,
    selectedEventId: state.selectedEventId,
    actions: {
      addFriend,
      removeFriend,
      renameFriend,
      setBirthday,
      setFriendNotes,
      updateFriend,
      selectFriend,
      toggleRelationship,
      addEvent,
      selectEvent,
      updateEvent,
      resetData,
      loadFromPayload,
    },
    helpers: {
      getFriendById,
      getConnectionCount,
      getEventCount,
    },
    derived: {
      stats,
      orbitBuckets,
      eventIndex,
      anniversaries,
    },
  };
}
