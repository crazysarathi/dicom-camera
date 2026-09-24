# Deployment preparation

This package prepares deployable files only. Production publishing, DNS changes, purchases and changes to the existing raster.in pages remain owner decisions.

## Build for production

```bash
npm ci
npm run build:production   # VITE_INDEXABLE=true → index,follow + sitemap in robots.txt
```

Upload the contents of `dist/` to the static host. `VITE_SITE_ORIGIN` in `.env` must match the served origin (`https://dicom.camera`); canonical URLs, the sitemap and social metadata derive from it.

## Hosting requirements

- Any static file host. Routing is hash-based, so the only page the server must serve is `/index.html`; no rewrite rules or SPA fallback are required.
- Keep the `dist/<route>/index.html` redirect stubs and `dist/404.html` if you want legacy path URLs (`/workflows/`) and unknown paths to forward to the matching hash route. Serve `404.html` for unknown paths where the host supports it (Netlify, Cloudflare Pages and GitHub Pages do so automatically).
- HTTPS with HTTP→HTTPS redirect; prefer redirecting `www.dicom.camera` to the apex domain (the canonical origin).
- Long cache lifetime for `assets/`, `images/` and `badges/` (all hashed or immutable), short cache for HTML.
- Suggested headers: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`. A Content-Security-Policy can be strict: the site loads no third-party scripts, fonts or images (`default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'` — extend `connect-src` if the contact form endpoint is enabled).
- The build assumes deployment at the domain root (asset URLs are absolute, e.g. `/assets/…`). Hosting under a sub-path would need a Vite `base` setting and a rebuild.

### Search-engine note

With hash routing, search engines treat the whole site as one URL (`https://dicom.camera/`). The homepage is fully prerendered with its title, description, canonical, Open Graph tags and structured data; sub-pages render on the client and update the document title/description for sharing, but they are not separately indexable. If separate indexing of sub-pages becomes a requirement later, switch `src/main.tsx` back to `BrowserRouter` and restore per-route prerendering in `scripts/prerender.mjs` (the server-render path already exists).

### Examples

nginx (root deployment):

```nginx
server {
  root /var/www/dicom.camera/dist;
  index index.html;
  error_page 404 /404.html;
  location / { try_files $uri $uri/ =404; }
  location ~* \.(js|css|woff2|avif|webp|png|jpg|svg)$ { add_header Cache-Control "public, max-age=31536000, immutable"; }
}
```

## Staging

Build with the default `VITE_INDEXABLE=false`: pages carry `noindex,nofollow`, `robots.txt` disallows everything, and the sitemap still lists routes for internal checking. Password-protecting the staging host is recommended but not required by the build.

## Not included by design

- No analytics, tag managers, chat widgets, CAPTCHA, CRM, newsletter or embedded store/video players. If the owner later approves analytics, add the script tag in `index.html` (`<!--app-head-->` region) and document the vendor and consent handling here.
- No server-side code. The optional contact form posts to an owner-supplied endpoint only when `VITE_CONTACT_FORM_ENDPOINT` is configured.
- No secrets anywhere in the repository or build output.

## Remaining launch inputs (owner)

See `VERIFICATION-REPORT.md` for the precise list: feature availability by release/platform, legal policy scope and destinations for dicom.camera, any conformance statement, commercial terms, and explicit authorisation to publish.
