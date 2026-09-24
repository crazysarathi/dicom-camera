# Change report: website update v1.1

Prepared 24 September 2026 for Raster Images (owner) and DICOM Camera product engineering. Implements the change package in `../update-v2/` (instructions v1.1) in the existing website project. Nothing was published: no production infrastructure, DNS, licences, enrolment links or patient data were touched. Preview: `npm run preview` → http://localhost:4173 (local; the Vercel preview updates when the owner deploys).

## Completed work

| Package item | What was done |
| --- | --- |
| Appearance selector, light and dark tokens | Implemented as specified (System/Light/Dark selector, pre-paint script, dark tokens for every component and both WebGL accents, print always light), then **removed on 24 September 2026 at the owner's request**: the site has one appearance. The colour-token refactor stayed (all colours are CSS tokens; no raw hex or `bg-white` in components), which also removed stray hard-coded colours. The two appearance FAQs were dropped with it. |
| Homepage enterprise section | "Central control for enterprise deployments." introduction card with "Explore Enterprise Manager" → `/#/enterprise/#enterprise-manager`. Existing sections untouched. |
| Enterprise page | New addressable section `#enterprise-manager`: eyebrow "DICOM Camera Enterprise Manager", the supplied heading, lede, three capability cards, "What your organisation can manage" table, "From administration to capture" workflow illustration (administration lane and a separate App → PACS/archive lane; labelled as an illustration, no real link, token, QR code or address), and "Plan your managed deployment" with "Discuss Enterprise Manager". |
| Enterprise Manager enquiry | CTA opens `/#/contact/?topic=enterprise-manager`; the contact page shows the topic, uses `mailto:info@raster.in?subject=DICOM%20Camera%20Enterprise%20Manager%20enquiry`, and pre-selects "Enterprise Manager" in the optional form (which stays dormant without an endpoint). |
| Integration page | Compression section: plain-language intro, JPEG split into "JPEG, lossy" and "JPEG, lossless", link card to the compression guide, and a disclaimer that distinguishes the educational comparison from the release-specific document while keeping the receiving-system warnings. New "DICOM conformance" card with the visible status, document ID, revision, date, "Read the draft" and "Download draft conformance statement (PDF)". Both added to the "On this page" list. |
| `/compression/` (new) | The supplied guide: three approaches, uncompressed note, semantic comparison table (visible caption, column and row headers; card presentation below 768px; optional Lossless / Near-lossless / Lossy filter as a native radio group that keeps multi-mode families; unfiltered by default; CSV download), "Choose by requirement", the lossy-history note, the iOS-labelled video note, "Confirm the complete connection" with actions, and a "Standards references" disclosure with the official DICOM sources. Table rows are generated from the supplied CSV. |
| `/conformance/` (new) | Landing page with status "Draft - implementation review pending", document DCAM-DCS-001, Draft 0.1, 24 September 2026, reference edition DICOM 2026d, the download link labelled exactly "Download draft conformance statement (PDF)", "Request integration information", section navigation, the complete accessible HTML edition (headings with ids, semantic tables with captions and row headers, scrollable labelled table regions on phones), a print header with identity and status, and related links. Route metadata is `noindex`. No app release/build numbers, empty version fields or placeholders are rendered. |
| Conformance PDF | `public/documents/DICOM-Camera-DICOM-Conformance-Statement-Draft-0.1.pdf` (17 pages, A4, tagged, bookmarked; draft status in the running header and in the document; `application/pdf`; filename carries the revision). Rendered by `npm run documents:pdf` from the same Markdown as the HTML edition and committed as a static file. |
| Storage and retention | "Organisation-managed policies" section with the supplied copy (policy locks never change the send/Storage Commitment condition) and "Explore enterprise controls". Existing diagrams and copy unchanged. |
| Support | Six supplied FAQs appended (enterprise and compression). |
| Contact | Enterprise Manager topic (query string and form option). |
| Footer | "Compression guide" and "DICOM conformance" under "For organisations". |
| Breadcrumbs | The two new pages show Home › Integration › page. Top-level navigation unchanged. |
| Indexing controls | Draft route `noindex` via route metadata (also applied on client navigation); production `robots.txt` adds `Disallow: /documents/`; `vercel.json` sets `X-Robots-Tag: noindex, nofollow`, `Content-Type: application/pdf` and `nosniff` on the PDF path (takes effect when deployed); nginx example in `DEPLOYMENT.md`. |

Editable sources: page copy in `src/content/*.ts`; document sources in `documents-source/` (`DICOM-CONFORMANCE-DRAFT.md`, `compression-comparison.csv`, unchanged from the package); document identity in `src/config/site.ts`. `npm run documents` regenerates the typed content; `npm run documents:pdf` regenerates the PDF. Build, lint and verification scripts were extended (`scripts/build-documents.mjs`, `scripts/check-content.mjs`, `scripts/verify.mjs`).

Preserved: product positioning, genuine store screenshots and badges, download priority, the two existing contact routes, generic Android wording, the Swift statement for iOS, Quick Take and patient-first workflows, hash routing (`/#/…`), no internal library or repository names in public content.

## Verification actually run

Run on 24 September 2026 against the final build (`npm run build`, preview build with `noindex`), Chromium via Playwright unless stated; the machine-generated report is `verification/REPORT.md` and `verification/report.json`, with captures in `verification/screenshots/`.

| Check | Result |
| --- | --- |
| TypeScript (`npm run typecheck`) | pass |
| Build (`npm run build`: images, documents, client, SSR, prerender) | pass; 11 routes prerendered for content checks, redirect stubs for every route |
| Content boundary checks (`npm run lint:content`) | pass on 12 rendered pages: forbidden terms, one `<h1>`, canonical/robots/main, alt text, Three.js kept lazy, conformance status/identity/`noindex`, no version placeholders, no evidence-checklist material, PDF is a real PDF whose text carries the draft label (pdftotext), CSV download equals the source, every format on the compression page, Enterprise Manager wording, robots rules |
| Horizontal overflow (11 routes × 6 viewports: 360, 390, 768, 1024, 1440, 844×390 landscape) | none across 66 combinations |
| Console and page errors | none |
| axe-core (WCAG 2.0/2.1/2.2 A+AA, best practice) at 390 and 1440, all routes | 0 violations |
| Exactly one `<h1>` per page, broken images, content hidden after scrolling | pass / none / none |
| Internal links, store links, mailto routes (commercial, Enterprise Manager, support), PDF and CSV links | pass |
| Keyboard flows | 18/18 passed |
| Firefox smoke (home, support, integration, compression, conformance; desktop and 390px) | 0 page errors, no overflow |
| WebKit | not run (missing system libraries; needs sudo) |
| Manual visual review from captures | header and mobile sheet, Enterprise Manager section, comparison table (desktop) and cards (phone), conformance identity card and document, Integration cards, retention addition, FAQs, contact topic at desktop and phone widths |

Keyboard flows added for this update (all in `scripts/verify.mjs`): print media hides the chrome and shows the document print header; the mobile sheet lists the navigation links and the download action; the comparison filter is keyboard operable, keeps multi-mode families and defaults to the unfiltered table; the phone card presentation names every column; the conformance page shows the status and identity, the PDF link downloads a real `application/pdf` file with the labelled filename, and section links land on their headings; the Enterprise Manager call to action reaches `/#/contact/?topic=enterprise-manager` with the Enterprise Manager email subject; the homepage link lands on the Enterprise Manager section; the retention page keeps the success/commitment condition.

Not available on this machine: Safari/WebKit (Playwright's WebKit needs system libraries that require sudo). Real iOS/Android devices were not used; mobile checks are Chromium/Firefox viewport emulation. Lighthouse was not re-run for this update.

## Limitations and notes for the owner

- Hash routing: search engines see one URL. The draft route's `noindex` is page metadata that only a JavaScript-executing crawler reads; a fragment cannot carry its own HTTP header. The PDF path and `robots.txt` carry the enforceable controls. No site-wide `noindex` was added for production.
- `vercel.json` (PDF headers) is a source change; it applies when the owner deploys. If the site moves off Vercel, apply the equivalent header at the PDF path (see `DEPLOYMENT.md`).
- Regenerating the PDF requires Playwright's Chromium locally; hosting builds use the committed file.
- "DICOM Camera Enterprise Manager" is the package's recommended name, used throughout. Confirm it before production publication.
- The conformance draft was published exactly as supplied (Draft 0.1). No field was completed, no service was marked N/A, and no app version was added: the website project has no access to the mobile implementation, protocol traces or test artefacts.

## Unresolved conformance evidence (for product engineering)

All 22 items of `../update-v2/CONFORMANCE-EVIDENCE-CHECKLIST.md` remain open: E01 (exact iOS/Android versions, release status, entitlements), E02 (SOP Class inventory), E03 (DIMSE roles and association traces), E04 (transfer syntaxes actually negotiated and emitted), E05 (emitted sample objects), E06 (MWL keys and mapping), E07 (MPPS behaviour), E08 (UPS classes and states), E09 (QIDO/WADO/STOW details), E10 (UPS-RS transactions), E11 (Storage Commitment model and outcomes), E12 (definition of successful send and retention behaviour), E13 (Implementation Class UID, Version Name, limits, timeouts), E14 (character sets), E15 (SR templates), E16 (Presentation State details), E17 (security profiles and local data protection), E18 (configuration defaults, locks and precedence), E19 (Enterprise Manager platform scope, licence unit, leases, offline/grace/revocation rules, enrolment token security), E20 (HL7/FHIR interface details), E21 (applicability of Q/R, print, media, RTV, de-identification, audit, other web services), E22 (code sets and private attributes). The checklist itself stays outside `public/` and `dist/`; `npm run lint:content` fails if its identifiers appear in public files.

Before the statement can be issued: name exact app versions/platforms; replace unresolved role cells with verified Y/N values; remove unsupported service rows; keep verified N/A section positions; populate the applicable IOD/SR/security/mapping/code-set annexes; reconcile against the official PS3.2 Annex N template for the issuing edition; remove authoring notes; obtain product engineering approval; then update `documents.conformance` in `src/config/site.ts`, the Integration card copy, the filename/label, indexing and headers.

## Remaining owner inputs (unchanged from the first release, plus this update)

Feature availability by release/platform; legal policy scope and destinations for dicom.camera; commercial terms; a contact-form endpoint if a form is wanted; Android phone screenshots; confirmation of the Enterprise Manager name; the conformance evidence above; and explicit authorisation to publish.
