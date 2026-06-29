import { useEffect, useRef } from 'react';

/**
 * EntanglementField — the cosmicfest_v2.67Hz signature canvas.
 *
 * Three layers, one idea (intrication):
 *  1. a drifting starfield (the cosmos)
 *  2. entangled particle PAIRS — each pair is two points mirrored across the field's
 *     center, brightening in perfect sync no matter the distance between them (the link)
 *  3. a 67Hz interference waveform along the lower third (cyan + magenta crossing into white)
 *
 * Decorative only: sits behind content, never gates it. Honours prefers-reduced-motion by
 * painting a single static frame (no rAF loop). Capped DPR + area-scaled counts for phones.
 */
const CYAN = 'oklch(0.84 0.14 200)';
const MAGENTA = 'oklch(0.72 0.21 350)';
const WHITE = 'oklch(0.99 0 0)';

export default function EntanglementField({ className }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let W = 0;
    let H = 0;
    let dpr = 1;
    let stars = [];
    let pairs = [];
    let raf = null;
    let running = true;

    const rand = (a, b) => a + Math.random() * (b - a);

    function build() {
      const rect = canvas.getBoundingClientRect();
      W = Math.max(1, rect.width);
      H = Math.max(1, rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const area = W * H;
      const starCount = Math.min(Math.round(area / 7000), 240);
      const pairCount = W < 640 ? 5 : W < 1100 ? 8 : 11;

      stars = Array.from({ length: starCount }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: rand(0.3, 1.4),
        base: rand(0.15, 0.7),
        tw: rand(0.6, 2.2),
        ph: rand(0, Math.PI * 2),
      }));

      // Each pair lives in the top-left quadrant; its twin is the mirror through center.
      pairs = Array.from({ length: pairCount }, () => ({
        x: rand(0.08, 0.46) * W,
        y: rand(0.06, 0.62) * H,
        ox: rand(8, 26),
        oy: rand(8, 26),
        speed: rand(0.18, 0.5),
        ph: rand(0, Math.PI * 2),
        link: rand(0.5, 1.2), // sync frequency of the shared brightness pulse
      }));
    }

    function drawWave(t) {
      // 67Hz rendered as two interfering travelling waves; where they cross, white.
      const yBase = H * 0.74;
      const amp = Math.min(H * 0.06, 46);
      const step = Math.max(4, Math.round(W / 220));

      const waves = [
        { color: CYAN, k: 0.018, w: 1.0, off: 0, a: 0.5 },
        { color: MAGENTA, k: 0.013, w: -1.35, off: Math.PI / 3, a: 0.5 },
      ];

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineWidth = 1.6;
      for (const wv of waves) {
        ctx.beginPath();
        for (let x = 0; x <= W; x += step) {
          const y =
            yBase +
            Math.sin(x * wv.k + t * wv.w + wv.off) * amp +
            Math.sin(x * wv.k * 2.7 + t * wv.w * 0.6) * amp * 0.28;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.globalAlpha = wv.a;
        ctx.strokeStyle = wv.color;
        ctx.stroke();
      }
      ctx.restore();
    }

    function frame(now) {
      if (!running) return;
      const t = now / 1000;
      ctx.clearRect(0, 0, W, H);

      // 1 — starfield
      for (const s of stars) {
        const a = reduce ? s.base : s.base * (0.55 + 0.45 * Math.sin(t * s.tw + s.ph));
        ctx.globalAlpha = a;
        ctx.fillStyle = WHITE;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // 2 — entangled pairs
      const cx = W / 2;
      const cy = H / 2;
      for (const p of pairs) {
        const wob = reduce ? 0 : t * p.speed;
        const ax = p.x + Math.cos(wob + p.ph) * p.ox;
        const ay = p.y + Math.sin(wob * 1.3 + p.ph) * p.oy;
        // twin: mirror through the field's center (instant correlation across distance)
        const bx = 2 * cx - ax;
        const by = 2 * cy - ay;

        // shared brightness pulse — both ends flare in the same instant
        const pulse = reduce ? 0.6 : 0.45 + 0.55 * Math.pow((Math.sin(t * p.link + p.ph) + 1) / 2, 2);

        // the link
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const grad = ctx.createLinearGradient(ax, ay, bx, by);
        grad.addColorStop(0, CYAN);
        grad.addColorStop(0.5, WHITE);
        grad.addColorStop(1, MAGENTA);
        ctx.strokeStyle = grad;
        ctx.globalAlpha = 0.06 + 0.1 * pulse;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.stroke();

        // the two states
        ctx.globalAlpha = 0.55 + 0.45 * pulse;
        const r = 2 + 1.6 * pulse;
        ctx.fillStyle = CYAN;
        ctx.beginPath();
        ctx.arc(ax, ay, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = MAGENTA;
        ctx.beginPath();
        ctx.arc(bx, by, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      ctx.globalAlpha = 1;

      // 3 — waveform
      drawWave(reduce ? 0 : t);

      if (!reduce) raf = requestAnimationFrame(frame);
    }

    let resizeTimer = null;
    function onResize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        build();
        if (reduce) frame(0);
      }, 150);
    }
    function onVisibility() {
      if (document.hidden) {
        running = false;
        if (raf) cancelAnimationFrame(raf);
      } else if (!reduce) {
        running = true;
        raf = requestAnimationFrame(frame);
      }
    }

    build();
    if (reduce) {
      frame(0); // single static frame, no loop
    } else {
      raf = requestAnimationFrame(frame);
    }
    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
