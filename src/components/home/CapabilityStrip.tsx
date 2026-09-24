import { cn } from '@/lib/utils';

interface CapabilityStripProps {
  /** Accessible name for the list, e.g. 'Enterprise capabilities'. */
  label: string;
  items: readonly string[];
  className?: string;
}

/** Compact strip of real enterprise capabilities: plain labelled items, no seals or badges. */
export function CapabilityStrip({ label, items, className }: CapabilityStripProps) {
  return (
    <div className={cn('border-y border-line bg-card', className)}>
      <div className="container-content">
        <ul
          aria-label={label}
          className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 py-4 text-[0.95rem] font-medium text-muted-foreground sm:gap-x-10 lg:py-5"
        >
          {items.map((item) => (
            <li key={item} className="inline-flex items-center gap-2.5">
              <span className="size-1.5 rounded-full bg-teal" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
