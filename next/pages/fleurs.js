import Head from "next/head";
import { useEffect, useRef, useState } from "react";

const FLOWER_COLORS = [
  { h: 340, s: 62, b: 78 },
  { h: 355, s: 52, b: 86 },
  { h: 48, s: 72, b: 88 },
  { h: 38, s: 58, b: 84 },
  { h: 280, s: 45, b: 72 },
  { h: 310, s: 48, b: 70 },
  { h: 15, s: 65, b: 80 },
  { h: 0, s: 4, b: 95 },
  { h: 55, s: 35, b: 92 },
  { h: 170, s: 42, b: 65 },
];

const FLOWER_TYPES = ["rose", "daisy", "cosmos", "wild"];

export default function Fleurs() {
  const containerRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    let instance;
    let destroyed = false;

    (async () => {
      const p5 = (await import("p5")).default;
      if (destroyed) return;

      const sketch = (p) => {
        let W, H;
        let groundBuffer, vignetteBuffer;
        let flowers = [];
        let grasses = [];
        let pollen = [];
        let fallingPetals = [];
        let t = 0;
        let frameDt = 0;
        let grassGfx;
        let grassFrame = 99; // force immediate first draw
        let isMobile = false;
        const WIND_SCALE = 0.003;
        const WIND_SPEED = 0.35;
        let reducedMotion = false;

        function windAt(x, y) {
          return p.noise(x * WIND_SCALE, y * WIND_SCALE, t * WIND_SPEED) - 0.5;
        }

        function buildGround() {
          if (groundBuffer) groundBuffer.remove();
          groundBuffer = p.createGraphics(W, H);
          const g = groundBuffer;
          g.colorMode(p.HSB, 360, 100, 100, 100);
          g.background(135, 38, 7);
          g.noStroke();

          // Many small mossy patches layered for organic texture
          for (let i = 0; i < 180; i++) {
            g.fill(p.random(100, 155), p.random(30, 55), p.random(8, 20), p.random(15, 35));
            const s = p.random(20, 140);
            g.ellipse(p.random(W), p.random(H), s, s * p.random(0.5, 1.5));
          }
          // Earth tone variation
          for (let i = 0; i < 60; i++) {
            g.fill(p.random(25, 55), p.random(30, 50), p.random(8, 16), p.random(12, 28));
            const s = p.random(15, 80);
            g.ellipse(p.random(W), p.random(H), s, s * p.random(0.6, 1.4));
          }
          // Tiny bright speckles (dew, minerals)
          for (let i = 0; i < 120; i++) {
            g.fill(p.random(80, 160), p.random(30, 55), p.random(28, 45), p.random(10, 25));
            const s = p.random(1, 6);
            g.ellipse(p.random(W), p.random(H), s, s);
          }
        }

        function buildVignette() {
          if (vignetteBuffer) vignetteBuffer.remove();
          vignetteBuffer = p.createGraphics(W, H);
          const v = vignetteBuffer;
          v.clear();
          v.noStroke();
          const cx = W / 2;
          const cy = H / 2;
          const maxR = Math.hypot(W, H) * 0.55;
          for (let r = maxR; r > maxR * 0.3; r -= 4) {
            const alpha = p.map(r, maxR, maxR * 0.3, 22, 0);
            v.fill(0, 0, 0, alpha);
            v.ellipse(cx, cy, r * 2, r * 2);
          }
        }

        class Flower {
          constructor(x, y, bloomDelay) {
            this.x = x;
            this.y = y;
            this.bloomDelay = bloomDelay;
            this.baseSize = p.random(28, 72);
            this.color = p.random(FLOWER_COLORS);
            this.rotation = p.random(p.TWO_PI);
            this.swayPhase = p.random(p.TWO_PI);
            this.type = p.random(FLOWER_TYPES);

            // ~12% chance of rare mutation
            this.rare = p.random() < 0.12;
            if (this.rare) {
              const mutation = p.random([
                "queen",        // oversized, slow majestic bloom
                "hypersaturated", // vivid neon-like colors
                "variegated",   // two-tone color split
                "concentric",   // rings instead of petals
                "firecracker",  // fast bloom, extra strokes
              ]);
              this.mutation = mutation;
              if (mutation === "queen") {
                this.baseSize = p.random(70, 110);
              } else if (mutation === "hypersaturated") {
                this.color = {
                  h: p.random([350, 290, 55, 180]),
                  s: p.random(85, 100),
                  b: p.random(85, 98),
                };
              } else if (mutation === "variegated") {
                this.color2 = p.random(FLOWER_COLORS);
              } else if (mutation === "firecracker") {
                this.baseSize *= 0.8;
              }
            } else {
              this.mutation = null;
            }

            this.strokes = this.buildStrokes();
            // Lifecycle
            this.bloomDuration = this.mutation === "queen" ? 6 : this.mutation === "firecracker" ? 1.2 : 3.5;
            this.lifeDuration = p.random(25, 55);
            this.fadeDuration = p.random(8, 14);
            this.dead = false;
            this.petalTimer = p.random(0.5, 1.5);
          }

          buildStrokes() {
            const strokes = [];
            const isConcentric = this.mutation === "concentric";
            const isFirecracker = this.mutation === "firecracker";
            const densityMult = isFirecracker ? 2.0 : isConcentric ? 1.4 : 1.0;
            const count = Math.floor(
              this.baseSize * (this.type === "wild" ? 1.6 : 1.1) * densityMult
            );

            for (let i = 0; i < count; i++) {
              const frac = i / count;
              let sx, sy, rot;

              if (isConcentric) {
                // Concentric rings — strokes arranged in distinct rings
                const ringCount = 4;
                const ringIdx = Math.floor(frac * ringCount);
                const ringFrac = (frac * ringCount) % 1;
                const ringRadius = ((ringIdx + 1) / ringCount) * this.baseSize * 0.45;
                const angle = ringFrac * p.TWO_PI + ringIdx * 0.4;
                sx = Math.cos(angle) * ringRadius + p.random(-2, 2);
                sy = Math.sin(angle) * ringRadius + p.random(-2, 2);
                rot = angle + p.HALF_PI;
              } else if (this.type === "rose") {
                const spiralAngle = frac * Math.PI * 5.5;
                const spiralDist = frac * this.baseSize * 0.43;
                sx = Math.cos(spiralAngle) * spiralDist + p.random(-3, 3);
                sy = Math.sin(spiralAngle) * spiralDist + p.random(-3, 3);
                rot = spiralAngle + p.random(-0.3, 0.3);
              } else if (this.type === "daisy") {
                const ring = frac < 0.2 ? 0 : 1;
                const angle = p.random(p.TWO_PI);
                const dist =
                  ring === 0
                    ? p.random(0, this.baseSize * 0.1)
                    : p.random(this.baseSize * 0.22, this.baseSize * 0.46);
                sx = Math.cos(angle) * dist;
                sy = Math.sin(angle) * dist;
                rot = ring === 0 ? p.random(p.TWO_PI) : angle;
              } else if (this.type === "cosmos") {
                const angle = p.random(p.TWO_PI);
                const dist = p.random(0, this.baseSize * 0.44);
                sx = Math.cos(angle) * dist;
                sy = Math.sin(angle) * dist;
                rot = p.random(p.TWO_PI);
              } else {
                const dist = Math.abs(p.randomGaussian(0, this.baseSize * 0.2));
                const angle = p.random(p.TWO_PI);
                sx = Math.cos(angle) * dist;
                sy = Math.sin(angle) * dist;
                rot = p.random(p.TWO_PI);
              }

              // Variegated: alternate hue between two colors
              let hueOff = p.random(-15, 15);
              if (this.mutation === "variegated" && this.color2) {
                const useAlt = Math.sin(frac * p.TWO_PI * 3 + p.random(-0.5, 0.5)) > 0;
                hueOff = useAlt ? this.color2.h - this.color.h : hueOff;
              }

              strokes.push({
                sx,
                sy,
                rot,
                w: p.random(this.baseSize * 0.12, this.baseSize * 0.28),
                h: p.random(this.baseSize * 0.09, this.baseSize * 0.22),
                hueOff,
                satOff: p.random(-8, 8) + (this.mutation === "hypersaturated" ? 10 : 0),
                briOff: p.random(-5, 10) + (this.mutation === "hypersaturated" ? 8 : 0),
                alphaBase: p.random(40, 80) + (this.mutation === "hypersaturated" ? 15 : 0),
                bloomOrder: frac,
              });
            }

            for (let i = 0; i < 6; i++) {
              const dist = p.random(0, this.baseSize * 0.06);
              const angle = p.random(p.TWO_PI);
              strokes.push({
                sx: Math.cos(angle) * dist,
                sy: Math.sin(angle) * dist,
                rot: p.random(p.TWO_PI),
                w: p.random(3, 7),
                h: p.random(3, 6),
                hueOff: 0,
                satOff: 0,
                briOff: 0,
                alphaBase: p.random(60, 90),
                bloomOrder: 0,
                isCenter: true,
              });
            }

            return strokes;
          }

          draw(time) {
            const elapsed = time - this.bloomDelay;
            if (elapsed < 0 || this.dead) return;

            // Bloom phase (0→1)
            const bloomEase =
              elapsed < this.bloomDuration
                ? 1 - Math.pow(1 - Math.min(elapsed / this.bloomDuration, 1), 3)
                : 1;

            // Wilt phase (1→0)
            const wiltStart = this.bloomDuration + this.lifeDuration;
            const wiltElapsed = elapsed - wiltStart;
            let vitality = 1;
            if (wiltElapsed > 0) {
              vitality = 1 - Math.min(wiltElapsed / this.fadeDuration, 1);
              if (vitality <= 0) {
                this.dead = true;
                return;
              }
              // Shed petals while wilting
              this.petalTimer -= frameDt;
              if (this.petalTimer <= 0 && vitality > 0.05 && fallingPetals.length < (isMobile ? 30 : 50)) {
                this.petalTimer = p.random(0.3, 1.0);
                const outer = this.strokes.filter((s) => !s.isCenter);
                if (outer.length > 0) {
                  const src = p.random(outer);
                  fallingPetals.push(
                    new FallingPetal(
                      this.x + src.sx * vitality,
                      this.y + src.sy * vitality,
                      this.color,
                      p.random(3, 8)
                    )
                  );
                }
              }
            }

            const ease = bloomEase * vitality;
            if (ease < 0.01) return;

            // Desaturate + shrink as flower wilts
            const satMult = 0.3 + 0.7 * vitality;
            const sizeMult = 0.85 + 0.15 * vitality;

            const wx = windAt(this.x, this.y) * 5;
            const wy = windAt(this.x + 500, this.y + 500) * 5;
            const sway = Math.sin(time * 0.7 + this.swayPhase) * 1.5 * ease;
            const breathe = 1 + Math.sin(time * 0.4 + this.swayPhase) * 0.02;

            p.push();
            p.translate(this.x + wx + sway, this.y + wy);
            p.rotate(
              this.rotation +
                Math.sin(time * 0.25 + this.swayPhase) * 0.03 +
                (1 - vitality) * 0.15
            );
            p.scale(breathe * ease * sizeMult);
            p.noStroke();

            // Soft ambient glow
            p.fill(this.color.h, this.color.s * 0.4 * satMult, this.color.b * 0.6, 6 * ease);
            p.ellipse(0, 0, this.baseSize * 1.8, this.baseSize * 1.8);

            for (const s of this.strokes) {
              const sp = Math.max(
                0,
                (bloomEase - s.bloomOrder * 0.3) / (1 - s.bloomOrder * 0.3)
              );
              if (sp < 0.05) continue;

              const alpha = s.alphaBase * sp * vitality;
              if (s.isCenter) {
                p.fill(48, 70 * satMult, 92, alpha);
              } else {
                p.fill(
                  (this.color.h + s.hueOff + 360) % 360,
                  p.constrain((this.color.s + s.satOff) * satMult, 0, 100),
                  p.constrain(this.color.b + s.briOff, 0, 100),
                  alpha
                );
              }

              p.push();
              p.translate(s.sx * sp, s.sy * sp);
              p.rotate(s.rot);
              p.ellipse(0, 0, s.w * sp, s.h * sp);
              p.pop();
            }

            p.pop();
          }
        }

        class GrassBlade {
          constructor(x, y) {
            this.x = x;
            this.y = y;
            this.len = p.random(3, 11);
            this.baseAngle = p.random(p.TWO_PI);
            this.hue = p.random(95, 150);
            this.sat = p.random(35, 65);
            this.bri = p.random(25, 50);
            this.weight = p.random(0.6, 2.0);
            this.alpha = p.random(45, 80);
          }

          draw(g) {
            const ctx = g || p;
            // Noise-driven wave reveal — grass patches appear progressively
            const reveal = t * 0.55 - p.noise(this.x * 0.004, this.y * 0.004) * 3;
            if (reveal < 0) return;
            const revealFade = Math.min(reveal, 1);

            const wind = windAt(this.x, this.y) * 0.8;
            const angle = this.baseAngle + wind;
            const ex = this.x + Math.cos(angle) * this.len;
            const ey = this.y + Math.sin(angle) * this.len;
            ctx.stroke(this.hue, this.sat, this.bri, this.alpha * revealFade);
            ctx.strokeWeight(this.weight);
            ctx.line(this.x, this.y, ex, ey);
          }
        }

        class Pollen {
          constructor(initial) {
            this.reset(initial);
          }

          reset(initial = false) {
            this.x = p.random(W);
            this.y = p.random(H);
            this.size = p.random(1.5, 3.5);
            this.alpha = p.random(25, 55);
            this.hue = p.random([48, 52, 56, 44]);
            this.vx = p.random(-0.15, 0.15);
            this.vy = p.random(-0.25, -0.02);
            this.life = p.random(4, 10);
            this.age = initial ? p.random(0, this.life) : 0;
          }

          update(dt) {
            const wind = windAt(this.x, this.y);
            this.x += this.vx + wind * 0.6;
            this.y += this.vy;
            this.age += dt;
            if (this.age > this.life || this.x < -10 || this.x > W + 10 || this.y < -10) {
              this.reset();
            }
          }

          draw() {
            const ratio = this.age / this.life;
            const fade = ratio < 0.15 ? ratio / 0.15 : ratio > 0.75 ? (1 - ratio) / 0.25 : 1;
            p.noStroke();
            p.fill(this.hue, 45, 92, this.alpha * fade);
            p.ellipse(this.x, this.y, this.size, this.size);
          }
        }

        class FallingPetal {
          constructor(x, y, color, size) {
            this.x = x;
            this.y = y;
            this.color = { ...color };
            this.size = size;
            this.rot = p.random(p.TWO_PI);
            this.rotSpeed = p.random(-2, 2);
            this.vx = p.random(-0.4, 0.4);
            this.vy = p.random(0.2, 0.7);
            this.oscillation = p.random(1.5, 3);
            this.oscPhase = p.random(p.TWO_PI);
            this.life = p.random(4, 9);
            this.age = 0;
            this.alpha = p.random(45, 75);
          }

          update(dt) {
            const wind = windAt(this.x, this.y);
            this.x += this.vx + wind * 1.0 + Math.sin(this.age * this.oscillation + this.oscPhase) * 0.3;
            this.y += this.vy;
            this.rot += this.rotSpeed * dt;
            this.age += dt;
            return this.age < this.life && this.y < H + 20;
          }

          draw() {
            const lifeRatio = this.age / this.life;
            const fade =
              lifeRatio < 0.15
                ? lifeRatio / 0.15
                : lifeRatio > 0.6
                  ? (1 - lifeRatio) / 0.4
                  : 1;
            p.push();
            p.translate(this.x, this.y);
            p.rotate(this.rot);
            p.noStroke();
            p.fill(this.color.h, this.color.s * 0.7, this.color.b, this.alpha * Math.max(0, fade));
            p.ellipse(0, 0, this.size * 0.7, this.size * 0.35);
            p.pop();
          }
        }

        p.setup = () => {
          reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          W = containerRef.current.offsetWidth;
          H = containerRef.current.offsetHeight;
          const canvas = p.createCanvas(W, H);
          canvas.style("display", "block");
          p.colorMode(p.HSB, 360, 100, 100, 100);
          isMobile = W < 768;
          p.pixelDensity(isMobile ? 1 : Math.min(window.devicePixelRatio, 2));
          p.frameRate(reducedMotion ? 1 : (isMobile ? 24 : 30));

          buildGround();
          buildVignette();

          const centerX = W / 2;
          const centerY = H * 0.4;
          const clearingR = Math.min(W, H) * 0.32;

          const grassTarget = Math.floor((W * H) / (isMobile ? 900 : 600));
          for (let i = 0; i < grassTarget; i++) {
            const x = p.random(W);
            const y = p.random(H);
            const density = p.noise(x * 0.005, y * 0.005);
            const dc = Math.hypot(x - centerX, y - centerY);
            const cf = dc < clearingR ? 0.15 + 0.85 * (dc / clearingR) : 1;
            if (p.random() < density * cf * 0.8) {
              grasses.push(new GrassBlade(x, y));
            }
          }

          const cellSize = Math.max(80, Math.min(W, H) / 7);
          const cols = Math.ceil(W / cellSize);
          const rows = Math.ceil(H / cellSize);
          let bloomDelay = 1.2;

          for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
              if (p.random() > 0.55) continue;
              const x = (col + p.random(0.15, 0.85)) * cellSize;
              const y = (row + p.random(0.15, 0.85)) * cellSize;
              const dc = Math.hypot(x - centerX, y - centerY);
              if (dc < clearingR && p.random() < 0.65) continue;
              flowers.push(new Flower(x, y, reducedMotion ? 0 : bloomDelay));
              bloomDelay += p.random(0.2, 0.5);
            }
          }

          flowers.sort((a, b) => b.baseSize - a.baseSize);

          for (let i = 0; i < 35; i++) {
            pollen.push(new Pollen(true));
          }

          grassGfx = p.createGraphics(W, H);
          grassGfx.colorMode(p.HSB, 360, 100, 100, 100);

          if (reducedMotion) {
            t = 25;
            drawFrame();
            p.noLoop();
          }

          setEntered(true);
        };

        function drawFrame() {
          p.image(groundBuffer, 0, 0, W, H);

          // Grass rendered to offscreen buffer, refreshed periodically
          grassFrame++;
          if (grassFrame >= (isMobile ? 5 : 3)) {
            grassFrame = 0;
            grassGfx.clear();
            for (const blade of grasses) {
              blade.draw(grassGfx);
            }
          }
          p.image(grassGfx, 0, 0, W, H);
          p.noStroke();

          for (const flower of flowers) {
            flower.draw(t);
          }

          // Falling petals (from wilting flowers)
          for (const petal of fallingPetals) {
            petal.draw();
          }

          for (const particle of pollen) {
            particle.draw();
          }

          // Dawn fade — scene emerges from darkness
          if (t < 4) {
            const dark = Math.pow(1 - Math.min(t / 4, 1), 2);
            p.noStroke();
            p.fill(0, 0, 0, dark * 100);
            p.rect(0, 0, W, H);
          }

          // Slow ambient light cycle (120s period)
          // dusk(warm) → night(cool) → dawn(golden) → day(neutral) → dusk...
          if (t > 4) {
            const cycle = ((t - 4) % 120) / 120; // 0→1 over 2 minutes
            let hue, alpha;
            if (cycle < 0.25) {
              // Dusk: warm amber tint
              hue = 30;
              alpha = Math.sin(cycle / 0.25 * Math.PI) * 6;
            } else if (cycle < 0.5) {
              // Night: cool blue-violet tint
              hue = 240;
              alpha = Math.sin((cycle - 0.25) / 0.25 * Math.PI) * 5;
            } else if (cycle < 0.75) {
              // Dawn: golden-pink warmth
              hue = 15;
              alpha = Math.sin((cycle - 0.5) / 0.25 * Math.PI) * 7;
            } else {
              // Day: very subtle neutral
              hue = 120;
              alpha = Math.sin((cycle - 0.75) / 0.25 * Math.PI) * 3;
            }
            if (alpha > 0.3) {
              p.blendMode(p.OVERLAY);
              p.noStroke();
              p.fill(hue, 40, 50, alpha);
              p.rect(0, 0, W, H);
              p.blendMode(p.BLEND);
            }
          }
        }

        p.draw = () => {
          frameDt = p.deltaTime / 1000;
          t += frameDt;

          // Update pollen
          for (const particle of pollen) {
            particle.update(frameDt);
          }

          // Update falling petals
          fallingPetals = fallingPetals.filter((petal) => petal.update(frameDt));

          // Flower lifecycle — respawn dead flowers
          for (let i = 0; i < flowers.length; i++) {
            if (flowers[i].dead) {
              const old = flowers[i];
              // Rebirth at same position after a pause
              flowers[i] = new Flower(old.x, old.y, t + p.random(5, 15));
            }
          }

          drawFrame();
        };

        p.windowResized = () => {
          if (!containerRef.current) return;
          W = containerRef.current.offsetWidth;
          H = containerRef.current.offsetHeight;
          isMobile = W < 768;
          p.resizeCanvas(W, H);
          buildGround();
          buildVignette();
          if (grassGfx) grassGfx.remove();
          grassGfx = p.createGraphics(W, H);
          grassGfx.colorMode(p.HSB, 360, 100, 100, 100);
          grassFrame = 99;
        };
      };

      instance = new p5(sketch, containerRef.current);
    })();

    return () => {
      destroyed = true;
      if (instance) instance.remove();
    };
  }, []);

  useEffect(() => {
    if (!isModalOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && setIsModalOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [isModalOpen]);

  return (
    <>
      <Head>
        <title>La Fête des Fleurs</title>
        <meta
          name="description"
          content="Invitation — La Fête des Fleurs, 21 mars, Jour du Printemps. Dès 17 h."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="La Fête des Fleurs" />
        <meta property="og:description" content="21 mars · Jour du Printemps · Dès 17 h · Éclosion collective." />
        <meta property="og:image" content="https://me.nech.pl/og-fleurs.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="La Fête des Fleurs" />
        <meta name="twitter:description" content="21 mars · Jour du Printemps · Dès 17 h" />
        <meta name="twitter:image" content="https://me.nech.pl/og-fleurs.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,400;1,500;1,600&display=swap"
          rel="stylesheet"
        />
      </Head>

      <main id="fleurs-page">
        <div ref={containerRef} className="garden-canvas" aria-hidden="true" />
        <div className="scan-lines" aria-hidden="true" />
        <div className="vignette-css" aria-hidden="true" />

        <section className={`invite ${entered ? "invite--visible" : ""}`}>
          <p className="eyebrow" style={{ "--d": "0.3s" }}>
            Invitation
          </p>
          <h1 style={{ "--d": "0.7s" }}>
            La Fête
            <br />
            des Fleurs
          </h1>
          <p className="date" style={{ "--d": "1.1s" }}>
            21 mars · Jour du Printemps
          </p>
          <div className="info" style={{ "--d": "1.4s" }}>
            <span>Dès 17 h</span>
            <span className="dot" aria-hidden="true" />
            <span>Adresse habituelle</span>
          </div>
          <p className="note" style={{ "--d": "1.7s" }}>
            Éclosion collective.
          </p>
          <p className="dress-code" style={{ "--d": "2.0s" }}>
            Venez fleuris.
          </p>
          <button
            type="button"
            className="cta"
            style={{ "--d": "2.4s" }}
            onClick={() => setIsModalOpen(true)}
          >
            RSVP
          </button>
        </section>

        {isModalOpen && (
          <div
            className="modal-shell"
            role="dialog"
            aria-modal="true"
            aria-labelledby="fleurs-rsvp-title"
            onClick={() => setIsModalOpen(false)}
          >
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <span className="modal-flower mf1" aria-hidden="true">✿</span>
              <span className="modal-flower mf2" aria-hidden="true">❀</span>
              <span className="modal-flower mf3" aria-hidden="true">✾</span>
              <span className="modal-flower mf4" aria-hidden="true">❁</span>
              <span className="modal-flower mf5" aria-hidden="true">✿</span>
              <span className="modal-flower mf6" aria-hidden="true">❀</span>
              <button
                type="button"
                className="modal-close"
                aria-label="Fermer"
                onClick={() => setIsModalOpen(false)}
              >
                ×
              </button>
              <p className="modal-eyebrow">RSVP</p>
              <h2 id="fleurs-rsvp-title">Tu viens ?</h2>
              <p className="modal-body">Fais vite signe à PLN.</p>
            </div>
          </div>
        )}

        <style jsx>{`
          #fleurs-page,
          #fleurs-page *,
          #fleurs-page *::before,
          #fleurs-page *::after {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }

          #fleurs-page {
            --bg: #07110c;
            --text: #f2f1e8;
            --text-muted: rgba(242, 241, 232, 0.6);
            --accent-warm: rgba(255, 225, 172, 0.88);
            position: relative;
            min-height: 100vh;
            min-height: 100dvh;
            overflow: hidden;
            background: var(--bg);
            color: var(--text);
            font-family: "Cormorant Garamond", "Georgia", serif;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          /* ── Canvas ── */

          .garden-canvas {
            position: fixed;
            inset: 0;
            z-index: 0;
          }

          .garden-canvas :global(canvas) {
            display: block;
            width: 100% !important;
            height: 100% !important;
            animation: subtle-glitch 9s ease-in-out infinite;
          }

          /* ── Overlays ── */

          .scan-lines {
            position: fixed;
            inset: 0;
            z-index: 1;
            pointer-events: none;
            background: repeating-linear-gradient(
              0deg,
              transparent,
              transparent 3px,
              rgba(0, 0, 0, 0.025) 3px,
              rgba(0, 0, 0, 0.025) 6px
            );
            opacity: 0.6;
          }

          .vignette-css {
            position: fixed;
            inset: 0;
            z-index: 1;
            pointer-events: none;
            background: radial-gradient(
              ellipse at 50% 40%,
              transparent 25%,
              rgba(7, 17, 12, 0.35) 70%,
              rgba(3, 7, 5, 0.7) 100%
            );
          }

          /* ── Invite text ── */

          .invite {
            position: relative;
            z-index: 2;
            width: min(100%, 36rem);
            padding: 1.5rem 1rem 2rem;
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.85rem;
          }

          .invite > * {
            opacity: 0;
            transform: translateY(14px);
            transition: opacity 0.9s ease-out, transform 0.9s ease-out;
            transition-delay: var(--d, 0s);
          }

          .invite--visible > * {
            opacity: 1;
            transform: none;
          }

          .eyebrow,
          .modal-eyebrow {
            text-transform: uppercase;
            letter-spacing: 0.3em;
            font-size: 0.7rem;
            font-weight: 400;
            color: var(--text-muted);
          }

          h1 {
            font-family: "Cormorant Garamond", "Georgia", serif;
            font-style: italic;
            font-weight: 500;
            font-size: clamp(3rem, 14vw, 5.6rem);
            line-height: 0.9;
            letter-spacing: -0.03em;
            text-shadow: 0 0 40px rgba(7, 17, 12, 0.95), 0 0 80px rgba(7, 17, 12, 0.6),
              0 2px 4px rgba(0, 0, 0, 0.5);
          }

          .date {
            font-size: 0.95rem;
            font-weight: 300;
            letter-spacing: 0.15em;
            text-transform: uppercase;
            color: var(--accent-warm);
            text-shadow: 0 0 20px rgba(7, 17, 12, 0.9);
          }

          .info {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            font-size: 1rem;
            font-weight: 300;
            color: var(--text);
            text-shadow: 0 0 24px rgba(7, 17, 12, 0.95);
          }

          .dot {
            width: 3px;
            height: 3px;
            border-radius: 50%;
            background: var(--text-muted);
            flex-shrink: 0;
          }

          .note {
            font-style: italic;
            font-weight: 400;
            font-size: 1.1rem;
            color: var(--text-muted);
            text-shadow: 0 0 24px rgba(7, 17, 12, 0.95);
          }

          .dress-code {
            font-weight: 300;
            font-size: 0.82rem;
            letter-spacing: 0.18em;
            text-transform: uppercase;
            color: rgba(255, 210, 170, 0.65);
            text-shadow: 0 0 20px rgba(7, 17, 12, 0.95);
          }

          /* ── CTA ── */

          .cta {
            appearance: none;
            border: 0;
            font-family: "Cormorant Garamond", "Georgia", serif;
            margin-top: 0.3rem;
            min-width: 11rem;
            padding: 0.9rem 2rem;
            border-radius: 999px;
            background: linear-gradient(
              135deg,
              rgba(252, 244, 188, 0.95),
              rgba(255, 149, 201, 0.9) 50%,
              rgba(130, 246, 179, 0.92)
            );
            color: #0c1a12;
            font-size: 0.85rem;
            font-weight: 600;
            letter-spacing: 0.28em;
            text-transform: uppercase;
            cursor: pointer;
            box-shadow: 0 16px 44px rgba(0, 0, 0, 0.35), 0 0 24px rgba(255, 182, 214, 0.2);
            transition: transform 200ms ease, box-shadow 200ms ease, filter 200ms ease;
            animation: cta-breathe 3.8s ease-in-out infinite;
          }

          .cta:hover,
          .cta:focus-visible {
            transform: translateY(-2px) scale(1.03);
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4), 0 0 36px rgba(160, 255, 200, 0.25);
            filter: saturate(1.08) brightness(1.04);
            outline: none;
          }

          /* ── Modal ── */

          .modal-shell {
            position: fixed;
            inset: 0;
            z-index: 20;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1.2rem;
            background: rgba(3, 7, 5, 0.65);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            animation: modal-fade-in 0.35s ease-out;
          }

          .modal-card {
            position: relative;
            width: min(100%, 26rem);
            padding: 2.4rem 2.8rem 2.2rem;
            border-radius: 1.4rem;
            border: 1px solid rgba(206, 255, 222, 0.12);
            background: radial-gradient(circle at 50% 0%, rgba(255, 211, 141, 0.12), transparent 45%),
              radial-gradient(circle at 20% 80%, rgba(255, 170, 195, 0.06), transparent 40%),
              radial-gradient(circle at 80% 80%, rgba(160, 225, 175, 0.06), transparent 40%),
              linear-gradient(180deg, rgba(14, 25, 18, 0.96), rgba(7, 13, 10, 0.98));
            box-shadow: 0 28px 70px rgba(0, 0, 0, 0.5), 0 0 40px rgba(255, 200, 180, 0.06);
            text-align: center;
            animation: modal-card-in 0.45s cubic-bezier(0.22, 1, 0.36, 1);
          }

          .modal-close {
            appearance: none;
            border: 0;
            font: inherit;
            position: absolute;
            top: 0.7rem;
            right: 0.8rem;
            width: 2.2rem;
            height: 2.2rem;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.06);
            color: rgba(255, 255, 255, 0.8);
            font-size: 1.1rem;
            cursor: pointer;
            display: grid;
            place-items: center;
            transition: background 150ms ease;
            z-index: 2;
          }

          .modal-close:hover {
            background: rgba(255, 255, 255, 0.12);
          }

          .modal-card h2 {
            font-style: italic;
            font-weight: 500;
            font-size: clamp(1.6rem, 7vw, 2.2rem);
            line-height: 1.05;
            margin-top: 0.4rem;
          }

          .modal-body {
            margin-top: 0.8rem;
            color: var(--text-muted);
            font-size: 1rem;
            font-weight: 300;
            line-height: 1.5;
          }

          /* ── Modal decorative flowers ── */

          .modal-flower {
            position: absolute;
            pointer-events: none;
            line-height: 1;
            animation: modal-flora-sway 5s ease-in-out infinite;
            filter: blur(0.3px);
          }

          .mf1 { top: 0.5rem; left: 0.4rem; font-size: 1.6rem; color: rgba(255, 170, 195, 0.5); animation-delay: 0s; }
          .mf2 { top: 46%; left: 0.15rem; font-size: 1.05rem; color: rgba(255, 220, 140, 0.4); animation-delay: -1.8s; }
          .mf3 { bottom: 0.4rem; left: 0.6rem; font-size: 1.3rem; color: rgba(195, 160, 240, 0.42); animation-delay: -3.2s; }
          .mf4 { top: 0.7rem; right: 0.35rem; font-size: 1.25rem; color: rgba(255, 185, 160, 0.48); animation-delay: -0.7s; }
          .mf5 { top: 50%; right: 0.2rem; font-size: 1.45rem; color: rgba(160, 225, 175, 0.42); animation-delay: -2.4s; }
          .mf6 { bottom: 0.6rem; right: 0.5rem; font-size: 0.95rem; color: rgba(255, 195, 210, 0.4); animation-delay: -4s; }

          /* ── Animations ── */

          @keyframes cta-breathe {
            0%,
            100% {
              box-shadow: 0 16px 44px rgba(0, 0, 0, 0.35), 0 0 24px rgba(255, 182, 214, 0.2);
            }
            50% {
              box-shadow: 0 20px 52px rgba(0, 0, 0, 0.38), 0 0 34px rgba(160, 255, 200, 0.22);
            }
          }

          @keyframes modal-fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          @keyframes modal-card-in {
            from { opacity: 0; transform: scale(0.92) translateY(12px); }
            to { opacity: 1; transform: none; }
          }

          @keyframes modal-flora-sway {
            0%, 100% { transform: rotate(0deg) scale(1); }
            33% { transform: rotate(10deg) scale(1.08); }
            66% { transform: rotate(-6deg) scale(0.95); }
          }

          @keyframes subtle-glitch {
            0%,
            94%,
            100% {
              filter: none;
              transform: none;
            }
            95% {
              filter: saturate(1.12) brightness(1.02);
              transform: translate(0.5px, 0);
            }
            96.5% {
              filter: hue-rotate(1deg);
              transform: translate(-0.3px, 0.2px);
            }
            98% {
              filter: saturate(0.95);
              transform: none;
            }
          }

          /* ── Responsive ── */

          @media (min-width: 800px) {
            .invite {
              gap: 1rem;
              padding: 2rem;
            }

            .info {
              gap: 1rem;
            }
          }

          /* ── Reduced Motion ── */

          @media (prefers-reduced-motion: reduce) {
            .invite > * {
              transition: none !important;
              opacity: 1 !important;
              transform: none !important;
            }

            .cta {
              animation: none !important;
            }

            .garden-canvas :global(canvas) {
              animation: none !important;
            }
          }
        `}</style>
      </main>
    </>
  );
}
