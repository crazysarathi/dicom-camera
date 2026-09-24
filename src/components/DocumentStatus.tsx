import { FileCheck2, FilePen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DocumentStatusProps {
  /** Visible status text, e.g. "Draft - implementation review pending". */
  status: string;
  kind: 'draft' | 'issued';
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * Document status label. The status is carried by the visible text (and an icon that matches it);
 * colour is not the only cue, so the label reads the same in both appearances and in print.
 */
export function DocumentStatus({ status, kind, size = 'md', className }: DocumentStatusProps) {
  const Icon = kind === 'draft' ? FilePen : FileCheck2;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-semibold uppercase tracking-[0.06em]',
        kind === 'draft' ? 'border-ink/40 bg-secondary text-ink' : 'border-teal/40 bg-teal-soft text-ink',
        size === 'sm' ? 'px-2.5 py-0.5 text-[0.6875rem]' : 'px-3 py-1 text-xs',
        className,
      )}
    >
      <Icon className={size === 'sm' ? 'size-3.5' : 'size-4'} aria-hidden="true" />
      {status}
    </span>
  );
}
