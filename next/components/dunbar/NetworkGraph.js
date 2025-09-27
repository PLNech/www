import { useEffect, useMemo, useRef, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { degreeMap, edgesFromFriends, clamp } from '@/lib/dunbar';
import styles from '@/styles/dunbar.module.css';

/**
 * NetworkGraph — simplified, high-UX graph using react-force-graph-2d
 * - Pan: drag background
 * - Zoom: wheel
 * - Drag node to reposition
 * - Hover: native tooltip shows name + degree
 * - Click: open profile via onOpenFriend
 * - Toolbar actions exposed via imperative methods: resetView(), centerOn(id)
 */
export default function NetworkGraph({ friends, onOpenFriend }) {
  const fgRef = useRef(null);
  const [selectedId, setSelectedId] = useState(null);

  const data = useMemo(() => {
    const baseNodes = (friends || []).map((f) => ({ id: String(f.id), name: f.name }));
    const baseLinks = edgesFromFriends(friends).map(([a, b]) => ({ source: String(a), target: String(b) }));
    // Add center node "YOU" connected to all
    const YOU_ID = '__YOU__';
    const youNode = { id: YOU_ID, name: 'YOU' };
    const youLinks = baseNodes.map((n) => ({ source: YOU_ID, target: n.id }));
    const nodes = [youNode, ...baseNodes];
    const links = [...youLinks, ...baseLinks];
    const deg = degreeMap(friends);
    return { nodes, links, deg, YOU_ID };
  }, [friends]);

  // Node sizing/coloring
  const nodeRadius = (id) => {
    if (id === data.YOU_ID) return 20;
    const deg = data.deg.get(id) || 0;
    return clamp(6 + deg * 0.8, 6, 18);
  };
  const nodeColor = (id) => {
    if (id === data.YOU_ID) return '#1f2937'; // slate for YOU
    const deg = data.deg.get(id) || 0;
    if (deg >= 10) return '#2c5530'; // dark green
    if (deg >= 5) return '#5a9960'; // medium green
    if (deg >= 1) return '#a0c0a0'; // light green
    return '#c0c0c0'; // gray
  };

  // Helpers exposed to parent via ref? Parent can call through fgRef directly.
  const resetView = () => {
    // Zoom to fit nicely
    try {
      fgRef.current?.zoomToFit(400, 40, (node) => true);
    } catch {}
  };
  useEffect(() => {
    // Initial settle & fit
    const t = setTimeout(resetView, 500);
    return () => clearTimeout(t);
  }, [friends]);

  const selectedNodeRef = useRef(null);

  const centerOn = (id) => {
    // Prefer the last known selected node object (has x/y from the engine)
    const n = selectedNodeRef.current && String(selectedNodeRef.current.id) === String(id)
      ? selectedNodeRef.current
      : null;

    // Fallback: try to access nodes from the instance (some builds expose graphData as a property)
    const nodesProp = fgRef.current?.graphData?.nodes || fgRef.current?.props?.graphData?.nodes || [];
    const node = n || nodesProp.find((nn) => String(nn.id) === String(id)) || (data.nodes || []).find((nn) => String(nn.id) === String(id));

    if (!node) return;
    try {
      const x = Number(node.x) || 0;
      const y = Number(node.y) || 0;
      fgRef.current?.centerAt(x, y, 400);
      fgRef.current?.zoom(1, 400);
    } catch {}
  };

  // Expose actions globally on the instance (optional)
  // Consumers can still call via fgRef
  // eslint-disable-next-line no-unused-vars
  const actions = { resetView, centerOn };

  // Compute distance-2/3 “via” info when a node is selected (simple BFS)
  const viaInfo = useMemo(() => {
    if (!selectedId) return null;
    if (selectedId === data.YOU_ID) return null; // skip banner for YOU
    const adj = new Map();
    for (const n of data.nodes) adj.set(n.id, new Set());
    for (const l of data.links) {
      const a = String(l.source?.id ?? l.source);
      const b = String(l.target?.id ?? l.target);
      adj.get(a)?.add(b);
      adj.get(b)?.add(a);
    }
    const start = String(selectedId);
    const dist = new Map([[start, 0]]);
    const via = new Map(); // nodeId -> first-hop id from start
    const q = [start];
    while (q.length) {
      const cur = q.shift();
      const d = dist.get(cur);
      if (d >= 3) continue; // stop at distance 3
      for (const nb of adj.get(cur) || []) {
        if (!dist.has(nb)) {
          dist.set(nb, d + 1);
          // first-hop determination
          via.set(nb, d === 0 ? nb : via.get(cur));
          q.push(nb);
        }
      }
    }
    const depth2 = Array.from(dist.entries()).filter(([id, d]) => d === 2).map(([id]) => id);
    const depth3 = Array.from(dist.entries()).filter(([id, d]) => d === 3).map(([id]) => id);
    // Collect representative “via” names
    const idToName = new Map(data.nodes.map(n => [String(n.id), n.name]));
    const via2 = Array.from(new Set(depth2.map((id) => idToName.get(via.get(id)) || via.get(id)).filter(Boolean)));
    const via3 = Array.from(new Set(depth3.map((id) => idToName.get(via.get(id)) || via.get(id)).filter(Boolean)));
    return {
      deg2: depth2.length,
      deg3: depth3.length,
      via2,
      via3,
      selectedName: idToName.get(start) || start,
    };
  }, [selectedId, data.nodes, data.links]);

  const nodeLabel = (n) => {
    const deg = data.deg.get(String(n.id)) || 0;
    return `${n.name} — deg ${deg}`;
  };

  // Always-visible initials for better readability at any zoom
  const getInitials = (name = '') => {
    const parts = String(name).trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '';
    if (parts.length === 1) {
      const p = parts[0];
      // take first 2 letters if single token
      return p.slice(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className={styles.card} style={{ padding: 0, position: 'relative' }}>
      <div className={styles.graphToolbar} style={{ padding: 8 }}>
        <button className={styles.btnSecondary} onClick={() => { setSelectedId(null); resetView(); }}>
          Reset
        </button>
        <button
          className={styles.btnSecondary}
          onClick={() => selectedId && centerOn(selectedId)}
          disabled={!selectedId}
          title="Center on selection"
        >
          Center
        </button>
        {selectedId ? <span className={styles.badge}>Selected: {data.nodes.find(n => n.id === selectedId)?.name}</span> : null}
      </div>
      {/* Distance banner */}
      {viaInfo ? (
        <div className={styles.banner} style={{ margin: '0 8px 8px' }}>
          <span style={{ fontWeight: 700 }}>{viaInfo.selectedName}</span>{' '}
          · Deg 2: {viaInfo.deg2} {viaInfo.via2.length ? `(via ${viaInfo.via2.slice(0, 3).join(', ')}${viaInfo.via2.length > 3 ? '…' : ''})` : ''}{' '}
          · Deg 3: {viaInfo.deg3} {viaInfo.via3.length ? `(via ${viaInfo.via3.slice(0, 3).join(', ')}${viaInfo.via3.length > 3 ? '…' : ''})` : ''}
        </div>
      ) : null}

      <ForceGraph2D
        ref={fgRef}
        graphData={{ nodes: data.nodes, links: data.links }}
        nodeRelSize={4}
        linkColor={(link) => {
          // Dim YOU-links slightly to keep focus on real connections
          const a = String(link.source?.id ?? link.source);
          const b = String(link.target?.id ?? link.target);
          const isYouLink = a === data.YOU_ID || b === data.YOU_ID;
          return isYouLink ? 'rgba(200,200,200,0.7)' : '#e0e0e0';
        }}
        linkWidth={(link) => {
          if (!selectedId) return 1;
          const a = String(link.source?.id ?? link.source);
          const b = String(link.target?.id ?? link.target);
          return (a === selectedId || b === selectedId) ? 2 : 1;
        }}
        cooldownTicks={200}
        onEngineStop={() => {
          // After layout, slightly zoom to fit
          resetView();
        }}
        onNodeClick={(node) => {
          const id = String(node.id);
          setSelectedId(id);
          selectedNodeRef.current = node;
          centerOn(id);
          if (id !== data.YOU_ID) onOpenFriend?.(id);
        }}
        onNodeHover={(node) => {
          if (node) {
            setSelectedId(String(node.id));
            selectedNodeRef.current = node;
          }
        }}
        nodeLabel={nodeLabel}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const id = String(node.id);
          const r = nodeRadius(id);
          const isSel = selectedId && selectedId === id;

          // Node circle
          ctx.beginPath();
          ctx.fillStyle = isSel && id !== data.YOU_ID ? '#2c5530' : nodeColor(id);
          ctx.arc(node.x || 0, node.y || 0, r, 0, Math.PI * 2);
          ctx.fill();

          // Full label (scale-aware)
          const fontSize = Math.max(6, 12 / Math.sqrt(globalScale));
          if (isSel || globalScale < 2 || id === data.YOU_ID) {
            ctx.font = `${fontSize}px system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillStyle = id === data.YOU_ID ? '#111' : '#333';
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = Math.max(2, fontSize / 3);
            const text = node.name || '';
            ctx.strokeText(text, node.x || 0, (node.y || 0) - (r + 4));
            ctx.fillText(text, node.x || 0, (node.y || 0) - (r + 4));
          }

          // Initials (always visible on top of the node)
          const initials = id === data.YOU_ID ? 'YOU' : getInitials(node.name || '');
          if (initials) {
            const initFont = Math.max(7, r); // scale with node radius
            ctx.font = `bold ${initFont}px system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.strokeStyle = 'rgba(255,255,255,0.95)';
            ctx.lineWidth = Math.max(2, initFont / 3);
            ctx.strokeText(initials, node.x || 0, node.y || 0);
            ctx.fillStyle = '#111';
            ctx.fillText(initials, node.x || 0, node.y || 0);
          }
        }}
      />
    </div>
  );
}
