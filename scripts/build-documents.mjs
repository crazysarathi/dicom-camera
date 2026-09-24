// Builds the published documents from documents-source/:
//  - src/content/generated/conformance-document.ts  typed blocks for the HTML edition (/#/conformance/)
//  - src/content/generated/compression-rows.ts      comparison rows for /#/compression/
//  - public/documents/compression-comparison.csv    the downloadable CSV (copied unchanged)
//  - public/documents/<conformance pdf>              with --pdf: rendered by Chromium (Playwright) from the same
//                                                    blocks, with the draft status in the running header
//  - verification/documents/conformance-draft-print.html  the print HTML used for the PDF (private)
// The metadata in src/config/site.ts (document ID, revision, date, status) must match the Markdown header.
import { mkdir, readFile, writeFile, copyFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseMarkdown, inlineToText, blocksToText } from './lib/markdown.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SOURCE = path.join(ROOT, 'documents-source');
const GENERATED = path.join(ROOT, 'src', 'content', 'generated');
const PUBLIC_DOCS = path.join(ROOT, 'public', 'documents');
const PRINT_DIR = path.join(ROOT, 'verification', 'documents');
const WANT_PDF = process.argv.includes('--pdf');

// Expected identity (kept in sync with src/config/site.ts `documents.conformance`; the site config is TypeScript,
// so the values are repeated here and cross-checked by scripts/check-content.mjs against the built page).
const EXPECTED = {
  documentId: 'DCAM-DCS-001',
  revision: 'Draft 0.1',
  date: '24 September 2026',
  status: 'DRAFT - IMPLEMENTATION REVIEW PENDING',
  standardEdition: 'DICOM 2026d',
  pdfFilename: 'DICOM-Camera-DICOM-Conformance-Statement-Draft-0.1.pdf',
};
// Owner request: no app release/build numbers or version placeholders in the public document.
// Section numbers (1.1.1) and UIDs (1.2.840.10008…) are legitimate; only version-like statements are rejected.
const VERSION_PLACEHOLDERS = [
  /\b(app|application|product|release|build)\s+(version|number)\s*[:=]?\s*(v?\d+(\.\d+)+|tbc|tbd|x\.y|\[|_+)/i,
  /\bversion\s+(v?\d+\.\d+(\.\d+)*)\b(?!\s*(name|of the))/i,
  /\bv\d+\.\d+(\.\d+)?\b/,
  /\[(app\s+)?version\]/i,
  /\bx\.y(\.z)?\b/i,
  /\bunassigned (app )?version\b/i,
];

const siteConfig = await readFile(path.join(ROOT, 'src', 'config', 'site.ts'), 'utf8');
for (const [key, value] of Object.entries(EXPECTED)) {
  if (key === 'status') continue;
  if (!siteConfig.includes(`'${value}'`)) throw new Error(`src/config/site.ts does not contain the expected ${key} '${value}'`);
}

await mkdir(GENERATED, { recursive: true });
await mkdir(PUBLIC_DOCS, { recursive: true });
await mkdir(PRINT_DIR, { recursive: true });

/* ---------------- Compression comparison (CSV -> rows) ---------------- */

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') { row.push(field); field = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.some((c) => c.length)) rows.push(row);
      row = [];
    } else field += ch;
  }
  if (field.length || row.length) { row.push(field); if (row.some((c) => c.length)) rows.push(row); }
  return rows;
}

const csvPath = path.join(SOURCE, 'compression-comparison.csv');
const csvText = await readFile(csvPath, 'utf8');
const csv = parseCsv(csvText);
const [csvHeader, ...csvRows] = csv;
const expectedHeader = ['Format', 'Modes', 'Advantages', 'Tradeoffs', 'Selection consideration'];
if (csvHeader.join('|') !== expectedHeader.join('|')) throw new Error(`Unexpected CSV header: ${csvHeader.join(' | ')}`);

function modeTags(modes) {
  const tags = [];
  const m = modes.toLowerCase();
  if (/no compression/.test(m)) tags.push('none');
  if (/\blossless\b/.test(m.replace(/near-lossless/g, ''))) tags.push('lossless');
  if (/near-lossless/.test(m)) tags.push('near-lossless');
  if (/\blossy\b/.test(m)) tags.push('lossy');
  if (!tags.length) throw new Error(`Cannot classify modes "${modes}"`);
  return tags;
}
const rows = csvRows.map((r) => {
  if (r.length !== 5) throw new Error(`CSV row has ${r.length} fields: ${r.join(' | ')}`);
  const [format, modes, advantages, tradeoffs, consideration] = r.map((c) => c.trim());
  return { format, modes, modeTags: modeTags(modes), advantages, tradeoffs, consideration };
});
for (const r of rows) for (const re of [/\d+\s?%/, /\b\d+(\.\d+)?\s?(ms|s|kb|mb|x)\b/i]) if (re.test(`${r.advantages} ${r.tradeoffs} ${r.consideration}`)) throw new Error(`Numeric benchmark-like value in CSV row "${r.format}"`);
const q = (s) => JSON.stringify(s);
const rowsTs = `// GENERATED by scripts/build-documents.mjs from documents-source/compression-comparison.csv. Do not edit.
export type CompressionMode = 'none' | 'lossless' | 'near-lossless' | 'lossy';

export interface CompressionRow {
  /** Encoding family as named in the comparison (e.g. "JPEG, lossless"). */
  format: string;
  /** Modes exactly as written in the source ("Lossless; near-lossless"). */
  modes: string;
  /** Machine-readable modes for the optional filter; families with several modes carry every applicable tag. */
  modeTags: readonly CompressionMode[];
  advantages: string;
  tradeoffs: string;
  consideration: string;
}

export const compressionRows: readonly CompressionRow[] = [
${rows.map((r) => `  { format: ${q(r.format)}, modes: ${q(r.modes)}, modeTags: [${r.modeTags.map(q).join(', ')}], advantages: ${q(r.advantages)}, tradeoffs: ${q(r.tradeoffs)}, consideration: ${q(r.consideration)} },`).join('\n')}
];
`;
await writeFile(path.join(GENERATED, 'compression-rows.ts'), rowsTs);
await copyFile(csvPath, path.join(PUBLIC_DOCS, 'compression-comparison.csv'));

/* ---------------- Conformance statement (Markdown -> blocks) ---------------- */

const mdPath = path.join(SOURCE, 'DICOM-CONFORMANCE-DRAFT.md');
const md = await readFile(mdPath, 'utf8');
const blocks = parseMarkdown(md);
if (blocks[0]?.type !== 'heading' || blocks[0].level !== 1) throw new Error('The conformance Markdown must start with a level-1 title');
const title = blocks[0].text;
const firstSection = blocks.findIndex((b, i) => i > 0 && b.type === 'heading' && b.level === 2);
if (firstSection < 1) throw new Error('No level-2 section found');
const frontMatter = blocks.slice(1, firstSection);
const body = blocks.slice(firstSection);

const text = blocksToText(blocks);
const identity = text.match(/Document ID:\s*([^|\n]+?)\s*\|\s*Revision:\s*([^|\n]+?)\s*\|\s*Date:\s*([^\n]+)/);
if (!identity) throw new Error('Identity line "Document ID: … | Revision: … | Date: …" not found');
const found = { documentId: identity[1].trim(), revision: identity[2].trim(), date: identity[3].trim() };
for (const key of ['documentId', 'revision', 'date']) if (found[key] !== EXPECTED[key]) throw new Error(`Markdown ${key} "${found[key]}" differs from configured "${EXPECTED[key]}"`);
if (!text.includes(EXPECTED.status)) throw new Error(`Markdown does not carry the status label "${EXPECTED.status}"`);
if (!text.includes(EXPECTED.standardEdition)) throw new Error(`Markdown does not name the reference edition "${EXPECTED.standardEdition}"`);
for (const re of VERSION_PLACEHOLDERS) { const m = text.match(re); if (m) throw new Error(`Version placeholder "${m[0]}" found in the conformance Markdown; the owner asked for app versions to be omitted for now`); }
// The draft's own sections should not carry heading levels deeper than h5 (page h1 + document h2–h5).
for (const b of body) if (b.type === 'heading' && (b.level < 2 || b.level > 5)) throw new Error(`Unexpected heading level ${b.level}: ${b.text}`);

// Table of contents list: link entries to the matching section heading ids.
const headingIds = new Map(body.filter((b) => b.type === 'heading').map((b) => [b.text.trim(), b.id]));
let inToc = false;
for (const b of body) {
  if (b.type === 'heading') inToc = b.level === 2 && /table of contents/i.test(b.text);
  else if (inToc && b.type === 'list') {
    b.items = b.items.map((item) => {
      const label = inlineToText(item).trim();
      const id = headingIds.get(label);
      return id ? [{ type: 'link', href: `#${id}`, children: item }] : item;
    });
  }
}

const sections = body.filter((b) => b.type === 'heading' && b.level === 2).map((b) => ({ id: b.id, label: b.text }));
const docTs = `// GENERATED by scripts/build-documents.mjs from documents-source/DICOM-CONFORMANCE-DRAFT.md. Do not edit.
export type InlineNode =
  | { type: 'text'; text: string }
  | { type: 'strong'; children: InlineNode[] }
  | { type: 'link'; href: string; children: InlineNode[] };

export type DocumentBlock =
  | { type: 'heading'; level: 1 | 2 | 3 | 4 | 5 | 6; text: string; id: string; inline: InlineNode[] }
  | { type: 'paragraph'; inline: InlineNode[] }
  | { type: 'list'; ordered: boolean; items: InlineNode[][] }
  | { type: 'table'; header: InlineNode[][]; rows: InlineNode[][][] };

export const conformanceDocument = {
  title: ${q(title)},
  documentId: ${q(found.documentId)},
  revision: ${q(found.revision)},
  date: ${q(found.date)},
  status: ${q(EXPECTED.status)},
  /** Level-2 sections, for in-page navigation. */
  sections: ${JSON.stringify(sections, null, 2).replace(/\n/g, '\n  ')} as readonly { id: string; label: string }[],
  /** Status line, identity line, product scope and drafting notes that precede section 1. */
  frontMatter: ${JSON.stringify(frontMatter)} as readonly DocumentBlock[],
  body: ${JSON.stringify(body)} as readonly DocumentBlock[],
} as const;
`;
await writeFile(path.join(GENERATED, 'conformance-document.ts'), docTs);
console.log(`documents: ${rows.length} compression rows, conformance draft with ${sections.length} sections and ${body.length} blocks`);

/* ---------------- PDF edition (same blocks; Chromium print) ---------------- */

const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
function inlineHtml(nodes) {
  return nodes
    .map((n) => {
      if (n.type === 'text') return escapeHtml(n.text);
      if (n.type === 'strong') return `<strong>${inlineHtml(n.children)}</strong>`;
      return `<a href="${escapeHtml(n.href)}">${inlineHtml(n.children)}</a>`;
    })
    .join('');
}
function blocksHtml(list, { headingShift = 0, tableCaption = true } = {}) {
  let current = '';
  return list
    .map((b) => {
      if (b.type === 'heading') {
        current = b.text;
        const level = Math.min(6, b.level + headingShift);
        return `<h${level} id="${escapeHtml(b.id)}">${inlineHtml(b.inline)}</h${level}>`;
      }
      if (b.type === 'paragraph') return `<p>${inlineHtml(b.inline)}</p>`;
      if (b.type === 'list') return `<${b.ordered ? 'ol' : 'ul'}>${b.items.map((i) => `<li>${inlineHtml(i)}</li>`).join('')}</${b.ordered ? 'ol' : 'ul'}>`;
      const caption = tableCaption && current ? `<caption class="sr-only">Table in section ${escapeHtml(current)}</caption>` : '';
      return `<table>${caption}<thead><tr>${b.header.map((c) => `<th scope="col">${inlineHtml(c)}</th>`).join('')}</tr></thead><tbody>${b.rows
        .map((r) => `<tr>${r.map((c, i) => (i === 0 ? `<th scope="row">${inlineHtml(c)}</th>` : `<td>${inlineHtml(c)}</td>`)).join('')}</tr>`)
        .join('')}</tbody></table>`;
    })
    .join('\n');
}

const fontFile = path.join(ROOT, 'node_modules', '@fontsource-variable', 'inter', 'files', 'inter-latin-wght-normal.woff2');
const fontFace = existsSync(fontFile)
  ? `@font-face { font-family: 'Inter Variable'; font-style: normal; font-weight: 100 900; font-display: block; src: url('${pathToFileURL(fontFile).href}') format('woff2-variations'); }`
  : '';
const printHtml = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(title)} - ${escapeHtml(found.revision)} (${escapeHtml(EXPECTED.status)})</title>
<meta name="author" content="Raster Images" />
<meta name="description" content="${escapeHtml(`${found.documentId} ${found.revision}, ${found.date}. ${EXPECTED.status}. Structured on DICOM PS3.2 Annex N; reference edition ${EXPECTED.standardEdition}.`)}" />
<style>
${fontFace}
:root { color-scheme: light; }
* { box-sizing: border-box; }
html { font-size: 10.5pt; }
body { margin: 0; font-family: 'Inter Variable', Inter, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #142235; line-height: 1.5; background: #fff; }
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.cover { padding: 12mm 0 6mm; border-bottom: 2px solid #142235; margin-bottom: 8mm; }
.cover .eyebrow { font-size: 9pt; letter-spacing: 0.04em; text-transform: uppercase; font-weight: 600; color: #0B6F7A; margin: 0 0 6pt; }
.cover h1 { font-size: 22pt; line-height: 1.15; margin: 0 0 8pt; letter-spacing: -0.02em; }
.status { display: inline-block; border: 1.5px solid #142235; border-radius: 999px; padding: 3pt 10pt; font-weight: 700; font-size: 9.5pt; letter-spacing: 0.06em; text-transform: uppercase; margin: 0 0 8pt; }
.identity { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 3pt 18pt; margin: 0 0 8pt; padding: 0; list-style: none; font-size: 9.5pt; }
.identity li span { color: #526173; }
.front p { margin: 0 0 6pt; font-size: 9.5pt; }
h2 { font-size: 15pt; margin: 16pt 0 6pt; page-break-after: avoid; letter-spacing: -0.01em; }
h3 { font-size: 12.5pt; margin: 12pt 0 4pt; page-break-after: avoid; }
h4 { font-size: 11pt; margin: 10pt 0 3pt; page-break-after: avoid; }
h5 { font-size: 10.5pt; margin: 8pt 0 2pt; page-break-after: avoid; }
p { margin: 0 0 6pt; }
ul, ol { margin: 0 0 6pt; padding-left: 18pt; }
li { margin: 0 0 2pt; }
a { color: #175CD3; text-decoration: underline; overflow-wrap: anywhere; }
table { width: 100%; border-collapse: collapse; margin: 4pt 0 8pt; font-size: 9pt; page-break-inside: auto; }
thead { display: table-header-group; }
tr { page-break-inside: avoid; }
th, td { border: 0.6pt solid #B8C2CF; padding: 3.5pt 5pt; text-align: left; vertical-align: top; }
thead th { background: #EEF2F7; font-weight: 600; }
tbody th { font-weight: 600; background: #F7F9FC; }
strong { font-weight: 600; }
.end { margin-top: 14pt; padding-top: 8pt; border-top: 1px solid #DCE3EC; font-size: 9pt; color: #526173; }
</style>
</head>
<body>
<header class="cover">
  <p class="eyebrow">DICOM Camera · Raster Images</p>
  <h1>${escapeHtml(title)}</h1>
  <p class="status">${escapeHtml(EXPECTED.status)}</p>
  <ul class="identity">
    <li><span>Document:</span> ${escapeHtml(found.documentId)}</li>
    <li><span>Revision:</span> ${escapeHtml(found.revision)}</li>
    <li><span>Date:</span> ${escapeHtml(found.date)}</li>
    <li><span>Reference edition:</span> ${escapeHtml(EXPECTED.standardEdition)}</li>
  </ul>
</header>
<section class="front">
${blocksHtml(frontMatter, { tableCaption: false })}
</section>
<main>
${blocksHtml(body)}
</main>
<p class="end">${escapeHtml(found.documentId)} · ${escapeHtml(found.revision)} · ${escapeHtml(found.date)} · ${escapeHtml(EXPECTED.status)}. Generated from the Markdown source by the website build; the HTML edition at /conformance/ is derived from the same source.</p>
</body>
</html>
`;
const printPath = path.join(PRINT_DIR, 'conformance-draft-print.html');
await writeFile(printPath, printHtml);

if (WANT_PDF) {
  const { chromium } = await import('playwright');
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.emulateMedia({ media: 'print', colorScheme: 'light' });
    await page.goto(pathToFileURL(printPath).href, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts?.ready);
    const headerStyle = 'font-family: Inter, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; font-size: 7.5pt; color: #526173; width: 100%; padding: 0 14mm; display: flex; justify-content: space-between; align-items: center;';
    const out = path.join(PUBLIC_DOCS, EXPECTED.pdfFilename);
    await page.pdf({
      path: out,
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: false,
      margin: { top: '20mm', right: '14mm', bottom: '18mm', left: '14mm' },
      displayHeaderFooter: true,
      headerTemplate: `<div style="${headerStyle}"><span>DICOM Camera · ${escapeHtml(found.documentId)} · ${escapeHtml(found.revision)}</span><span style="font-weight:700; letter-spacing:0.06em;">${escapeHtml(EXPECTED.status)}</span></div>`,
      footerTemplate: `<div style="${headerStyle}"><span>${escapeHtml(found.date)} · Raster Images</span><span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span></div>`,
      outline: true,
      tagged: true,
    });
    const size = (await stat(out)).size;
    console.log(`PDF written: ${path.relative(ROOT, out)} (${(size / 1024).toFixed(0)} KB)`);
  } finally {
    await browser.close();
  }
} else if (!existsSync(path.join(PUBLIC_DOCS, EXPECTED.pdfFilename))) {
  console.warn(`WARNING: ${EXPECTED.pdfFilename} is missing from public/documents/. Run "npm run documents:pdf" and commit the file.`);
}
