// GSAP registration and scrolling helpers shared by the motion layer
// (src/components/MotionProvider.tsx, src/components/ScrollManager.tsx).
//
// Everything here is SSR-safe: plugin registration and DOM access only happen when `window` exists.
// The page must be complete and readable without any of this running.

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollSmoother } from 'gsap/ScrollSmoother';
import { SplitText } from 'gsap/SplitText';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { useGSAP } from '@gsap/react';

export { gsap, ScrollTrigger, ScrollSmoother, SplitText };

const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

/** Media query that gates ScrollSmoother (wide, precise-pointer devices only). */
export const SMOOTHER_QUERY = '(min-width: 1024px) and (pointer: fine)';
export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/** Reveal timing shared by MotionProvider. Only transform and opacity are animated. */
export const revealDefaults = {
  y: 24,
  duration: 0.7,
  ease: 'power2.out',
  stagger: 0.08,
  start: 'top 85%',
} as const;

let registered = false;

/** Registers the GSAP plugins once. Safe to call repeatedly; a no-op on the server. */
export function registerGsap(): boolean {
  if (!isBrowser) return false;
  if (!registered) {
    gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText, ScrollToPlugin, useGSAP);
    // Do not refresh on the scroll-restoring resize events mobile browsers fire when their toolbars hide.
    ScrollTrigger.config({ ignoreMobileResize: true });
    registered = true;
  }
  return true;
}

/** True when the visitor prefers reduced motion (also true on the server, so nothing animates before hydration). */
export function reducedMotion(): boolean {
  if (!isBrowser) return true;
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

/** True when ScrollSmoother is allowed right now (config switch, wide pointer device, no reduced motion). */
export function smootherAllowed(enabledByConfig: boolean): boolean {
  if (!isBrowser || !enabledByConfig) return false;
  return window.matchMedia(SMOOTHER_QUERY).matches && !reducedMotion();
}

/** The active ScrollSmoother instance, if any. */
export function getSmoother(): ScrollSmoother | null {
  if (!isBrowser || !registered) return null;
  return ScrollSmoother.get() ?? null;
}

/**
 * Fixed-header offset for in-page targets, in pixels: the --header-h custom property plus 16px.
 * Mirrors the CSS `scroll-margin-top` used in native scrolling mode.
 */
export function headerOffsetPx(): number {
  if (!isBrowser) return 0;
  const root = document.documentElement;
  const raw = getComputedStyle(root).getPropertyValue('--header-h').trim();
  let header = 0;
  if (raw.endsWith('rem')) header = parseFloat(raw) * (parseFloat(getComputedStyle(root).fontSize) || 16);
  else if (raw.endsWith('px')) header = parseFloat(raw);
  if (!header || Number.isNaN(header)) header = document.querySelector('header')?.getBoundingClientRect().height ?? 72;
  return Math.round(header + 16);
}

/**
 * Resolves the in-page fragment of a location hash to an element. Accepts "#id", "id" and the
 * hash-router form "#/route/#id" (the part after the last "#"). Malformed escapes never throw.
 */
export function findHashTarget(hash: string): HTMLElement | null {
  if (!isBrowser) return null;
  const raw = hash.split('#').pop() ?? '';
  if (!raw || raw.startsWith('/')) return null;
  let id = raw;
  try {
    id = decodeURIComponent(raw);
  } catch {
    // Keep the raw fragment; an id that is not valid percent-encoding is looked up as written.
  }
  return document.getElementById(id) ?? document.getElementById(raw);
}

/** Timestamp (performance.now) of the last scroll this module performed on purpose. */
let lastProgrammaticScroll = -Infinity;
export function lastProgrammaticScrollAt(): number {
  return lastProgrammaticScroll;
}
function markScroll(): void {
  lastProgrammaticScroll = typeof performance !== 'undefined' ? performance.now() : Date.now();
}

/**
 * Moves keyboard/screen-reader focus to an in-page target without scrolling. Targets that are not
 * focusable get a temporary tabindex="-1" that is dropped again on blur, so reading and tabbing
 * continue from the landing point rather than from the top of the page.
 */
function focusTarget(el: HTMLElement): void {
  const focusable = el.tabIndex >= 0 || el.hasAttribute('tabindex');
  if (!focusable) {
    el.setAttribute('tabindex', '-1');
    el.addEventListener('blur', () => el.removeAttribute('tabindex'), { once: true });
  }
  focusWithoutScroll(el);
}

let programmaticFocus = false;
/** True while this module is moving focus itself; the smoother's focus-follow must not scroll then. */
export function isProgrammaticFocus(): boolean {
  return programmaticFocus;
}
/** Focuses an element without any scrolling, native or smoother-driven (focusin fires synchronously). */
export function focusWithoutScroll(el: HTMLElement): void {
  programmaticFocus = true;
  try {
    el.focus({ preventScroll: true });
  } finally {
    programmaticFocus = false;
  }
}

export interface ScrollToHashOptions {
  /** Animate the scroll (same-page anchor clicks). Cross-page hash landings are instant. */
  smooth?: boolean;
  /** Move focus to the target (default true). */
  focus?: boolean;
}

/**
 * Scrolls to an in-page target so it lands just below the fixed header.
 * With ScrollSmoother active it drives the smoother; otherwise it scrolls the window natively.
 * Returns false when the target does not exist.
 */
export function scrollToHash(hash: string, options: ScrollToHashOptions = {}): boolean {
  const el = findHashTarget(hash);
  if (!el) return false;
  const { smooth = true, focus = true } = options;
  const smoother = getSmoother();
  markScroll();
  if (smoother) {
    // The browser may have scrolled the (overflow: hidden) wrapper natively on the hash jump; undo that first.
    const wrapper = document.getElementById('smooth-wrapper');
    if (wrapper && wrapper.scrollTop !== 0) wrapper.scrollTop = 0;
    smoother.scrollTo(el, smooth && !reducedMotion(), `top ${headerOffsetPx()}px`);
  } else {
    // Explicit position rather than scrollIntoView: the header offset is applied exactly once, whatever
    // scroll-padding/scroll-margin the stylesheet adds for the no-JavaScript case.
    const top = Math.max(0, Math.round(el.getBoundingClientRect().top + window.scrollY - headerOffsetPx()));
    window.scrollTo({ top, left: 0, behavior: smooth && !reducedMotion() ? 'smooth' : ('instant' as ScrollBehavior) });
  }
  if (focus) focusTarget(el);
  return true;
}

/** Jumps to the top of the page instantly (route changes), through the smoother when it is active. */
export function scrollToTop(): void {
  if (!isBrowser) return;
  markScroll();
  const smoother = getSmoother();
  if (smoother) {
    const wrapper = document.getElementById('smooth-wrapper');
    if (wrapper && wrapper.scrollTop !== 0) wrapper.scrollTop = 0;
    smoother.scrollTop(0);
  } else {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }
}

/** Recalculates every ScrollTrigger (and the smoother's page height). Call after layout changes. */
export function refreshMotion(): void {
  if (!isBrowser || !registered) return;
  ScrollTrigger.refresh();
}
