import { useEffect, useRef, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { siteConfig } from '@/config/site';
import { useReducedMotion } from '@/lib/useReducedMotion';
import {
  REDUCED_MOTION_QUERY,
  SMOOTHER_QUERY,
  ScrollSmoother,
  ScrollTrigger,
  SplitText,
  gsap,
  getSmoother,
  isProgrammaticFocus,
  lastProgrammaticScrollAt,
  refreshMotion,
  registerGsap,
  revealDefaults,
  scrollToHash,
  smootherAllowed,
} from '@/lib/motion';
import { useGSAP } from '@gsap/react';

const DONE = 'data-motion-done';

/**
 * Elements near the end of a short page may never reach the 85% line, so their trigger would never fire.
 * When a trigger's start lies beyond the maximum scroll position, play its animation right away.
 */
function playWhenUnreachable(self: ScrollTrigger): void {
  const animation = self.animation;
  if (!animation || self.progress > 0 || animation.progress() > 0) return;
  if (self.start > ScrollTrigger.maxScroll(window)) animation.play();
}

/**
 * Motion layer: GSAP ScrollTrigger reveals for [data-reveal], SplitText line reveals for [data-split],
 * an optional ScrollSmoother on wide pointer devices, and layout-change refreshes.
 *
 * The wrapper markup is identical on the server and the client (#smooth-wrapper > #smooth-content around
 * main + footer; the fixed header lives outside). All GSAP work happens in effects, initial states are set
 * only from JavaScript, and nothing runs with reduced motion, so the content is always visible without it.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const reduced = useReducedMotion();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  // Elements already on screen when the prerendered page hydrates are never hidden and re-shown.
  // Tracked from render (not an effect) so StrictMode's double effects cannot mistake the first
  // page for a client-side navigation.
  const initialPath = useRef(pathname);
  const navigated = useRef(false);
  if (pathname !== initialPath.current) navigated.current = true;

  // ScrollSmoother lifecycle, refreshes after load and on content resize (mount only).
  useEffect(() => {
    if (!registerGsap()) return;
    const wrapper = wrapperRef.current;
    const content = contentRef.current;
    if (!wrapper || !content) return;

    const wideFine = window.matchMedia(SMOOTHER_QUERY);
    const reducedMq = window.matchMedia(REDUCED_MOTION_QUERY);

    const evaluate = () => {
      const wanted = smootherAllowed(siteConfig.motion.scrollSmoother);
      const current = getSmoother();
      if (wanted && !current) {
        ScrollSmoother.create({
          wrapper,
          content,
          smooth: siteConfig.motion.smooth,
          effects: false,
          normalizeScroll: false,
          ignoreMobileResize: true,
          // The smoother centres any focused element that is off screen. Focus moved by the motion layer
          // itself (hash landings) must not be re-scrolled, and focusing the main landmark (skip link,
          // route change) means "start of the page" instead.
          onFocusIn: (self, event) => {
            if (isProgrammaticFocus()) return false;
            if ((event.target as HTMLElement | null)?.id === 'main') {
              self.scrollTop(0);
              return false;
            }
            return true;
          },
        });
        // Deep links: the browser already jumped natively before the smoother took over the scroll.
        // The helper understands both "#fragment" and the hash-router form "#/route/#fragment".
        if (window.location.hash) {
          requestAnimationFrame(() => scrollToHash(window.location.hash, { smooth: false, focus: false }));
        }
      } else if (!wanted && current) {
        const y = current.scrollTop();
        current.kill();
        window.scrollTo({ top: y, left: 0, behavior: 'instant' as ScrollBehavior });
      }
      refreshMotion();
    };
    evaluate();
    wideFine.addEventListener('change', evaluate);
    reducedMq.addEventListener('change', evaluate);

    // While the smoother is active the wrapper is a fixed, overflow-hidden box that nothing should scroll,
    // yet native fragment jumps and find-in-page still scroll it and leave the content displaced. Undo that
    // before it paints and hand the distance to the smoother unless a deliberate landing (scrollToHash /
    // scrollToTop) has taken over in the meantime. This never fires in native scrolling mode.
    const onWrapperScroll = () => {
      const y = wrapper.scrollTop;
      if (!y) return;
      wrapper.scrollTop = 0;
      const smoother = getSmoother();
      if (!smoother) return;
      const at = performance.now();
      requestAnimationFrame(() => {
        if (lastProgrammaticScrollAt() >= at) return;
        smoother.scrollTop(smoother.scrollTop() + y);
      });
    };
    wrapper.addEventListener('scroll', onWrapperScroll, { passive: true });

    // Re-activating a plain anchor whose URL is already the current one triggers no navigation event
    // (the router never hears about it), so land its in-page target here. Router links are untouched:
    // they prevent the default themselves and are handled by ScrollManager through the location key.
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element | null)?.closest?.('a[href]');
      if (!(anchor instanceof HTMLAnchorElement) || anchor.target) return;
      const url = new URL(anchor.href, window.location.href);
      if (!url.hash || url.href !== window.location.href) return;
      if (scrollToHash(url.hash, { smooth: true })) event.preventDefault();
    };
    document.addEventListener('click', onClick);

    // Images and fonts settle after the first paint; refresh positions once they have.
    const timers: ReturnType<typeof setTimeout>[] = [];
    const onLoad = () => {
      refreshMotion();
      timers.push(setTimeout(refreshMotion, 300), setTimeout(refreshMotion, 1000));
    };
    if (document.readyState === 'complete') onLoad();
    else window.addEventListener('load', onLoad, { once: true });

    // Content height changes (route renders, images, expanded <details>) must reach ScrollTrigger and the
    // smoother's page height. This is a resize observer, not a scroll listener.
    let resizeTimer: ReturnType<typeof setTimeout> | undefined;
    let lastHeight = content.offsetHeight;
    const observer = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(() => {
          const h = content.offsetHeight;
          if (h === lastHeight) return;
          lastHeight = h;
          if (resizeTimer) clearTimeout(resizeTimer);
          resizeTimer = setTimeout(refreshMotion, 150);
        })
      : undefined;
    observer?.observe(content);

    return () => {
      wideFine.removeEventListener('change', evaluate);
      reducedMq.removeEventListener('change', evaluate);
      wrapper.removeEventListener('scroll', onWrapperScroll);
      document.removeEventListener('click', onClick);
      window.removeEventListener('load', onLoad);
      timers.forEach(clearTimeout);
      if (resizeTimer) clearTimeout(resizeTimer);
      observer?.disconnect();
      getSmoother()?.kill();
    };
  }, []);

  // Reveals and heading splits, rebuilt per route (the context reverts everything from the previous page).
  useGSAP(
    (context) => {
      if (reduced || !registerGsap()) return;
      const root = contentRef.current;
      if (!root) return;

      const initialLoad = !navigated.current;
      const viewportLine = window.innerHeight * 0.85;
      const alreadyVisible = (el: Element) => {
        const rect = el.getBoundingClientRect();
        // Above the viewport (scroll restoration) or, on the prerendered first paint, already on screen.
        return rect.bottom <= 0 || (initialLoad && rect.top < viewportLine);
      };

      // 1) Fade/slide reveals.
      root.querySelectorAll<HTMLElement>(`[data-reveal]:not([${DONE}]), [data-reveal-stagger]:not([${DONE}])`).forEach((el) => {
        // A direct child of a staggered group is animated by its parent.
        if (el.parentElement?.hasAttribute('data-reveal-stagger')) { el.setAttribute(DONE, ''); return; }
        if (alreadyVisible(el)) { el.setAttribute(DONE, ''); return; }
        const staggered = el.hasAttribute('data-reveal-stagger');
        // A plain wrapper around a staggered group (Reveal > FeatureList) leaves the entrance to the group,
        // so items are not faded and shifted twice.
        if (!staggered && el.querySelector(`[data-reveal-stagger]:not([${DONE}])`)) { el.setAttribute(DONE, ''); return; }
        const targets: Element[] = staggered ? Array.from(el.children) : [el];
        if (!targets.length) { el.setAttribute(DONE, ''); return; }
        const delay = parseFloat(el.getAttribute('data-reveal-delay') ?? '') || 0;
        gsap.from(targets, {
          y: revealDefaults.y,
          opacity: 0,
          duration: revealDefaults.duration,
          ease: revealDefaults.ease,
          delay,
          stagger: staggered ? revealDefaults.stagger : 0,
          immediateRender: true,
          scrollTrigger: { trigger: el, start: revealDefaults.start, once: true, onRefresh: playWhenUnreachable },
          onStart: () => gsap.set(targets, { willChange: 'transform, opacity' }),
          onComplete: () => {
            gsap.set(targets, { clearProps: 'transform,opacity,willChange' });
            el.setAttribute(DONE, '');
          },
        });
      });

      // 2) SplitText line reveals, after fonts are ready so line breaks are final.
      const splits: SplitText[] = [];
      let cancelled = false;
      const headings = Array.from(root.querySelectorAll<HTMLElement>(`[data-split]:not([${DONE}])`)).filter((el) => {
        if (alreadyVisible(el)) { el.setAttribute(DONE, ''); return false; }
        return true;
      });
      if (headings.length) {
        // Hide the headings now (transform/opacity only) so nothing flashes before the fonts resolve.
        gsap.set(headings, { opacity: 0 });
        const fontsReady: Promise<unknown> = 'fonts' in document ? document.fonts.ready : Promise.resolve();
        fontsReady.then(() => {
          if (cancelled) return;
          context.add(() => {
            headings.forEach((el) => {
              if (el.hasAttribute(DONE) || !el.isConnected) return;
              gsap.set(el, { clearProps: 'opacity' });
              const split = SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'split-line', aria: 'auto', autoSplit: false });
              splits.push(split);
              const finish = () => {
                split.revert();
                el.setAttribute(DONE, '');
              };
              if (!split.lines.length) { finish(); return; }
              gsap.from(split.lines, {
                yPercent: 100,
                opacity: 0,
                duration: 0.8,
                ease: 'power3.out',
                stagger: revealDefaults.stagger,
                immediateRender: true,
                scrollTrigger: { trigger: el, start: revealDefaults.start, once: true, onRefresh: playWhenUnreachable },
                onComplete: finish,
              });
            });
          });
        });
      }

      // The new page's height differs from the previous one; let ScrollTrigger (and the smoother) know.
      const raf = requestAnimationFrame(refreshMotion);

      return () => {
        cancelled = true;
        cancelAnimationFrame(raf);
        splits.forEach((s) => s.revert());
        gsap.set(headings, { clearProps: 'opacity' });
      };
    },
    { dependencies: [pathname, reduced], revertOnUpdate: true },
  );

  return (
    <div id="smooth-wrapper" ref={wrapperRef}>
      <div id="smooth-content" ref={contentRef}>
        {children}
      </div>
    </div>
  );
}
