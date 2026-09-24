// Content boundary checks against the built site (dist/**/*.html) and source.
// Fails when forbidden terms appear in visible text, alt text, metadata or source comments.
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FORBIDDEN = [
  /\bdcmtk\b/i, /\bdcm4che\b/i, /fo-dicom/i, /\bpydicom\b/i, /\bgdcm\b/i, /\borthanc\b/i, /openjpeg/i, /openjph/i, /libjxl/i, /\bcharls\b/i, /\bkakadu\b/i,
  /github\.com/i, /gitlab\.com/i, /bitbucket/i, /open[- ]?source/i, /diagnose with precision/i, /capture diagnostic images/i, /free forever/i,
  /\bhipaa\b/i, /\bgdpr\b/i, /coming soon/i, /lorem ipsum/i, /\btodo\b/i, /\bfda\b/i, /\bce[- ]mark/i, /iso 13485/i, /chatgpt/i, /content pending/i,
  /\bsla\b/i, /testimonial/i, /trusted by/i, /\bfree\b/i,
];
const REQUIRED_HOME = ['100% in Swift', 'QIDO-RS', 'WADO-RS', 'STOW-RS', 'UPS-RS', 'Quick Take', 'Storage Commitment'];

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else out.push(p);
  }
  return out;
}

function visibleText(html) {
  const metaContent = [...html.matchAll(/<meta[^>]+content="([^"]*)"/g)].map((m) => m[1]).join(' ');
  const altText = [...html.matchAll(/alt="([^"]*)"/g)].map((m) => m[1]).join(' ');
  const ariaText = [...html.matchAll(/aria-label="([^"]*)"/g)].map((m) => m[1]).join(' ');
  const comments = [...html.matchAll(/<!--([\s\S]*?)-->/g)].map((m) => m[1]).join(' ');
  const jsonld = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]).join(' ');
  const body = html.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ');
  return [body, metaContent, altText, ariaText, comments, jsonld].join('\n');
}

let failures = 0;
let failuresPre = 0;
// Hash routing: dist/ holds the prerendered home plus redirect stubs; full server renders of every route
// are written to verification/prerendered/ by scripts/prerender.mjs for these checks.
const dist = path.join(ROOT, 'dist');
const rendered = path.join(ROOT, 'verification', 'prerendered');
const htmlFiles = [path.join(dist, 'index.html'), ...(await walk(rendered)).filter((f) => f.endsWith('.html'))];
if (htmlFiles.length < 2) { console.error('No rendered HTML found. Run npm run build first.'); process.exit(1); }
// Redirect stubs must not leak copy or be indexable.
for (const f of (await walk(dist)).filter((f) => f.endsWith('.html') && f !== path.join(dist, 'index.html'))) {
  const html = await readFile(f, 'utf8');
  if (!html.includes('data-redirect-stub')) { failuresPre++; console.error(`Unexpected non-stub HTML in dist: ${path.relative(ROOT, f)}`); }
  if (!/name="robots" content="noindex"/.test(html)) { failuresPre++; console.error(`Stub without noindex: ${path.relative(ROOT, f)}`); }
}
for (const f of htmlFiles) {
  const html = await readFile(f, 'utf8');
  const text = visibleText(html);
  for (const re of FORBIDDEN) {
    const m = text.match(re);
    if (m) { failures++; console.error(`FORBIDDEN "${m[0]}" in ${path.relative(ROOT, f)}`); }
  }
  const h1s = (html.match(/<h1[\s>]/g) || []).length;
  if (h1s !== 1) { failures++; console.error(`Expected exactly one <h1>, found ${h1s} in ${path.relative(ROOT, f)}`); }
  if (!/<link rel="canonical"/.test(html)) { failures++; console.error(`Missing canonical in ${path.relative(ROOT, f)}`); }
  if (!/<meta name="robots"/.test(html)) { failures++; console.error(`Missing robots meta in ${path.relative(ROOT, f)}`); }
  if (!/<main[\s>]/.test(html)) { failures++; console.error(`Missing <main> in ${path.relative(ROOT, f)}`); }
  if (/<img(?![^>]*\balt=)[^>]*>/.test(html)) { failures++; console.error(`<img> without alt in ${path.relative(ROOT, f)}`); }
  if (f.endsWith(`${path.sep}dist${path.sep}index.html`)) {
    for (const req of REQUIRED_HOME) if (!text.includes(req)) { failures++; console.error(`Homepage missing required text "${req}"`); }
  }
}
// Source scan for toolkit/repository leaks in comments or strings.
const src = (await walk(path.join(ROOT, 'src'))).filter((f) => /\.(tsx?|css)$/.test(f));
for (const f of src) {
  const s = await readFile(f, 'utf8');
  for (const re of FORBIDDEN.slice(0, 15)) { const m = s.match(re); if (m) { failures++; console.error(`FORBIDDEN "${m[0]}" in source ${path.relative(ROOT, f)}`); } }
}
failures += failuresPre;
console.log(failures ? `${failures} content check failure(s).` : `Content checks passed for ${htmlFiles.length} rendered pages.`);
process.exit(failures ? 1 : 0);
