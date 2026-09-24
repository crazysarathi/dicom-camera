import { Link } from 'react-router-dom';
import { ArrowRight, Mail, ShieldAlert } from 'lucide-react';
import type { PageMeta } from '@/lib/seo';
import { useDocumentMeta } from '@/lib/seo';
import { PageHero } from '@/components/PageHero';
import { Section, SectionHeading } from '@/components/Section';
import { EmailAction } from '@/components/EmailAction';
import { Faq } from '@/components/Faq';
import { Reveal } from '@/components/Reveal';
import { Button } from '@/components/ui/button';
import { supportContent as c } from '@/content/support';

export const meta: PageMeta = {
  title: 'Support and Frequently Asked Questions | DICOM Camera',
  description: 'Find answers about DICOM Camera capture, Photo Album import, retention, PACS integration, and getting support from Raster.',
  path: '/support/',
};

export default function SupportPage() {
  useDocumentMeta(meta);
  return (
    <>
      <PageHero
        eyebrow={c.eyebrow}
        title={c.title}
        lede={c.intro}
        actions={<EmailAction email={c.primaryAction.email} buttonLabel={c.primaryAction.label} note={c.primaryAction.note} />}
      />

      <Section id={c.faq.id} tone="white" aria-labelledby={`${c.faq.id}-title`}>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-16">
          <Reveal>
            <SectionHeading id={`${c.faq.id}-title`} title={c.faq.title} split className="lg:sticky lg:top-[calc(var(--header-h)+2rem)]" />
          </Reveal>
          <Reveal>
            <Faq items={c.faq.items} idPrefix="faq" />
          </Reveal>
        </div>
      </Section>

      <Section id={c.beforeContacting.id} tone="tint" aria-labelledby={`${c.beforeContacting.id}-title`}>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
          <Reveal>
            <SectionHeading id={`${c.beforeContacting.id}-title`} title={c.beforeContacting.title} split />
            <p className="measure mt-5 text-body text-ink">{c.beforeContacting.body}</p>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="card-surface flex h-full flex-col gap-6 p-6 sm:p-8">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-teal-soft text-teal" aria-hidden="true">
                  <ShieldAlert className="size-5" />
                </span>
                <p className="m-0 text-ink">{c.beforeContacting.caution}</p>
              </div>
              <div className="mt-auto flex flex-wrap items-center gap-3 border-t border-line pt-6">
                <Button asChild>
                  <a href={c.primaryAction.email.href}>
                    <Mail aria-hidden="true" />
                    {c.primaryAction.label}
                  </a>
                </Button>
                <Button asChild variant="outline" className="h-auto whitespace-normal text-left">
                  <Link to={c.secondaryAction.to}>
                    {c.secondaryAction.label} <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </Section>
    </>
  );
}
