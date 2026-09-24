# Content editing guide

All visitor-facing text, destinations and switches live in a few typed files. Components never hard-code copy. After any change run `npm run build` and `npm run lint:content`.

## Copy

| What | Where |
| --- | --- |
| Homepage sections | `src/content/home.ts` |
| How it works (`/workflows/`) | `src/content/workflows.ts` |
| Enterprise (`/enterprise/`) | `src/content/enterprise.ts` |
| Integration tables and notes (`/integration/`) | `src/content/integration.ts` |
| Storage and retention (`/privacy-and-retention/`) | `src/content/privacy.ts` |
| Download (`/download/`) | `src/content/download.ts` |
| Support FAQs and preparation notes (`/support/`) | `src/content/support.ts` |
| Contact (`/contact/`) | `src/content/contact.ts` |
| Header/footer labels, accessible utility labels | `src/content/nav.ts` |
| Page titles and meta descriptions | the `meta` export at the top of each file in `src/pages/` |
| Not-found page | `src/pages/NotFound.tsx` |

Keep the editorial rules from the handoff: no internal library or repository names, no unsupported compliance/performance/pricing claims, iOS-specific hardware and codec statements only inside iOS-labelled blocks, and the distinction between a successful send and a Storage Commitment result.

## Store links, emails and legal links

Edit `src/config/site.ts`:

- `stores.appStore.url`, `stores.googlePlay.url` — used by every badge group, the footer and the download page.
- `email.commercial`, `email.support` — `address` (shown as selectable text and copied by the copy control) and `href` (the `mailto:` link with subject).
- `legal.privacy`, `legal.terms` — footer destinations. These currently point at Raster's existing published pages; confirm their scope for dicom.camera before launch.
- `motion.scrollSmoother` — set to `false` to disable GSAP ScrollSmoother on desktop entirely (reveals still work).

## Canonical origin and indexing

`.env` holds `VITE_SITE_ORIGIN` (canonical URLs, sitemap, Open Graph) and `VITE_INDEXABLE`.

- Preview/staging: leave `VITE_INDEXABLE=false` (every page gets `noindex,nofollow`; `robots.txt` disallows all).
- Production: run `npm run build:production` (equivalent to `VITE_INDEXABLE=true npm run build`).

## Images

Originals stay in `assets-source/` (with `asset-manifest.json` recording provenance and review flags) and are never modified. `scripts/build-images.mjs` lists the screenshots used on the site with their crop bounds, alt text and captions. To add or change a screenshot:

1. Add an entry to `SCREENSHOTS` in `scripts/build-images.mjs` (id, source path, output stem, crop box, alt, caption, platform). Only use originals marked usable in `assets-source/asset-manifest.json` (see the review flags; the editorial guidance is in the parent folder's `ASSETS.md`).
2. Run `npm run images`. This regenerates `public/images/*`, `src/images/manifest.ts` and `DERIVATIVES.json`.
3. Reference the new id with `<ScreenshotFigure image="…" />` (or add it to a gallery list in `src/content/home.ts`).

App icons and favicons derive from the Apple icon; the Android icon is only used in the Android download panel. The social card (`public/social-card.jpg`) is composed by the same script.

## Optional contact form

The contact page uses the working email routes by default. To enable the form, set `VITE_CONTACT_FORM_ENDPOINT` in `.env` to an HTTPS endpoint that accepts a JSON `POST` (`name`, `email`, `organisation`, `topic`, `pacs`, `platform`, `message`) and responds with a 2xx status only on successful receipt. The endpoint must validate input server-side and must not log message bodies unnecessarily. No CAPTCHA, CRM or analytics are included; record any later integration in `DEPLOYMENT.md`.
