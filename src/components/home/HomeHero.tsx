import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StoreBadges } from '@/components/StoreBadges';
import { ScreenshotFigure } from '@/components/ScreenshotFigure';
import { HeroSceneLazy } from '@/components/three';
import { homeContent } from '@/content/home';

/**
 * Homepage opening. Desktop: headline and actions left, one genuine iPhone screen right, aligned to the
 * section's bottom edge so the composition's cut-off bottom is clipped deliberately. Mobile order:
 * eyebrow / H1 / paragraph → store badges → screenshot → supporting line.
 * The WebGL accent is a transparent, deferred backdrop; the text never depends on it.
 */
export function HomeHero() {
  const c = homeContent.hero;
  return (
    <section className="relative overflow-hidden bg-surface" aria-labelledby="home-hero-title">
      {/* Backdrop from sm up only: on phones the aperture would sit behind the headline. */}
      <HeroSceneLazy wrapperClassName="pointer-events-none absolute inset-0 hidden sm:block" />
      <div className="container-content relative grid gap-x-12 gap-y-8 pt-10 sm:pt-14 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:grid-rows-[1fr_auto] lg:gap-y-6 lg:pt-16">
        {/* Proposition and download actions */}
        <div className="max-w-2xl lg:col-start-1 lg:row-start-1 lg:self-center lg:pb-4 lg:pt-6">
          <p className="eyebrow mb-4">{c.eyebrow}</p>
          <h1 id="home-hero-title" data-split="">{c.title}</h1>
          <p className="lede mt-5 max-w-measure">{c.body}</p>
          <div className="mt-8 flex flex-col items-start gap-4">
            <StoreBadges size="lg" label={c.badgesLabel} />
            <Button asChild variant="link" size="lg" className="px-0">
              <Link to={c.secondary.to}>
                {c.secondary.label} <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>

        {/* One strong genuine screen, rising into view from the section's bottom edge */}
        <div className="relative flex justify-center lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:items-end lg:justify-end">
          <ScreenshotFigure
            image={c.image}
            priority
            sizes="(min-width: 1024px) 400px, 70vw"
            bleed
            className="w-[70vw] max-w-[400px] lg:w-full lg:max-w-[360px] xl:max-w-[400px]"
            imgClassName="drop-shadow-[0_28px_48px_rgba(20,34,53,0.22)]"
          />
        </div>

        {/* Supporting line: after the screenshot on mobile, under the actions on desktop */}
        <p className="pb-10 text-[0.95rem] text-muted-foreground sm:pb-14 lg:col-start-1 lg:row-start-2 lg:pb-16">{c.supporting}</p>
      </div>
    </section>
  );
}
