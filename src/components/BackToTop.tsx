import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { scrollToTop } from '@/lib/motion';
import { cn } from '@/lib/utils';

/**
 * Floating "Back to top" control, bottom-right. Appears after scrolling roughly one viewport down,
 * works with native scrolling and with ScrollSmoother, and is removed from the tab order while hidden.
 */
export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setVisible(window.scrollY > window.innerHeight * 0.8);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); if (frame) cancelAnimationFrame(frame); };
  }, []);

  const onClick = () => {
    scrollToTop();
    // Continue keyboard navigation from the top of the page.
    document.getElementById('main')?.focus({ preventScroll: true });
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Back to top"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      className={cn(
        'fixed bottom-5 right-5 z-40 inline-flex size-12 items-center justify-center rounded-full border border-line bg-white text-ink shadow-card',
        'transition-[opacity,transform,background-color] duration-300 ease-out hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        'sm:bottom-8 sm:right-8',
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0',
      )}
    >
      <ArrowUp className="size-5" aria-hidden="true" />
    </button>
  );
}
