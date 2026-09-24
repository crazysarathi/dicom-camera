import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { routes } from '@/config/site';
import { headerNav, pageLabels } from '@/content/nav';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface BreadcrumbsProps {
  /** Trail after "Home". The last item is the current page (rendered without a link). */
  items: BreadcrumbItem[];
  className?: string;
}

/** Accessible breadcrumb trail: Home › … › current page. */
export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  const trail: BreadcrumbItem[] = [{ label: 'Home', to: routes.home }, ...items];
  return (
    <nav aria-label="Breadcrumb" className={cn('text-sm', className)}>
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
        {trail.map((item, i) => {
          const last = i === trail.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-x-1.5">
              {i > 0 && <ChevronRight className="size-4 shrink-0 text-muted-foreground/70" aria-hidden="true" />}
              {last || !item.to ? (
                <span className="font-medium text-ink" aria-current={last ? 'page' : undefined}>
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.to}
                  className="inline-flex min-h-8 items-center gap-1.5 rounded-md text-muted-foreground no-underline hover:text-ink hover:underline"
                >
                  {i === 0 && <Home className="size-4" aria-hidden="true" />}
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * Breadcrumb for the current route when the page is not reachable from the header navigation
 * (e.g. Storage and retention, Download, Contact). Returns null on header-nav pages and on the homepage.
 */
export function AutoBreadcrumbs({ className }: { className?: string }) {
  const { pathname } = useLocation();
  const path = pathname.endsWith('/') ? pathname : `${pathname}/`;
  if (path === routes.home) return null;
  if (headerNav.some((item) => item.to === path)) return null;
  const label = pageLabels[path] ?? 'Page not found';
  return <Breadcrumbs items={[{ label }]} className={className} />;
}
