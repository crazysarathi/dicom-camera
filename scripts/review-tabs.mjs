// Independent review of the platform gallery tabs: captures the tablist at 1440/360 and checks
// geometry, targets, a11y names, keyboard, viewer focus return and console errors.
// Usage: node scripts/review-tabs.mjs [baseUrl] [outDir]
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const base = process.argv[2] ?? 'http://localhost:4198/';
const outDir = process.argv[3] ?? '/tmp/claude-1000/-home-raster-sarathi-dicom-camera/aa92de63-2f57-40cb-bea7-5a84b620701d/scratchpad';
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const results = {};
try {
  for (const [name, viewport] of [['1440', { width: 1440, height: 900 }], ['360', { width: 360, height: 740 }]]) {
    const page = await browser.newPage({ viewport, deviceScaleFactor: 2 });
    const errors = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
    await page.goto(base, { waitUntil: 'networkidle' });
    const section = page.locator('#platforms');
    const list = section.getByRole('tablist');
    await list.scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollBy(0, -120));
    await page.waitForTimeout(1200);
    // Hide sticky header for the capture only, and freeze animation so the pill is at rest.
    await page.addStyleTag({ content: 'header{visibility:hidden!important} *,*::before,*::after{animation:none!important;transition:none!important}' });
    await page.waitForTimeout(200);
    const listShot = join(outDir, `review-tablist-${name}.png`);
    const listBox = await list.boundingBox();
    await page.screenshot({ path: listShot, clip: { x: Math.max(0, listBox.x - 12), y: Math.max(0, listBox.y - 12), width: Math.min(viewport.width, listBox.width + 24), height: listBox.height + 24 } });

    const geo = await list.evaluate((el) => {
      const tabs = [...el.querySelectorAll('[role=tab]')];
      const cs = getComputedStyle(el);
      return {
        list: { scrollWidth: el.scrollWidth, clientWidth: el.clientWidth, overflowX: cs.overflowX, flexWrap: cs.flexWrap },
        docScrollWidth: document.documentElement.scrollWidth, innerWidth: window.innerWidth,
        tabs: tabs.map((t) => {
          const r = t.getBoundingClientRect();
          const svg = t.querySelector('svg');
          const sr = svg?.getBoundingClientRect();
          const pill = t.querySelector('span[aria-hidden]');
          const pr = pill ? pill.getBoundingClientRect() : null;
          const ps = pill ? getComputedStyle(pill).display : null;
          // Label text node
          const range = document.createRange();
          const textNode = [...t.childNodes].find((n) => n.nodeType === 3 && n.textContent.trim());
          let tr = null;
          if (textNode) { range.selectNodeContents(textNode); tr = range.getBoundingClientRect(); }
          const st = getComputedStyle(t);
          return {
            text: t.textContent, ariaLabel: t.getAttribute('aria-label'), state: t.getAttribute('data-state'), selected: t.getAttribute('aria-selected'),
            w: +r.width.toFixed(1), h: +r.height.toFixed(1), bg: st.backgroundColor, color: st.color, shadow: st.boxShadow,
            icon: svg ? { present: true, w: +sr.width.toFixed(1), h: +sr.height.toFixed(1), cy: +(sr.top + sr.height / 2).toFixed(1), ariaHidden: svg.getAttribute('aria-hidden'), color: getComputedStyle(svg).color } : { present: false },
            label: tr ? { cy: +(tr.top + tr.height / 2).toFixed(1), h: +tr.height.toFixed(1) } : null,
            pill: pill ? { display: ps, ariaHidden: pill.getAttribute('aria-hidden'), cy: pr ? +(pr.top + pr.height / 2).toFixed(1) : null, w: +pr.width.toFixed(1), h: +pr.height.toFixed(1), text: pill.textContent } : null,
          };
        }),
      };
    });
    // Accessible names via aria snapshot
    const snapshot = await list.ariaSnapshot();

    // Keyboard
    const tabs = list.getByRole('tab');
    await tabs.first().focus();
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(150);
    const kb1 = await page.evaluate(() => ({ text: document.activeElement?.textContent, selected: document.activeElement?.getAttribute('aria-selected'), role: document.activeElement?.getAttribute('role') }));
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(150);
    const kb2 = await page.evaluate(() => ({ text: document.activeElement?.textContent, selected: document.activeElement?.getAttribute('aria-selected') }));
    await page.keyboard.press('ArrowRight'); // loops back
    await page.waitForTimeout(150);
    const kb3 = await page.evaluate(() => ({ text: document.activeElement?.textContent, selected: document.activeElement?.getAttribute('aria-selected') }));
    await page.keyboard.press('Home');
    await page.waitForTimeout(150);
    const panelCount = await section.getByRole('tabpanel').count();
    const panelName = await section.getByRole('tabpanel').first().evaluate((p) => p.getAttribute('aria-labelledby') && document.getElementById(p.getAttribute('aria-labelledby'))?.textContent);
    const imgs = await section.locator('img').count();

    // Viewer: open with the first enlarge button, check focus, ArrowRight, Escape, focus return.
    const enlarge = section.getByRole('tabpanel').getByRole('button').first();
    await enlarge.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    const enlargeName = await enlarge.evaluate((b) => b.textContent);
    await enlarge.focus();
    await page.keyboard.press('Enter');
    const dialog = page.getByRole('dialog');
    await dialog.waitFor({ state: 'visible', timeout: 3000 });
    const focusInDialog = await page.evaluate(() => !!document.activeElement?.closest('[role=dialog]'));
    const cap1 = await dialog.locator('p').last().textContent();
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(150);
    const cap2 = await dialog.locator('p').last().textContent();
    const dialogName = await dialog.getAttribute('aria-labelledby');
    await page.keyboard.press('Escape');
    await dialog.waitFor({ state: 'hidden', timeout: 3000 });
    await page.waitForTimeout(250);
    const focusReturned = await enlarge.evaluate((b) => document.activeElement === b);
    // Also close via the close button path: open with mouse and click the X
    await enlarge.click();
    await dialog.waitFor({ state: 'visible', timeout: 3000 });
    await dialog.getByRole('button', { name: /close/i }).click();
    await dialog.waitFor({ state: 'hidden', timeout: 3000 });
    await page.waitForTimeout(250);
    const focusReturnedX = await enlarge.evaluate((b) => document.activeElement === b);
    const bodyAriaHidden = await page.evaluate(() => document.querySelector('#root')?.getAttribute('aria-hidden'));

    results[name] = { shot: listShot, geo, snapshot, kb: [kb1, kb2, kb3], panelCount, panelName, imgs, viewer: { enlargeName, focusInDialog, cap1, cap2, dialogName, focusReturned, focusReturnedX, rootAriaHiddenAfter: bodyAriaHidden }, errors };
    await page.close();
  }
} finally {
  await browser.close();
}
console.log(JSON.stringify(results, null, 1));
