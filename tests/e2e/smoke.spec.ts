import { test, expect } from '@playwright/test';

/**
 * Route-smoke safety net.
 *
 * Visits every public route and asserts: (1) the document responds < 400,
 * (2) the page renders non-empty content, and (3) it throws no *genuine*
 * uncaught exception. This is a regression guard for the App Router
 * migration — the URLs below are stable across that migration, so this spec
 * must stay green before and after.
 *
 * Tolerated noise (NOT failures): third-party embeds (SoundCloud, YouTube,
 * Bandcamp, ReactPlayer) and React dev-mode hydration warnings. These are
 * dev-server-only and/or out of our control; failing on them would make the
 * net flaky. Known pre-existing issue: /cosmicfest emits a dev-mode hydration
 * mismatch (tracked separately) — intentionally tolerated here.
 *
 * Dynamic routes use known-valid content slugs (see content/**).
 */
const ROUTES: string[] = [
  '/',
  '/talks',
  '/poesie',
  '/poesie/berg',
  '/post/hello-world',
  '/hydra',
  '/hydra/adenora',
  '/starry-nights',
  '/fleurs',
  '/cosmicfest',
  '/parvagues',
  '/parvagues/fiche',
  '/parvagues/live', // redirects to /parvagues
  '/parvagues/live/montreuil-algorave',
];

// Dev-only / third-party noise we deliberately ignore.
const IGNORABLE_ERRORS = [
  /Hydration failed/i,
  /Text content does not match/i,
  /error while hydrating/i,
  /switch to client rendering/i,
  /ResizeObserver loop/i,
];

const isGenuineError = (err: Error) =>
  !IGNORABLE_ERRORS.some((re) => re.test(err.message));

for (const route of ROUTES) {
  test(`route loads: ${route}`, async ({ page }) => {
    const pageErrors: Error[] = [];
    page.on('pageerror', (err) => pageErrors.push(err));

    const response = await page.goto(route, { waitUntil: 'domcontentloaded' });

    // Main document must not be a 4xx/5xx (redirects resolve to their target).
    expect(response, `no response for ${route}`).not.toBeNull();
    expect(response!.status(), `bad status for ${route}`).toBeLessThan(400);

    // The page must render something visible (catches blank/crashed renders).
    await expect(page.locator('body')).not.toBeEmpty();

    // Brief settle for hydration to surface any throw — capped so pages with
    // persistent embeds (never reach networkidle) don't hang the test.
    await page.waitForLoadState('networkidle', { timeout: 2500 }).catch(() => {});

    const genuine = pageErrors.filter(isGenuineError);
    expect(
      genuine,
      `uncaught exception(s) on ${route}:\n${genuine.map((e) => e.message).join('\n')}`,
    ).toHaveLength(0);
  });
}
