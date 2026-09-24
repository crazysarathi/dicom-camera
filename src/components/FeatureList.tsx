import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface Feature {
  title: string;
  body: ReactNode;
  icon?: LucideIcon;
}

interface FeatureListProps {
  items: Feature[];
  columns?: 1 | 2 | 3;
  variant?: 'plain' | 'cards';
  className?: string;
  /** Heading level for item titles. */
  headingLevel?: 'h3' | 'h4';
}

/** Feature groups: a plain list with leading icons, or cards when a section needs separation. */
export function FeatureList({ items, columns = 3, variant = 'plain', className, headingLevel: Tag = 'h3' }: FeatureListProps) {
  const cols = { 1: 'grid-cols-1', 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-2 lg:grid-cols-3' }[columns];
  return (
    <ul className={cn('grid gap-6 lg:gap-8', cols, className)} data-reveal-stagger="">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <li key={item.title} className={cn('flex gap-4', variant === 'cards' && 'card-surface p-6')}>
            {Icon && (
              <span className="mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary-deep" aria-hidden="true">
                <Icon className="size-5" />
              </span>
            )}
            <div>
              <Tag className="text-lg font-semibold leading-snug text-ink sm:text-lg">{item.title}</Tag>
              <div className="mt-1.5 text-[1rem] leading-relaxed text-muted-foreground">{item.body}</div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
