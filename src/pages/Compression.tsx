import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, ImageOff, Video } from 'lucide-react';
import type { PageMeta } from '@/lib/seo';
import { useDocumentMeta } from '@/lib/seo';
import { PageHero } from '@/components/PageHero';
import { Section, SectionHeading } from '@/components/Section';
import { CompressionTable } from '@/components/CompressionTable';
import { CtaBand } from '@/components/CtaBand';
import { Reveal } from '@/components/Reveal';
import { Button } from '@/components/ui/button';
import { compressionContent as c, compressionModes, compressionRows } from '@/content/compression';
import { discussSection } from '@/content/integration';

export const meta: PageMeta = {
  title: c.meta.title,
  description: c.meta.description,
  path: '/compression/',
};

export default function CompressionPage() {
  useDocumentMeta(meta);
  const modeLabel = (mode: string) => compressionModes.find((m) => m.value === mode)?.label ?? mode;
  return (
    <>
      <PageHero eyebrow={c.hero.eyebrow} title={c.hero.title} lede={c.hero.lede} />

      {/* The three approaches: definition cards, each named by its mode as text. */}
      <Section id={c.approaches.id} tone="white" aria-labelledby={`${c.approaches.id}-title`}>
        <Reveal>
          <SectionHeading id={`${c.approaches.id}-title`} title={c.approaches.title} split />
        </Reveal>
        <Reveal className="mt-10" stagger>
          <ul className="grid gap-6 md:grid-cols-3 lg:gap-8">
            {c.approaches.items.map((item) => (
              <li key={item.mode} className="card-surface flex flex-col p-6">
                <span className="inline-flex w-fit min-h-7 items-center rounded-full border border-line bg-secondary px-3 text-xs font-semibold uppercase tracking-wider text-ink">
                  {modeLabel(item.mode)}
                </span>
                <h3 className="mt-4 text-xl sm:text-xl">{item.term}</h3>
                <p className="mt-2 text-[1rem] leading-relaxed text-muted-foreground">{item.body}</p>
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal className="mt-8">
          <p className="measure text-body text-ink">{c.approaches.uncompressed}</p>
        </Reveal>
      </Section>

      {/* Comparison table (data from documents-source/compression-comparison.csv) */}
      <Section id={c.comparison.id} tone="surface" aria-labelledby={`${c.comparison.id}-title`}>
        <Reveal>
          <SectionHeading id={`${c.comparison.id}-title`} title={c.comparison.title} split />
        </Reveal>
        <Reveal delay={0.1} className="mt-8 lg:mt-10">
          <CompressionTable rows={compressionRows} caption={c.comparison.caption} columns={c.comparison.columns} filter={c.comparison.filter} csv={c.comparison.csv} />
          <p className="measure mt-6 text-[1rem] leading-relaxed text-muted-foreground">{c.comparison.footnote}</p>
        </Reveal>
      </Section>

      {/* Selection guidance */}
      <Section id={c.choose.id} tone="white" aria-labelledby={`${c.choose.id}-title`}>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <Reveal>
            <SectionHeading id={`${c.choose.id}-title`} title={c.choose.title} split />
          </Reveal>
          <Reveal delay={0.1}>
            <ul className="m-0 grid gap-5 p-0" data-reveal-stagger="">
              {c.choose.items.map((item) => (
                <li key={item.term} className="flex gap-4">
                  <span className="mt-2.5 size-2 shrink-0 rounded-full bg-teal" aria-hidden="true" />
                  <p className="m-0 text-ink">
                    <strong className="font-semibold">{item.term}</strong>{' '}
                    <span className="text-muted-foreground">
                      {'link' in item ? (
                        <>
                          {item.body.split(item.link.label)[0]}
                          <Link to={item.link.to} className="font-medium text-primary underline hover:text-primary-deep">
                            {item.link.label}
                          </Link>
                          {item.body.split(item.link.label)[1]}
                        </>
                      ) : (
                        item.body
                      )}
                    </span>
                  </p>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </Section>

      {/* Lossy history and the iOS video note */}
      <Section tone="surface" aria-label="Encoding history and video">
        <Reveal stagger className="grid gap-10 md:grid-cols-2 md:gap-12">
          <article id={c.history.id} aria-labelledby={`${c.history.id}-title`}>
            <span className="inline-flex size-12 items-center justify-center rounded-xl bg-primary-soft text-primary-deep" aria-hidden="true">
              <ImageOff className="size-6" />
            </span>
            <h2 id={`${c.history.id}-title`} className="mt-5">
              {c.history.title}
            </h2>
            <p className="measure mt-4 text-muted-foreground">{c.history.body}</p>
          </article>
          <article id={c.video.id} aria-labelledby={`${c.video.id}-title`}>
            <div className="flex items-center gap-3">
              <span className="inline-flex size-12 items-center justify-center rounded-xl bg-primary-soft text-primary-deep" aria-hidden="true">
                <Video className="size-6" />
              </span>
              <span className="inline-flex min-h-7 items-center rounded-full border border-line bg-secondary px-3 text-xs font-semibold uppercase tracking-wider text-ink">
                {c.video.platformLabel}
              </span>
            </div>
            <h2 id={`${c.video.id}-title`} className="mt-5">
              {c.video.title}
            </h2>
            <p className="measure mt-4 text-muted-foreground">{c.video.body}</p>
          </article>
        </Reveal>
      </Section>

      {/* Confirm the complete connection */}
      <Section id={c.confirm.id} tone="tint" aria-labelledby={`${c.confirm.id}-title`}>
        <Reveal className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <SectionHeading id={`${c.confirm.id}-title`} title={c.confirm.title} split />
          <div className="measure lg:pt-1">
            <p className="prose-site">{c.confirm.body}</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link to={c.confirm.primary.to}>
                  {c.confirm.primary.label} <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to={c.confirm.secondary.to}>{c.confirm.secondary.label}</Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </Section>

      {/* Standards references: a native disclosure, secondary to the explanations above. */}
      <Section id={c.references.id} tone="white" aria-labelledby={`${c.references.id}-title`} className="py-8 sm:py-10 lg:py-12" flush>
        <details className="group card-surface p-5 sm:p-6">
          <summary className="flex min-h-11 cursor-pointer items-center gap-3 text-left [&::-webkit-details-marker]:hidden focus-visible:rounded-md">
            <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-ink" aria-hidden="true">
              <BookOpen className="size-4" />
            </span>
            <h2 id={`${c.references.id}-title`} className="text-lg font-semibold sm:text-xl">
              {c.references.title}
            </h2>
            <span className="ml-auto text-sm font-medium text-muted-foreground group-open:hidden">Show</span>
            <span className="ml-auto hidden text-sm font-medium text-muted-foreground group-open:inline">Hide</span>
          </summary>
          <div className="mt-4 border-t border-line pt-4">
            <p className="measure text-[0.95rem] text-muted-foreground">{c.references.intro}</p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {c.references.items.map((ref) => (
                <li key={ref.href}>
                  <a href={ref.href} rel="noopener" className="inline-flex min-h-9 items-center text-[0.95rem] font-medium text-primary underline [overflow-wrap:anywhere] hover:text-primary-deep">
                    {ref.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </details>
      </Section>

      <CtaBand id={discussSection.id} tone="ink" title={discussSection.title} body={discussSection.body} />
    </>
  );
}
