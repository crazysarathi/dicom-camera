import type { ReactNode } from 'react';
import { Section } from '@/components/Section';
import { AutoBreadcrumbs } from '@/components/Breadcrumbs';
import { cn } from '@/lib/utils';

interface PageHeroProps {
  eyebrow?: string;
  title: ReactNode;
  lede: ReactNode;
  actions?: ReactNode;
  /** Optional right-hand column (screenshot, diagram, or 3D accent). */
  aside?: ReactNode;
  className?: string;
}

/** Sub-page opening: H1, lede, actions, optional aside. Homepage uses its own hero. */
export function PageHero({ eyebrow, title, lede, actions, aside, className }: PageHeroProps) {
  return (
    <Section tone="surface" className={cn('relative overflow-hidden pb-10 pt-10 sm:pt-14 lg:pb-16 lg:pt-20', className)} flush>
      <div className={cn('grid items-center gap-10', aside && 'lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]')}>
        <div className="max-w-3xl">
          <AutoBreadcrumbs className="mb-6" />
          {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
          <h1 data-split="">{title}</h1>
          <div className="lede mt-5 max-w-measure">{typeof lede === 'string' ? <p>{lede}</p> : lede}</div>
          {actions && <div className="mt-8 flex flex-wrap items-center gap-3">{actions}</div>}
        </div>
        {aside && <div className="relative">{aside}</div>}
      </div>
    </Section>
  );
}
