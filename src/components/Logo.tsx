import { Link } from 'react-router-dom';
import { routes } from '@/config/site';
import { cn } from '@/lib/utils';

/** Authentic Apple app icon (artwork preserved) beside a typeset wordmark. The icon is decorative because the wordmark carries the name. */
export function Logo({ className, iconSize = 36, wordmarkClassName }: { className?: string; iconSize?: number; wordmarkClassName?: string }) {
  return (
    <Link to={routes.home} className={cn('inline-flex items-center gap-2.5 rounded-md text-ink no-underline', className)} aria-label="DICOM Camera home">
      <img
        src="/images/app-icon-96.png"
        srcSet="/images/app-icon-96.png 1x, /images/app-icon-192.png 2x"
        width={iconSize}
        height={iconSize}
        alt=""
        aria-hidden="true"
        className="rounded-[22%] shadow-sm"
        decoding="async"
      />
      <span className={cn('text-[1.125rem] font-semibold tracking-tight', wordmarkClassName)}>DICOM Camera</span>
    </Link>
  );
}
