// Screenshots the homepage platform gallery (tab list + active panel) at desktop and phone widths,
// then checks Radix Tabs keyboard operation. Usage: node scripts/shot-tabs.mjs [baseUrl] [outDir]
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const base = process.argv[2] ?? 'http://localhost:4196/';
const outDir = process.argv[3] ?? '/tmp/claude-1000/-home-raster-sarathi-dicom-camera/aa92de63-2f57-40cb-bea7-5a84b620701d/scratchpad';
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
try {
  for (const [name, viewport] of [['1440', { width: 1440, height: 900 }], ['360', { width: 360, height: 740 }]]) {
    const page = await browser.newPage({ viewport, deviceScaleFactor: 2 });
    await page.goto(base, { waitUntil: 'networkidle' });
    // The sticky site header would overlap an element screenshot; hide it for the capture only.
    await page.addStyleTag({ content: 'header { visibility: hidden !important; } *, *::before, *::after { animation: none !important; transition: none !important; }' });
    const section = page.locator('#platforms');
    await section.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500);
    await section.getByRole('tablist').scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    const list = section.getByRole('tablist');
    const panel = section.getByRole('tabpanel');
    const root = list.locator('..');
    // Reveal everything in the active panel (the reveal observer needs each figure to enter the viewport),
    // then capture the tabs root in page coordinates so the sticky header never overlaps the capture.
    await root.evaluate(async (el) => {
      const { top, height } = el.getBoundingClientRect();
      for (let y = 0; y <= height; y += window.innerHeight * 0.6) { window.scrollBy(0, y ? window.innerHeight * 0.6 : 0); await new Promise((r) => setTimeout(r, 120)); }
      window.scrollTo(0, window.scrollY + top - 96);
    });
    await page.waitForTimeout(400);
    const rect = await root.evaluate((el) => { const r = el.getBoundingClientRect(); return { x: r.x + window.scrollX, y: r.y + window.scrollY, width: r.width, height: r.height }; });
    // Grow the viewport to the tabs root so a plain (non full-page) clip captures the list plus the whole panel.
    const pad = 16;
    await page.setViewportSize({ width: viewport.width, height: Math.ceil(rect.height + pad * 2 + 160) });
    await page.evaluate((y) => window.scrollTo(0, y), Math.max(0, rect.y - pad - 120));
    await page.waitForTimeout(400);
    const box = await root.evaluate((el) => { const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; });
    const clip = { x: Math.max(0, box.x - pad), y: Math.max(0, box.y - pad), width: Math.min(viewport.width, box.width + pad * 2), height: box.height + pad * 2 };
    const out = join(outDir, `tabs-${name}.png`);
    await page.screenshot({ path: out, clip });
    await page.setViewportSize(viewport);
    await list.scrollIntoViewIfNeeded();
    // Tab list geometry: does it fit without horizontal overflow of the page?
    const geo = await list.evaluate((el) => ({
      scrollWidth: el.scrollWidth, clientWidth: el.clientWidth,
      docOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      tabs: [...el.querySelectorAll('[role=tab]')].map((t) => ({ name: t.getAttribute('aria-label') || t.textContent, w: Math.round(t.getBoundingClientRect().width) })),
    }));
    console.log(name, out, JSON.stringify(geo));

    // Keyboard: focus first tab, ArrowRight moves selection to the focused tab.
    const tabs = list.getByRole('tab');
    await tabs.first().focus();
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(100);
    const kb = await list.evaluate((el) => {
      const a = document.activeElement;
      return { focused: a?.textContent, selected: a?.getAttribute('aria-selected'), idx: [...el.querySelectorAll('[role=tab]')].indexOf(a) };
    });
    const acc = await tabs.nth(1).evaluate((t) => t.textContent);
    console.log(name, 'keyboard', JSON.stringify(kb), 'accessibleNameOf2nd=', await tabs.nth(1).getAttribute('aria-label') ?? '(from content)', 'text=', acc);
    if (kb.idx !== 1 || kb.selected !== 'true') throw new Error('ArrowRight did not move selection');
    await page.close();
  }
} finally {
  await browser.close();
}
