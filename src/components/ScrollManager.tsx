import { useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { scrollToHash, scrollToTop } from '@/lib/motion';

// Layout effect on the client so the scroll position is right before the new page paints; a plain effect
// on the server (where it never runs) keeps prerendering warning-free.
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * Route-change scrolling. On navigation: scroll to top (or to the hash target, landing below the fixed
 * header) and move focus to #main (or to the target). Works with native scrolling and with ScrollSmoother
 * when it is active (see src/lib/motion.ts). On the initial load the browser's own scroll restoration is
 * respected; only a deep-linked hash target is re-aligned below the header.
 */
export function ScrollManager() {
  // `key` changes on every navigation, so re-activating the same in-page link (or the current page's
  // own nav item) still lands again even though pathname and hash are unchanged.
  const { pathname, hash, key } = useLocation();
  const previousPath = useRef<string | null>(null);
  const handled = useRef<string | null>(null);

  useIsomorphicLayoutEffect(() => {
    // Each location is handled once (StrictMode re-runs effects in development). Address-bar and
    // hashchange navigations all carry the key "default", so the path and hash are part of the identity.
    const signature = `${key}|${pathname}|${hash}`;
    if (handled.current === signature) return;
    handled.current = signature;
    const isInitial = previousPath.current === null;
    const pathChanged = previousPath.current !== pathname;
    previousPath.current = pathname;
    if (isInitial) {
      // The browser may already have jumped to a deep-linked target; re-land it exactly one header offset
      // down (before paint), and once more after web fonts settle unless the visitor has scrolled meanwhile.
      if (hash) {
        const land = () => scrollToHash(hash, { smooth: false, focus: false });
        if (land()) {
          const y = window.scrollY;
          document.fonts?.ready.then(() => { if (Math.abs(window.scrollY - y) < 2) land(); });
        }
      }
      return;
    }

    if (hash) {
      if (!pathChanged) {
        // Same-document fragment navigation: the browser makes its own instant jump right after popstate,
        // so land (smoothly, one header offset down) on the next frame, after that jump.
        const frame = requestAnimationFrame(() => scrollToHash(hash, { smooth: true }));
        return () => cancelAnimationFrame(frame);
      }
      // Cross-page landing: arrive instantly on the new page's target, which also receives focus.
      if (scrollToHash(hash, { smooth: false })) return;
    }
    scrollToTop();
    // Keyboard and screen-reader users continue from the new page's main landmark.
    document.getElementById('main')?.focus({ preventScroll: true });
  }, [pathname, hash, key]);

  return null;
}
