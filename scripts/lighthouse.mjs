// Runs Lighthouse (mobile emulation, simulated throttling) against the preview for key routes.
// Usage: node scripts/lighthouse.mjs [baseUrl]   (requires `lighthouse` devDependency and a Chrome binary)
import { spawnSync } from 'node:child_process';
import { readFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = process.argv[2] || process.env.BASE_URL || 'http://localhost:4173';
const OUT = path.join(ROOT, 'verification', 'lighthouse');
await mkdir(OUT, { recursive: true });
const ROUTES = ['/', '/workflows/', '/integration/', '/support/', '/download/'];
const chrome = process.env.CHROME_PATH || '/usr/bin/google-chrome';
const rows = [];
for (const route of ROUTES) {
  const name = route === '/' ? 'home' : route.replace(/^\/|\/$/g, '').replace(/\//g, '-');
  const outBase = path.join(OUT, `${name}-mobile`);
  const args = [
    'lighthouse', BASE + route, '--output=json', '--output=html', `--output-path=${outBase}`,
    '--only-categories=performance,accessibility,best-practices,seo', '--form-factor=mobile', '--screenEmulation.mobile',
    '--throttling-method=simulate', '--quiet', `--chrome-flags=--headless=new --no-sandbox --disable-gpu`,
  ];
  const r = spawnSync('npx', args, { cwd: ROOT, env: { ...process.env, CHROME_PATH: chrome }, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  if (r.status !== 0) { console.error(`lighthouse failed for ${route}:\n${r.stderr.slice(-2000)}`); rows.push({ route, error: r.stderr.slice(-300) }); continue; }
  const json = JSON.parse(await readFile(`${outBase}.report.json`, 'utf8'));
  const c = json.categories; const a = json.audits;
  rows.push({
    route,
    performance: Math.round(c.performance.score * 100), accessibility: Math.round(c.accessibility.score * 100),
    bestPractices: Math.round(c['best-practices'].score * 100), seo: Math.round(c.seo.score * 100),
    lcp: a['largest-contentful-paint'].displayValue, cls: a['cumulative-layout-shift'].displayValue, tbt: a['total-blocking-time'].displayValue, fcp: a['first-contentful-paint'].displayValue,
    lighthouseVersion: json.lighthouseVersion, userAgent: json.environment?.hostUserAgent,
  });
  console.log(route, rows[rows.length - 1]);
}
const md = `| Route | Performance | Accessibility | Best practices | SEO | LCP | CLS | TBT | FCP |\n| --- | --- | --- | --- | --- | --- | --- | --- | --- |\n${rows.map((r) => r.error ? `| ${r.route} | error | | | | | | | |` : `| ${r.route} | ${r.performance} | ${r.accessibility} | ${r.bestPractices} | ${r.seo} | ${r.lcp} | ${r.cls} | ${r.tbt} | ${r.fcp} |`).join('\n')}\n`;
await import('node:fs/promises').then((fs) => fs.writeFile(path.join(OUT, 'SUMMARY.md'), `# Lighthouse (mobile emulation, simulated throttling)\n\nBase: ${BASE}  \nLighthouse ${rows.find((r) => r.lighthouseVersion)?.lighthouseVersion || ''}\n\n${md}`));
console.log('\n' + md);
