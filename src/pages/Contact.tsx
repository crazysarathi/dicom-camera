import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Check, ShieldAlert, Tag } from 'lucide-react';
import type { PageMeta } from '@/lib/seo';
import { useDocumentMeta } from '@/lib/seo';
import { PageHero } from '@/components/PageHero';
import { Section, SectionHeading } from '@/components/Section';
import { EmailAction } from '@/components/EmailAction';
import { ContactForm } from '@/components/ContactForm';
import { Reveal } from '@/components/Reveal';
import { Button } from '@/components/ui/button';
import { siteConfig } from '@/config/site';
import { contactContent as c } from '@/content/contact';

export const meta: PageMeta = {
  title: 'Hospital and Commercial Enquiries | DICOM Camera',
  description: 'Contact Raster about DICOM Camera hospital deployment, PACS integration, patient information interfaces, and commercial requirements.',
  path: '/contact/',
};

export default function ContactPage() {
  useDocumentMeta(meta);
  const formEndpoint = siteConfig.contactFormEndpoint;
  // /#/contact/?topic=enterprise-manager: the Enterprise Manager call to action lands here with its topic.
  const [params] = useSearchParams();
  const topicKey = params.get('topic') ?? '';
  const topic = topicKey ? c.topics[topicKey] : undefined;
  const email = topic?.email ?? c.primaryAction.email;
  return (
    <>
      <PageHero
        eyebrow={c.eyebrow}
        title={c.title}
        lede={c.intro}
        actions={
          <div className="flex w-full flex-col gap-5">
            {topic && (
              <p className="m-0 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.95rem] text-ink" data-enquiry-topic={topicKey}>
                <Tag className="size-4 text-teal" aria-hidden="true" />
                <span className="text-muted-foreground">{topic.label}:</span>
                <strong className="font-semibold">{topic.name}</strong>
                <span className="basis-full text-sm text-muted-foreground">{topic.note}</span>
              </p>
            )}
            <EmailAction email={email} buttonLabel={c.primaryAction.label} note={c.primaryAction.note} />
          </div>
        }
      />

      <Section id={c.details.id} tone="white" aria-labelledby={`${c.details.id}-title`}>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <Reveal>
            <SectionHeading id={`${c.details.id}-title`} title={c.details.title} split />
          </Reveal>
          <Reveal delay={0.1}>
            <div className="card-surface p-6 sm:p-8">
              <ul className="m-0 grid gap-3.5 p-0" data-reveal-stagger="">
                {c.details.items.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-ink">
                    <span className="mt-1 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary-deep" aria-hidden="true">
                      <Check className="size-3.5" />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 flex items-start gap-3 border-t border-line pt-6 text-muted-foreground">
                <ShieldAlert className="mt-1 size-5 shrink-0 text-teal" aria-hidden="true" />
                <span>{c.details.caution}</span>
              </p>
            </div>
          </Reveal>
        </div>
      </Section>

      {formEndpoint ? (
        <Section id={c.form.id} tone="surface" aria-labelledby={`${c.form.id}-title`}>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-16">
            <Reveal>
              <SectionHeading id={`${c.form.id}-title`} title={c.form.title} />
            </Reveal>
            <Reveal delay={0.1}>
              <ContactForm endpoint={formEndpoint} defaultTopic={topic?.formTopic} />
            </Reveal>
          </div>
        </Section>
      ) : null}

      <Section id={c.support.id} tone="tint" aria-labelledby={`${c.support.id}-title`}>
        <Reveal className="grid items-center gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <div className="max-w-2xl">
            <h2 id={`${c.support.id}-title`}>{c.support.title}</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              {c.support.before}
              <a href={c.support.email.href} className="font-medium text-primary [overflow-wrap:anywhere] hover:text-primary-deep">
                {c.support.email.address}
              </a>
              {c.support.after}
            </p>
          </div>
          <div className="flex lg:justify-end">
            <Button asChild variant="outline" size="lg" className="h-auto whitespace-normal text-left">
              <Link to={c.support.link.to}>
                {c.support.link.label} <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </Reveal>
      </Section>
    </>
  );
}
