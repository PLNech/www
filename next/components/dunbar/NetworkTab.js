import { useEffect, useMemo, useRef, useState } from 'react';
import styles from '@/styles/dunbar.module.css';
import {
  degreeMap,
  edgesFromFriends,
  drawLabel,
  clamp,
} from '@/lib/dunbar';

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

  // Graph data derived from friends
  const nodes = useMemo(() => friends.map(f => ({
    id: String(f.id),
    name: f.name,
  })), [friends]);

  const degreeM = useMemo(() => degreeMap(friends), [friends]);
  const links = useMemo(() => edgesFromFriends(friends).map(([a,b]) => ({ source: String(a), target: String(b) })), [friends]);

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
    ctx.lineWidth = 1 / transform.k;
    ctx.strokeStyle = '#e0e0e0';
    for (const l of links) {
      const a = getNodeState(String(l.source));
      const b = getNodeState(String(l.target));
      if (!a || !b) continue;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }

    // Draw nodes
    for (const n of nodes) {
      const s = getNodeState(n.id);
      const r = nodeRadius(n.id);
      ctx.beginPath();
      ctx.fillStyle = nodeColor(n.id);
      ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Labels: world coords, offset by node radius; keep pixel size constant with inverse scaling
    for (const n of nodes) {
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
    draggingNodeId: null,
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
    // simple hit test
    for (let i = nodes.length - 1; i >= 0; i--) {
      const n = nodes[i];
      const s = getNodeState(n.id);
      const r = nodeRadius(n.id);
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
        // start dragging node
        stateRef.current.draggingNodeId = id;
        const { x, y } = worldFromScreen(sx, sy);
        const s = getNodeState(id);
        stateRef.current.dragOffset = { x: s.x - x, y: s.y - y };
        // Nudge simulation
        if (simRef.current) {
          simRef.current.alphaTarget(0.1).restart();
        }
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
      // View mode click node -> open friend detail
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
        <span className={styles.badge}>{nodes.length} nodes · {links.length} edges</span>
      </div>
      {editMode && (
        <div className={styles.banner}>Edit mode: Drag from one node to another to toggle a connection.</div>
      )}
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
  );
}
