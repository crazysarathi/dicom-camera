import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import type { PageMeta } from '@/lib/seo';
import { useDocumentMeta } from '@/lib/seo';
import { PageHero } from '@/components/PageHero';
import { Section, SectionHeading } from '@/components/Section';
import { ScreenshotFigure } from '@/components/ScreenshotFigure';
import { Reveal } from '@/components/Reveal';
import { Button } from '@/components/ui/button';
import {
  enterpriseDiscussion,
  enterpriseHero,
  enterpriseInfrastructure,
  enterpriseInterfaces,
  enterpriseLinks,
  enterpriseRetention,
  type EnterpriseSection,
} from '@/content/enterprise';

export const meta: PageMeta = {
  title: 'Hospital and Enterprise Workflows | DICOM Camera',
  description: 'Connect point-of-care capture with MWL, optional MPPS, UPS, HL7, FHIR, and PACS. Discuss DICOM Camera deployment with Raster.',
  path: '/enterprise/',
};

/** One of the two prose sections that pair a heading with a supporting cross-link. */
function ProseSection({ section, tone, link }: { section: EnterpriseSection; tone: 'white' | 'surface'; link: { label: string; to: string } }) {
  const Icon = section.icon;
  const headingId = `${section.id}-title`;
  return (
    <Section id={section.id} tone={tone} aria-labelledby={headingId}>
      <Reveal className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div className="flex items-start gap-4">
          <span className="mt-1 inline-flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary-deep" aria-hidden="true">
            <Icon className="size-6" />
          </span>
          <SectionHeading id={headingId} title={section.title} split />
        </div>
        <div className="measure lg:pt-1">
          <p className="prose-site">{section.body}</p>
          <p className="mt-6">
            <Link to={link.to} className="inline-flex min-h-11 items-center gap-2 font-semibold text-primary hover:text-primary-deep">
              {link.label} <ArrowRight className="size-[1.1em]" aria-hidden="true" />
            </Link>
          </p>
        </div>
      </Reveal>
    </Section>
  );
}

export default function EnterprisePage() {
  useDocumentMeta(meta);
  return (
    <>
      <PageHero
        eyebrow={enterpriseHero.eyebrow}
        title={enterpriseHero.title}
        lede={enterpriseHero.lede}
        actions={
          <>
            <Button asChild size="lg">
              <Link to={enterpriseHero.primary.to}>{enterpriseHero.primary.label}</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to={enterpriseHero.secondary.to}>
                {enterpriseHero.secondary.label} <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </>
        }
        aside={
          <ScreenshotFigure
            image="ipad-03"
            caption
            bleed
            sizes="(min-width: 1024px) 460px, (min-width: 640px) 70vw, 90vw"
            className="mx-auto w-full max-w-[460px] lg:ml-auto lg:mr-0"
          />
        }
      />

      {/* Hospital interfaces: three approved sections presented side by side. Each keeps its own H2. */}
      <Section tone="white" aria-label="Hospital workflow interfaces">
        <Reveal stagger className="grid gap-10 md:grid-cols-3 md:gap-8">
          {enterpriseInterfaces.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.id} id={item.id} className="flex flex-col" aria-labelledby={`${item.id}-title`}>
                <span className="inline-flex size-12 items-center justify-center rounded-xl bg-primary-soft text-primary-deep" aria-hidden="true">
                  <Icon className="size-6" />
                </span>
                <h2 id={`${item.id}-title`} className="mt-5 text-[1.5rem] leading-snug sm:text-[1.625rem]">
                  {item.title}
                </h2>
                <p className="mt-3 text-[1rem] leading-relaxed text-muted-foreground sm:text-[1.0625rem]">{item.body}</p>
              </article>
            );
          })}
        </Reveal>
      </Section>

      <ProseSection section={enterpriseInfrastructure} tone="surface" link={enterpriseLinks.integration} />
      <ProseSection section={enterpriseRetention} tone="white" link={enterpriseLinks.retention} />

      <Section id={enterpriseDiscussion.id} tone="ink" aria-labelledby={`${enterpriseDiscussion.id}-title`}>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,6fr)_minmax(0,6fr)] lg:gap-16">
          <Reveal className="max-w-xl">
            <h2 id={`${enterpriseDiscussion.id}-title`} className="text-white" data-split="">
              {enterpriseDiscussion.title}
            </h2>
            <p className="mt-4 text-lg text-white/80">{enterpriseDiscussion.lede}</p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button asChild size="lg" variant="secondary">
                <Link to={enterpriseDiscussion.action.to}>
                  {enterpriseDiscussion.action.label} <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            </div>
            <p className="mt-6 text-base text-white/80">{enterpriseDiscussion.note}</p>
          </Reveal>
          <Reveal delay={0.1}>
            <ul className="rounded-2xl border border-white/15 bg-white/[0.06] p-2 sm:p-3" data-reveal-stagger="">
              {enterpriseDiscussion.topics.map((topic) => (
                <li key={topic} className="flex items-start gap-3 rounded-xl px-4 py-3 text-[1.0625rem] leading-relaxed text-white/90">
                  <Check className="mt-1.5 size-4 shrink-0 text-teal-soft" aria-hidden="true" />
                  <span>{topic}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </Section>
    </>
  );
}
