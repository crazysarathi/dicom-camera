import { useId, useState } from 'react';
import { Download } from 'lucide-react';
import { SegmentedRadioGroup } from '@/components/ui/segmented';
import { compressionModes, type CompressionMode, type CompressionRow } from '@/content/compression';
import { cn } from '@/lib/utils';

type Filter = 'all' | CompressionMode;

interface CompressionTableProps {
  rows: readonly CompressionRow[];
  caption: string;
  columns: { format: string; modes: string; advantages: string; tradeoffs: string; consideration: string };
  filter: { legend: string; all: string; status: (shown: number, total: number) => string; note: string };
  csv?: { url: string; filename: string; label: string };
  className?: string;
}

/** Mode names as visible text chips (never colour alone). */
function ModeChips({ modes }: { modes: string }) {
  return (
    <span className="flex flex-wrap gap-1.5">
      {modes.split(';').map((m) => m.trim()).filter(Boolean).map((m) => m.charAt(0).toUpperCase() + m.slice(1)).map((m) => (
        <span key={m} className="inline-flex min-h-6 items-center rounded-full border border-line bg-secondary px-2 text-[0.75rem] font-semibold text-ink">
          {m}
        </span>
      ))}
    </span>
  );
}

/**
 * Qualitative comparison of encoding families. From the md breakpoint it is a real table (caption,
 * column headers, row headers); below it every row is a card with each column named, so nothing is
 * hidden on phones. The optional mode filter is a native radio group; the unfiltered table is the
 * default and families with several modes stay listed in every applicable view. Reading the table
 * never requires interaction.
 */
export function CompressionTable({ rows, caption, columns, filter, csv, className }: CompressionTableProps) {
  const [mode, setMode] = useState<Filter>('all');
  const name = useId();
  const shown = mode === 'all' ? rows : rows.filter((r) => r.modeTags.includes(mode));
  const options = [{ value: 'all' as Filter, label: filter.all }, ...compressionModes.map((m) => ({ value: m.value as Filter, label: m.label }))];
  const statusText = mode === 'all' ? '' : filter.status(shown.length, rows.length);
  return (
    <div className={cn(className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <SegmentedRadioGroup legend={filter.legend} name={name} value={mode} onChange={setMode} options={options} wrap />
        {csv && (
          <a
            href={csv.url}
            download={csv.filename}
            type="text/csv"
            className="inline-flex min-h-11 items-center gap-2 rounded-md text-[0.95rem] font-semibold text-primary no-underline hover:text-primary-deep hover:underline"
          >
            <Download className="size-4" aria-hidden="true" />
            {csv.label}
          </a>
        )}
      </div>
      <p role="status" aria-live="polite" className={cn('mt-3 text-sm text-muted-foreground', !statusText && 'sr-only')}>
        {statusText ? `${statusText}. ${filter.note}` : ''}
      </p>

      {/* Table from md up */}
      <div className="card-surface mt-5 hidden overflow-hidden md:block">
        <table className="w-full border-collapse text-left">
          <caption className="border-b border-line px-5 py-4 text-left text-[0.95rem] font-medium text-ink">{caption}</caption>
          <thead>
            <tr>
              {[columns.format, columns.modes, columns.advantages, columns.tradeoffs, columns.consideration].map((label) => (
                <th key={label} scope="col" className="border-b border-line bg-secondary/60 px-4 py-3 align-bottom text-[0.8125rem] font-semibold uppercase tracking-wider text-muted-foreground first:pl-5 last:pr-5">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.map((row) => (
              <tr key={row.format} className="border-b border-line last:border-b-0">
                <th scope="row" className="w-[15%] px-4 py-4 pl-5 align-top text-[1rem] font-semibold leading-snug text-ink">
                  {row.format}
                </th>
                <td className="w-[15%] px-4 py-4 align-top text-[0.95rem] leading-relaxed text-ink">
                  <ModeChips modes={row.modes} />
                </td>
                <td className="px-4 py-4 align-top text-[0.95rem] leading-relaxed text-ink">{row.advantages}</td>
                <td className="px-4 py-4 align-top text-[0.95rem] leading-relaxed text-ink">{row.tradeoffs}</td>
                <td className="px-4 py-4 pr-5 align-top text-[0.95rem] leading-relaxed text-ink">{row.consideration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards below md */}
      <div className="mt-5 md:hidden">
        <p className="text-[0.95rem] font-medium text-ink">{caption}</p>
        <ul className="mt-4 grid gap-4">
          {shown.map((row) => (
            <li key={row.format} className="card-surface p-5">
              <h3 className="text-lg font-semibold leading-snug text-ink sm:text-lg">{row.format}</h3>
              <dl className="mt-3 grid gap-3">
                <div>
                  <dt className="text-[0.75rem] font-semibold uppercase tracking-wider text-muted-foreground">{columns.modes}</dt>
                  <dd className="mt-1.5"><ModeChips modes={row.modes} /></dd>
                </div>
                {[
                  [columns.advantages, row.advantages],
                  [columns.tradeoffs, row.tradeoffs],
                  [columns.consideration, row.consideration],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-[0.75rem] font-semibold uppercase tracking-wider text-muted-foreground">{label}</dt>
                    <dd className="mt-1 text-[0.95rem] leading-relaxed text-ink">{value}</dd>
                  </div>
                ))}
              </dl>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
