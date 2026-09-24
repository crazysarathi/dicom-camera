# Content editing guide

All visitor-facing text, destinations and switches live in a few typed files. Components never hard-code copy. After any change run `npm run build` and `npm run lint:content`.

## Copy

| What | Where |
| --- | --- |
| Homepage sections (including the Enterprise Manager introduction) | `src/content/home.ts` |
| How it works (`/workflows/`) | `src/content/workflows.ts` |
| Enterprise (`/enterprise/`), including the Enterprise Manager section (`#enterprise-manager`) | `src/content/enterprise.ts` |
| Integration tables, compression overview, conformance card (`/integration/`) | `src/content/integration.ts` |
| Compression guide (`/compression/`): definitions, selection guidance, references | `src/content/compression.ts` (table rows come from `documents-source/compression-comparison.csv`) |
| Conformance landing page (`/conformance/`) | `src/content/conformance.ts` (document body comes from `documents-source/DICOM-CONFORMANCE-DRAFT.md`) |
| Storage and retention (`/privacy-and-retention/`), including organisation-managed policies | `src/content/privacy.ts` |
| Download (`/download/`) | `src/content/download.ts` |
| Support FAQs and preparation notes (`/support/`) | `src/content/support.ts` |
| Contact (`/contact/`), enquiry topics | `src/content/contact.ts` |
| Header/footer labels, breadcrumb parents, accessible utility labels | `src/content/nav.ts` |
| Page titles and meta descriptions | the `meta` export at the top of each file in `src/pages/` |
| Not-found page | `src/pages/NotFound.tsx` |

Keep the editorial rules from the handoff: no internal library or repository names, no unsupported compliance/performance/pricing claims, iOS-specific hardware and codec statements only inside iOS-labelled blocks, and the distinction between a successful send and a Storage Commitment result.

### Enterprise Manager

The optional server is called **DICOM Camera Enterprise Manager** (`siteConfig.enterpriseManager` in `src/config/site.ts`), described as centralised licensing, configuration and policy control. Describe only the owner-confirmed capabilities: central feature entitlements without individual in-app purchases, floating licences and central revocation, per-user enrolment link or QR code that applies the configuration (AE Title, archive address), and locked settings (connection, compression, Photo Album export, automatic deletion). Do not add licence checkout duration, device limits, offline or revocation timing, cloud/on-premise availability, SSO, MDM, audit reporting, background policy refresh, remote image erasure, "unlimited" or pricing. The workflow diagram (`src/components/ManagedDeploymentDiagram.tsx`) is labelled as an illustration and never shows a real link, token, credential, archive address or QR code. Licence revocation is not image deletion; a policy lock never changes the send/Storage Commitment condition for deletion.

The Enterprise Manager call to action links to `/#/contact/?topic=enterprise-manager`; the contact page then uses the email route with the Enterprise Manager subject (`siteConfig.email.enterpriseManager`) and pre-selects the topic in the optional form.

## Store links, emails and legal links

Edit `src/config/site.ts`:

- `stores.appStore.url`, `stores.googlePlay.url` — used by every badge group, the footer and the download page.
- `email.commercial`, `email.enterpriseManager`, `email.support` — `address` (shown as selectable text and copied by the copy control) and `href` (the `mailto:` link with subject). The verification script only accepts these three mailto routes.
- `legal.privacy`, `legal.terms` — footer destinations. These currently point at Raster's existing published pages; confirm their scope for dicom.camera before launch.
- `motion.scrollSmoother` — set to `false` to disable GSAP ScrollSmoother on desktop entirely (reveals still work).

## Colour tokens

Every colour is a token: RGB channels in `src/styles/globals.css` (`:root`) exposed to Tailwind through `tailwind.config.ts` (`bg-card`, `text-ink`, `border-line`, `bg-primary-soft`, `bg-band`, …). Components never use raw hex values or `bg-white`; use `card` (surface), `popover` (elevated), `band` (closing bands), `ink`/`ink-foreground` (inverted fills), `secondary` (hover fills), `primary`/`primary-foreground` (filled buttons), `ring` (focus). When changing a value keep small text at 4.5:1 and controls at 3:1. The 3D scenes read their palette from `src/components/three/materials.ts`. The site has one appearance: the owner asked for no light/dark option (24 September 2026).

## Canonical origin and indexing

`.env` holds `VITE_SITE_ORIGIN` (canonical URLs, sitemap, Open Graph) and `VITE_INDEXABLE`.

- Preview/staging: leave `VITE_INDEXABLE=false` (every page gets `noindex,nofollow`; `robots.txt` disallows all).
- Production: run `npm run build:production` (equivalent to `VITE_INDEXABLE=true npm run build`). The draft conformance route keeps `noindex` through its page metadata, and `robots.txt` disallows `/documents/`; see `DEPLOYMENT.md` for the PDF header.

## Documents (conformance statement, compression comparison)

Sources live in `documents-source/` (see its README). `npm run documents` regenerates `src/content/generated/` and the CSV download; `npm run documents:pdf` also renders the PDF into `public/documents/` (commit it). The document identity (`documents.conformance` in `src/config/site.ts`: ID, revision, date, status, DICOM edition, PDF path and link label) must match the Markdown header; the build fails otherwise.

While the statement is a draft: keep the status "Draft - implementation review pending" and the link text "Download draft conformance statement (PDF)"; do not add app release/build numbers or version placeholders (the owner asked for them to be omitted for now; `scripts/build-documents.mjs` rejects version-like statements). When product engineering issues a final statement, update the Markdown, set `status`/`statusKind`, revision, date, filename and label in `src/config/site.ts`, replace the draft copy on the Integration page (`conformanceSection`), set `noindex: false` if the owner wants it indexed, regenerate the PDF and update `vercel.json`/host headers.

## Images

Originals stay in `assets-source/` (with `asset-manifest.json` recording provenance and review flags) and are never modified. `scripts/build-images.mjs` lists the screenshots used on the site with their crop bounds, alt text and captions. To add or change a screenshot:

1. Add an entry to `SCREENSHOTS` in `scripts/build-images.mjs` (id, source path, output stem, crop box, alt, caption, platform). Only use originals marked usable in `assets-source/asset-manifest.json` (see the review flags; the editorial guidance is in the parent folder's `ASSETS.md`).
2. Run `npm run images`. This regenerates `public/images/*`, `src/images/manifest.ts` and `DERIVATIVES.json`.
3. Reference the new id with `<ScreenshotFigure image="…" />` (or add it to a gallery list in `src/content/home.ts`).

App icons and favicons derive from the Apple icon; the Android icon is only used in the Android download panel. The social card (`public/social-card.jpg`) is composed by the same script.

## Optional contact form

The contact page uses the working email routes by default. To enable the form, set `VITE_CONTACT_FORM_ENDPOINT` in `.env` to an HTTPS endpoint that accepts a JSON `POST` (`name`, `email`, `organisation`, `topic`, `pacs`, `platform`, `message`) and responds with a 2xx status only on successful receipt. The endpoint must validate input server-side and must not log message bodies unnecessarily. "Enterprise Manager" is one of the topics and is pre-selected when the page is opened with `?topic=enterprise-manager`. No CAPTCHA, CRM or analytics are included; record any later integration in `DEPLOYMENT.md`.
