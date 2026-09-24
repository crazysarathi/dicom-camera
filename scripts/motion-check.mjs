// Browser checks for the motion layer (reveals, SplitText, ScrollSmoother, hash and route scrolling).
// The site uses hash routing: routes are /#/route/ and in-page targets /#/route/#id.
// Usage: npm run build && npx vite preview --port 4181 &  then  node scripts/motion-check.mjs [baseUrl]
import { chromium } from 'playwright';

const base = process.argv[2] || 'http://localhost:4181';
const results = [];
const check = (name, ok, detail = '') => { results.push({ name, ok, detail }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`); };

const browser = await chromium.launch();

async function session(viewport, extra = {}) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, ...extra });
  const page = await context.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.addInitScript(`window.__state = ${state.toString()}; window.__reveals = ${revealReport.toString()};`);
  return { context, page, errors };
}

const state = () => ({
  smoother: getComputedStyle(document.getElementById('smooth-wrapper')).position === 'fixed',
  headerH: document.querySelector('header').getBoundingClientRect().height,
  scrollY: window.scrollY,
  wrapperScrollTop: document.getElementById('smooth-wrapper').scrollTop,
  overflowX: document.documentElement.scrollWidth - window.innerWidth,
  active: document.activeElement && (document.activeElement.id || document.activeElement.tagName),
});

const revealReport = () => {
  const els = [...document.querySelectorAll('[data-reveal], [data-reveal-stagger] > *')];
  const bad = els.filter((el) => {
    const cs = getComputedStyle(el);
    return cs.opacity !== '1' || (cs.transform !== 'none' && !cs.transform.endsWith(', 0, 0)'));
  });
  const inline = els.filter((el) => el.style.opacity || el.style.transform || el.style.willChange);
  const splits = [...document.querySelectorAll('[data-split]')];
  const unsplit = splits.filter((el) => !el.querySelector('.split-line') && !el.hasAttribute('aria-label'));
  return { total: els.length, bad: bad.length, inline: inline.length, splits: splits.length, reverted: unsplit.length, badSample: bad.slice(0, 3).map((e) => e.outerHTML.slice(0, 80)) };
};

async function scrollThrough(page) {
  const height = await page.evaluate(() => document.getElementById('smooth-content').scrollHeight);
  const steps = Math.ceil(height / 500) + 2;
  await page.mouse.move(200, 400);
  for (let i = 0; i < steps; i++) { await page.mouse.wheel(0, 500); await page.waitForTimeout(120); }
  await page.waitForTimeout(1800);
}

for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
  const tag = `${viewport.width}x${viewport.height}`;
  const { context, page, errors } = await session(viewport);
  await page.goto(`${base}/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  const initial = await page.evaluate(() => window.__state());
  check(`${tag} smoother ${viewport.width >= 1024 ? 'active' : 'inactive'}`, initial.smoother === viewport.width >= 1024, `position fixed: ${initial.smoother}`);
  check(`${tag} no horizontal overflow`, initial.overflowX <= 0, `${initial.overflowX}px`);
  const above = await page.evaluate(() => [...document.querySelectorAll('[data-reveal]')].filter((el) => el.getBoundingClientRect().top < innerHeight * 0.85).map((el) => getComputedStyle(el).opacity));
  check(`${tag} above-the-fold content never hidden after hydration`, above.every((o) => o === '1'), `${above.length} elements`);

  await scrollThrough(page);
  const scrolled = await page.evaluate(() => ({ ...({ y: window.scrollY }), header: document.querySelector('header').className.includes('border-line') }));
  check(`${tag} page scrolled and header picked up scroll state`, scrolled.y > 500 && scrolled.header, `scrollY ${scrolled.y}`);
  const report = await page.evaluate(() => window.__reveals());
  check(`${tag} all [data-reveal] end at opacity 1 with no inline motion styles`, report.bad === 0 && report.inline === 0, `${report.total} elements, bad ${report.bad}, inline ${report.inline} ${report.badSample.join(' | ')}`);
  check(`${tag} all [data-split] headings reverted to plain markup`, report.reverted === report.splits, `${report.reverted}/${report.splits}`);

  // In-page anchor lands below the fixed header (hash-router form: "#/<route>#id").
  await page.evaluate(() => {
    const a = document.createElement('a'); a.href = '#/#storage'; a.id = 'motion-test-anchor'; a.textContent = 'Anchor test';
    a.style.cssText = 'position:fixed;left:8px;bottom:8px;z-index:9999;background:#fff;padding:8px';
    document.body.appendChild(a);
  });
  await page.click('#motion-test-anchor');
  await page.waitForTimeout(1800);
  const anchor = await page.evaluate(() => ({ top: document.getElementById('storage').getBoundingClientRect().top, ...window.__state(), hash: location.hash }));
  const expected = anchor.headerH + 16;
  check(`${tag} in-page anchor lands below the header`, Math.abs(anchor.top - expected) <= 4 && anchor.wrapperScrollTop === 0, `top ${anchor.top.toFixed(1)} expected ${expected} hash ${anchor.hash} wrapperScrollTop ${anchor.wrapperScrollTop}`);
  check(`${tag} in-page anchor target receives focus`, anchor.active === 'storage', `active ${anchor.active}`);
  // Re-activating the same link (same pathname and hash) lands again.
  await page.mouse.move(200, 400); await page.mouse.wheel(0, -600); await page.waitForTimeout(1200);
  await page.$eval('#motion-test-anchor', (a) => a.click());
  await page.waitForTimeout(1800);
  const again = await page.evaluate(() => ({ top: document.getElementById('storage').getBoundingClientRect().top, ...window.__state() }));
  check(`${tag} same in-page anchor activated twice lands again`, Math.abs(again.top - expected) <= 4 && again.wrapperScrollTop === 0, `top ${again.top.toFixed(1)} wrapperScrollTop ${again.wrapperScrollTop}`);
  if (viewport.width >= 1024) {
    // Native scrolling of the fixed wrapper (find-in-page, scrollIntoView from elsewhere) must not displace the content.
    const before = await page.evaluate(() => window.scrollY);
    await page.evaluate(() => { document.getElementById('smooth-wrapper').scrollTop = 300; });
    await page.waitForTimeout(500);
    const net = await page.evaluate(() => window.__state());
    check(`${tag} native wrapper scroll is handed to the smoother`, net.wrapperScrollTop === 0 && net.scrollY > before, `wrapperScrollTop ${net.wrapperScrollTop} scrollY ${before} -> ${net.scrollY}`);
  }

  // Skip link.
  await page.keyboard.press('Tab');
  await page.focus('a.skip-link');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1500);
  const skip = await page.evaluate(() => ({ top: document.getElementById('main').getBoundingClientRect().top, ...window.__state() }));
  check(`${tag} skip link reaches #main`, skip.active === 'main' && skip.top >= -1 && skip.wrapperScrollTop === 0, `main top ${skip.top.toFixed(1)} active ${skip.active}`);

  // Route change resets scroll and focuses main; new page's reveals settle.
  await scrollThrough(page);
  await page.evaluate(() => { location.hash = '#/workflows/'; });
  await page.waitForTimeout(200);
  const afterNav = await page.evaluate(() => ({ ...window.__state(), path: location.hash }));
  check(`${tag} route change resets scroll to top and focuses #main`, afterNav.path === '#/workflows/' && afterNav.scrollY === 0 && afterNav.wrapperScrollTop === 0 && afterNav.active === 'main', `scrollY ${afterNav.scrollY} active ${afterNav.active}`);
  await page.waitForTimeout(1600);
  const navReveal = await page.evaluate(() => [...document.querySelectorAll('[data-reveal], [data-reveal-stagger] > *')].filter((el) => el.getBoundingClientRect().top < innerHeight).map((el) => getComputedStyle(el).opacity));
  check(`${tag} above-the-fold reveals on the new route finish visible`, navReveal.length > 0 && navReveal.every((o) => o === '1'), `${navReveal.length} checked`);
  await scrollThrough(page);
  const report2 = await page.evaluate(() => window.__reveals());
  check(`${tag} new route: all reveals visible after scrolling`, report2.bad === 0 && report2.inline === 0 && report2.reverted === report2.splits, `${report2.total} elements, splits ${report2.reverted}/${report2.splits}`);
  const overflow2 = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  check(`${tag} no horizontal overflow after navigation`, overflow2 <= 0, `${overflow2}px`);

  // Cross-page hash landing through the router.
  await page.evaluate(() => { location.hash = '#/support/#faq-5'; });
  await page.waitForTimeout(1800);
  const cross = await page.evaluate(() => ({ top: document.getElementById('faq-5').getBoundingClientRect().top, ...window.__state(), path: location.hash }));
  check(`${tag} cross-page hash lands below the header and focuses the target`, cross.path === '#/support/#faq-5' && Math.abs(cross.top - (cross.headerH + 16)) <= 4 && cross.active === 'faq-5', `top ${cross.top.toFixed(1)} expected ${cross.headerH + 16} active ${cross.active}`);

  // Direct deep link load (a fresh document, not a same-document fragment change).
  await page.goto('about:blank');
  await page.goto(`${base}/#/support/#faq-8`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  const deep = await page.evaluate(() => ({ top: document.getElementById('faq-8').getBoundingClientRect().top, ...window.__state() }));
  check(`${tag} direct deep link lands below the header`, Math.abs(deep.top - (deep.headerH + 16)) <= 4, `top ${deep.top.toFixed(1)} expected ${deep.headerH + 16}`);

  check(`${tag} no console or page errors`, errors.length === 0, errors.slice(0, 3).join(' | '));
  await context.close();
}

// Reduced motion: nothing animates, native scroll, everything visible.
{
  const { context, page, errors } = await session({ width: 1440, height: 900 }, { reducedMotion: 'reduce' });
  await page.goto(`${base}/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  const rm = await page.evaluate(() => ({ ...window.__state(), ...window.__reveals(), done: document.querySelectorAll('[data-motion-done]').length }));
  check('reduced motion: no smoother, no hidden or split content', !rm.smoother && rm.bad === 0 && rm.inline === 0 && rm.reverted === rm.splits && rm.done === 0, `total ${rm.total} done-marks ${rm.done}`);
  await page.evaluate(() => { location.hash = '#/enterprise/'; });
  await page.waitForTimeout(400);
  const rmNav = await page.evaluate(() => ({ ...window.__state(), ...window.__reveals(), path: location.hash }));
  check('reduced motion: route change is native and fully visible', rmNav.path === '#/enterprise/' && rmNav.scrollY === 0 && rmNav.bad === 0 && rmNav.inline === 0 && rmNav.active === 'main', `path ${rmNav.path} scrollY ${rmNav.scrollY} active ${rmNav.active}`);
  check('reduced motion: no console or page errors', errors.length === 0, errors.slice(0, 3).join(' | '));
  await context.close();
}

// JavaScript disabled: the prerendered page is complete and visible.
{
  const { context, page } = await session({ width: 1024, height: 768 }, { javaScriptEnabled: false });
  await page.goto(`${base}/`, { waitUntil: 'load' });
  const nojs = await page.evaluate(() => {
    const els = [...document.querySelectorAll('[data-reveal], [data-reveal-stagger] > *')];
    return { total: els.length, bad: els.filter((el) => getComputedStyle(el).opacity !== '1').length, inline: els.filter((el) => el.style.opacity || el.style.transform).length };
  });
  check('no JavaScript: prerendered content visible', nojs.total > 0 && nojs.bad === 0 && nojs.inline === 0, `${nojs.total} reveal elements`);
  await context.close();
}

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
