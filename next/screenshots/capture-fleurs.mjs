import { chromium } from "playwright";

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1280, height: 800 },
  deviceScaleFactor: 2,
});
const page = await context.newPage();

const dir = new URL(".", import.meta.url).pathname;
const url = "http://localhost:3001/fleurs";

console.log("Loading page...");
await page.goto(url, { waitUntil: "networkidle" });

// Cumulative wait: 0s, 2s, 5s, 9s, 15s
const waits = [0, 2, 3, 4, 6];
let total = 0;
for (const wait of waits) {
  if (wait > 0) await page.waitForTimeout(wait * 1000);
  total += wait;
  await page.screenshot({
    path: `${dir}fleurs-${String(total).padStart(2, "0")}s.png`,
    fullPage: false,
  });
  console.log(`Screenshot at ~${total}s`);
}

// Mobile
await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(1500);
await page.screenshot({ path: `${dir}fleurs-mobile.png`, fullPage: false });
console.log("Mobile screenshot");

// Modal
const btn = page.locator("button.cta");
if (await btn.isVisible()) {
  await btn.click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${dir}fleurs-modal.png`, fullPage: false });
  console.log("Modal screenshot");
}

await browser.close();
console.log("Done!");
