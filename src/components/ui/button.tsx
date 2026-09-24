import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Pill buttons with a quiet lift on hover, a press state, and trailing-icon motion.
 * Colours come from the site palette; no luminous gradients.
 */
const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold tracking-[-0.005em]',
    'transition-[transform,box-shadow,background-color,color,border-color] duration-200 ease-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
    'disabled:pointer-events-none disabled:opacity-50',
    '[&_svg]:pointer-events-none [&_svg]:size-[1.1em] [&_svg]:shrink-0 [&_svg]:transition-transform [&_svg]:duration-200',
    'hover:[&>svg:not(:only-child):last-child]:translate-x-0.5',
    'active:translate-y-px active:shadow-none',
  ].join(' '),
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-button hover:-translate-y-px hover:bg-primary-deep hover:shadow-button-hover',
        secondary:
          'border border-line bg-card text-ink shadow-secondary hover:-translate-y-px hover:border-ink/25 hover:shadow-card',
        outline: 'border border-ink/25 bg-transparent text-ink hover:border-ink/50 hover:bg-card/70',
        ghost: 'text-ink hover:bg-secondary',
        link: 'rounded-sm text-primary underline underline-offset-4 hover:text-primary-deep active:translate-y-0',
      },
      size: {
        default: 'min-h-11 px-6 py-2.5 text-base',
        sm: 'min-h-10 px-5 text-sm',
        lg: 'min-h-12 px-7 text-base sm:text-lg',
        icon: 'size-11',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button';
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
});
Button.displayName = 'Button';

export { Button, buttonVariants };
