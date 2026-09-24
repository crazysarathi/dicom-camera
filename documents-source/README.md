# Document sources

Editable sources for the published documents. `scripts/build-documents.mjs` turns them into typed
content for the website (`src/content/generated/`) and static downloads (`public/documents/`).

| Source | Generates |
| --- | --- |
| `DICOM-CONFORMANCE-DRAFT.md` | `src/content/generated/conformance-document.ts` (HTML edition on `/#/conformance/`) and, with `npm run documents:pdf`, `public/documents/DICOM-Camera-DICOM-Conformance-Statement-Draft-0.1.pdf` |
| `compression-comparison.csv` | `src/content/generated/compression-rows.ts` (comparison table on `/#/compression/`) and `public/documents/compression-comparison.csv` (download) |

Rules:

- The conformance Markdown is the single source of truth for both the HTML and the PDF edition. Its
  document ID, revision, date and status must match `documents.conformance` in `src/config/site.ts`;
  the build script fails when they differ.
- Keep the draft label until product engineering issues a final statement. Do not add app release or
  build numbers, version placeholders or "TBC version" fields; the owner has asked for them to be
  omitted for now. The document revision (Draft 0.1) and the DICOM edition (2026d) are separate
  identifiers and stay.
- Internal material (the conformance evidence checklist, source notes, the change package) stays
  outside this folder and outside `public/`.
- Run `npm run documents:pdf` after editing the Markdown, then commit the regenerated PDF. The PDF is
  a committed static file so hosting builds do not need a browser.
