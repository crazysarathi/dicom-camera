import { Fragment, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { DocumentBlock, InlineNode } from '@/content/generated/conformance-document';
import { cn } from '@/lib/utils';

/** Inline Markdown nodes (text, bold, links). In-page links go through the router so hash routing keeps working. */
export function DocumentInline({ nodes }: { nodes: readonly InlineNode[] }) {
  return (
    <>
      {nodes.map((node, i) => {
        if (node.type === 'text') return <Fragment key={i}>{node.text}</Fragment>;
        if (node.type === 'strong') return <strong key={i}><DocumentInline nodes={node.children} /></strong>;
        if (node.href.startsWith('#')) {
          return (
            <Link key={i} to={node.href}>
              <DocumentInline nodes={node.children} />
            </Link>
          );
        }
        return (
          <a key={i} href={node.href} rel="noopener">
            <DocumentInline nodes={node.children} />
          </a>
        );
      })}
    </>
  );
}

interface DocumentBlocksProps {
  blocks: readonly DocumentBlock[];
  /** Added to Markdown heading levels (the page already owns the H1, so the document's "##" stays h2 with 0). */
  headingShift?: 0 | 1;
  /** Prefix for generated table captions, e.g. "Table in section"; the current heading text follows. */
  tableCaptionPrefix?: string;
  className?: string;
}

const HEADING_TAGS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const;

/**
 * Renders parsed Markdown blocks as accessible HTML: headings with stable ids, paragraphs, lists and
 * semantic tables (caption, column headers, first column as row headers). Wide tables scroll inside a
 * labelled, keyboard-focusable region on narrow screens instead of hiding columns.
 */
export function DocumentBlocks({ blocks, headingShift = 0, tableCaptionPrefix = 'Table in section', className }: DocumentBlocksProps) {
  let current = '';
  const out: ReactNode[] = blocks.map((block, index) => {
    if (block.type === 'heading') {
      current = block.text;
      const Tag = HEADING_TAGS[Math.min(5, block.level - 1 + headingShift)];
      return (
        <Tag key={index} id={block.id}>
          <DocumentInline nodes={block.inline} />
        </Tag>
      );
    }
    if (block.type === 'paragraph') {
      return (
        <p key={index}>
          <DocumentInline nodes={block.inline} />
        </p>
      );
    }
    if (block.type === 'list') {
      const ListTag = block.ordered ? 'ol' : 'ul';
      return (
        <ListTag key={index}>
          {block.items.map((item, i) => (
            <li key={i}>
              <DocumentInline nodes={item} />
            </li>
          ))}
        </ListTag>
      );
    }
    const captionText = current ? `${tableCaptionPrefix} ${current}` : 'Table';
    return (
      <div key={index} className="table-wrap" role="region" aria-label={captionText} tabIndex={0}>
        <table>
          <caption className="sr-only">{captionText}</caption>
          <thead>
            <tr>
              {block.header.map((cell, i) => (
                <th key={i} scope="col">
                  <DocumentInline nodes={cell} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, r) => (
              <tr key={r}>
                {row.map((cell, c) =>
                  c === 0 ? (
                    <th key={c} scope="row">
                      <DocumentInline nodes={cell} />
                    </th>
                  ) : (
                    <td key={c}>
                      <DocumentInline nodes={cell} />
                    </td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  });
  return <div className={cn('document', className)}>{out}</div>;
}
