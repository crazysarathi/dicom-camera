// Automated verification against a running preview (default http://localhost:4173).
// - Screenshots at 360/390/768/1024/1440 widths (+ 844x390 mobile landscape) for every route
// - Horizontal overflow detection, console/page errors, missing images
// - axe-core WCAG 2.x A/AA scan per route (desktop + mobile)
// - Link/destination checks (store URLs, mailto routes, internal routes resolve)
// - Keyboard flows: skip link, mobile navigation dialog, FAQ disclosures, copy-email control, screenshot viewer
// Writes verification/report.json and verification/REPORT.md
import { chromium, firefox, webkit } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = process.env.BASE_URL || 'http://localhost:4173';
const OUT = path.join(ROOT, 'verification');
const SHOTS = path.join(OUT, 'screenshots');
await mkdir(SHOTS, { recursive: true });

const KNOWN = ['/', '/workflows/', '/enterprise/', '/integration/', '/privacy-and-retention/', '/download/', '/support/', '/contact/'];
const ROUTES = ['/', '/#/workflows/', '/#/enterprise/', '/#/integration/', '/#/privacy-and-retention/', '/#/download/', '/#/support/', '/#/contact/', '/#/this-page-does-not-exist/'];
const VIEWPORTS = [
  { name: '360', width: 360, height: 740 },
  { name: '390', width: 390, height: 844 },
  { name: '768', width: 768, height: 1024 },
  { name: '1024', width: 1024, height: 768 },
  { name: '1440', width: 1440, height: 900 },
  { name: '844x390-landscape', width: 844, height: 390 },
];
const EXPECT = {
  appStore: 'https://apps.apple.com/in/app/dicom-camera/id6459410698',
  googlePlay: 'https://play.google.com/store/apps/details?id=com.raster.dicomcamera',
  commercial: 'mailto:info@raster.in?subject=DICOM%20Camera%20hospital%20enquiry',
  support: 'mailto:support@raster.in?subject=DICOM%20Camera%20support',
};

const report = { base: BASE, generated: new Date().toISOString(), pages: [], keyboard: [], browsers: {}, summary: {} };
const slug = (r) => (r === '/' ? 'home' : r.replace(/^\/#\//, '').replace(/^\/|\/$/g, '').replace(/\//g, '-'));

const browser = await chromium.launch();
const context = await browser.newContext({ deviceScaleFactor: 1 });
await context.grantPermissions(['clipboard-read', 'clipboard-write']);

for (const route of ROUTES) {
  const pageReport = { route, viewports: [], axe: {}, links: {}, errors: [] };
  for (const vp of VIEWPORTS) {
    const page = await context.newPage();
    await page.setViewportSize({ width: vp.width, height: vp.height });
    const errors = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', (e) => errors.push(String(e)));
    page.on('requestfailed', (r) => errors.push(`requestfailed ${r.url()}`));
    const res = await page.goto(BASE + route, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    // Scroll through to trigger lazy images and reveals (slowly enough for ScrollSmoother's 0.9 s lag),
    // pause at the bottom, then return to the top.
    await page.evaluate(async () => {
      const h = document.documentElement.scrollHeight;
      for (let y = 0; y < h; y += 400) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
      window.scrollTo(0, h);
      await new Promise((r) => setTimeout(r, 1500));
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(1200);
    const metrics = await page.evaluate(() => {
      const de = document.documentElement;
      const brokenImgs = [...document.images].filter((i) => i.complete && i.naturalWidth === 0 && !i.hidden && i.loading !== 'lazy').map((i) => i.currentSrc || i.src);
      const wide = [...document.querySelectorAll('body *')].filter((el) => { const r = el.getBoundingClientRect(); return r.right > de.clientWidth + 1 && getComputedStyle(el).position !== 'fixed'; }).slice(0, 5).map((el) => `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}.${[...el.classList].slice(0, 3).join('.')}`);
      const hidden = [...document.querySelectorAll('[data-reveal], [data-reveal-stagger] > *, [data-split]')].filter((el) => { const cs = getComputedStyle(el); return parseFloat(cs.opacity) < 0.95 || cs.visibility === 'hidden'; }).slice(0, 5).map((el) => `${el.tagName.toLowerCase()}.${[...el.classList].slice(0, 2).join('.')}`);
      return { scrollWidth: de.scrollWidth, clientWidth: de.clientWidth, overflow: de.scrollWidth > de.clientWidth + 1, wide, brokenImgs, h1: document.querySelectorAll('h1').length, title: document.title, hiddenAfterScroll: hidden };
    });
    const shotName = `${slug(route)}-${vp.name}.png`;
    if (vp.name === '390' || vp.name === '1440') {
      // Full-page captures: GSAP ScrollSmoother (desktop) transforms the content, which breaks stitched
      // full-page screenshots, so capture with reduced motion emulated (smoother off, reveals off).
      const shot = await context.newPage();
      await shot.emulateMedia({ reducedMotion: 'reduce' });
      await shot.setViewportSize({ width: vp.width, height: vp.height });
      await shot.goto(BASE + route, { waitUntil: 'networkidle' });
      await shot.evaluate(async () => { const h = document.documentElement.scrollHeight; for (let y = 0; y < h; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 50)); } window.scrollTo(0, 0); });
      await shot.waitForTimeout(800);
      await shot.screenshot({ path: path.join(SHOTS, shotName), fullPage: true });
      await shot.close();
    } else {
      await page.screenshot({ path: path.join(SHOTS, shotName), fullPage: false });
    }
    pageReport.viewports.push({ ...vp, status: res?.status(), ...metrics, errors, screenshot: `screenshots/${shotName}` });
    if (vp.name === '1440' || vp.name === '390') {
      const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']).analyze();
      pageReport.axe[vp.name] = axe.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.slice(0, 5).map((n) => n.target.join(' ')) }));
    }
    if (vp.name === '1440') {
      const links = await page.evaluate(() => [...document.querySelectorAll('a[href]')].map((a) => ({ href: a.getAttribute('href'), text: (a.textContent || a.getAttribute('aria-label') || '').trim().slice(0, 60), img: a.querySelector('img')?.getAttribute('alt') || null })));
      // Hash routing: internal links look like "#/workflows/"; they must map to a known route (or a fragment on a known route).
      const internal = [...new Set(links.map((l) => l.href).filter((h) => h.startsWith('#/') || (h.startsWith('/') && !h.startsWith('//'))))];
      const statuses = {};
      for (const h of internal) {
        const routePath = h.startsWith('#/') ? h.slice(1).split('#')[0] : h.split('#')[0];
        if (h.startsWith('#/')) statuses[h] = KNOWN.includes(routePath) ? 200 : 404;
        else { const r = await page.request.get(BASE + routePath); statuses[h] = r.status(); }
      }
      pageReport.links = {
        total: links.length,
        appStoreOk: links.some((l) => l.href === EXPECT.appStore), googlePlayOk: links.some((l) => l.href === EXPECT.googlePlay),
        commercialMail: links.filter((l) => l.href.startsWith('mailto:info@')).map((l) => l.href), supportMail: links.filter((l) => l.href.startsWith('mailto:support@')).map((l) => l.href),
        badMailto: links.filter((l) => l.href.startsWith('mailto:') && ![EXPECT.commercial, EXPECT.support].includes(l.href)).map((l) => l.href),
        internalStatuses: statuses, emptyText: links.filter((l) => !l.text && !l.img).map((l) => l.href), hashLinks: links.filter((l) => l.href === '#' || l.href === '').length,
      };
    }
    await page.close();
  }
  report.pages.push(pageReport);
  console.log('checked', route);
}

// Keyboard flows (Chromium)
async function flow(name, fn) {
  const page = await context.newPage();
  try { const r = await fn(page); report.keyboard.push({ name, pass: true, ...r }); console.log('PASS', name); }
  catch (e) { report.keyboard.push({ name, pass: false, error: String(e) }); console.log('FAIL', name, e.message); }
  finally { await page.close(); }
}
await flow('skip link appears on Tab and moves focus to main', async (page) => {
  await page.setViewportSize({ width: 1440, height: 900 }); await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await page.keyboard.press('Tab');
  const active = await page.evaluate(() => ({ text: document.activeElement?.textContent, visible: document.activeElement?.getBoundingClientRect().width > 0 }));
  if (!/skip to content/i.test(active.text || '') || !active.visible) throw new Error('skip link not focused/visible: ' + JSON.stringify(active));
  await page.keyboard.press('Enter'); await page.waitForTimeout(200);
  const id = await page.evaluate(() => document.activeElement?.id || location.hash);
  if (id !== 'main' && id !== '#main') throw new Error('focus not on main: ' + id);
  return {};
});
await flow('mobile navigation opens with keyboard, traps focus, Escape closes and returns focus', async (page) => {
  await page.setViewportSize({ width: 390, height: 844 }); await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  const btn = page.getByRole('button', { name: /open navigation/i }); await btn.focus(); await page.keyboard.press('Enter');
  await page.waitForTimeout(400);
  const dialog = page.locator('#mobile-navigation'); if (!(await dialog.isVisible())) throw new Error('dialog not visible');
  const inside = await page.evaluate(() => !!document.activeElement?.closest('#mobile-navigation')); if (!inside) throw new Error('focus not inside dialog');
  // While the dialog is open, Radix hides the rest of the page from the accessibility tree, so read the trigger by CSS.
  const expanded = await page.evaluate(() => document.querySelector('button[aria-label="Open navigation"]')?.getAttribute('aria-expanded'));
  const linkCount = await dialog.getByRole('link').count(); if (linkCount < 5) throw new Error('expected nav links in dialog, got ' + linkCount);
  await page.keyboard.press('Escape'); await page.waitForTimeout(400);
  if (await dialog.isVisible().catch(() => false)) throw new Error('dialog still visible after Escape');
  const back = await page.evaluate(() => document.activeElement?.getAttribute('aria-label')); if (!/open navigation/i.test(back || '')) throw new Error('focus did not return to trigger: ' + back);
  return { ariaExpandedWhenOpen: expanded };
});
await flow('FAQ disclosures open/close with keyboard on /support/', async (page) => {
  await page.setViewportSize({ width: 1440, height: 900 }); await page.goto(BASE + '/#/support/', { waitUntil: 'networkidle' });
  const summaries = page.locator('details > summary'); const n = await summaries.count(); if (n < 10) throw new Error('expected 10 FAQ items, found ' + n);
  await summaries.first().focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(150);
  const open = await page.evaluate(() => document.querySelector('details')?.open); if (!open) throw new Error('details did not open');
  await page.keyboard.press('Space'); await page.waitForTimeout(150);
  const closed = await page.evaluate(() => !document.querySelector('details')?.open); if (!closed) throw new Error('details did not close');
  return { faqCount: n };
});
for (const [route, addr] of [['/#/support/', 'support@raster.in'], ['/#/contact/', 'info@raster.in']]) {
  await flow(`copy email control on ${route} copies ${addr} and confirms`, async (page) => {
    await page.setViewportSize({ width: 1440, height: 900 }); await page.goto(BASE + route, { waitUntil: 'networkidle' });
    const btn = page.getByRole('button', { name: /copy email address/i }).first(); await btn.focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(500);
    const clip = await page.evaluate(() => navigator.clipboard.readText()); if (clip !== addr) throw new Error('clipboard=' + clip);
    const confirmed = await page.evaluate(() => /copied/i.test(document.body.innerText)); if (!confirmed) throw new Error('no visible confirmation');
    const visibleAddr = await page.evaluate((a) => document.body.innerText.includes(a), addr); if (!visibleAddr) throw new Error('address not visible as text');
    return {};
  });
}
await flow('screenshot viewer (if present) opens, traps focus, Escape closes and returns focus', async (page) => {
  await page.setViewportSize({ width: 1440, height: 900 }); await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  const triggers = page.getByRole('button', { name: /view larger screenshot/i }); const n = await triggers.count();
  if (n === 0) return { skipped: 'no viewer present' };
  await triggers.first().scrollIntoViewIfNeeded(); await triggers.first().focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(500);
  const dlg = page.getByRole('dialog'); if (!(await dlg.isVisible())) throw new Error('viewer dialog not visible');
  const inside = await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]')); if (!inside) throw new Error('focus not inside viewer');
  await page.keyboard.press('ArrowRight'); await page.waitForTimeout(200);
  await page.keyboard.press('Escape'); await page.waitForTimeout(400);
  if (await dlg.isVisible().catch(() => false)) throw new Error('viewer still open after Escape');
  const back = await page.evaluate(() => document.activeElement?.getAttribute('aria-label') || document.activeElement?.textContent); if (!/view larger/i.test(back || '')) throw new Error('focus did not return: ' + back);
  return { viewerTriggers: n };
});
await flow('platform tabs (if present) are keyboard operable', async (page) => {
  await page.setViewportSize({ width: 1440, height: 900 }); await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  const tabs = page.getByRole('tab'); const n = await tabs.count(); if (n === 0) return { skipped: 'no tabs' };
  await tabs.first().focus(); await page.keyboard.press('ArrowRight'); await page.waitForTimeout(200);
  const selected = await page.evaluate(() => document.activeElement?.getAttribute('aria-selected')); if (selected !== 'true') throw new Error('arrow key did not move selection');
  return { tabs: n };
});
await flow('200% zoom equivalent (720px wide, desktop UA) has no horizontal overflow on home', async (page) => {
  await page.setViewportSize({ width: 720, height: 450 }); await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  const o = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth); if (o > 1) throw new Error('overflow ' + o); return {};
});
await flow('legacy path URLs redirect to hash routes (/workflows/ → /#/workflows/)', async (page) => {
  await page.setViewportSize({ width: 1280, height: 800 }); await page.goto(BASE + '/workflows/', { waitUntil: 'load' }); await page.waitForTimeout(1500);
  const url = page.url(); if (!url.endsWith('/#/workflows/')) throw new Error('landed on ' + url);
  const h1 = await page.locator('h1').first().textContent(); if (!/clinical capture/i.test(h1 || '')) throw new Error('h1=' + h1);
  return { url };
});
await flow('back-to-top control appears after scrolling, is keyboard operable and returns to the top', async (page) => {
  await page.setViewportSize({ width: 390, height: 844 }); await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  const btn = page.locator('button[aria-label="Back to top"]');
  const hiddenAtTop = await btn.evaluate((b) => b.getAttribute('aria-hidden') === 'true' && b.tabIndex === -1); if (!hiddenAtTop) throw new Error('control not hidden at top');
  await page.evaluate(() => window.scrollTo(0, 2000)); await page.waitForTimeout(600);
  const shown = await btn.evaluate((b) => b.getAttribute('aria-hidden') !== 'true' && getComputedStyle(b).opacity === '1'); if (!shown) throw new Error('control not shown after scrolling');
  await btn.focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(1500);
  const y = await page.evaluate(() => window.scrollY); if (y > 2) throw new Error('did not return to top, scrollY=' + y);
  return {};
});
await context.close(); await browser.close();

// Cross-browser smoke: Firefox and WebKit load home + support without page errors.
for (const [name, type] of [['firefox', firefox], ['webkit', webkit]]) {
  try {
    const b = await type.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
    const errs = []; p.on('pageerror', (e) => errs.push(String(e)));
    for (const r of ['/', '/#/support/', '/#/integration/']) { await p.goto(BASE + r, { waitUntil: 'load' }); await p.waitForTimeout(800); }
    const overflow = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    await p.setViewportSize({ width: 390, height: 844 }); await p.goto(BASE + '/', { waitUntil: 'load' }); await p.waitForTimeout(500);
    await p.screenshot({ path: path.join(SHOTS, `home-390-${name}.png`), fullPage: true });
    const mOverflow = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    await b.close();
    report.browsers[name] = { ran: true, pageErrors: errs, desktopOverflow: overflow, mobileOverflow: mOverflow };
  } catch (e) { report.browsers[name] = { ran: false, error: String(e) }; }
  console.log('browser', name, report.browsers[name].ran ? 'ok' : 'unavailable');
}

// Summary
const overflowIssues = report.pages.flatMap((p) => p.viewports.filter((v) => v.overflow).map((v) => `${p.route} @${v.name}: scrollWidth ${v.scrollWidth} > ${v.clientWidth} (${v.wide.join(', ')})`));
const consoleErrors = report.pages.flatMap((p) => p.viewports.flatMap((v) => v.errors.map((e) => `${p.route} @${v.name}: ${e}`)));
const axeViolations = report.pages.flatMap((p) => Object.entries(p.axe).flatMap(([vp, vs]) => vs.map((v) => `${p.route} @${vp}: [${v.impact}] ${v.id} — ${v.help} (${v.nodes.join(' | ')})`)));
const h1Issues = report.pages.flatMap((p) => p.viewports.filter((v) => v.h1 !== 1).map((v) => `${p.route} @${v.name}: ${v.h1} h1`));
const brokenImgs = report.pages.flatMap((p) => p.viewports.flatMap((v) => v.brokenImgs.map((i) => `${p.route} @${v.name}: ${i}`)));
const hiddenContent = report.pages.flatMap((p) => p.viewports.filter((v) => v.hiddenAfterScroll?.length).map((v) => `${p.route} @${v.name}: ${v.hiddenAfterScroll.join(', ')}`));
const linkIssues = report.pages.flatMap((p) => { const l = p.links; if (!l || !l.total) return []; const out = []; if (l.badMailto?.length) out.push(`${p.route}: unexpected mailto ${l.badMailto.join(', ')}`); for (const [h, s] of Object.entries(l.internalStatuses || {})) if (s !== 200) out.push(`${p.route}: ${h} → ${s}`); if (l.emptyText?.length) out.push(`${p.route}: links without accessible text ${l.emptyText.join(', ')}`); if (l.hashLinks) out.push(`${p.route}: ${l.hashLinks} empty '#' links`); return out; });
report.summary = { overflowIssues, consoleErrors: [...new Set(consoleErrors)], axeViolations, h1Issues, brokenImgs, hiddenContent, linkIssues, keyboardFailures: report.keyboard.filter((k) => !k.pass).map((k) => `${k.name}: ${k.error}`) };
await writeFile(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2));
const md = `# Automated verification report\n\nBase: ${BASE}  \nGenerated: ${report.generated}\n\n## Summary\n\n| Check | Result |\n| --- | --- |\n| Horizontal overflow | ${overflowIssues.length ? overflowIssues.length + ' issue(s)' : 'none across ' + ROUTES.length * VIEWPORTS.length + ' route×viewport combinations'} |\n| Console/page errors | ${report.summary.consoleErrors.length || 'none'} |\n| axe violations (WCAG 2.x A/AA + best-practice) | ${axeViolations.length || 'none'} |\n| Exactly one h1 per page | ${h1Issues.length ? h1Issues.length + ' issue(s)' : 'yes'} |\n| Broken images | ${brokenImgs.length || 'none'} |\n| Content still hidden after scrolling (reveal/split) | ${hiddenContent.length || 'none'} |\n| Link/destination issues | ${linkIssues.length || 'none'} |\n| Keyboard flows | ${report.keyboard.filter((k) => k.pass).length}/${report.keyboard.length} passed |\n| Firefox | ${report.browsers.firefox?.ran ? `ran; ${report.browsers.firefox.pageErrors.length} page errors; overflow desktop ${report.browsers.firefox.desktopOverflow}px / mobile ${report.browsers.firefox.mobileOverflow}px` : 'not run: ' + report.browsers.firefox?.error} |\n| WebKit | ${report.browsers.webkit?.ran ? `ran; ${report.browsers.webkit.pageErrors.length} page errors; overflow desktop ${report.browsers.webkit.desktopOverflow}px / mobile ${report.browsers.webkit.mobileOverflow}px` : 'not run: ' + report.browsers.webkit?.error} |\n\n## Details\n\n${['overflowIssues', 'consoleErrors', 'axeViolations', 'h1Issues', 'brokenImgs', 'hiddenContent', 'linkIssues', 'keyboardFailures'].map((k) => `### ${k}\n\n${report.summary[k].length ? report.summary[k].map((x) => `- ${x}`).join('\n') : '- none'}`).join('\n\n')}\n\n## Store and email destinations per page (1440px)\n\n| Route | App Store | Google Play | mailto info@ | mailto support@ |\n| --- | --- | --- | --- | --- |\n${report.pages.map((p) => `| ${p.route} | ${p.links.appStoreOk ? 'exact' : '—'} | ${p.links.googlePlayOk ? 'exact' : '—'} | ${p.links.commercialMail?.length || 0} | ${p.links.supportMail?.length || 0} |`).join('\n')}\n\n## Keyboard flows\n\n${report.keyboard.map((k) => `- ${k.pass ? 'PASS' : 'FAIL'} — ${k.name}${k.skipped ? ' (skipped: ' + k.skipped + ')' : ''}${k.error ? ': ' + k.error : ''}`).join('\n')}\n`;
await writeFile(path.join(OUT, 'REPORT.md'), md);
console.log('\n' + md.split('## Details')[0]);
