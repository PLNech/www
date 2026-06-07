# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

PLN's personal website (`pln-www`) — a Next.js **App Router** app that bundles a personal landing page together with several self-contained mini-apps and generative-art experiments. It grew organically; expect each section to have its own conventions. Sections worth knowing:

- **`/` (index)** — personal landing page (bio, posts, talks).
- **ParVagues** (`/parvagues`, `/parvagues/live/*`, `/parvagues/fiche`) — the most actively developed area: a live-coding musician's site (gig timeline, music/video, technical rider). Has its own component family under `components/parvagues/` and a separate `<Layout>`. Flagship of the in-progress redesign.
- **CosmicFest** (`/cosmicfest`) — an event page; the only remaining consumer of the legacy `components/ParVaguesHeader.js` / `ParVaguesFooter.js` shell.
- **Generative art** — `pages/fleurs.js`, `pages/starry-nights.js` (p5.js sketches), and `/hydra/[id]` (Hydra-synth live-coding visuals). These are large single-file canvas sketches.
- **Content sections** — posts, poems, talks, hydras, all Markdown-driven (see Content model).

## Commands

All app commands run from the **repo root** (the app was hoisted out of the former `next/` subdirectory). **Use Node 20** (`nvm use 20`) — Yarn 4 refuses Node < 18.12, and the system default here is Node 16:

```bash
nvm use 20
yarn install --frozen-lockfile   # deterministic install
yarn dev                         # dev server on :3000
yarn build && yarn start         # production build + serve
yarn test                        # Jest unit tests (jsdom)
yarn test -- routing.spec         # single test file by name pattern
yarn test:watch                  # Jest watch mode
yarn test:e2e                    # Playwright e2e (auto-starts dev server)
yarn test:e2e:ui                 # Playwright UI mode
```

Deploy is Vercel, **preview-first** (after the hoist, Vercel "Root Directory" must be `.` / repo root — update in the Vercel UI):

```bash
yarn deploy:preview              # vercel --yes  (every branch/PR)
yarn deploy:prod                 # vercel --prod --yes  (only from main, after review)
yarn preview:env:pull            # vercel env pull .env.local (first-time local setup)
```

## Non-obvious conventions (enforced — see `.cursor/rules/`)

- **Yarn 4 only.** `yarn.lock` is the single source of truth. Never create `package-lock.json` / `pnpm-lock.yaml`. Uses Yarn PnP (hence `jest-pnp-resolver` and the `.yarn/` dir).
- **`@/` import alias** maps to the repo root (configured in `next.config.js` webpack and `jest.config.js` moduleNameMapper). Use `@/components/...`, `@/lib/...` instead of deep `../../` paths.
- **Global CSS only from `app/layout.tsx`** (the one root shell). Everywhere else use CSS Modules (`*.module.css`) or Tailwind utility classes. Tailwind v4 is active alongside the legacy `.module.css` files — both styling systems coexist.
- **Server Components by default; `'use client'` only at the leaves.** Pages are server components that fetch data + export `metadata`/`generateStaticParams`; push interactivity (hooks, `window`, `<style jsx>`, `next/dynamic({ssr:false})`, embeds) into small client components. All routes are SSG/ISR — there is no SSR/`getServerSideProps`. `revalidate` lives as a segment export (`export const revalidate = 60`) on `/parvagues` and `/parvagues/live/[slug]`.
- **Content in `content/`, assets in `public/`.** Markdown lives under `content/SECTION/`; static assets under `public/images/SECTION/`, referenced by absolute path (`/images/...`). Don't hotlink persistent assets — copy them in. Avoid build-time network fetches for core UI.
- **Secrets via Vercel env**, never committed. `NEXT_PUBLIC_*` prefix only for browser-safe vars.

## Content model

Markdown sections are loaded server-side at build via `gray-matter` (frontmatter) + `remark`/`remark-html` (body → HTML). The shared loader is `lib/utils.js`:
- `getAllContentData(section, sorted)` — list with frontmatter only (used for index/listing pages).
- `getAllContentIds(section)` — `[{ params: { id } }]` shape; map to `generateStaticParams()` via `.map(({ params }) => params)`.
- `getContentData(section, id)` — single item with rendered `contentHtml`.

Thin per-section wrappers (`lib/posts.js`, `lib/hydras.js`, `lib/poems.js`, `lib/talks.js`) just bind a section name to these helpers. Dynamic content pages (`app/post/[id]/page.js`, `app/poesie/[id]/page.js`, `app/hydra/[id]/page.js`) are async server components that pair `generateStaticParams()` + a `params`-driven fetch (`params` is a Promise — `await` it).

**ParVagues "lives" are a separate, richer model** (`lib/livesData.js`, NOT the generic loader): Markdown files organized by year under `content/lives/YYYY/slug.md`, with optional `content/lives/YYYY/slug/tracks.json` and gig photos under `public/images/parvagues/lives/YYYY/slug/`. Frontmatter carries gig metadata (date, time, location, audio/video/instagram/archive links, tags). `getAllLives()` aggregates across all year folders, sorted newest-first.

## Architecture notes

- **Hydra & p5 sketches**: canvas/WebGL code must be client-only — `next/dynamic({ ssr: false })` is only valid inside a client component, so it lives in a `'use client'` leaf (see `app/hydra/[id]/page.js` → `app/hydra/[id]/HydraClient.js` → `components/hydra-view.js`; `/fleurs` follows the same server-page → client-leaf split).
- **One root shell + a ParVagues sub-layout.** `app/layout.tsx` is the single `<html>/<body>` shell (global CSS + shared `metadata`). The landing/content pages wrap their content in the `components/layout.js` client component (header/footer/back-button). ParVagues has its own segment layout `app/parvagues/layout.tsx` (Syne font, `parvagues-root` wrapper, scroll header + reveal observer as client leaves). The legacy `ParVaguesHeader`/`ParVaguesFooter` and `components/parvagues/Layout.js` shells are gone.

## Testing

Jest (`jest.config.js`) uses `next/jest` (SWC transform) + jsdom, RTL matchers. `tests/jest.setup.js` mocks `next/navigation` (App Router hooks: `useRouter`/`usePathname`/`useSearchParams`/`redirect`) and `next/dynamic` (renders null stub). Unit tests in `tests/unit/`, Playwright e2e in `tests/e2e/` (excluded from Jest via `testPathIgnorePatterns`). **The test infra exists but there is currently 0 coverage** — all tests were Dunbar's and were removed with it. Re-establishing a baseline (starting with ParVagues) is part of the redesign.

Note: `tsconfig.json` has `strict: false` — TypeScript is loosely applied; most app code is plain `.js`/`.jsx`.
