import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ArrowLinkProps {
  to: string;
  label: string;
  className?: string;
}

/** Inline section link with a trailing arrow and a 44px minimum target. */
export function ArrowLink({ to, label, className }: ArrowLinkProps) {
  return (
    <Link
      to={to}
      className={cn('group inline-flex min-h-11 items-center gap-1.5 rounded-md font-semibold text-primary no-underline hover:text-primary-deep hover:underline', className)}
    >
      {label}
      <ArrowRight className="size-[1.05em] transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
    </Link>
  );
}
