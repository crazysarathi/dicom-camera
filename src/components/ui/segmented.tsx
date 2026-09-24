import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  icon?: LucideIcon;
}

interface SegmentedRadioGroupProps<T extends string> {
  /** Accessible name of the group (rendered as the fieldset legend). */
  legend: string;
  legendVisuallyHidden?: boolean;
  name: string;
  value: T;
  onChange: (value: T) => void;
  options: readonly SegmentedOption<T>[];
  className?: string;
  /** Let the pills wrap onto several lines instead of sharing one row. */
  wrap?: boolean;
}

/**
 * Native radio buttons styled as a segmented control (used by the compression mode filter). Keyboard behaviour (arrow keys move the
 * selection, Tab leaves the group) and announcements come from the browser; the checked pill is
 * shown by a raised fill, a ring and the icon tint together, not by colour alone.
 */
export function SegmentedRadioGroup<T extends string>({ legend, legendVisuallyHidden, name, value, onChange, options, className, wrap }: SegmentedRadioGroupProps<T>) {
  return (
    <fieldset className={cn('m-0 min-w-0 border-0 p-0', className)}>
      <legend className={cn('mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground', legendVisuallyHidden && 'sr-only')}>{legend}</legend>
      <div className={cn('inline-flex max-w-full items-center gap-1 rounded-full border border-line/80 bg-secondary p-1', wrap ? 'flex-wrap' : 'w-full')}>
        {options.map((option) => {
          const Icon = option.icon;
          const checked = value === option.value;
          const id = `${name}-${option.value}`;
          return (
            <label
              key={option.value}
              htmlFor={id}
              className={cn(
                'relative inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full px-3 text-sm font-semibold transition-[background-color,color,box-shadow] duration-200 sm:px-4',
                !wrap && 'flex-1',
                checked ? 'bg-pill text-ink shadow-tab' : 'text-muted-foreground hover:text-ink',
                'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-secondary',
              )}
            >
              <input type="radio" id={id} name={name} value={option.value} checked={checked} onChange={() => onChange(option.value)} className="sr-only" />
              {Icon && <Icon className={cn('size-4 shrink-0', checked ? 'text-primary' : 'text-muted-foreground')} aria-hidden="true" />}
              {option.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
