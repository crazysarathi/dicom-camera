import { Link } from 'react-router-dom';
import { ArrowRight, Download } from 'lucide-react';
import type { PageMeta } from '@/lib/seo';
import { useDocumentMeta } from '@/lib/seo';
import { PageHero } from '@/components/PageHero';
import { Section } from '@/components/Section';
import { CtaBand } from '@/components/CtaBand';
import { DocumentStatus } from '@/components/DocumentStatus';
import { DocumentBlocks } from '@/components/DocumentRenderer';
import { Button } from '@/components/ui/button';
import { conformanceContent as c, conformanceDocument as doc } from '@/content/conformance';
import { conformanceDocument as source } from '@/content/generated/conformance-document';
import { discussSection } from '@/content/integration';

export const meta: PageMeta = {
  title: c.meta.title,
  description: c.meta.description,
  path: '/conformance/',
  // Draft: excluded from indexing by route metadata until a final statement is issued (see DEPLOYMENT.md).
  noindex: doc.noindex,
};

/** The document identity block: label/value pairs, with the status as visible text. */
function IdentityCard() {
  return (
    <div className="card-surface p-6 sm:p-7">
      <DocumentStatus status={doc.status} kind={doc.statusKind} />
      <dl className="mt-5 grid grid-cols-[auto_minmax(0,1fr)] gap-x-5 gap-y-2.5 text-[0.95rem]">
        {[
          [c.identity.document, doc.documentId],
          [c.identity.revision, doc.revision],
          [c.identity.date, doc.date],
          [c.identity.edition, doc.standardEdition],
        ].map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="m-0 font-semibold text-ink">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-6 flex flex-col items-start gap-3 border-t border-line pt-6">
        <Button asChild size="lg" className="h-auto whitespace-normal text-left">
          <a href={doc.pdfUrl} download={doc.pdfFilename} type="application/pdf">
            <Download aria-hidden="true" />
            {doc.downloadLabel}
          </a>
        </Button>
        <Button asChild variant="link" size="default" className="px-0">
          <Link to={c.hero.secondary.to}>
            {c.hero.secondary.label} <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

export default function ConformancePage() {
  useDocumentMeta(meta);
  return (
    <>
      <PageHero
        eyebrow={c.hero.eyebrow}
        title={c.hero.title}
        lede={
          <>
            <p>{c.hero.intro}</p>
            <p className="mt-4">{c.hero.caveat}</p>
          </>
        }
        aside={<IdentityCard />}
      />

      <Section tone="white" aria-label="Conformance statement, HTML edition">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,3.5fr)_minmax(0,8.5fr)] lg:gap-14">
          <nav aria-label={c.contents.label} className="lg:sticky lg:top-[calc(var(--header-h)+1.5rem)] lg:self-start" data-print-hidden="">
            <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{c.contents.title}</p>
            <ol className="mt-3 divide-y divide-line border-y border-line">
              {source.sections.map((section) => (
                <li key={section.id}>
                  <Link to={`#${section.id}`} className="flex min-h-11 items-center py-2 text-[0.95rem] font-medium text-ink no-underline hover:text-primary-deep hover:underline">
                    {section.label}
                  </Link>
                </li>
              ))}
            </ol>
            <p className="mt-5 text-sm text-muted-foreground">
              <a href={doc.pdfUrl} download={doc.pdfFilename} type="application/pdf" className="inline-flex min-h-9 items-center gap-2 font-medium text-primary underline hover:text-primary-deep">
                <Download className="size-4" aria-hidden="true" />
                {doc.downloadLabel}
              </a>
            </p>
          </nav>

          <article aria-labelledby="conformance-document-title" className="min-w-0">
            {/* Print header: the document identity and status travel with a printed copy. */}
            <div className="print-only mb-6 border-b border-line pb-4 text-sm">
              <p className="m-0 font-semibold">{doc.documentId} · {doc.revision} · {doc.date} · {doc.status}</p>
              <p className="m-0 mt-1 text-muted-foreground">{c.document.printNote}</p>
            </div>
            <header className="border-b border-line pb-6">
              <p className="eyebrow mb-2">{doc.documentId} · {doc.revision}</p>
              <h2 id="conformance-document-title" className="text-[1.75rem] sm:text-4xl">
                {c.document.title}
              </h2>
              <p className="mt-4">
                <DocumentStatus status={doc.status} kind={doc.statusKind} />
              </p>
              <DocumentBlocks blocks={source.frontMatter} tableCaptionPrefix={c.document.tableCaptionPrefix} className="mt-2 [&>p]:text-[0.95rem] [&>p]:text-muted-foreground" />
            </header>
            <DocumentBlocks blocks={source.body} tableCaptionPrefix={c.document.tableCaptionPrefix} />
          </article>
        </div>
      </Section>

      <Section tone="surface" aria-labelledby="conformance-related-title" className="py-10 sm:py-12 lg:py-14" flush>
        <h2 id="conformance-related-title" className="text-xl sm:text-2xl">{c.related.title}</h2>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          {c.related.links.map((link) => (
            <Button key={link.to} asChild variant="outline" size="default">
              <Link to={link.to}>
                {link.label} <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          ))}
        </div>
      </Section>

      <CtaBand id={discussSection.id} tone="ink" title={discussSection.title} body={discussSection.body} />
    </>
  );
}
