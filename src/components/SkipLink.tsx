import type { MouseEvent } from 'react';
import { a11yLabels } from '@/content/nav';

/**
 * Skip link. With hash-based routing a plain "#main" fragment would be read as a route, so the
 * click moves focus and scroll to the main landmark directly without touching the URL.
 */
export function SkipLink() {
  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const main = document.getElementById('main');
    if (!main) return;
    main.focus({ preventScroll: true });
    main.scrollIntoView({ block: 'start' });
  };
  return (
    <a href="#main" onClick={onClick} className="skip-link">
      {a11yLabels.skip}
    </a>
  );
}
