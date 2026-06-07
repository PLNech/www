/**
 * BpmCurve — smoothed BPM chart per set
 * Global Y-axis (GLOBAL_MIN–GLOBAL_MAX) for cross-set comparison.
 * Pure SVG, no deps.
 */

const GLOBAL_MIN = 60;
const GLOBAL_MAX = 170;
const PADDING = { top: 24, right: 16, bottom: 72, left: 44 };

function smoothPath(points) {
  if (points.length < 2) return '';
  if (points.length === 2) {
    return `M${points[0].x},${points[0].y} L${points[1].x},${points[1].y}`;
  }
  let d = `M${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    // Catmull-Rom to cubic bezier
    const tension = 0.3;
    const cp1x = p1.x + (p2.x - p0.x) * tension;
    const cp1y = p1.y + (p2.y - p0.y) * tension;
    const cp2x = p2.x - (p3.x - p1.x) * tension;
    const cp2y = p2.y - (p3.y - p1.y) * tension;
    d += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
  }
  return d;
}

export default function BpmCurve({ tracks }) {
  if (!tracks?.tracks?.length) return null;
  const bpms = tracks.tracks.map((t) => t.bpm).filter(Boolean);
  if (bpms.length < 2) return null;

  const names = tracks.tracks.filter((t) => t.bpm).map((t) => t.name);
  const W = 640;
  const H = 220;
  const plotW = W - PADDING.left - PADDING.right;
  const plotH = H - PADDING.top - PADDING.bottom;

  const yScale = (bpm) =>
    PADDING.top + plotH - ((bpm - GLOBAL_MIN) / (GLOBAL_MAX - GLOBAL_MIN)) * plotH;
  const xScale = (i) =>
    PADDING.left + (i / (bpms.length - 1)) * plotW;

  const points = bpms.map((bpm, i) => ({ x: xScale(i), y: yScale(bpm) }));
  const curvePath = smoothPath(points);

  // Gradient fill under curve
  const fillPath = `${curvePath} L${points[points.length - 1].x},${PADDING.top + plotH} L${points[0].x},${PADDING.top + plotH} Z`;

  // Y-axis ticks
  const yTicks = [80, 100, 120, 140, 160].filter(
    (v) => v >= GLOBAL_MIN && v <= GLOBAL_MAX
  );

  return (
    <div className="mb-12">
      <div className="flex items-center gap-4 mb-4">
        <h2 className="font-display text-lg font-bold text-white">
          <span className="text-[var(--neon-high)]">~</span> BPM
        </h2>
        <div className="h-px bg-[var(--neon-high)]/20 flex-grow" />
        {tracks.bpmRange && (
          <span className="text-[11px] font-mono text-[var(--text-muted)]">
            {Math.min(...bpms)}–{Math.max(...bpms)}
          </span>
        )}
      </div>
      <div className="bg-black/30 rounded-xl border border-white/[0.06] p-4 overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          style={{ minWidth: bpms.length > 10 ? '600px' : 'auto' }}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="bpm-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(217,0,255,0.25)" />
              <stop offset="100%" stopColor="rgba(217,0,255,0)" />
            </linearGradient>
            <filter id="bpm-glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Grid lines */}
          {yTicks.map((tick) => (
            <g key={tick}>
              <line
                x1={PADDING.left}
                y1={yScale(tick)}
                x2={W - PADDING.right}
                y2={yScale(tick)}
                stroke="rgba(255,255,255,0.06)"
                strokeDasharray="4 4"
              />
              <text
                x={PADDING.left - 8}
                y={yScale(tick) + 3}
                textAnchor="end"
                fill="rgba(255,255,255,0.25)"
                fontSize="9"
                fontFamily="monospace"
              >
                {tick}
              </text>
            </g>
          ))}

          {/* Fill under curve */}
          <path d={fillPath} fill="url(#bpm-fill)" />

          {/* Curve */}
          <path
            d={curvePath}
            fill="none"
            stroke="rgba(217,0,255,0.8)"
            strokeWidth="2"
            strokeLinecap="round"
            filter="url(#bpm-glow)"
          />

          {/* Data points */}
          {points.map((p, i) => (
            <g key={i}>
              <circle
                cx={p.x}
                cy={p.y}
                r="3.5"
                fill="var(--surface, #0a0a0a)"
                stroke="rgba(217,0,255,0.9)"
                strokeWidth="1.5"
              />
              {/* BPM value on hover area */}
              <title>{`${names[i]}: ${bpms[i]} BPM`}</title>
              {/* Track name label (rotated) */}
              <text
                x={p.x}
                y={PADDING.top + plotH + 12}
                textAnchor="end"
                fill="rgba(255,255,255,0.3)"
                fontSize="8"
                fontFamily="monospace"
                transform={`rotate(-45, ${p.x}, ${PADDING.top + plotH + 12})`}
              >
                {names[i]?.length > 14 ? names[i].slice(0, 13) + '…' : names[i]}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
