import type { ReactNode } from 'react';
import { Section } from '@/components/Section';
import { cn } from '@/lib/utils';

interface CtaBandProps {
  title: string;
  body: string;
  /** Retained for compatibility with page code; closing bands intentionally show no actions (owner decision). */
  badges?: boolean;
  primary?: ReactNode;
  secondary?: { label: string; to: string };
  tone?: 'ink' | 'white' | 'tint';
  id?: string;
  className?: string;
}

/**
 * Closing band at the end of pages: heading and supporting paragraph only.
 * The header "Get the app" button and the footer carry the actions on every page.
 */
export function CtaBand({ title, body, tone = 'ink', id, className }: CtaBandProps) {
  const dark = tone === 'ink';
  return (
    <Section id={id} tone={tone} className={cn(className)} aria-labelledby={id ? `${id}-title` : undefined}>
      <div className="max-w-2xl">
        <h2 id={id ? `${id}-title` : undefined} className={cn(dark && 'text-band-foreground')}>{title}</h2>
        <p className={cn('mt-4 text-lg', dark ? 'text-band-foreground/80' : 'text-muted-foreground')}>{body}</p>
      </div>
    </Section>
  );
}
