/**
 * Take screenshots of any page at desktop + mobile viewports.
 *
 * Usage:
 *   yarn node scripts/screenshots.js [url] [output-dir]
 *   (must use `yarn node` for PnP resolution)
 *
 * Defaults:
 *   url:        http://localhost:3000/parvagues
 *   output-dir: /tmp/screenshots
 *
 * Scrolls through the page and captures each viewport-height chunk.
 * Also captures anchored sections (#tour, #music, #video, #booking).
 */
// Use @playwright/test's bundled browser launcher
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = process.argv[2] || 'http://localhost:3000/parvagues';
const OUT_DIR = process.argv[3] || '/tmp/screenshots';

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
];

const SECTIONS = ['tour', 'music', 'video', 'booking'];

async function captureViewport({ name, width, height }) {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  // Wait for content to render + images to load
  await new Promise((r) => setTimeout(r, 3000));

  // Full-page screenshot
  await page.screenshot({ path: path.join(OUT_DIR, `${name}-full.png`), fullPage: true });

  // Hero (above the fold)
  await page.screenshot({ path: path.join(OUT_DIR, `${name}-hero.png`) });

  // Scroll-based captures (each viewport height)
  const totalHeight = await page.evaluate(() => document.body.scrollHeight);
  const chunks = Math.ceil(totalHeight / height);
  for (let i = 1; i < Math.min(chunks, 8); i++) {
    await page.evaluate((y) => window.scrollTo(0, y), i * height);
    await new Promise((r) => setTimeout(r, 400));
    await page.screenshot({ path: path.join(OUT_DIR, `${name}-scroll-${i}.png`) });
  }

  // Section-anchored captures
  for (const id of SECTIONS) {
    const found = await page.evaluate((sectionId) => {
      const el = document.querySelector(`#${sectionId}`);
      if (el) { el.scrollIntoView({ behavior: 'instant' }); return true; }
      return false;
    }, id);
    if (found) {
      await new Promise((r) => setTimeout(r, 400));
      await page.screenshot({ path: path.join(OUT_DIR, `${name}-${id}.png`) });
    }
  }

  await browser.close();
  console.log(`  ✓ ${name} (${width}×${height}): ${chunks} scroll chunks + ${SECTIONS.length} sections`);
}

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  console.log(`Capturing ${BASE_URL} → ${OUT_DIR}/\n`);

  for (const vp of VIEWPORTS) {
    await captureViewport(vp);
  }

  const files = fs.readdirSync(OUT_DIR).filter((f) => f.endsWith('.png'));
  console.log(`\nDone! ${files.length} screenshots in ${OUT_DIR}/`);
})();
