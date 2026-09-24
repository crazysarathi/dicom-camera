// Captures the ConnectivityScene panel on the homepage and inside the Integration hero aside.
// Usage: node scripts/shot-connectivity.mjs <outDir> [suffix] [reduced-motion: 0|1] [width] [height] [deviceScaleFactor]
// The deferred loader waits for load + idle + intersection, so the target is scrolled into view
// and given ~4.5s before the element screenshot is taken. Prints console errors/warnings.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const [, , outDir = '.', suffix = '1', reduced = '0', width = '1440', height = '900', dsf = '1'] = process.argv;
mkdirSync(outDir, { recursive: true });
const base = 'http://localhost:4195';

const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
const context = await browser.newContext({
  viewport: { width: +width, height: +height },
  deviceScaleFactor: +dsf,
  reducedMotion: reduced === '1' ? 'reduce' : 'no-preference',
});
const page = await context.newPage();
const issues = [];
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') issues.push(`${m.type()}: ${m.text()}`); });
page.on('pageerror', (e) => issues.push(`pageerror: ${e}`));

/** Finds the closest positioned ancestor of the deferred scene wrapper (the visual panel). */
async function capture(url, selectorHint, out) {
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  const target = page.locator(selectorHint).first();
  const count = await target.count();
  if (!count) { console.log(`${out}: no panel (${selectorHint}) - skipped`); return; }
  const visible = await target.isVisible();
  if (!visible) { console.log(`${out}: panel hidden at this width - skipped`); return; }
  await target.scrollIntoViewIfNeeded();
  await page.waitForTimeout(4500);
  const info = await target.evaluate((el) => {
    const c = el.querySelector('canvas');
    const r = el.getBoundingClientRect();
    return { panel: [Math.round(r.width), Math.round(r.height)], canvas: c ? [c.width, c.height, c.clientWidth, c.clientHeight] : null };
  });
  console.log(`${out}:`, JSON.stringify(info));
  await target.screenshot({ path: out });
}

await capture(`${base}/`, '#connectivity .aspect-\\[4\\/3\\]', join(outDir, `connectivity-${suffix}.png`));
await capture(`${base}/#/integration/`, '.aspect-\\[16\\/7\\]', join(outDir, `connectivity-integration-${suffix}.png`));

// Full-page context shot of the homepage section so the panel can be judged next to its text.
await page.goto(`${base}/`, { waitUntil: 'networkidle' });
const section = page.locator('#connectivity');
if (await section.count()) {
  await section.scrollIntoViewIfNeeded();
  await page.waitForTimeout(4500);
  await section.screenshot({ path: join(outDir, `connectivity-section-${suffix}.png`) });
}

console.log('issues:', issues.length ? issues : 'none');
await browser.close();
