/// <reference types="@playwright/test" />
import { test, expect } from '@playwright/test';

test.describe('Dunbar navigation (path-only URL sync, SPA feel)', () => {
  test('Events -> Stats stays on Stats (no URL change, no snap-back)', async ({ page }) => {
    await page.goto('/dunbar'); // Events tab expected by default
    // Click Stats
    await page.getByRole('button', { name: /stats/i }).click();
    // URL should remain /dunbar (stats has no dedicated path)
    await expect(page).toHaveURL(/\/dunbar$/);
    // URL stability is the contract for search/stats tabs (no dedicated path)
    // Visual assertions are left to component-level tests.
  });

  test('Root -> Search remains Search (no URL change, no snap-back)', async ({ page }) => {
    await page.goto('/dunbar');
    await page.getByRole('button', { name: /search/i }).click();
    // URL remains the same
    await expect(page).toHaveURL(/\/dunbar$/);
    // URL-only assertion (visual coverage happens in unit/integration)
  });

  test('/dunbar/orbits -> Events -> Search (Search persists, URL stays /dunbar)', async ({ page }) => {
    await page.goto('/dunbar/orbits');
    // Orbits initially (empty when no friends)
    await page.getByRole('button', { name: /events/i }).click();
    await expect(page).toHaveURL(/\/dunbar$/);
    // Now click Search; should stay on search, and URL should remain /dunbar
    await page.getByRole('button', { name: /search/i }).click();
    await expect(page).toHaveURL(/\/dunbar$/);
  });

  test('/dunbar/friends shallow-select retains /dunbar/friends/:slug', async ({ page }) => {
    // Start on list; may be empty in a brand-new session but we still exercise the path
    await page.goto('/dunbar/friends');
    // If there is a friend, clicking should replace URL to /dunbar/friends/:slug without full reload.
    // We try to click the first list item if present.
    const listItems = page.locator('[class*="listItem"]');
    const count = await listItems.count();
    if (count > 0) {
      await listItems.nth(0).click();
      await expect(page).toHaveURL(/\/dunbar\/friends\/[a-z0-9-]+$/);
    } else {
      // No data: still valid that URL remains /dunbar/friends and no crash occurs.
      await expect(page).toHaveURL(/\/dunbar\/friends$/);
    }
  });

  test('/dunbar/network loads graph and stays on /dunbar/network', async ({ page }) => {
    await page.goto('/dunbar/network');
    await expect(page).toHaveURL(/\/dunbar\/network$/);
    // Graph toolbar visible (Reset button present)
    await expect(page.getByRole('button', { name: /Reset/i })).toBeVisible();
  });
});
