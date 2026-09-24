import { Link } from 'react-router-dom';
import { ArrowRight, PenLine, Video } from 'lucide-react';
import type { PageMeta } from '@/lib/seo';
import { useDocumentMeta } from '@/lib/seo';
import { PageHero } from '@/components/PageHero';
import { Section, SectionHeading } from '@/components/Section';
import { CapabilityTable } from '@/components/CapabilityTable';
import { CtaBand } from '@/components/CtaBand';
import { Reveal } from '@/components/Reveal';
import { Button } from '@/components/ui/button';
import { ConnectivitySceneLazy } from '@/components/three';
import {
  annotationsSection,
  compressionSection,
  connectivitySection,
  discussSection,
  integrationContents,
  integrationHero,
  storageCommitmentSection,
  videoSection,
} from '@/content/integration';

export const meta: PageMeta = {
  title: 'DICOM Connectivity and Image Formats | DICOM Camera',
  description: 'Explore DICOMweb, DIMSE, MWL, MPPS, UPS, HL7/FHIR demographic queries, image compression, video, and annotation interoperability.',
  path: '/integration/',
};

/**
 * In-page contents card, with a restrained, deferred 3D accent in its own band on wide screens.
 * The card is the real content; the scene is decorative (aria-hidden) and nothing depends on it.
 */
function ContentsAside() {
  return (
    <div className="mx-auto w-full max-w-sm lg:ml-auto lg:mr-0 lg:max-w-md">
      <div className="relative mb-5 hidden aspect-[16/7] overflow-hidden rounded-2xl border border-line bg-white/70 shadow-card lg:block">
        <ConnectivitySceneLazy wrapperClassName="absolute inset-0" />
      </div>
      <nav aria-label="On this page" className="card-surface p-5 sm:p-6">
        <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">On this page</p>
        <ol className="mt-3 divide-y divide-line">
          {integrationContents.map((item, index) => (
            <li key={item.id}>
              <Link to={`#${item.id}`} className="flex min-h-11 items-center gap-3 py-2 text-[1rem] font-medium text-ink no-underline hover:text-primary-deep hover:underline">
                <span className="w-5 shrink-0 text-sm tabular-nums text-muted-foreground" aria-hidden="true">
                  {index + 1}
                </span>
                {item.label}
              </Link>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
}

export default function IntegrationPage() {
  useDocumentMeta(meta);
  return (
    <>
      <PageHero
        eyebrow={integrationHero.eyebrow}
        title={integrationHero.title}
        lede={integrationHero.lede}
        actions={
          <>
            <Button asChild size="lg">
              <Link to={integrationHero.primary.to}>{integrationHero.primary.label}</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to={integrationHero.secondary.to}>
                {integrationHero.secondary.label} <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </>
        }
        aside={<ContentsAside />}
      />

      <Section id={connectivitySection.id} tone="white" aria-labelledby={`${connectivitySection.id}-title`}>
        <Reveal>
          <SectionHeading id={`${connectivitySection.id}-title`} title={connectivitySection.title} split />
        </Reveal>
        <Reveal delay={0.1} className="mt-8 lg:mt-10">
          <CapabilityTable caption={connectivitySection.title} captionVisuallyHidden columns={connectivitySection.columns} rows={[...connectivitySection.rows]} />
        </Reveal>
      </Section>

      <Section id={compressionSection.id} tone="surface" aria-labelledby={`${compressionSection.id}-title`}>
        <Reveal>
          <SectionHeading id={`${compressionSection.id}-title`} title={compressionSection.title} lede={compressionSection.lede} split />
        </Reveal>
        <Reveal delay={0.1} className="mt-8 lg:mt-10">
          <div className="card-surface px-5 py-2 sm:px-8 sm:py-4">
            <CapabilityTable
              caption={compressionSection.title}
              captionVisuallyHidden
              columns={compressionSection.columns}
              rows={[...compressionSection.rows]}
              className="[&_tbody_tr:last-child]:border-b-0"
            />
          </div>
          <p className="measure mt-6 text-[1rem] leading-relaxed text-muted-foreground">{compressionSection.disclaimer}</p>
        </Reveal>
      </Section>

      <Section tone="white" aria-label="Video and annotations">
        <Reveal stagger className="grid gap-10 md:grid-cols-2 md:gap-12">
          <article id={videoSection.id} aria-labelledby={`${videoSection.id}-title`}>
            <div className="flex items-center gap-3">
              <span className="inline-flex size-12 items-center justify-center rounded-xl bg-primary-soft text-primary-deep" aria-hidden="true">
                <Video className="size-6" />
              </span>
              <span className="inline-flex min-h-7 items-center rounded-full border border-line bg-secondary px-3 text-xs font-semibold uppercase tracking-wider text-ink">
                {videoSection.platformLabel}
              </span>
            </div>
            <h2 id={`${videoSection.id}-title`} className="mt-5">
              {videoSection.title}
            </h2>
            <p className="measure mt-4 text-muted-foreground">{videoSection.body}</p>
          </article>
          <article id={annotationsSection.id} aria-labelledby={`${annotationsSection.id}-title`}>
            <span className="inline-flex size-12 items-center justify-center rounded-xl bg-primary-soft text-primary-deep" aria-hidden="true">
              <PenLine className="size-6" />
            </span>
            <h2 id={`${annotationsSection.id}-title`} className="mt-5">
              {annotationsSection.title}
            </h2>
            <p className="measure mt-4 text-muted-foreground">{annotationsSection.body}</p>
          </article>
        </Reveal>
      </Section>

      <Section id={storageCommitmentSection.id} tone="tint" aria-labelledby={`${storageCommitmentSection.id}-title`}>
        <Reveal className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <SectionHeading id={`${storageCommitmentSection.id}-title`} title={storageCommitmentSection.title} split />
          <div className="measure lg:pt-1">
            <p className="prose-site">{storageCommitmentSection.body}</p>
            <p className="mt-6">
              <Link to={storageCommitmentSection.link.to} className="inline-flex min-h-11 items-center gap-2 font-semibold text-primary hover:text-primary-deep">
                {storageCommitmentSection.link.label} <ArrowRight className="size-[1.1em]" aria-hidden="true" />
              </Link>
            </p>
          </div>
        </Reveal>
      </Section>

      <CtaBand
        id={discussSection.id}
        tone="ink"
        badges={false}
        title={discussSection.title}
        body={discussSection.body}
        primary={
          <Button asChild size="lg" variant="secondary">
            <Link to={discussSection.action.to}>
              {discussSection.action.label} <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        }
      />
    </>
  );
}
