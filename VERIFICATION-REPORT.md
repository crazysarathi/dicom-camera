# Verification report

Preview build of the DICOM Camera website, verified on 24 September 2026. This is a local/staging preview: nothing has been published, no DNS changed, nothing purchased, and the existing raster.in pages were not touched.

## Preview location and routes

- Local preview: `npm run preview` → http://localhost:4173 (serves `dist/`). A preview server was left running on port 4173 during verification.
- Routing is hash-based (owner decision): `/` (home), `/#/workflows/`, `/#/enterprise/`, `/#/integration/`, `/#/privacy-and-retention/`, `/#/download/`, `/#/support/`, `/#/contact/`, plus a not-found page for any other hash path. Legacy path URLs (`/workflows/` …) and `/404.html` are redirect stubs to the matching hash route.
- The build in `dist/` is the staging variant (`noindex,nofollow`, restrictive `robots.txt`). `npm run build:production` produces the indexable variant.

## Key design and implementation decisions

- Stack as requested by the owner: React 18 + TypeScript + Vite 5, Tailwind 3 with shadcn-style Radix primitives, GSAP 3 (ScrollTrigger reveals, SplitText headings, ScrollSmoother on wide pointer devices only, ScrollTo for anchors), Three.js + React Three Fiber + drei for two procedural brand accents (aperture behind the hero; connectivity graph on the homepage and Integration page), lucide-react icons, sonner toasts.
- Homepage is prerendered at build time and hydrated; other hash routes render on the client. The prerender step also writes private server renders of every route to `verification/prerendered/` for content checks.
- Copy is verbatim from `WEBSITE-COPY.md`, stored as typed content files; destinations, emails and switches live in `src/config/site.ts`.
- Owner changes applied during the build: no store badges or buttons in closing bands (heading and paragraph only); badges at most once per page body plus the footer; footer badges aligned on their visible edges; breadcrumbs on pages not in the header navigation; back-to-top control; segmented-control tabs; pill buttons; hash routing; original assets moved into `assets-source/`.
- Palette follows the brief with one measured adjustment: the teal accent was darkened from #087F8C to #0B6F7A so small teal text meets 4.5:1 on the near-white surface.
- Screenshots: six approved store compositions only (see `ASSET-USAGE.md`). Each is a faithful crop to the existing device frame with the legacy promotional headline removed and the white canvas outside the frame made transparent. The Google Play artwork shows a tablet-proportioned device mockup; to avoid presenting Android as a tablet, the site shows the app screen itself (a faithful crop inside the frame) as a compact bordered screen. No screenshot text or controls were edited; captions acknowledge the earlier "Quick Photos" label where it appears.
- Motion respects `prefers-reduced-motion` (no reveals, no split, no smoother, static 3D frame). WebGL scenes are deferred until load + idle + near-viewport, skipped without WebGL or with save-data, paused when hidden or offscreen, and are `aria-hidden`.
- Contact and support use the working email routes (mail app opens; visible selectable addresses; accessible copy control with confirmation). A full contact form with idle/validating/submitting/success/server-error/offline states is implemented but dormant until `VITE_CONTACT_FORM_ENDPOINT` is configured; no fake submission exists.

## Checks performed (`npm run verify`, Chromium via Playwright)

| Check | Result |
| --- | --- |
| Horizontal overflow at 360, 390, 768, 1024, 1440 and 844×390 landscape, all 9 routes | none (54 combinations) |
| Console and page errors | none |
| axe-core scan (WCAG 2.0/2.1/2.2 A+AA, best practice) at 390 and 1440, all routes | 0 violations |
| Exactly one `<h1>` per page | yes |
| Broken images | none |
| Content still hidden after scrolling (reveal/split safety) | none |
| Internal links resolve to known routes; store links are the exact verified URLs; only the two approved mailto routes | pass |
| 200% zoom approximation (720px viewport, desktop UA) | no overflow |
| Firefox smoke (home, support, integration; desktop and 390px) | 0 page errors, no overflow |
| WebKit | not run: this machine lacks system libraries (libgstreamer-plugins-bad, libavif16) and installing them needs sudo. Safari/WebKit was therefore not tested. |

Keyboard flows:

- PASS — skip link appears on Tab and moves focus to main
- PASS — mobile navigation opens with keyboard, traps focus, Escape closes and returns focus
- PASS — FAQ disclosures open/close with keyboard on /support/
- PASS — copy email control on /#/support/ copies support@raster.in and confirms
- PASS — copy email control on /#/contact/ copies info@raster.in and confirms
- PASS — screenshot viewer (if present) opens, traps focus, Escape closes and returns focus
- PASS — platform tabs (if present) are keyboard operable
- PASS — 200% zoom equivalent (720px wide, desktop UA) has no horizontal overflow on home
- PASS — legacy path URLs redirect to hash routes (/workflows/ → /#/workflows/)
- PASS — back-to-top control appears after scrolling, is keyboard operable and returns to the top

Screenshots of every route at every width are in `verification/screenshots/` (full-page at 390 and 1440, captured with reduced motion so GSAP ScrollSmoother does not distort stitching). Finished homepage: `verification/screenshots/home-1440.png` (desktop) and `verification/screenshots/home-390.png` (mobile).

Content boundary checks (`npm run lint:content`): pass on the deployed homepage and all private route renders — no internal toolkit/library names, repository links, open-source wording, legacy store headlines, pricing, HIPAA/GDPR, "free", "coming soon" or placeholder text; canonical/robots/main present; every image has alt text; the homepage contains the required Swift, Quick Take, DICOMweb service and Storage Commitment wording; Three.js stays out of the entry bundle.

Manual checks: visual review of all routes at desktop and mobile widths from the captures above; badge sizing (Google Play visible badge equal or larger than App Store); hero one-screen fit at 1440×900 and 390×844; mobile section order (proposition → badges → screenshot → supporting line); diagrams stack on narrow screens with their text equivalents; tables stack on narrow screens.

## Lighthouse (mobile emulation, simulated slow-4G throttling, Lighthouse 13.5, headless Chrome 144)

Preview build (noindex — SEO is capped at 69 solely by the intentional `is-crawlable` failure; all other SEO audits pass):

| Route | Performance | Accessibility | Best practices | SEO | LCP | CLS | TBT | FCP |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| / | 96 | 100 | 100 | 69 | 2.6 s | 0 | 0 ms | 1.7 s |
| /workflows/ | 94 | 100 | 100 | 69 | 2.9 s | 0 | 20 ms | 1.8 s |
| /integration/ | 95 | 100 | 100 | 69 | 2.8 s | 0 | 10 ms | 1.8 s |
| /support/ | 94 | 100 | 100 | 69 | 2.8 s | 0 | 20 ms | 1.8 s |
| /download/ | 94 | 100 | 100 | 69 | 2.8 s | 0 | 20 ms | 1.8 s |

Production build (indexable), homepage: Performance 97, Accessibility 100, Best practices 100, SEO 100, LCP 2.5 s, CLS 0 (`verification/lighthouse/production/home-mobile.report.json`).

Measured LCP on sub-routes is 2.6–2.9 s in this profile because hash routes render on the client after the homepage shell hydrates; the homepage itself is prerendered. These are local lab measurements, not field data; no INP or real-user claims are made.

## Remaining external launch inputs (owner)

1. Confirm expanded feature availability by release and platform (Quick Take, Photo Album import, MWL/MPPS, UPS/UPS-RS, HL7/FHIR, DICOMweb services, compression families, Storage Commitment gating, annotations, iOS video). Withdraw or adjust any claim not shipped before production.
2. Confirm legal policy scope and destinations for dicom.camera. The footer currently links Raster's published app privacy page and terms page as references (`src/config/site.ts`); supply approved text or destinations if those do not cover this website.
3. Optional: a formal DICOM Conformance Statement (the site uses "Request integration information" until one exists).
4. Optional: Android phone screenshots. The Play artwork's device mockup is tablet-proportioned, so Android currently shows bare app screens.
5. Optional: a real contact-form endpoint (the email routes work today).
6. Explicit authorisation to publish, plus hosting choice and DNS for `dicom.camera`. Note the hash-routing trade-off: search engines index the site as one URL; per-page indexing would require switching back to path routing (the prerender path already exists).

## Not done / limitations

- WebKit/Safari not tested (see above). Chromium and Firefox were tested.
- The 3D scenes were checked visually in Chromium only; an automated independent review of the reworked connectivity scene was interrupted and not repeated.
- No analytics, CAPTCHA, CRM or newsletter were added, by design.

## Update v1.1 (24 September 2026): Enterprise Manager, compression guide, draft conformance statement

Scope and results are in `CHANGE-REPORT-v1.1.md`. In brief, re-run on the final build: typecheck and build pass; `npm run lint:content` passes on 12 rendered pages (now including the conformance and compression routes and the document checks); no horizontal overflow across 11 routes × 6 viewports; 0 console errors; 0 axe violations at 390 and 1440; keyboard flows 18/18 passed; Firefox smoke clean; WebKit still not runnable on this machine. A light/dark appearance option was built and verified during this update and then removed at the owner's request; the site has one appearance. Additional launch input from this update: the conformance evidence list (E01–E22) needed before the draft can be issued, and confirmation of the "DICOM Camera Enterprise Manager" name.
