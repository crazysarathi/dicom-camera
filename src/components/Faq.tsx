import { useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FaqEntry {
  question: string;
  answer: string;
}

interface FaqProps {
  items: readonly FaqEntry[];
  className?: string;
  /** Prefix for generated ids so several lists can share a page. */
  idPrefix?: string;
}

/**
 * Native <details>/<summary> disclosures: readable without JavaScript, keyboard operable, with the
 * question as a real heading. The chevron rotates via the details[open] state; the answer fades in
 * with a short CSS-only transition that the global reduced-motion rule shortens to nothing.
 */
export function Faq({ items, className, idPrefix = 'faq' }: FaqProps) {
  // Deep links (#faq-3) open the matching disclosure; browsers only scroll to it. Client-side only.
  useEffect(() => {
    const openFromHash = () => {
      const hash = (window.location.hash.split('#').pop() ?? '');
      if (!hash || !hash.startsWith(`${idPrefix}-`)) return;
      const target = document.getElementById(hash);
      if (target instanceof HTMLDetailsElement) target.open = true;
    };
    openFromHash();
    window.addEventListener('hashchange', openFromHash);
    return () => window.removeEventListener('hashchange', openFromHash);
  }, [idPrefix]);

  return (
    <div className={cn('divide-y divide-line border-y border-line', className)}>
      {items.map((item, index) => {
        const id = `${idPrefix}-${index + 1}`;
        return (
          <details key={item.question} id={id} className="group">
            <summary className="flex min-h-11 cursor-pointer items-start justify-between gap-4 py-5 text-left [&::-webkit-details-marker]:hidden focus-visible:rounded-md">
              <h3 className="text-[1.125rem] font-semibold leading-snug text-ink sm:text-[1.2rem]">{item.question}</h3>
              <span
                className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-ink transition-transform duration-200 group-open:rotate-180 group-hover:bg-primary-soft"
                aria-hidden="true"
              >
                <ChevronDown className="size-4" />
              </span>
            </summary>
            <div className="pb-6 pr-12 animate-in fade-in-0 slide-in-from-top-1 duration-200">
              <p className="measure m-0 text-[1rem] leading-relaxed text-muted-foreground sm:text-[1.0625rem]">{item.answer}</p>
            </div>
          </details>
        );
      })}
    </div>
  );
}
