// Automated verification against a running preview (default http://localhost:4173).
// - Screenshots at 360/390/768/1024/1440 widths (+ 844x390 mobile landscape) for every route
// - Horizontal overflow detection, console/page errors, missing images
// - axe-core WCAG 2.x A/AA scan per route (desktop + mobile)
// - Link/destination checks (store URLs, mailto routes, internal routes resolve)
// - Keyboard flows: skip link, mobile navigation dialog, FAQ disclosures, copy-email control, screenshot viewer,
//   print presentation, compression filter, conformance draft download, Enterprise Manager call to action
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

const KNOWN = ['/', '/workflows/', '/enterprise/', '/integration/', '/compression/', '/conformance/', '/privacy-and-retention/', '/download/', '/support/', '/contact/'];
const ROUTES = ['/', '/#/workflows/', '/#/enterprise/', '/#/integration/', '/#/compression/', '/#/conformance/', '/#/privacy-and-retention/', '/#/download/', '/#/support/', '/#/contact/', '/#/this-page-does-not-exist/'];
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
  enterpriseManager: 'mailto:info@raster.in?subject=DICOM%20Camera%20Enterprise%20Manager%20enquiry',
  support: 'mailto:support@raster.in?subject=DICOM%20Camera%20support',
};
const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];
const scrollThrough = async (page) => page.evaluate(async () => { const h = document.documentElement.scrollHeight; for (let y = 0; y < h; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 50)); } window.scrollTo(0, 0); });

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
      const axe = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
      pageReport.axe[vp.name] = axe.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.slice(0, 5).map((n) => n.target.join(' ')) }));
    }
    if (vp.name === '1440') {
      const links = await page.evaluate(() => [...document.querySelectorAll('a[href]')].map((a) => ({ href: a.getAttribute('href'), text: (a.textContent || a.getAttribute('aria-label') || '').trim().slice(0, 60), img: a.querySelector('img')?.getAttribute('alt') || null })));
      // Hash routing: internal links look like "#/workflows/"; they must map to a known route (or a fragment on a known route).
      const internal = [...new Set(links.map((l) => l.href).filter((h) => h.startsWith('#/') || (h.startsWith('/') && !h.startsWith('//'))))];
      const statuses = {};
      for (const h of internal) {
        const routePath = (h.startsWith('#/') ? h.slice(1).split('#')[0] : h.split('#')[0]).split('?')[0];
        if (h.startsWith('#/')) statuses[h] = KNOWN.includes(routePath) ? 200 : 404;
        else { const r = await page.request.get(BASE + routePath); statuses[h] = r.status(); }
      }
      pageReport.links = {
        total: links.length,
        appStoreOk: links.some((l) => l.href === EXPECT.appStore), googlePlayOk: links.some((l) => l.href === EXPECT.googlePlay),
        commercialMail: links.filter((l) => l.href.startsWith('mailto:info@')).map((l) => l.href), supportMail: links.filter((l) => l.href.startsWith('mailto:support@')).map((l) => l.href),
        badMailto: links.filter((l) => l.href.startsWith('mailto:') && ![EXPECT.commercial, EXPECT.enterpriseManager, EXPECT.support].includes(l.href)).map((l) => l.href),
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
  const pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(String(e)));
  try {
    const r = await fn(page);
    if (pageErrors.length) throw new Error('page errors: ' + pageErrors.join('; '));
    report.keyboard.push({ name, pass: true, ...r }); console.log('PASS', name);
  }
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

// ---- Print presentation ----
await flow('print media hides the fixed chrome and shows the document print header on the conformance page', async (page) => {
  await page.setViewportSize({ width: 1440, height: 900 }); await page.goto(BASE + '/#/conformance/', { waitUntil: 'networkidle' });
  await page.emulateMedia({ media: 'print' }); await page.waitForTimeout(200);
  const r = await page.evaluate(() => ({ bg: getComputedStyle(document.body).backgroundColor, header: getComputedStyle(document.querySelector('header')).display, printHeader: getComputedStyle(document.querySelector('.print-only')).display, text: document.querySelector('.print-only')?.textContent || '' }));
  await page.emulateMedia({ media: 'screen' });
  if (r.bg !== 'rgb(255, 255, 255)' || r.header !== 'none' || r.printHeader !== 'block' || !/DCAM-DCS-001/.test(r.text) || !/Draft - implementation review pending/.test(r.text)) throw new Error(JSON.stringify(r));
  return r;
});
await flow('mobile navigation sheet lists the navigation links and the download action', async (page) => {
  await page.setViewportSize({ width: 390, height: 844 }); await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /open navigation/i }).click(); await page.waitForTimeout(400);
  const dialog = page.locator('#mobile-navigation');
  const links = await dialog.getByRole('link').allTextContents();
  if (links.length < 5 || !links.some((t) => /get the app/i.test(t))) throw new Error('sheet links: ' + links.join(', '));
  await page.keyboard.press('Escape'); await page.waitForTimeout(300);
  return { links };
});

// ---- Compression guide, conformance draft, Enterprise Manager ----
await flow('compression comparison: the unfiltered table is the default; the filter is keyboard operable and keeps multi-mode families', async (page) => {
  await page.setViewportSize({ width: 1440, height: 900 }); await page.goto(BASE + '/#/compression/', { waitUntil: 'networkidle' });
  const rows = () => page.evaluate(() => [...document.querySelectorAll('main table tbody th[scope="row"]')].map((th) => th.textContent.trim()));
  const all = await rows(); if (all.length !== 8) throw new Error('expected 8 formats, got ' + all.join(', '));
  const caption = await page.locator('main table caption').first().textContent(); if (!/not measured DICOM Camera benchmarks/.test(caption || '')) throw new Error('caption: ' + caption);
  const group = page.getByRole('group', { name: /show formats/i });
  await group.getByRole('radio', { name: /^all modes$/i }).focus(); await page.keyboard.press('ArrowRight'); await page.waitForTimeout(200);
  const lossless = await rows();
  for (const f of ['DICOM RLE', 'JPEG, lossless', 'JPEG-LS', 'JPEG 2000', 'HTJ2K', 'JPEG XL']) if (!lossless.includes(f)) throw new Error('Lossless view missing ' + f);
  if (lossless.includes('JPEG, lossy') || lossless.includes('Uncompressed')) throw new Error('Lossless view shows non-lossless rows');
  await page.keyboard.press('ArrowRight'); await page.waitForTimeout(200);
  const near = await rows(); if (near.join() !== 'JPEG-LS') throw new Error('Near-lossless view: ' + near.join(', '));
  await page.keyboard.press('ArrowRight'); await page.waitForTimeout(200);
  const lossy = await rows(); for (const f of ['JPEG, lossy', 'JPEG 2000', 'HTJ2K', 'JPEG XL']) if (!lossy.includes(f)) throw new Error('Lossy view missing ' + f);
  const status = await page.evaluate(() => document.querySelector('main [role="status"]')?.textContent || ''); if (!/of 8 formats shown/.test(status)) throw new Error('status: ' + status);
  const csv = await page.getByRole('link', { name: /download the comparison as csv/i }).getAttribute('href');
  const res = await page.request.get(BASE + csv); if (res.status() !== 200 || !/csv/.test(res.headers()['content-type'] || '')) throw new Error('CSV ' + res.status() + ' ' + res.headers()['content-type']);
  return { formats: all };
});
await flow('compression comparison at 390px: card presentation shows every format with its column names', async (page) => {
  await page.setViewportSize({ width: 390, height: 844 }); await page.goto(BASE + '/#/compression/', { waitUntil: 'networkidle' });
  const r = await page.evaluate(() => {
    const tableVisible = [...document.querySelectorAll('main table')].some((t) => t.offsetParent !== null);
    const cards = [...document.querySelectorAll('#compare ul li h3')].filter((h) => h.offsetParent !== null).map((h) => h.textContent.trim());
    const dts = [...document.querySelectorAll('#compare dl dt')].filter((d) => d.offsetParent !== null).map((d) => d.textContent.trim());
    return { tableVisible, cards, dts: [...new Set(dts)], overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth };
  });
  if (r.tableVisible) throw new Error('table should be replaced by cards on phones');
  if (r.cards.length !== 8) throw new Error('expected 8 cards: ' + r.cards.join(', '));
  for (const d of ['Modes', 'Advantages', 'Tradeoffs', 'Selection consideration']) if (!r.dts.includes(d)) throw new Error('card column label missing: ' + d);
  if (r.overflow > 1) throw new Error('overflow ' + r.overflow);
  return r;
});
await flow('conformance draft: status, identity and PDF download (real file, application/pdf, draft label) and section navigation', async (page) => {
  await page.setViewportSize({ width: 1440, height: 900 }); await page.goto(BASE + '/#/conformance/', { waitUntil: 'networkidle' });
  // textContent, not innerText: the status label is displayed uppercase through CSS, and the check is about the content.
  const text = await page.evaluate(() => document.querySelector('main')?.textContent || '');
  for (const s of ['Draft - implementation review pending', 'DCAM-DCS-001', 'Draft 0.1', '24 September 2026', 'DICOM 2026d', 'Download draft conformance statement (PDF)']) if (!text.includes(s)) throw new Error('page missing "' + s + '"');
  if (/app version|version:\s*tbc|unassigned/i.test(text)) throw new Error('version placeholder text present');
  const robots = await page.evaluate(() => document.querySelector('meta[name="robots"]')?.content); if (!/noindex/.test(robots || '')) throw new Error('robots ' + robots);
  const link = page.getByRole('link', { name: /download draft conformance statement \(pdf\)/i }).first();
  const href = await link.getAttribute('href'); const download = await link.getAttribute('download');
  if (!href || !download) throw new Error('download link missing href/download attribute');
  const res = await page.request.get(BASE + href); if (res.status() !== 200) throw new Error('PDF status ' + res.status());
  const type = res.headers()['content-type'] || ''; if (!type.includes('application/pdf')) throw new Error('content-type ' + type);
  const body = await res.body(); if (body.subarray(0, 5).toString() !== '%PDF-') throw new Error('not a PDF file');
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 5000 }), link.click()]);
  const suggested = dl.suggestedFilename(); if (suggested !== download) throw new Error('downloaded as ' + suggested);
  // Bring the link into view and let ScrollSmoother settle (0.9 s lag) before clicking, so the click lands on the link.
  const sectionLink = page.getByRole('navigation', { name: /document sections/i }).getByRole('link', { name: /^8 Security$/ });
  await sectionLink.scrollIntoViewIfNeeded(); await page.waitForTimeout(1300);
  await sectionLink.click(); await page.waitForTimeout(900);
  const landed = await page.evaluate(() => { const id = location.hash.split('#').pop(); const el = document.getElementById(id); if (!el) return { id }; const r = el.getBoundingClientRect(); return { id, top: r.top, text: el.textContent }; });
  if (!landed.text || landed.top < -2 || landed.top > 240) throw new Error('section link did not land: ' + JSON.stringify(landed));
  return { pdfBytes: body.length, contentType: type, downloadedAs: suggested };
});
await flow('Enterprise Manager call to action opens the contact route with its topic; the email route carries the Enterprise Manager subject', async (page) => {
  await page.setViewportSize({ width: 1440, height: 900 }); await page.goto(BASE + '/#/enterprise/', { waitUntil: 'networkidle' });
  const section = await page.evaluate(() => !!document.getElementById('enterprise-manager')); if (!section) throw new Error('#enterprise-manager section missing');
  const cta = page.getByRole('link', { name: /discuss enterprise manager/i }); await cta.scrollIntoViewIfNeeded(); await cta.click(); await page.waitForTimeout(600);
  if (!page.url().endsWith('/#/contact/?topic=enterprise-manager')) throw new Error('landed on ' + page.url());
  const topic = await page.evaluate(() => document.querySelector('[data-enquiry-topic]')?.textContent || ''); if (!/DICOM Camera Enterprise Manager/.test(topic)) throw new Error('topic not shown: ' + topic);
  const href = await page.getByRole('link', { name: /^email raster$/i }).first().getAttribute('href'); if (href !== EXPECT.enterpriseManager) throw new Error('email href ' + href);
  return { url: page.url() };
});
await flow('homepage "Explore Enterprise Manager" lands on the Enterprise Manager section of the Enterprise page', async (page) => {
  await page.setViewportSize({ width: 1440, height: 900 }); await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  const link = page.getByRole('link', { name: /explore enterprise manager/i }); await link.scrollIntoViewIfNeeded(); await link.click(); await page.waitForTimeout(900);
  if (!page.url().endsWith('/#/enterprise/#enterprise-manager')) throw new Error('landed on ' + page.url());
  const r = await page.evaluate(() => { const el = document.getElementById('enterprise-manager'); const rect = el?.getBoundingClientRect(); return rect ? { top: Math.round(rect.top), h: window.innerHeight } : null; });
  if (!r || r.top < -2 || r.top > 200) throw new Error('section not at the top: ' + JSON.stringify(r));
  return r;
});
await flow('storage and retention page names the organisation-managed policies and keeps the success/commitment condition', async (page) => {
  await page.setViewportSize({ width: 1440, height: 900 }); await page.goto(BASE + '/#/privacy-and-retention/', { waitUntil: 'networkidle' });
  const text = await page.evaluate(() => document.body.innerText);
  for (const s of ['Organisation-managed policies', 'A policy lock does not change the requirement for the relevant success confirmation']) if (!text.includes(s)) throw new Error('missing: ' + s);
  return {};
});
await context.close(); await browser.close();

// Cross-browser smoke: Firefox and WebKit load home + support without page errors.
for (const [name, type] of [['firefox', firefox], ['webkit', webkit]]) {
  try {
    const b = await type.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
    const errs = []; p.on('pageerror', (e) => errs.push(String(e)));
    for (const r of ['/', '/#/support/', '/#/integration/', '/#/compression/', '/#/conformance/']) { await p.goto(BASE + r, { waitUntil: 'load' }); await p.waitForTimeout(800); }
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
