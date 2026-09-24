import type { PageMeta } from '@/lib/seo';
import { useDocumentMeta } from '@/lib/seo';
import { Section, SectionHeading } from '@/components/Section';
import { Reveal } from '@/components/Reveal';
import { FeatureList } from '@/components/FeatureList';
import { ScreenshotFigure } from '@/components/ScreenshotFigure';
import { ScreenshotGallery } from '@/components/ScreenshotGallery';
import { CtaBand } from '@/components/CtaBand';
import { ConnectivitySceneLazy } from '@/components/three';
import { HomeHero } from '@/components/home/HomeHero';
import { CapabilityStrip } from '@/components/home/CapabilityStrip';
import { ArrowLink } from '@/components/home/ArrowLink';
import { homeContent as c } from '@/content/home';
import { siteConfig } from '@/config/site';
import { KeyRound, LockKeyhole, QrCode } from 'lucide-react';

export const meta: PageMeta = {
  title: 'DICOM Camera | Clinical Photos and Video for PACS',
  description: 'Capture clinical photos and videos, add annotations, and connect with PACS using DICOM Camera for iOS and Android. Explore enterprise workflows and downloads.',
  path: '/',
};

export default function HomePage() {
  useDocumentMeta(meta);
  return (
    <>
      {/* Opening */}
      <HomeHero />
      <CapabilityStrip label={c.capabilities.label} items={c.capabilities.items} />

      {/* Flexible capture: prose left, genuine iPad capture-entry screen right */}
      <Section id="capture" tone="surface" aria-labelledby="capture-title">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,6fr)_minmax(0,6fr)] lg:gap-16">
          <Reveal>
            <SectionHeading id="capture-title" title={c.capture.title} lede={c.capture.body} split />
            <ul className="mt-8 max-w-measure space-y-5" data-reveal-stagger="">
              {c.capture.items.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.title} className="flex gap-4">
                    {Icon && (
                      <span className="mt-1 inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary-deep" aria-hidden="true">
                        <Icon className="size-[1.1rem]" />
                      </span>
                    )}
                    <p className="text-ink">
                      <strong className="font-semibold">{item.title}</strong> <span className="text-muted-foreground">{item.body}</span>
                    </p>
                  </li>
                );
              })}
            </ul>
            <ArrowLink to={c.capture.link.to} label={c.capture.link.label} className="mt-6" />
          </Reveal>
          <Reveal delay={0.1} className="flex justify-center lg:justify-end">
            <ScreenshotFigure
              image={c.capture.image}
              sizes="(min-width: 1024px) 560px, 90vw"
              bleed
              caption
              className="w-full max-w-[560px]"
              imgClassName="drop-shadow-screen"
            />
          </Reveal>
        </div>
      </Section>

      {/* Enterprise workflows */}
      <Section id="enterprise-workflows" tone="white" aria-labelledby="enterprise-title">
        <Reveal>
          <SectionHeading id="enterprise-title" title={c.enterprise.title} lede={c.enterprise.body} split />
        </Reveal>
        <Reveal className="mt-12">
          <FeatureList items={c.enterprise.items} columns={3} />
        </Reveal>
        <Reveal className="mt-10">
          <ArrowLink to={c.enterprise.link.to} label={c.enterprise.link.label} />
        </Reveal>
        {/* Enterprise Manager: optional server for centralised licensing, configuration and policy control */}
        <Reveal className="mt-12" delay={0.05}>
          <div className="card-surface grid gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-center lg:gap-12">
            <div className="max-w-measure">
              <p className="eyebrow mb-3">{siteConfig.enterpriseManager.name}</p>
              <h3 id="enterprise-manager-intro-title" className="text-2xl sm:text-[1.75rem]">{c.enterprise.manager.title}</h3>
              <p className="mt-3 text-muted-foreground">{c.enterprise.manager.body}</p>
              <ArrowLink to={c.enterprise.manager.link.to} label={c.enterprise.manager.link.label} className="mt-5" />
            </div>
            <ul className="grid gap-3 text-[0.95rem] text-ink sm:grid-cols-3 lg:grid-cols-1" aria-label="Enterprise Manager controls">
              {[
                { icon: KeyRound, label: 'Managed feature access and floating licences' },
                { icon: QrCode, label: 'Personal setup link or QR code for each user' },
                { icon: LockKeyhole, label: 'Locked connection, compression, export and deletion settings' },
              ].map((item) => (
                <li key={item.label} className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary-deep" aria-hidden="true">
                    <item.icon className="size-4" />
                  </span>
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </Section>

      {/* Annotations */}
      <Section id="annotations" tone="surface" aria-labelledby="annotations-title">
        <Reveal className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <SectionHeading id="annotations-title" title={c.annotations.title} split />
          <div className="max-w-measure lg:pt-2">
            <p className="text-body-lg text-ink">{c.annotations.body}</p>
            <p className="mt-5 text-[0.95rem] text-muted-foreground">{c.annotations.supporting}</p>
          </div>
        </Reveal>
      </Section>

      {/* Storage and retention */}
      <Section id="storage" tone="white" aria-labelledby="storage-title">
        <Reveal className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <SectionHeading id="storage-title" title={c.storage.title} split />
          <div className="max-w-measure lg:pt-2">
            <div className="prose-site space-y-4 text-body-lg">
              {c.storage.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            <ArrowLink to={c.storage.link.to} label={c.storage.link.label} className="mt-6" />
          </div>
        </Reveal>
      </Section>

      {/* Image fidelity and video */}
      <Section id="fidelity" tone="surface" aria-labelledby="fidelity-title">
        <Reveal className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <SectionHeading id="fidelity-title" title={c.fidelity.title} split />
          <div className="max-w-measure lg:pt-2">
            <p className="text-body-lg text-ink">{c.fidelity.body}</p>
            {/* iOS-labelled sub-block */}
            <div className="mt-8 border-l-2 border-teal pl-5">
              <h3 className="text-base font-semibold uppercase tracking-[0.08em] text-ink sm:text-base">{c.fidelity.ios.label}</h3>
              <p className="mt-2 text-ink">{c.fidelity.ios.body}</p>
            </div>
            <p className="mt-8 text-[0.95rem] text-muted-foreground">{c.fidelity.supporting}</p>
            <ArrowLink to={c.fidelity.link.to} label={c.fidelity.link.label} className="mt-4" />
          </div>
        </Reveal>
      </Section>

      {/* Connectivity: prose plus a restrained WebGL accent that the text never depends on */}
      <Section id="connectivity" tone="tint" aria-labelledby="connectivity-title">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,6fr)_minmax(0,6fr)] lg:gap-16">
          <Reveal>
            <SectionHeading id="connectivity-title" title={c.connectivity.title} split />
            <p className="mt-6 max-w-measure text-body-lg text-ink">{c.connectivity.body}</p>
          </Reveal>
          {/* Accent panel: desktop only (as on the Integration page). The dotted texture keeps the panel from
              reading as an empty box when the deferred scene does not render (no WebGL, save-data). */}
          <Reveal
            delay={0.1}
            className="relative hidden aspect-[4/3] overflow-hidden rounded-2xl border border-line bg-card/70 shadow-card lg:block"
          >
            <div
              className="absolute inset-0 opacity-70 [background-image:radial-gradient(theme(colors.line)_1px,transparent_1px)] [background-size:22px_22px]"
              aria-hidden="true"
            />
            <ConnectivitySceneLazy wrapperClassName="absolute inset-0" />
          </Reveal>
        </div>
      </Section>

      {/* Platforms */}
      <Section id="platforms" tone="white" aria-labelledby="platforms-title">
        <Reveal>
          <SectionHeading id="platforms-title" title={c.platforms.title} split />
        </Reveal>
        <Reveal className="mt-10 grid gap-10 lg:grid-cols-2 lg:gap-16" stagger>
          <div className="max-w-measure">
            <h3>{c.platforms.ios.title}</h3>
            <p className="mt-3 text-ink">{c.platforms.ios.body}</p>
          </div>
          <div className="max-w-measure">
            <h3>{c.platforms.android.title}</h3>
            <p className="mt-3 text-ink">{c.platforms.android.body}</p>
          </div>
        </Reveal>
        <Reveal className="mt-14">
          <h3 className="sr-only">{c.platforms.galleryHeading}</h3>
          <ScreenshotGallery groups={c.platforms.gallery} tabsLabel="Platform" viewer />
        </Reveal>
      </Section>

      {/* Clinical uses */}
      <Section id="clinical-uses" tone="surface" aria-labelledby="clinical-title">
        <Reveal>
          <SectionHeading id="clinical-title" title={c.clinical.title} split />
        </Reveal>
        <Reveal className="mt-12">
          <FeatureList items={c.clinical.items} columns={3} variant="cards" />
        </Reveal>
      </Section>

      {/* Final actions */}
      <CtaBand id="get-the-app" title={c.final.title} body={c.final.body} badges secondary={c.final.secondary} />
    </>
  );
}
