import { Link } from 'react-router-dom';
import { ArrowRight, LifeBuoy } from 'lucide-react';
import type { PageMeta } from '@/lib/seo';
import { useDocumentMeta } from '@/lib/seo';
import { siteConfig } from '@/config/site';
import { downloadContent, type PlatformPanel } from '@/content/download';
import { screenshots } from '@/images/manifest';
import { PageHero } from '@/components/PageHero';
import { Section } from '@/components/Section';
import { CtaBand } from '@/components/CtaBand';
import { Reveal } from '@/components/Reveal';
import { ScreenshotFigure } from '@/components/ScreenshotFigure';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const meta: PageMeta = {
  title: 'Download for iOS and Android | DICOM Camera',
  description: 'Get DICOM Camera from the App Store or Google Play. Contact Raster for hospital deployment and integration enquiries.',
  path: '/download/',
};

/** One platform: heading with its app icon, the approved sentence, the official store badge and a genuine screenshot. */
function PlatformCard({ panel }: { panel: PlatformPanel }) {
  const store = siteConfig.stores[panel.store];
  const badgeWidth = Math.round(panel.badgeHeight * panel.badgeRatio);
  const complete = screenshots[panel.screenshot].complete;
  return (
    <article id={panel.id} aria-labelledby={`${panel.id}-title`} className="card-surface flex flex-col overflow-hidden">
      <div className="p-6 sm:p-8">
        <div className="flex items-center gap-4">
          <img
            src={panel.icon.src}
            width={panel.icon.size}
            height={panel.icon.size}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            className="size-16 shrink-0 rounded-2xl border border-line"
          />
          <h2 id={`${panel.id}-title`} className="text-2xl sm:text-3xl">{panel.title}</h2>
        </div>
        <p className="mt-5 max-w-measure text-muted-foreground">{panel.body}</p>
        {/* The Google Play PNG carries its own clear space, so its focus ring hugs the artwork like the shared StoreBadges group. */}
        <a
          href={store.url}
          rel="noopener"
          className={cn('mt-6 inline-flex rounded-lg', panel.store === 'googlePlay' ? '-mx-1 focus-visible:ring-offset-0' : 'focus-visible:ring-offset-4')}
        >
          <img
            src={store.badge}
            width={badgeWidth}
            height={panel.badgeHeight}
            alt={store.label}
            style={{ height: panel.badgeHeight, width: 'auto' }}
            decoding="async"
          />
        </a>
      </div>
      {/* Compositions that bleed off their original bottom edge sit flush with the card edge so the card clips the cut naturally. */}
      <div className={cn('mt-auto px-10 sm:px-14', complete ? 'pb-8 sm:pb-10' : 'pb-0')}>
        <ScreenshotFigure
          image={panel.screenshot}
          sizes={screenshots[panel.screenshot].screenOnly ? '(min-width: 1024px) 280px, 56vw' : '(min-width: 1024px) 360px, (min-width: 640px) 60vw, 70vw'}
          className={cn('mx-auto', screenshots[panel.screenshot].screenOnly ? 'max-w-[17.5rem]' : 'max-w-[22rem]')}
        />
      </div>
    </article>
  );
}

export default function DownloadPage() {
  useDocumentMeta(meta);
  const { hero, platforms, support, deployment } = downloadContent;
  return (
    <>
      <PageHero eyebrow={hero.eyebrow} title={hero.title} lede={hero.lede} />

      <Section tone="white" id="platforms" aria-label="Choose your platform">
        <Reveal stagger className="grid items-start gap-6 lg:grid-cols-2 lg:gap-8">
          {platforms.map((panel) => (
            <PlatformCard key={panel.id} panel={panel} />
          ))}
        </Reveal>
        <Reveal className="mt-8">
          <p>
            <Link to={support.to} className="inline-flex min-h-11 items-center gap-2 font-semibold text-primary underline hover:text-primary-deep">
              <LifeBuoy className="size-5" aria-hidden="true" />
              {support.label}
            </Link>
          </p>
        </Reveal>
      </Section>

      <CtaBand
        id="deployment"
        tone="ink"
        title={deployment.title}
        body={deployment.body}
        badges={false}
        primary={
          <Button asChild size="lg">
            <Link to={deployment.action.to}>
              {deployment.action.label} <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        }
      />
    </>
  );
}
