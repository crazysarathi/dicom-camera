import { Link } from 'react-router-dom';
import { ArrowRight, LockKeyhole } from 'lucide-react';
import type { PageMeta } from '@/lib/seo';
import { useDocumentMeta } from '@/lib/seo';
import { siteConfig } from '@/config/site';
import { privacyContent, type ProseBlock } from '@/content/privacy';
import { PageHero } from '@/components/PageHero';
import { Section } from '@/components/Section';
import { CtaBand } from '@/components/CtaBand';
import { Reveal } from '@/components/Reveal';
import { RetentionDiagram } from '@/components/RetentionDiagram';
import { Button } from '@/components/ui/button';

export const meta: PageMeta = {
  title: 'Image Storage and Retention | DICOM Camera',
  description: 'Understand in-app capture storage, explicit Photo Album export, automatic deletion after send, and optional DICOM Storage Commitment gating.',
  path: '/privacy-and-retention/',
};

/** One explanatory block: icon, H2 and a paragraph. Used in two-column grids. */
function Explainer({ block }: { block: ProseBlock }) {
  const Icon = block.icon;
  return (
    <article id={block.id} aria-labelledby={`${block.id}-title`} className="flex gap-4">
      <span className="mt-1 inline-flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary-deep" aria-hidden="true">
        <Icon className="size-5" />
      </span>
      <div className="max-w-measure">
        <h2 id={`${block.id}-title`} className="text-2xl sm:text-[1.75rem]">{block.title}</h2>
        <p className="mt-3 text-muted-foreground">{block.body}</p>
      </div>
    </article>
  );
}

export default function PrivacyRetentionPage() {
  useDocumentMeta(meta);
  const { hero, storage, deletion, diagram, managed, fit, footnote } = privacyContent;
  return (
    <>
      <PageHero eyebrow={hero.eyebrow} title={hero.title} lede={hero.lede} />

      <Section tone="white" id="storage" aria-label="In-app storage and Photo Album import">
        <Reveal stagger className="grid gap-10 lg:grid-cols-2 lg:gap-12">
          {storage.map((block) => (
            <Explainer key={block.id} block={block} />
          ))}
        </Reveal>
      </Section>

      <Section id="retention" aria-label="Deletion after send and Storage Commitment">
        <Reveal stagger className="grid gap-10 lg:grid-cols-2 lg:gap-12">
          {deletion.map((block) => (
            <Explainer key={block.id} block={block} />
          ))}
        </Reveal>
        <Reveal className="mt-12 lg:mt-16" delay={0.1}>
          <RetentionDiagram flows={diagram.flows} note={diagram.note} disclaimer={diagram.disclaimer} />
        </Reveal>
      </Section>

      <Section id={managed.id} tone="white" aria-labelledby={`${managed.id}-title`}>
        <Reveal className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <div className="flex items-start gap-4">
            <span className="mt-1 inline-flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary-deep" aria-hidden="true">
              <LockKeyhole className="size-5" />
            </span>
            <h2 id={`${managed.id}-title`} className="text-2xl sm:text-[1.75rem]">{managed.title}</h2>
          </div>
          <div className="max-w-measure lg:pt-1">
            <div className="prose-site space-y-4">
              {managed.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            <p className="mt-6">
              <Link to={managed.action.to} className="inline-flex min-h-11 items-center gap-2 font-semibold text-primary hover:text-primary-deep">
                {managed.action.label} <ArrowRight className="size-[1.1em]" aria-hidden="true" />
              </Link>
            </p>
          </div>
        </Reveal>
      </Section>

      <CtaBand
        id="fit-retention"
        tone="ink"
        title={fit.title}
        body={fit.body}
        badges={false}
        primary={
          <Button asChild size="lg">
            <Link to={fit.action.to}>
              {fit.action.label} <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        }
      />

      <Section tone="white" className="py-6 sm:py-8 lg:py-8" flush>
        <p className="max-w-measure text-sm text-muted-foreground">
          {footnote}{' '}
          <a href={siteConfig.legal.privacy.href} rel="noopener" className="text-ink underline hover:text-primary">
            {siteConfig.legal.privacy.label}
          </a>
          {' · '}
          <a href={siteConfig.legal.terms.href} rel="noopener" className="text-ink underline hover:text-primary">
            {siteConfig.legal.terms.label}
          </a>
        </p>
      </Section>
    </>
  );
}
