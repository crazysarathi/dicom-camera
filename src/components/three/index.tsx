import { Component, lazy, Suspense, useEffect, useRef, useState, type ComponentType, type ReactNode } from 'react';

const HeroScene = lazy(() => import('./HeroScene'));
const ConnectivityScene = lazy(() => import('./ConnectivityScene'));

class SceneErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? null : this.props.children; }
}

function webglAvailable(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch { return false; }
}

/**
 * Defers a WebGL scene until: the page has loaded, the browser is idle, the element is near the viewport,
 * WebGL is available, and the visitor has not asked to save data. Nothing renders on the server.
 */
function DeferredScene({ children, className, minWidth = 0 }: { children: ReactNode; className?: string; minWidth?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !webglAvailable()) return;
    const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
    if (nav.connection?.saveData) return;
    if (minWidth && window.innerWidth < minWidth) return;
    let cancelled = false;
    let observer: IntersectionObserver | undefined;
    const arm = () => {
      if (cancelled) return;
      observer = new IntersectionObserver((entries) => {
        if (entries.some((e) => e.isIntersecting)) { setReady(true); observer?.disconnect(); }
      }, { rootMargin: '240px' });
      observer.observe(el);
    };
    const idle = () => {
      const ric = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
      if (ric) ric(arm, { timeout: 2500 }); else setTimeout(arm, 1200);
    };
    if (document.readyState === 'complete') idle(); else window.addEventListener('load', idle, { once: true });
    return () => { cancelled = true; observer?.disconnect(); window.removeEventListener('load', idle); };
  }, [minWidth]);
  return (
    <div ref={ref} className={className} aria-hidden="true">
      {ready && (
        <SceneErrorBoundary>
          <Suspense fallback={null}>{children}</Suspense>
        </SceneErrorBoundary>
      )}
    </div>
  );
}

export interface SceneProps { className?: string }

function withDeferral<P extends SceneProps>(Scene: ComponentType<P>, minWidth = 0) {
  return function Lazy(props: P & { wrapperClassName?: string }) {
    const { wrapperClassName, ...rest } = props;
    return (
      <DeferredScene className={wrapperClassName} minWidth={minWidth}>
        <Scene {...(rest as P)} />
      </DeferredScene>
    );
  };
}

/** Procedural aperture accent for the homepage hero (and 404 page). */
export const HeroSceneLazy = withDeferral(HeroScene);
/** Procedural connectivity graph accent for connectivity/integration sections. */
export const ConnectivitySceneLazy = withDeferral(ConnectivityScene, 0);
