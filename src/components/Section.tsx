import type { ElementType, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Tone = 'surface' | 'white' | 'ink' | 'tint';

interface SectionProps {
  id?: string;
  tone?: Tone;
  className?: string;
  innerClassName?: string;
  children: ReactNode;
  as?: ElementType;
  'aria-labelledby'?: string;
  'aria-label'?: string;
  /** Remove the default vertical padding (for custom hero sections). */
  flush?: boolean;
}

const tones: Record<Tone, string> = {
  surface: 'bg-surface',
  white: 'bg-card border-y border-line',
  ink: 'bg-band text-band-foreground',
  tint: 'bg-primary-soft/60',
};

export function Section({ id, tone = 'surface', className, innerClassName, children, as: Tag = 'section', flush, ...aria }: SectionProps) {
  return (
    <Tag id={id} className={cn(tones[tone], !flush && 'section-pad', className)} {...aria}>
      <div className={cn('container-content', innerClassName)}>{children}</div>
    </Tag>
  );
}

interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  lede?: ReactNode;
  as?: 'h1' | 'h2' | 'h3';
  align?: 'left' | 'center';
  id?: string;
  className?: string;
  /** Enable the SplitText line reveal (motion layer). */
  split?: boolean;
}

export function SectionHeading({ eyebrow, title, lede, as: Tag = 'h2', align = 'left', id, className, split }: SectionHeadingProps) {
  return (
    <div className={cn('max-w-3xl', align === 'center' && 'mx-auto text-center', className)}>
      {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
      <Tag id={id} {...(split ? { 'data-split': '' } : {})}>{title}</Tag>
      {lede && <div className="lede mt-4 max-w-measure">{typeof lede === 'string' ? <p>{lede}</p> : lede}</div>}
    </div>
  );
}
