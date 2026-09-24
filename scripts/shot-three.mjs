// Screenshot helper for the WebGL brand scenes. The deferred loader waits for load + idle +
// intersection, so we give the page a few seconds before capturing.
// Usage: node scripts/shot-three.mjs <url> <out.png> <width> <height> [reduced-motion: 0|1]
import { chromium } from 'playwright';
const [, , url, out, w, h, reduced = '0'] = process.argv;
const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({
  viewport: { width: +w, height: +h },
  deviceScaleFactor: 1,
  reducedMotion: reduced === '1' ? 'reduce' : 'no-preference',
});
const errors = [];
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errors.push(`${m.type()}: ${m.text()}`); });
page.on('pageerror', (e) => errors.push(String(e)));
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(4000);
// Scroll through so every deferred scene intersects, then return to the top.
await page.evaluate(async () => {
  const step = window.innerHeight / 2;
  for (let y = 0; y < document.body.scrollHeight; y += step) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); }
  window.scrollTo(0, 0);
});
await page.waitForTimeout(2500);
const canvases = await page.evaluate(() => Array.from(document.querySelectorAll('canvas')).map((c) => ({ w: c.width, h: c.height, cssW: c.clientWidth, cssH: c.clientHeight })));
console.log('canvases:', JSON.stringify(canvases));
await page.screenshot({ path: out, fullPage: true });
console.log('errors:', errors.length ? errors : 'none');
await browser.close();
