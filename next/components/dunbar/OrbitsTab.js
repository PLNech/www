import { useEffect, useMemo, useRef, useState } from 'react';
import styles from '@/styles/dunbar.module.css';
import Tooltip from '@/components/dunbar/Tooltip';
import {
  distributeOnCircle,
  colorByActivity,
  firstWords,
  isoDate,
} from '@/lib/dunbar';

function useSize(ref) {
  const [size, setSize] = useState({ w: 800, h: 500 });
  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      setSize({ w: Math.max(300, r.width), h: Math.max(300, r.height) });
    });
    ro.observe(el);
    const r = el.getBoundingClientRect();
    setSize({ w: Math.max(300, r.width), h: Math.max(300, r.height) });
    return () => ro.disconnect();
  }, [ref]);
  return size;
}

function countRecentEvents(friend, days = 90) {
  const now = Date.now();
  const win = days * 24 * 60 * 60 * 1000;
  let c = 0;
  for (const e of friend.events || []) {
    const t = new Date(e.date).getTime();
    if (!isNaN(t) && now - t <= win) c += 1;
  }
  return c;
}

export default function OrbitsTab({ friends, buckets, openFriendDetail }) {
  const wrapRef = useRef(null);
  const { w, h } = useSize(wrapRef);

  const cx = w / 2;
  const cy = h / 2;
  const rOuter = Math.min(w, h) * 0.45;
  const rMiddle = Math.min(w, h) * 0.32;
  const rInner = Math.min(w, h) * 0.18;

  const friendMap = useMemo(() => {
    const m = new Map();
    for (const f of friends) m.set(f.id, f);
    return m;
  }, [friends]);

  // Positions for each orbit
  const posInner = useMemo(() => distributeOnCircle(buckets.inner || [], rInner, cx, cy, -Math.PI / 2), [buckets.inner, cx, cy, rInner]);
  const posMiddle = useMemo(() => distributeOnCircle(buckets.middle || [], rMiddle, cx, cy, -Math.PI / 2), [buckets.middle, cx, cy, rMiddle]);
  const posOuter = useMemo(() => distributeOnCircle(buckets.outer || [], rOuter, cx, cy, -Math.PI / 2), [buckets.outer, cx, cy, rOuter]);

  const [tooltip, setTooltip] = useState({ x: 0, y: 0, show: false, html: null });

  const handleEnter = (e, id) => {
    const f = friendMap.get(id);
    if (!f) return;
    const totalEvents = (f.events || []).length;
    const connectionCount = f.relationships ? f.relationships.size : 0;
    const recent = [...(f.events || [])]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3)
      .map((ev) => `${isoDate(ev.date)}: ${firstWords(ev.notes, 3)}…`);

    setTooltip({
      x: e.clientX,
      y: e.clientY,
      show: true,
      html: (
        <div>
          <div style={{ fontWeight: 800, marginBottom: 4 }}>{f.name}</div>
          <div>Total events: {totalEvents}</div>
          <div>Connections: {connectionCount}</div>
          {recent.length ? (
            <div style={{ marginTop: 6 }}>
              {recent.map((line, i) => (
                <div key={i} style={{ color: '#555' }}>{line}</div>
              ))}
            </div>
          ) : null}
        </div>
      ),
    });
  };

  const handleMove = (e) => {
    setTooltip((t) => ({ ...t, x: e.clientX, y: e.clientY }));
  };
  const handleLeave = () => setTooltip((t) => ({ ...t, show: false }));

  const renderNodes = (ids, posMap) => {
    return ids.map((id) => {
      const p = posMap.get(id);
      const f = friendMap.get(id);
      if (!p || !f) return null;
      const c90 = countRecentEvents(f, 90);
      const fill = colorByActivity(c90);
      return (
        <g key={id} transform={`translate(${p.x},${p.y})`} style={{ cursor: 'pointer' }}>
          <circle
            r={10}
            fill={fill}
            onMouseEnter={(e) => handleEnter(e, id)}
            onMouseMove={handleMove}
            onMouseLeave={handleLeave}
            onClick={() => openFriendDetail?.(id)}
          />
          <text className={styles.nodeLabel} textAnchor="middle" y={-14}>
            {f.name}
          </text>
        </g>
      );
    });
  };

  return (
    <div ref={wrapRef} className={styles.orbitsWrap}>
      <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Orbits visualization">
        {/* Orbits */}
        <circle cx={cx} cy={cy} r={rOuter} fill="none" stroke="#e8efe9" />
        <circle cx={cx} cy={cy} r={rMiddle} fill="none" stroke="#d7e7db" />
        <circle cx={cx} cy={cy} r={rInner} fill="none" stroke="#c9e0cf" />
        {/* Labels */}
        <text x={cx} y={cy - rInner - 8} className={styles.orbitLabel} textAnchor="middle">Close</text>
        <text x={cx} y={cy - rMiddle - 8} className={styles.orbitLabel} textAnchor="middle">Regular</text>
        <text x={cx} y={cy - rOuter - 8} className={styles.orbitLabel} textAnchor="middle">Distant</text>

        {/* Nodes */}
        {renderNodes(buckets.inner || [], posInner)}
        {renderNodes(buckets.middle || [], posMiddle)}
        {renderNodes(buckets.outer || [], posOuter)}
      </svg>

      <Tooltip x={tooltip.x} y={tooltip.y} visible={tooltip.show}>
        {tooltip.html}
      </Tooltip>
    </div>
  );
}
