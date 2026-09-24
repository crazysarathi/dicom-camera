import { useRef, useState, type KeyboardEvent } from 'react';
import { ChevronLeft, ChevronRight, Images, Maximize2, Smartphone, Tablet, type LucideIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScreenshotFigure } from '@/components/ScreenshotFigure';
import { screenshots, type ScreenshotId } from '@/images/manifest';
import { a11yLabels } from '@/content/nav';
import { cn } from '@/lib/utils';

export interface GalleryGroup {
  /** Stable id used as the tab value, e.g. 'iphone'. */
  id: string;
  /** Visible tab label, e.g. 'iPhone'. */
  label: string;
  images: ScreenshotId[];
}

interface ScreenshotGalleryProps {
  groups: GalleryGroup[];
  /** Accessible name for the platform tab list. */
  tabsLabel?: string;
  /** Enable the enlarged viewer (Radix Dialog with previous/next and arrow keys). */
  viewer?: boolean;
  defaultGroup?: string;
  className?: string;
}

interface ViewerState {
  group: GalleryGroup;
  index: number;
}

/** Platform glyph shown before each tab label; unknown group ids fall back to a generic gallery icon. */
const groupIcons: Record<string, LucideIcon> = { iphone: Smartphone, ipad: Tablet, android: Smartphone };
const iconFor = (id: string): LucideIcon => groupIcons[id] ?? Images;

/** Wide iPad compositions get more room than tall phone compositions so both read at a similar height. */
function figureWidth(id: ScreenshotId) {
  const wide = screenshots[id].platform === 'ipad';
  return {
    className: wide ? 'max-w-[520px]' : 'max-w-[320px]',
    sizes: wide ? '(min-width: 640px) 520px, 90vw' : '(min-width: 640px) 320px, 80vw',
  };
}

/**
 * Small, purposeful screenshot gallery with accessible platform tabs (Radix Tabs) and an optional
 * enlarged viewer. Genuine store compositions are shown unframed; captions come from the image manifest.
 * Images load lazily and only the active tab's panel is mounted. Nothing auto-advances.
 */
export function ScreenshotGallery({ groups, tabsLabel = 'Platform', viewer = true, defaultGroup, className }: ScreenshotGalleryProps) {
  const [state, setState] = useState<ViewerState | null>(null);
  /** The enlarge button that opened the viewer; focus goes back to it when the viewer closes. */
  const returnTo = useRef<HTMLElement | null>(null);

  const close = () => {
    const el = returnTo.current;
    returnTo.current = null;
    setState(null);
    // Refocus after the dialog has unmounted and the outside aria-hidden/inert state is lifted.
    if (el) requestAnimationFrame(() => el.focus());
  };

  const step = (delta: number) =>
    setState((s) => (s ? { ...s, index: (s.index + delta + s.group.images.length) % s.group.images.length } : s));

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!state || state.group.images.length < 2) return;
    if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
  };

  const current = state ? screenshots[state.group.images[state.index]] : null;

  return (
    <div className={cn(className)}>
      <Tabs defaultValue={defaultGroup ?? groups[0]?.id}>
        {/* Single row on every width: the list scrolls sideways (scrollbar hidden) instead of wrapping. */}
        <TabsList
          aria-label={tabsLabel}
          className="max-w-full flex-nowrap overflow-x-auto overscroll-x-contain [scrollbar-width:none] [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden"
        >
          {groups.map((g) => {
            const Icon = iconFor(g.id);
            return (
              <TabsTrigger key={g.id} value={g.id} className="shrink-0 gap-1.5 pl-3 pr-2.5 sm:gap-2 sm:pl-4 sm:pr-3.5">
                <Icon aria-hidden="true" />
                {g.label}
                {/* Decorative count: hidden on the narrowest phones so three tabs fit at 360px without scrolling. */}
                <span
                  aria-hidden="true"
                  className="ml-0.5 hidden min-w-[1.375rem] items-center justify-center rounded-full bg-ink/[0.06] px-1.5 py-px text-[0.6875rem] font-semibold leading-4 tabular-nums text-muted-foreground min-[400px]:inline-flex"
                >
                  {g.images.length}
                </span>
              </TabsTrigger>
            );
          })}
        </TabsList>
        {groups.map((g) => (
          <TabsContent key={g.id} value={g.id}>
            <ul className="grid gap-8 sm:grid-cols-2 lg:gap-10" data-reveal-stagger="">
              {g.images.map((id, i) => {
                const img = screenshots[id];
                const size = figureWidth(id);
                return (
                  <li key={id} className="flex flex-col">
                    <div className="relative flex flex-1 items-end justify-center overflow-hidden rounded-2xl border border-line bg-secondary/70 px-6 pb-5 pt-8 sm:px-8 sm:pt-10">
                      <ScreenshotFigure
                        image={id}
                        sizes={size.sizes}
                        bleed
                        caption
                        className={cn('w-full', size.className)}
                        imgClassName="drop-shadow-[0_18px_30px_rgba(20,34,53,0.18)]"
                      />
                      {viewer && (
                        <Button
                          type="button"
                          variant="secondary"
                          size="icon"
                          className="absolute right-3 top-3"
                          onClick={(e) => { returnTo.current = e.currentTarget; setState({ group: g, index: i }); }}
                        >
                          <Maximize2 className="size-5" aria-hidden="true" />
                          <span className="sr-only">{a11yLabels.viewLarger}: {img.caption}</span>
                        </Button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </TabsContent>
        ))}
      </Tabs>

      {viewer && (
        <Dialog open={state !== null} onOpenChange={(open) => { if (!open) close(); }}>
          {state && current && (
            <DialogContent
              closeLabel={a11yLabels.closePreview}
              onKeyDown={onKeyDown}
              className="max-h-[calc(100dvh-2rem)] max-w-3xl gap-3 overflow-y-auto p-4 pt-14 sm:p-6 sm:pt-14"
            >
              <DialogTitle className="sr-only">{a11yLabels.viewLarger}</DialogTitle>
              <div className="flex items-end justify-center overflow-hidden rounded-xl bg-secondary/70 px-4 pt-6">
                <ScreenshotFigure
                  key={current.id}
                  image={state.group.images[state.index]}
                  sizes="(min-width: 1024px) 520px, 90vw"
                  bleed
                  className="w-full"
                  imgClassName="mx-auto max-h-[62vh] w-auto max-w-full"
                />
              </div>
              <div className="flex items-center justify-between gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  onClick={() => step(-1)}
                  disabled={state.group.images.length < 2}
                  aria-label="Previous screenshot"
                >
                  <ChevronLeft className="size-5" aria-hidden="true" />
                </Button>
                <DialogDescription aria-live="polite" className="text-center text-sm text-muted-foreground">
                  {current.caption}{' '}
                  <span className="whitespace-nowrap">
                    ({state.group.label} screenshot {state.index + 1} of {state.group.images.length})
                  </span>
                </DialogDescription>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  onClick={() => step(1)}
                  disabled={state.group.images.length < 2}
                  aria-label="Next screenshot"
                >
                  <ChevronRight className="size-5" aria-hidden="true" />
                </Button>
              </div>
            </DialogContent>
          )}
        </Dialog>
      )}
    </div>
  );
}
