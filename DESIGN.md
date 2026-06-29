# Design

> Visual system for the **cosmicfest_v2.67Hz** micro-site. Standalone from the main site's
> Syne identity — cosmicfest has its own fonts and tokens (`next/styles/cosmicfest.module.css`).

## Theme

Dark, electric, cosmic-laboratory. Scene: a beachside night, an oscilloscope glowing in the
dark, two particles entangled across the sand. Not space-opera purple — a deep cosmic ink with
two living accents (cyan + magenta) that always appear as a pair, the way entangled states do,
resolving to white phosphor where they meet. One warm amber spark for the summer/sun nod.

Color strategy: **Full palette** (committed dark ground + a deliberate dual-accent system).

## Color (OKLCH)

| Role | Token | Value | Notes |
|---|---|---|---|
| Ground | `--cf-bg` | `oklch(0.15 0.03 275)` | cosmic ink, faint violet-blue |
| Surface | `--cf-surface` | `oklch(0.19 0.035 278)` | raised panels |
| Surface alt | `--cf-surface-2` | `oklch(0.23 0.04 280)` | hover / nested ground |
| Border | `--cf-border` | `oklch(1 0 0 / 0.10)` | hairlines |
| Ink | `--cf-ink` | `oklch(0.97 0.01 270)` | primary text, ~14:1 on bg |
| Muted | `--cf-muted` | `oklch(0.80 0.02 272)` | secondary, ≥4.5:1 on bg |
| **Signal (state A)** | `--cf-cyan` | `oklch(0.84 0.14 200)` | first entangled accent |
| **Entangled (state B)** | `--cf-magenta` | `oklch(0.72 0.21 350)` | second entangled accent |
| Phosphor | `--cf-white` | `oklch(0.99 0 0)` | stars, the "meeting point" |
| Spark (sun) | `--cf-amber` | `oklch(0.82 0.15 75)` | rare warm accent, the 67Hz/sun |

The two accents are a **system**: use them together (a cyan label paired with a magenta value,
a gradient *between* them reserved only for the literal entanglement motif — never gradient text).

## Typography

Voice words: electric, precise, oscillating. Reflex-rejects avoided (no Space Mono/Grotesk,
Montserrat, Orbitron, Inter).

- **Display** — `Archivo Expanded` (700–900, wide). The wordmark + section heads shout like a
  concert poster. `letter-spacing` ≥ -0.02em; `text-wrap: balance`.
- **Body** — `Archivo` (400–600). Same superfamily as display = cohesion. Logistics prose,
  ≤70ch, line-height 1.6 (light-on-dark needs the air).
- **Mono** — `Martian Mono` (400–600). The lab instrument: frequencies, dates, coordinates,
  the "67Hz", entanglement labels, countdown digits. Earned, not costume.

Loaded via `next/font/google`, exposed as CSS vars on the page container.

## Components

- **Hero canvas** (`EntanglementField`): full-bleed `<canvas>` — drifting starfield, ~6–10
  entangled particle *pairs* (two points joined by a faint line, mirroring each other's motion
  across the viewport), and a 67Hz sine/interference waveform along the lower third. Decorative,
  behind content, `prefers-reduced-motion` → single static frame.
- **Wordmark**: `cosmicfest` (display) + `v2.67Hz` (mono badge). The `.67Hz` is the hook.
- **Lineup rows**: not cards — a typographic list, each act = name (display) · role (mono) ·
  the artist's real name in parens. Cyan/magenta alternating per row.
- **Logistics blocks**: scannable definition-style groups (séjour, hébergement, transport,
  à prévoir) with mono labels + body values. Generous, not walls.
- **Souvenirs v0**: ParVagues Bandcamp/SoundCloud embeds + a small photo strip with an
  accessible lightbox (lifted + restyled from v0).
- **Countdown**: mono digits counting to 2026-08-22T00:00 (jour J). Retargeted from v0's June auto-calc.
- **CTA**: mailto `cosmic@nech.pl`, "réponds à l'invitation" — verb + object.

## Motion

- Hero canvas: continuous, GPU-cheap (transform/opacity on canvas paint; rAF loop).
- Section reveals: staggered fade+rise, ease-out-expo, enhancing an already-visible default
  (never gating visibility). Entangled-pair micro-motion on lineup hover.
- All motion has a `prefers-reduced-motion: reduce` path (crossfade/instant, static canvas).

## Layout

Single long scroll, deliberate pacing. Fluid `clamp()` spacing. Asymmetry allowed for the hero.
Mobile-first; logistics reflow to single column; canvas stays performant on phones (capped DPR,
fewer particles).
