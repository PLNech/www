import { useEffect, useMemo, useRef, useState } from 'react';
import styles from '@/styles/dunbar.module.css';
import {
  degreeMap,
  edgesFromFriends,
  drawLabel,
  clamp,
} from '@/lib/dunbar';
import { extractLocations } from '@/lib/dunbar-nlp';

// We only rely on d3-force for physics. Zoom/pan/drag implemented manually to avoid extra deps.
export default function NetworkTab({ friends, toggleRel, openFriendDetail }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const simRef = useRef(null);
  const rafRef = useRef(0);

  // Canvas sizing
  const [size, setSize] = useState({ w: 800, h: 500 });
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      setSize({ w: Math.max(300, r.width), h: Math.max(300, r.height) });
    });
    ro.observe(el);
    const r = el.getBoundingClientRect();
    setSize({ w: Math.max(300, r.width), h: Math.max(300, r.height) });
    return () => ro.disconnect();
  }, []);

  // Transform for pan/zoom
  const [transform, setTransform] = useState({ k: 1, x: 0, y: 0 });
  const worldFromScreen = (sx, sy) => ({
    x: (sx - transform.x) / transform.k,
    y: (sy - transform.y) / transform.k,
  });

  // Location filter (offline gazetteer)
  const [locFilter, setLocFilter] = useState('');

  // Selection + UI state
  const [selectedId, setSelectedId] = useState(null);
  const [focusNeighbors, setFocusNeighbors] = useState(false);
  // labelDensity: 'none' | 'focus' | 'all'
  const [labelDensity, setLabelDensity] = useState('focus');
  const [searchText, setSearchText] = useState('');
  const searchInputRef = useRef(null);
  const locByFriend = useMemo(() => {
    const m = new Map();
    for (const f of friends) {
      let text = '';
      text += ' ' + (f.notes || '');
      for (const ev of f.events || []) {
        text += ' ' + (ev.title || '') + ' ' + (ev.notes || '') + ' ' + (ev.location || '');
      }
      const locs = extractLocations(text).map((l) => l.name);
      m.set(f.id, Array.from(new Set(locs)));
    }
    return m;
  }, [friends]);

  const locationOptions = useMemo(() => {
    const counts = new Map();
    for (const [, locs] of locByFriend.entries()) {
      for (const name of locs) counts.set(name, (counts.get(name) || 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 50)
      .map(([name]) => name);
  }, [locByFriend]);

  const filteredFriends = useMemo(() => {
    if (!locFilter) return friends;
    return friends.filter((f) => (locByFriend.get(f.id) || []).includes(locFilter));
  }, [friends, locFilter, locByFriend]);

  // Search (by name) results
  const searchResults = useMemo(() => {
    const q = (searchText || '').toLowerCase().trim();
    if (!q) return [];
    return friends
      .filter((f) => (f.name || '').toLowerCase().includes(q))
      .slice(0, 10);
  }, [friends, searchText]);

  // Neighbor set for selection
  const neighborSet = useMemo(() => {
    if (!selectedId) return new Set();
    const set = new Set();
    for (const [a, b] of edgesFromFriends(filteredFriends)) {
      if (String(a) === String(selectedId)) set.add(String(b));
      if (String(b) === String(selectedId)) set.add(String(a));
    }
    return set;
  }, [filteredFriends, selectedId]);

  // Graph data derived from friends
  const nodes = useMemo(() => filteredFriends.map(f => ({
    id: String(f.id),
    name: f.name,
  })), [filteredFriends]);

  const degreeM = useMemo(() => degreeMap(filteredFriends), [filteredFriends]);
  const links = useMemo(
    () => edgesFromFriends(filteredFriends).map(([a,b]) => ({ source: String(a), target: String(b) })),
    [filteredFriends]
  );

  // Node state (positions) persisted across renders
  const nodeStateRef = useRef(new Map()); // id -> {x,y,vx,vy}
  const getNodeState = (id) => {
    let s = nodeStateRef.current.get(id);
    if (!s) {
      // seed around center
      s = {
        x: (Math.random() - 0.5) * 200,
        y: (Math.random() - 0.5) * 200,
        vx: 0, vy: 0,
      };
      nodeStateRef.current.set(id, s);
    }
    return s;
  };

  // Simulation setup/refresh
  const physicsOn = true;
  useEffect(() => {
    let stopped = false;
    let sim;
    async function setup() {
      const d3 = await import('d3-force');
      const d3force = d3; // module namespace
      // Build d3 nodes referencing our state map
      const d3Nodes = nodes.map(n => {
        const s = getNodeState(n.id);
        return { id: n.id, x: s.x, y: s.y, vx: s.vx, vy: s.vy };
      });
      const d3Links = links.map(l => ({ source: l.source, target: l.target }));

      sim = d3force.forceSimulation(d3Nodes)
        .force('charge', d3force.forceManyBody().strength(-80))
        .force('link', d3force.forceLink(d3Links).id(d => d.id).distance(80).strength(0.2))
        .force('center', d3force.forceCenter(0, 0))
        .force('collide', d3force.forceCollide(18));

      sim.alpha(0.8).alphaTarget(0.03).restart();

      sim.on('tick', () => {
        if (stopped) return;
        // Persist positions back to our state map
        for (const n of d3Nodes) {
          const s = getNodeState(n.id);
          s.x = n.x;
          s.y = n.y;
          s.vx = n.vx || 0;
          s.vy = n.vy || 0;
        }
        requestDraw();
      });

      simRef.current = sim;
    }
    setup();
    return () => {
      stopped = true;
      if (sim) sim.stop();
      simRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, links]); // rebuild when graph updates

  // Drawing
  const requestDraw = () => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0;
      draw();
    });
  };

  const nodeRadius = (id) => {
    const deg = degreeM.get(id) || 0;
    return clamp(6 + deg * 0.8, 6, 18);
    // color by degree buckets as specified
  };
  const nodeColor = (id) => {
    const deg = degreeM.get(id) || 0;
    if (deg >= 10) return '#2c5530'; // dark green
    if (deg >= 5) return '#5a9960';  // medium green
    if (deg >= 1) return '#a0c0a0';  // light green
    return '#c0c0c0';                // gray for 0
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { w, h } = size;

    // DPR scaling
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    ctx.save();
    ctx.scale(dpr, dpr);

    // clear
    ctx.clearRect(0, 0, w, h);

    // apply transform (pan/zoom)
    ctx.translate(transform.x, transform.y);
    ctx.scale(transform.k, transform.k);

    // Draw links
    for (const l of links) {
      const a = getNodeState(String(l.source));
      const b = getNodeState(String(l.target));
      if (!a || !b) continue;
      const isFocus =
        selectedId &&
        (String(l.source) === String(selectedId) || String(l.target) === String(selectedId));
      ctx.beginPath();
      ctx.lineWidth = (isFocus ? 2 : 1) / transform.k;
      ctx.strokeStyle = isFocus
        ? '#5a9960'
        : focusNeighbors && selectedId
        ? 'rgba(224,224,224,0.35)'
        : '#e0e0e0';
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }

    // Draw nodes
    for (const n of nodes) {
      const s = getNodeState(n.id);
      const r = nodeRadius(n.id);
      const isSel = selectedId && String(n.id) === String(selectedId);
      const isNbr = selectedId && neighborSet.has(String(n.id));
      ctx.beginPath();
      if (isSel) {
        ctx.fillStyle = '#2c5530';
      } else if (isNbr) {
        ctx.fillStyle = '#5a9960';
      } else {
        ctx.fillStyle =
          focusNeighbors && selectedId ? 'rgba(160,192,160,0.4)' : nodeColor(n.id);
      }
      ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Labels: based on density
    for (const n of nodes) {
      const showLabel =
        labelDensity === 'all' ||
        (labelDensity === 'focus' &&
          (String(n.id) === String(selectedId) || neighborSet.has(String(n.id))));
      if (!showLabel) continue;
      const s = getNodeState(n.id);
      const r = nodeRadius(n.id);
      const fontPx = 12 / transform.k;
      const yOff = (r + 6) / transform.k; // a bit above the node
      drawLabel(ctx, n.name, s.x, s.y - yOff, '#333', fontPx);
    }

    ctx.restore();
  };

  useEffect(() => { requestDraw(); }, [size, transform, nodes, links, degreeM]); // redraw on deps

  // Interaction
  const stateRef = useRef({
    pendingDragId: null,      // node id awaiting threshold before dragging
    draggingNodeId: null,     // active drag
    downAt: { x: 0, y: 0 },   // screen coords where mouse down occurred
    dragOffset: { x: 0, y: 0 },
    panning: false,
    panStart: { x: 0, y: 0 },
    transformStart: { x: 0, y: 0 },
    linkDraftFrom: null, // id when in edit mode and dragging a link
    lastMouse: { x: 0, y: 0 },
  });

  const [editMode, setEditMode] = useState(false);

  const pickNodeAt = (sx, sy) => {
    const { x, y } = worldFromScreen(sx, sy);
    // simple hit test with expanded radius
    for (let i = nodes.length - 1; i >= 0; i--) {
      const n = nodes[i];
      const s = getNodeState(n.id);
      const r = nodeRadius(n.id) + 4;
      const dx = x - s.x;
      const dy = y - s.y;
      if (dx * dx + dy * dy <= r * r) return n.id;
    }
    return null;
  };

  const onMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    const id = pickNodeAt(sx, sy);
    stateRef.current.lastMouse = { x: sx, y: sy };

    if (id) {
      if (editMode) {
        // start link draft
        stateRef.current.linkDraftFrom = id;
      } else {
        // prepare to drag node (threshold)
        stateRef.current.pendingDragId = id;
        stateRef.current.downAt = { x: sx, y: sy };
        const { x, y } = worldFromScreen(sx, sy);
        const s = getNodeState(id);
        stateRef.current.dragOffset = { x: s.x - x, y: s.y - y };
        // Nudge simulation once dragging starts
      }
    } else {
      // start panning
      stateRef.current.panning = true;
      stateRef.current.panStart = { x: sx, y: sy };
      stateRef.current.transformStart = { x: transform.x, y: transform.y };
    }
  };

  const onMouseMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    stateRef.current.lastMouse = { x: sx, y: sy };

    // activate dragging if threshold exceeded
    if (stateRef.current.pendingDragId && !stateRef.current.draggingNodeId) {
      const dx = sx - stateRef.current.downAt.x;
      const dy = sy - stateRef.current.downAt.y;
      if (dx * dx + dy * dy > 16) {
        stateRef.current.draggingNodeId = stateRef.current.pendingDragId;
        stateRef.current.pendingDragId = null;
        if (simRef.current) simRef.current.alphaTarget(0.1).restart();
      }
    }

    if (stateRef.current.draggingNodeId) {
      const id = stateRef.current.draggingNodeId;
      const { x, y } = worldFromScreen(sx, sy);
      const s = getNodeState(id);
      s.x = x + stateRef.current.dragOffset.x;
      s.y = y + stateRef.current.dragOffset.y;
      // reflect back to simulation node if exists
      if (simRef.current) {
        const d3node = simRef.current.nodes().find(n => n.id === id);
        if (d3node) {
          d3node.fx = s.x;
          d3node.fy = s.y;
        }
      }
      requestDraw();
      return;
    }

    if (stateRef.current.panning) {
      const dx = sx - stateRef.current.panStart.x;
      const dy = sy - stateRef.current.panStart.y;
      setTransform(t => ({ ...t, x: stateRef.current.transformStart.x + dx, y: stateRef.current.transformStart.y + dy }));
      return;
    }

    // if link draft, just redraw (we draw draft in overlay)
    if (stateRef.current.linkDraftFrom) {
      requestDraw();
    }
  };

  const onMouseUp = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    const overId = pickNodeAt(sx, sy);

    if (stateRef.current.draggingNodeId) {
      const id = stateRef.current.draggingNodeId;
      stateRef.current.draggingNodeId = null;
      stateRef.current.pendingDragId = null;
      // release fixed position so sim can settle (unless physics off)
      if (simRef.current) {
        const d3node = simRef.current.nodes().find(n => n.id === id);
        if (d3node) {
          d3node.fx = null;
          d3node.fy = null;
        }
      }
    } else if (stateRef.current.panning) {
      stateRef.current.panning = false;
    } else if (stateRef.current.linkDraftFrom) {
      const from = stateRef.current.linkDraftFrom;
      stateRef.current.linkDraftFrom = null;
      if (overId && overId !== from) {
        // Toggle bidirectional link
        toggleRel?.(from, overId);
      }
    } else if (!editMode && overId) {
      // Click node: select and center; optionally open detail on double-click later
      setSelectedId(overId);
      centerOnNode(overId);
      // keep existing behavior: open friend detail
      openFriendDetail?.(overId);
    }
    requestDraw();
  };

  const zoomAt = (factor, sx, sy) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    const cx = rect ? rect.width / 2 : 0;
    const cy = rect ? rect.height / 2 : 0;
    const px = sx ?? cx;
    const py = sy ?? cy;
    setTransform((t) => {
      const newK = clamp(t.k * factor, 0.2, 4);
      const wx0 = (px - t.x) / t.k;
      const wy0 = (py - t.y) / t.k;
      const x = px - wx0 * newK;
      const y = py - wy0 * newK;
      return { k: newK, x, y };
    });
  };

  const panBy = (dx, dy) => {
    setTransform(t => ({ ...t, x: t.x + dx, y: t.y + dy }));
  };

  const onWheel = (e) => {
    e.preventDefault();
    const rect = canvasRef.current.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    const factor = Math.exp(-e.deltaY * 0.0015);
    zoomAt(factor, sx, sy);
  };

  // Overlay draw (draft link)
  useEffect(() => {
    // draw overlay line for link draft
    if (!stateRef.current.linkDraftFrom) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { w, h } = size;
    const dpr = window.devicePixelRatio || 1;

    ctx.save();
    ctx.scale(dpr, dpr);
    // simply call main draw then overlay the draft line
    draw();

    const fromId = stateRef.current.linkDraftFrom;
    const s = getNodeState(fromId);
    const { x: sx, y: sy } = stateRef.current.lastMouse;
    const p = worldFromScreen(sx, sy);

    ctx.translate(transform.x, transform.y);
    ctx.scale(transform.k, transform.k);
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(p.x, p.y);
    ctx.strokeStyle = '#5a9960';
    ctx.lineWidth = 2 / transform.k;
    ctx.setLineDash([6 / transform.k, 4 / transform.k]);
    ctx.stroke();
    ctx.restore();
  });

  // Keyboard navigation scoped to container
  const onKeyDown = (e) => {
    const PAN = 40;
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
      e.preventDefault();
      searchInputRef.current?.focus();
      return;
    }
    if (e.key.toLowerCase() === 'f') {
      // center on selection
      if (selectedId) centerOnNode(selectedId);
      return;
    }
    if (e.key === 'Escape') {
      setSelectedId(null);
      return;
    }
    if (e.key === 'ArrowLeft') setTransform(t => ({ ...t, x: t.x + PAN }));
    else if (e.key === 'ArrowRight') setTransform(t => ({ ...t, x: t.x - PAN }));
    else if (e.key === 'ArrowUp') setTransform(t => ({ ...t, y: t.y + PAN }));
    else if (e.key === 'ArrowDown') setTransform(t => ({ ...t, y: t.y - PAN }));
    else if (e.key === '+' || e.key === '=') zoomAt(1.2);
    else if (e.key === '-' || e.key === '_') zoomAt(1 / 1.2);
    else if (e.key === '0') setTransform({ k: 1, x: 0, y: 0 });
    else if (e.key.toLowerCase() === 'e') setEditMode(v => !v);
  };

  // Focus container on mount so arrows/+/− work immediately
  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  // Center viewport on a node
  const centerOnNode = (id) => {
    const s = getNodeState(String(id));
    if (!s) return;
    const rect = containerRef.current?.getBoundingClientRect();
    const w = rect ? rect.width : size.w;
    const h = rect ? rect.height : size.h;
    // Target center in screen coords
    const cx = w / 2;
    const cy = h / 2;
    setTransform((t) => {
      const x = cx - s.x * t.k;
      const y = cy - s.y * t.k;
      return { ...t, x, y };
    });
    requestDraw();
  };

  return (
    <div>
      <div className={styles.graphToolbar}>
        <button
          className={styles.btnSecondary}
          onClick={() => setEditMode(v => !v)}
          title="Toggle edit mode to create/remove connections"
        >
          Mode: {editMode ? 'Edit' : 'View'}
        </button>
        <select
          className={styles.select}
          value={locFilter}
          onChange={(e) => setLocFilter(e.target.value)}
          title="Filter by location (offline gazetteer)"
        >
          <option value="">All locations</option>
          {locationOptions.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
        <button
          className={styles.btnSecondary}
          onClick={() => selectedId && centerOnNode(selectedId)}
          disabled={!selectedId}
          title="Center on selection"
        >
          Center
        </button>
        <button
          className={styles.btnSecondary}
          onClick={() => setFocusNeighbors(v => !v)}
          title="Focus selected + neighbors"
        >
          Focus: {focusNeighbors ? 'ON' : 'OFF'}
        </button>
        <select
          className={styles.select}
          value={labelDensity}
          onChange={(e) => setLabelDensity(e.target.value)}
          title="Label density"
        >
          <option value="none">Labels: None</option>
          <option value="focus">Labels: Focus</option>
          <option value="all">Labels: All</option>
        </select>
        <span className={styles.badge}>{nodes.length} nodes · {links.length} edges</span>
      </div>
      {editMode && (
        <div className={styles.banner}>Edit mode: Drag from one node to another to toggle a connection.</div>
      )}
      <div className={styles.twoCol} style={{ gap: 12 }}>
        {/* Sidebar */}
        <div className={styles.card}>
          <div className={styles.cardHeader}><span>Find</span></div>
          <div className={styles.row} style={{ marginBottom: 8 }}>
            <input
              ref={searchInputRef}
              className={styles.input}
              placeholder="Search by name (Ctrl/Cmd+F)"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
          <div className={styles.listScroll} style={{ maxHeight: '30vh' }}>
            {searchResults.map((f) => (
              <div
                key={f.id}
                className={styles.listItem}
                onClick={() => {
                  setSelectedId(String(f.id));
                  centerOnNode(String(f.id));
                }}
                style={
                  String(selectedId) === String(f.id) ? { background: '#f5fbf7' } : undefined
                }
              >
                <div className={styles.itemTitle}>{f.name}</div>
              </div>
            ))}
            {searchText && searchResults.length === 0 && (
              <div style={{ padding: 8, color: '#666' }}>No matches.</div>
            )}
          </div>

          {selectedId ? (
            <div style={{ marginTop: 8 }}>
              <div className={styles.cardHeader}><span>Selection</span></div>
              <div className={styles.row} style={{ flexWrap: 'wrap' }}>
                <button
                  className={styles.btnSecondary}
                  onClick={() => centerOnNode(selectedId)}
                  title="Center on selection"
                >
                  Center
                </button>
                <button
                  className={styles.btnSecondary}
                  onClick={() => setSelectedId(null)}
                  title="Clear selection"
                >
                  Clear
                </button>
                <button
                  className={styles.btnSecondary}
                  onClick={() => openFriendDetail?.(selectedId)}
                  title="Open friend detail"
                >
                  Open
                </button>
              </div>
              <div className={styles.itemMeta} style={{ marginTop: 6 }}>
                Neighbors: {neighborSet.size}
              </div>
            </div>
          ) : null}
        </div>

        {/* Canvas */}
        <div
          ref={containerRef}
          className={styles.canvasWrap}
          tabIndex={0}
          role="application"
          aria-label="Network graph"
          onKeyDown={onKeyDown}
          style={{ outline: 'none' }}
        >
          <canvas
            ref={canvasRef}
            width={size.w}
            height={size.h}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onWheel={onWheel}
          />
          <div className={styles.floatingControls}>
            <button className={styles.ctrlBtn} onClick={() => panBy(-40, 0)} aria-label="Pan left">←</button>
            <button className={styles.ctrlBtn} onClick={() => panBy(0, -40)} aria-label="Pan up">↑</button>
            <button className={styles.ctrlBtn} onClick={() => panBy(40, 0)} aria-label="Pan right">→</button>
            <button className={styles.ctrlBtn} onClick={() => zoomAt(1 / 1.2)} aria-label="Zoom out">−</button>
            <button className={styles.ctrlBtn} onClick={() => setTransform({ k: 1, x: 0, y: 0 })} aria-label="Reset">⟲</button>
            <button className={styles.ctrlBtn} onClick={() => zoomAt(1.2)} aria-label="Zoom in">＋</button>
            <button className={`${styles.ctrlBtn} ${styles.ctrlWide}`} onClick={() => setEditMode(v => !v)} aria-label="Toggle edit">
              {editMode ? 'Edit:ON' : 'Edit:OFF'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
