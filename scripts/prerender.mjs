// Hash-routing build step:
//  - dist/index.html: fully prerendered homepage with head tags (hydrated on the client)
//  - dist/<route>/index.html and dist/404.html: tiny redirect stubs so legacy path URLs and unknown
//    paths land on the matching hash route (e.g. /workflows/ → /#/workflows/)
//  - sitemap.xml (origin only — hash routes are not separately crawlable), robots.txt
//  - verification/prerendered/<route>.html: full server renders of every route for content checks
//    (private; not deployed)
import { readFile, writeFile, mkdir, rm, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const SSR = path.join(ROOT, 'dist-ssr');
const CHECK = path.join(ROOT, 'verification', 'prerendered');

const { render, routeList, config } = await import(pathToFileURL(path.join(SSR, 'entry-server.js')).href);
const template = await readFile(path.join(DIST, 'index.html'), 'utf8');

const assets = await readdir(path.join(DIST, 'assets'));
const fontFile = assets.find((f) => /inter-latin-wght-normal.*\.woff2$/.test(f));
const fontPreload = fontFile ? `<link rel="preload" href="/assets/${fontFile}" as="font" type="font/woff2" crossorigin />` : '';

// Inline the (small) entry stylesheet so first paint does not wait for a second request.
const cssLink = template.match(/<link rel="stylesheet"[^>]*href="\/assets\/([^"]+\.css)"[^>]*>/);
const inlineCss = cssLink ? `<style>${await readFile(path.join(DIST, 'assets', cssLink[1]), 'utf8')}</style>` : '';
const withInlineCss = (html) => (cssLink ? html.replace(cssLink[0], inlineCss) : html);
const fill = (head, html) => withInlineCss(template.replace('<!--app-head-->', `${head}\n    ${fontPreload}`).replace('<!--app-html-->', html));
const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

function redirectStub(hashPath, title) {
  const target = `/#${hashPath}`;
  return `<!doctype html>
<html lang="en" data-redirect-stub>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex" />
    <title>${esc(title)}</title>
    <link rel="icon" href="/favicon.ico" sizes="32x32" />
    <meta http-equiv="refresh" content="0; url=${target}" />
    <script>location.replace(${JSON.stringify(target)});</script>
    <style>:root{color-scheme:light dark}body{font-family:system-ui,sans-serif;background:#F7F9FC;color:#142235;padding:2rem}a{color:#175CD3}@media (prefers-color-scheme:dark){body{background:#0D1420;color:#F1F5F9}a{color:#8CB6FF}}</style>
  </head>
  <body>
    <p>Redirecting to <a href="${target}">${esc(title)}</a>…</p>
  </body>
</html>
`;
}

await mkdir(CHECK, { recursive: true });
await rm(CHECK, { recursive: true, force: true });
await mkdir(CHECK, { recursive: true });

const written = [];
for (const r of routeList) {
  const { html, head } = render(r.path);
  const full = fill(head, html);
  const slug = r.path === '/' ? 'home' : r.path.replace(/^\/|\/$/g, '').replace(/\//g, '-');
  await writeFile(path.join(CHECK, `${slug}.html`), full);
  if (r.path === '/') {
    await writeFile(path.join(DIST, 'index.html'), full);
    written.push('/ (prerendered)');
  } else {
    const outDir = path.join(DIST, r.path);
    await mkdir(outDir, { recursive: true });
    await writeFile(path.join(outDir, 'index.html'), redirectStub(r.path, r.meta.title));
    written.push(`${r.path} → /#${r.path} (redirect stub)`);
  }
}
{
  const { html, head } = render('/__not_found__/');
  await writeFile(path.join(CHECK, '404.html'), fill(head, html));
  await writeFile(path.join(DIST, '404.html'), redirectStub('/404/', 'Page not found | DICOM Camera'));
  written.push('/404.html → /#/404/ (redirect stub)');
}

const today = new Date().toISOString().slice(0, 10);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${config.origin}/</loc><lastmod>${today}</lastmod></url>\n</urlset>\n`;
await writeFile(path.join(DIST, 'sitemap.xml'), sitemap);
// Draft documents (public/documents/) stay out of search results until issued; see DEPLOYMENT.md for the matching header.
const robots = config.indexable
  ? `User-agent: *\nAllow: /\nDisallow: /documents/\n\nSitemap: ${config.origin}/sitemap.xml\n`
  : `# Preview/staging build: not indexable. Build with VITE_INDEXABLE=true for production.\nUser-agent: *\nDisallow: /\n`;
await writeFile(path.join(DIST, 'robots.txt'), robots);
await rm(SSR, { recursive: true, force: true });
console.log(`Hash-routing build (${config.indexable ? 'indexable' : 'noindex'}):\n  ${written.join('\n  ')}\nServer renders for content checks: verification/prerendered/`);
