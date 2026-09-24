import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { StoreBadges } from '@/components/StoreBadges';
import { currentYear, siteConfig } from '@/config/site';
import { footerGroups } from '@/content/nav';

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-white" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">Site footer</h2>
      <div className="container-content py-12 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(3,1fr)] lg:gap-8">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-3 text-sm text-muted-foreground">DICOM Camera by {siteConfig.publisher}.</p>
            <p className="mt-2 text-sm text-muted-foreground">Clinical photographs and video, associated with patient and study information and sent to your PACS.</p>
            <StoreBadges size="md" className="mt-6" label="Download DICOM Camera from the stores" layout="row" />
          </div>
          {footerGroups.map((group) => (
            <nav key={group.title} aria-labelledby={`footer-${group.title.replace(/\s+/g, '-').toLowerCase()}`}>
              <h3 id={`footer-${group.title.replace(/\s+/g, '-').toLowerCase()}`} className="text-sm font-semibold uppercase tracking-wider text-ink">
                {group.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.label}>
                    {'to' in link ? (
                      <Link to={link.to} className="inline-flex min-h-8 items-center text-[0.95rem] text-muted-foreground no-underline hover:text-ink hover:underline">
                        {link.label}
                      </Link>
                    ) : (
                      <a href={link.href} className="inline-flex min-h-8 items-center text-[0.95rem] text-muted-foreground no-underline hover:text-ink hover:underline" rel="noopener">
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mt-10 grid gap-4 border-t border-line pt-8 text-sm text-muted-foreground sm:grid-cols-2">
          <ul className="space-y-1.5">
            <li>
              <a href={siteConfig.email.commercial.href} className="inline-flex min-h-8 items-center gap-2 no-underline hover:text-ink hover:underline">
                <Mail className="size-4" aria-hidden="true" /> Commercial enquiries: <span className="select-all text-ink">{siteConfig.email.commercial.address}</span>
              </a>
            </li>
            <li>
              <a href={siteConfig.email.support.href} className="inline-flex min-h-8 items-center gap-2 no-underline hover:text-ink hover:underline">
                <Mail className="size-4" aria-hidden="true" /> Support: <span className="select-all text-ink">{siteConfig.email.support.address}</span>
              </a>
            </li>
          </ul>
          <p className="sm:text-right">© {currentYear} {siteConfig.publisher}. All rights reserved.</p>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Apple and the App Store are trademarks of Apple Inc. Google Play and the Google Play logo are trademarks of Google LLC.
        </p>
      </div>
    </footer>
  );
}
