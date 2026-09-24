import { cn } from '@/lib/utils';

export interface CapabilityTableRow {
  term: string;
  description: string;
}

interface CapabilityTableProps {
  /** Table caption. Rendered visually unless a nearby heading already names the table. */
  caption: string;
  columns: [string, string];
  rows: CapabilityTableRow[];
  captionVisuallyHidden?: boolean;
  className?: string;
  id?: string;
}

/**
 * Two-column capability table. On wide screens it is a conventional table; below the `md` breakpoint
 * every row becomes a stacked block with the term as a bold label. The transformation is CSS-only, and
 * explicit table roles keep the table semantics for assistive technology when the display type changes,
 * so screen readers hear one table at every width. The column headers stay in the accessible tree
 * (visually hidden) at narrow widths; no pseudo-content is added, so nothing is announced twice.
 */
export function CapabilityTable({ caption, columns, rows, captionVisuallyHidden = false, className, id }: CapabilityTableProps) {
  return (
    <table id={id} role="table" className={cn('block w-full border-collapse text-left md:table', className)}>
      <caption className={cn('text-left', captionVisuallyHidden ? 'sr-only' : 'mb-4 block text-base font-semibold text-ink md:table-caption')}>
        {caption}
      </caption>
      <thead role="rowgroup" className="sr-only md:not-sr-only md:table-header-group">
        <tr role="row" className="block md:table-row">
          <th role="columnheader" scope="col" className="block md:table-cell md:w-[36%] md:border-b md:border-line md:py-3 md:pr-6 md:text-sm md:font-semibold md:uppercase md:tracking-wider md:text-muted-foreground">
            {columns[0]}
          </th>
          <th role="columnheader" scope="col" className="block md:table-cell md:border-b md:border-line md:py-3 md:text-sm md:font-semibold md:uppercase md:tracking-wider md:text-muted-foreground">
            {columns[1]}
          </th>
        </tr>
      </thead>
      <tbody role="rowgroup" className="block md:table-row-group">
        {rows.map((row) => (
          <tr key={row.term} role="row" className="block border-b border-line py-4 first:border-t md:table-row md:py-0 md:first:border-t-0">
            <th role="rowheader" scope="row" className="block pr-0 align-top text-[1.0625rem] font-semibold leading-snug text-ink md:table-cell md:py-4 md:pr-6">
              {row.term}
            </th>
            <td role="cell" className="block pt-1.5 align-top text-[1rem] leading-relaxed text-muted-foreground md:table-cell md:py-4 md:pt-4 md:text-[1.0625rem]">
              {row.description}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
