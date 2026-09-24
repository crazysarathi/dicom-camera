import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { PageMeta } from '@/lib/seo';
import { useDocumentMeta } from '@/lib/seo';
import type { ScreenshotId } from '@/images/manifest';
import { PageHero } from '@/components/PageHero';
import { Section, SectionHeading } from '@/components/Section';
import { StoreBadges } from '@/components/StoreBadges';
import { ScreenshotFigure } from '@/components/ScreenshotFigure';
import { WorkflowDiagram } from '@/components/WorkflowDiagram';
import { CtaBand } from '@/components/CtaBand';
import { Reveal } from '@/components/Reveal';
import { Button } from '@/components/ui/button';
import { workflowsContent as c } from '@/content/workflows';
import { cn } from '@/lib/utils';

export const meta: PageMeta = {
  title: 'Clinical Capture Workflows | DICOM Camera',
  description: 'Start with a patient, use Quick Take, or import from Photo Album. Review, annotate, and send clinical images to PACS with DICOM Camera.',
  path: '/workflows/',
};

const OVERVIEW_ID = 'capture-paths';

/** Rendered widths for the two genuine screenshots on this page (both lazy-loaded; neither is the site hero). */
const figureLayout: Partial<Record<ScreenshotId, { sizes: string; className: string }>> = {
  'iphone-06': { sizes: '(min-width: 1024px) 340px, 300px', className: 'max-w-[300px] lg:max-w-[340px]' },
  'ipad-03': { sizes: '(min-width: 640px) 440px, 90vw', className: 'max-w-[440px]' },
};

export default function WorkflowsPage() {
  useDocumentMeta(meta);
  return (
    <>
      <PageHero eyebrow={c.hero.eyebrow} title={c.hero.title} lede={c.hero.lede} actions={<StoreBadges size="md" />} />

      {/* All three capture paths at a glance. The figure's own label names this landmark. */}
      <Section tone="white" aria-labelledby={`${OVERVIEW_ID}-label`} className="py-10 sm:py-14 lg:py-16" flush>
        <Reveal>
          <WorkflowDiagram id={OVERVIEW_ID} />
        </Reveal>
      </Section>

      {c.entryPoints.map((section, index) => {
        const headingId = `${section.id}-title`;
        const imageLeft = index % 2 === 1;
        const image: ScreenshotId | undefined = 'image' in section ? section.image : undefined;
        const layout = image ? figureLayout[image] : undefined;
        return (
          <Section key={section.id} id={section.id} tone={index % 2 === 0 ? 'surface' : 'white'} aria-labelledby={headingId}>
            <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
              <Reveal className={cn(imageLeft && 'lg:order-last')}>
                <SectionHeading as="h2" id={headingId} title={section.title} split />
                <p className="measure mt-5 text-muted-foreground">{section.body}</p>
              </Reveal>
              <Reveal delay={0.1}>
                {image ? (
                  <ScreenshotFigure
                    image={image}
                    bleed
                    caption
                    sizes={layout?.sizes}
                    className={cn('mx-auto w-full', layout?.className)}
                    imgClassName="drop-shadow-[0_24px_40px_rgba(20,34,53,0.18)]"
                  />
                ) : (
                  <WorkflowDiagram id={`${section.id}-diagram`} paths={[section.path]} variant="compact" className="mx-auto w-full max-w-[440px]" />
                )}
              </Reveal>
            </div>
          </Section>
        );
      })}

      <Section tone="tint">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
          <Reveal>
            <article id={c.annotations.id} aria-labelledby={`${c.annotations.id}-title`} className="card-surface h-full p-6 sm:p-8">
              <h2 id={`${c.annotations.id}-title`} className="text-2xl sm:text-3xl">
                {c.annotations.title}
              </h2>
              <p className="mt-4 text-muted-foreground">{c.annotations.body}</p>
            </article>
          </Reveal>
          <Reveal delay={0.1}>
            {/* The only iOS-labelled content on this page. */}
            <article id={c.ios.id} aria-labelledby={`${c.ios.id}-title`} className="card-surface h-full p-6 sm:p-8">
              <p className="eyebrow mb-3">{c.ios.eyebrow}</p>
              <h2 id={`${c.ios.id}-title`} className="text-2xl sm:text-3xl">
                {c.ios.title}
              </h2>
              <p className="mt-4 text-muted-foreground">{c.ios.body}</p>
            </article>
          </Reveal>
        </div>
      </Section>

      <Section id={c.review.id} tone="white" aria-labelledby={`${c.review.id}-title`}>
        <Reveal>
          <SectionHeading as="h2" id={`${c.review.id}-title`} title={c.review.title} split />
          <p className="measure mt-5 text-muted-foreground">{c.review.body}</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            {c.review.links.map((link) => (
              <Button key={link.to} asChild variant="outline" size="lg">
                <Link to={link.to}>
                  {link.label} <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            ))}
          </div>
        </Reveal>
      </Section>

      <CtaBand id={c.cta.id} title={c.cta.title} body={c.cta.body} badges secondary={c.cta.secondary} />
    </>
  );
}
