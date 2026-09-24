# Deployment preparation

This package prepares deployable files only. Production publishing, DNS changes, purchases and changes to the existing raster.in pages remain owner decisions.

## Build for production

```bash
npm ci
npm run build:production   # VITE_INDEXABLE=true → index,follow + sitemap in robots.txt (with Disallow: /documents/)
```

Upload the contents of `dist/` to the static host. `VITE_SITE_ORIGIN` in `.env` must match the served origin (`https://dicom.camera`); canonical URLs, the sitemap and social metadata derive from it.

## Hosting requirements

- Any static file host. Routing is hash-based, so the only page the server must serve is `/index.html`; no rewrite rules or SPA fallback are required.
- Keep the `dist/<route>/index.html` redirect stubs and `dist/404.html` if you want legacy path URLs (`/workflows/`) and unknown paths to forward to the matching hash route. Serve `404.html` for unknown paths where the host supports it (Netlify, Cloudflare Pages and GitHub Pages do so automatically).
- HTTPS with HTTP→HTTPS redirect; prefer redirecting `www.dicom.camera` to the apex domain (the canonical origin).
- Long cache lifetime for `assets/`, `images/` and `badges/` (all hashed or immutable), short cache for HTML and for `documents/` (the PDF and CSV are replaced in place when a new revision is issued).
- Suggested headers: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`. A Content-Security-Policy can be strict: the site loads no third-party scripts, fonts or images (`default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'` — extend `connect-src` if the contact form endpoint is enabled).
- The build assumes deployment at the domain root (asset URLs are absolute, e.g. `/assets/…`). Hosting under a sub-path would need a Vite `base` setting and a rebuild.

### Draft documents: keep them out of search results

`public/documents/` holds the draft DICOM conformance statement (PDF) and the compression comparison (CSV). Until product engineering issues a final statement:

- `robots.txt` (production build) contains `Disallow: /documents/`.
- The PDF must be served with `X-Robots-Tag: noindex, nofollow` and `Content-Type: application/pdf`. `vercel.json` in this folder configures that for Vercel (the current preview host) together with `nosniff` and a short cache. For nginx see the example below. This is an editorial publishing control, not access protection.
- The HTML edition at `/#/conformance/` sets `<meta name="robots" content="noindex,nofollow">` through its route metadata when rendered on the client. Limitation of hash routing: crawlers that do not execute JavaScript only ever see the prerendered homepage and its robots directive; a fragment cannot receive its own HTTP header, so nothing beyond the page-level meta and the PDF/robots.txt rules can be configured for the draft route. No site-wide `noindex` is applied in production.

### Examples

nginx (root deployment):

```nginx
server {
  root /var/www/dicom.camera/dist;
  index index.html;
  error_page 404 /404.html;
  location / { try_files $uri $uri/ =404; }
  location ~* \.(js|css|woff2|avif|webp|png|jpg|svg)$ { add_header Cache-Control "public, max-age=31536000, immutable"; }
  location ~* ^/documents/.*\.pdf$ {
    types { application/pdf pdf; }
    add_header X-Robots-Tag "noindex, nofollow";
    add_header X-Content-Type-Options nosniff;
    add_header Cache-Control "public, max-age=3600, must-revalidate";
  }
}
```

## Staging

Build with the default `VITE_INDEXABLE=false`: pages carry `noindex,nofollow`, `robots.txt` disallows everything, and the sitemap still lists routes for internal checking. Password-protecting the staging host is recommended but not required by the build.

## Not included by design

- No analytics, tag managers, chat widgets, CAPTCHA, CRM, newsletter or embedded store/video players. If the owner later approves analytics, add the script tag in `index.html` (`<!--app-head-->` region) and document the vendor and consent handling here.
- No server-side code. The optional contact form posts to an owner-supplied endpoint only when `VITE_CONTACT_FORM_ENDPOINT` is configured. The Enterprise Manager section is marketing content only: no enrolment handler, licence checkout API or administration portal exists on the website.
- No secrets anywhere in the repository or build output.

## Remaining launch inputs (owner)

See `VERIFICATION-REPORT.md` and `CHANGE-REPORT-v1.1.md` for the precise lists: feature availability by release/platform, legal policy scope and destinations for dicom.camera, the conformance evidence needed to issue the statement as final, commercial terms, and explicit authorisation to publish.
