import type { ElementType, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface RevealProps {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  /** Delay in seconds before the reveal starts. */
  delay?: number;
  /** Stagger direct children instead of animating the wrapper. */
  stagger?: boolean;
  id?: string;
}

/**
 * Scroll-triggered entrance wrapper. Marks elements with data attributes that the motion layer
 * (src/components/MotionProvider.tsx) animates with GSAP ScrollTrigger. Content is fully visible
 * without JavaScript and when reduced motion is preferred.
 */
export function Reveal({ children, className, as: Tag = 'div', delay, stagger, id }: RevealProps) {
  return (
    <Tag id={id} className={cn(className)} data-reveal="" data-reveal-delay={delay ?? undefined} {...(stagger ? { 'data-reveal-stagger': '' } : {})}>
      {children}
    </Tag>
  );
}
