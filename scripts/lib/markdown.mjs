// Minimal Markdown parser for the document sources (headings, paragraphs, pipe tables, bullet and
// numbered lists, bold, links). It covers exactly the constructs used by documents-source/*.md and
// fails loudly on anything else, so the HTML and PDF editions never silently drop content.

/** @typedef {{ type: 'text', text: string } | { type: 'strong', children: Inline[] } | { type: 'link', href: string, children: Inline[] }} Inline */

/** Parse inline Markdown (bold and links only) into inline nodes. */
export function parseInline(text) {
  const out = [];
  let rest = text;
  const push = (t) => { if (t) out.push({ type: 'text', text: t }); };
  while (rest.length) {
    const link = rest.match(/^\[([^\]]+)\]\(([^)\s]+)\)/);
    if (link) { out.push({ type: 'link', href: link[2], children: parseInline(link[1]) }); rest = rest.slice(link[0].length); continue; }
    const strong = rest.match(/^\*\*([^*]+)\*\*/);
    if (strong) { out.push({ type: 'strong', children: parseInline(strong[1]) }); rest = rest.slice(strong[0].length); continue; }
    const next = rest.slice(1).search(/\[[^\]]+\]\(|\*\*/);
    if (next === -1) { push(rest); rest = ''; } else { push(rest.slice(0, next + 1)); rest = rest.slice(next + 1); }
  }
  // Merge adjacent text runs.
  return out.reduce((acc, node) => {
    const last = acc[acc.length - 1];
    if (node.type === 'text' && last?.type === 'text') last.text += node.text; else acc.push(node);
    return acc;
  }, []);
}

export function inlineToText(nodes) {
  return nodes.map((n) => (n.type === 'text' ? n.text : inlineToText(n.children))).join('');
}

function splitRow(line) {
  // Cells never contain escaped pipes in these sources; keep it strict.
  const trimmed = line.trim().replace(/^\|/, '').replace(/\|$/, '');
  return trimmed.split('|').map((c) => c.trim());
}

/** Stable, readable id from a heading ("1.2 DIMSE services" -> "s-1-2-dimse-services"). */
export function slugify(text) {
  const base = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return /^[a-z]/.test(base) ? base : `s-${base}`;
}

/**
 * Parse a Markdown document into blocks:
 *  { type: 'heading', level, text, inline, id }
 *  { type: 'paragraph', inline }
 *  { type: 'list', ordered, items: Inline[][] }
 *  { type: 'table', header: Inline[][], rows: Inline[][][] }
 */
export function parseMarkdown(source) {
  const lines = source.replace(/\r\n?/g, '\n').split('\n');
  const blocks = [];
  const ids = new Map();
  let i = 0;
  const uniqueId = (text) => {
    const base = slugify(text);
    const n = (ids.get(base) ?? 0) + 1;
    ids.set(base, n);
    return n === 1 ? base : `${base}-${n}`;
  };
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    const heading = line.match(/^(#{1,6})\s+(.+?)\s*#*\s*$/);
    if (heading) {
      const text = heading[2];
      blocks.push({ type: 'heading', level: heading[1].length, text, inline: parseInline(text), id: uniqueId(text) });
      i++; continue;
    }
    if (line.trim().startsWith('|')) {
      const header = splitRow(line);
      const sep = lines[i + 1] ?? '';
      if (!/^\s*\|?\s*:?-{3,}/.test(sep)) throw new Error(`Table at line ${i + 1} has no separator row`);
      const rows = [];
      i += 2;
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        const cells = splitRow(lines[i]);
        if (cells.length !== header.length) throw new Error(`Table row at line ${i + 1} has ${cells.length} cells, expected ${header.length}`);
        rows.push(cells.map(parseInline));
        i++;
      }
      blocks.push({ type: 'table', header: header.map(parseInline), rows });
      continue;
    }
    const bullet = line.match(/^\s*[-*]\s+(.+)$/);
    const numbered = line.match(/^\s*\d+[.)]\s+(.+)$/);
    if (bullet || numbered) {
      const ordered = !!numbered;
      const items = [];
      while (i < lines.length) {
        const m = ordered ? lines[i].match(/^\s*\d+[.)]\s+(.+)$/) : lines[i].match(/^\s*[-*]\s+(.+)$/);
        if (!m) break;
        items.push(parseInline(m[1].trim()));
        i++;
      }
      blocks.push({ type: 'list', ordered, items });
      continue;
    }
    if (/^\s*(```|>|<)/.test(line)) throw new Error(`Unsupported Markdown construct at line ${i + 1}: ${line.slice(0, 40)}`);
    // Paragraph: consecutive non-blank lines that are not another construct.
    const para = [];
    while (i < lines.length && lines[i].trim() && !/^(#{1,6})\s/.test(lines[i]) && !lines[i].trim().startsWith('|') && !/^\s*([-*]|\d+[.)])\s+/.test(lines[i])) {
      para.push(lines[i].trim());
      i++;
    }
    blocks.push({ type: 'paragraph', inline: parseInline(para.join(' ')) });
  }
  return blocks;
}

/** Plain text of every block, for content checks and round-trip comparison. */
export function blocksToText(blocks) {
  const parts = [];
  for (const b of blocks) {
    if (b.type === 'heading') parts.push(b.text);
    else if (b.type === 'paragraph') parts.push(inlineToText(b.inline));
    else if (b.type === 'list') parts.push(...b.items.map(inlineToText));
    else if (b.type === 'table') { parts.push(b.header.map(inlineToText).join(' ')); for (const r of b.rows) parts.push(r.map(inlineToText).join(' ')); }
  }
  return parts.join('\n');
}
