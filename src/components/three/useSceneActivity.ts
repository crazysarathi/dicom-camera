import { useEffect, useState, type RefObject } from 'react';

export type Frameloop = 'always' | 'demand';

export interface SceneActivity {
  /** False when the visitor prefers reduced motion: the scene renders a single still frame. */
  animate: boolean;
  /** 'always' only while animating, the tab is visible and the canvas is on screen; otherwise 'demand'. */
  frameloop: Frameloop;
  /** True on devices with a precise pointer (mouse / trackpad), used to enable gentle parallax. */
  finePointer: boolean;
}

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';
const FINE_POINTER = '(pointer: fine)';

function mediaMatches(query: string): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  try {
    return window.matchMedia(query).matches;
  } catch {
    return false;
  }
}

function subscribeMedia(query: string, onChange: (matches: boolean) => void): () => void {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return () => {};
  const mq = window.matchMedia(query);
  const handler = () => onChange(mq.matches);
  if (typeof mq.addEventListener === 'function') {
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }
  // Older WebKit
  mq.addListener(handler);
  return () => mq.removeListener(handler);
}

/**
 * Decides whether a WebGL accent may run its render loop. Everything is read inside effects or lazy
 * state initialisers, so importing this module never touches window/document.
 */
export function useSceneActivity(ref: RefObject<HTMLElement>): SceneActivity {
  const [reducedMotion, setReducedMotion] = useState(() => mediaMatches(REDUCED_MOTION));
  const [finePointer, setFinePointer] = useState(() => mediaMatches(FINE_POINTER));
  const [tabVisible, setTabVisible] = useState(
    () => typeof document === 'undefined' || document.visibilityState !== 'hidden',
  );
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const unsubReduced = subscribeMedia(REDUCED_MOTION, setReducedMotion);
    const unsubFine = subscribeMedia(FINE_POINTER, setFinePointer);

    const onVisibility = () => setTabVisible(document.visibilityState !== 'hidden');
    document.addEventListener('visibilitychange', onVisibility);

    let observer: IntersectionObserver | undefined;
    const el = ref.current;
    if (el && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) setInView(entry.isIntersecting);
        },
        { threshold: 0 },
      );
      observer.observe(el);
    }

    return () => {
      unsubReduced();
      unsubFine();
      document.removeEventListener('visibilitychange', onVisibility);
      observer?.disconnect();
    };
  }, [ref]);

  const animate = !reducedMotion;
  return {
    animate,
    frameloop: animate && tabVisible && inView ? 'always' : 'demand',
    finePointer,
  };
}
