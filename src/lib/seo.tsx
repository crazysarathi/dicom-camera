import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { siteConfig } from '@/config/site';

export interface PageMeta {
  title: string;
  description: string;
  /** Route path with trailing slash, e.g. '/workflows/'. Use '/404.html' for the not-found page. */
  path: string;
  noindex?: boolean;
}

/** Client-side head updates on navigation. The prerender script injects the same values statically. */
export function useDocumentMeta(meta: PageMeta) {
  const { pathname } = useLocation();
  useEffect(() => {
    document.title = meta.title;
    const set = (selector: string, attr: string, value: string) => {
      const el = document.head.querySelector<HTMLElement>(selector);
      if (el) el.setAttribute(attr, value);
    };
    set('meta[name="description"]', 'content', meta.description);
    set('link[rel="canonical"]', 'href', canonicalFor(meta.path));
    set('meta[property="og:title"]', 'content', meta.title);
    set('meta[property="og:description"]', 'content', meta.description);
    set('meta[property="og:url"]', 'content', canonicalFor(meta.path));
  }, [meta.title, meta.description, meta.path, pathname]);
}

/** Hash-based routing: only the origin is a distinct crawlable URL; other pages are addressed as origin/#/path/. */
export function canonicalFor(path: string) {
  if (path === '/' || path === '') return `${siteConfig.origin}/`;
  if (path === '/404.html') return `${siteConfig.origin}/#/404/`;
  return `${siteConfig.origin}/#${path}`;
}

/** Static head markup for a route, used by scripts/prerender.mjs through entry-server. */
export function renderHead(meta: PageMeta): string {
  const url = canonicalFor(meta.path);
  const robots = siteConfig.indexable && !meta.noindex ? 'index,follow' : 'noindex,nofollow';
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${siteConfig.origin}/#organization`,
        name: siteConfig.publisher,
        url: siteConfig.origin,
        email: siteConfig.email.commercial.address,
      },
      {
        '@type': 'WebSite',
        '@id': `${siteConfig.origin}/#website`,
        url: siteConfig.origin,
        name: siteConfig.name,
        publisher: { '@id': `${siteConfig.origin}/#organization` },
      },
      {
        '@type': 'SoftwareApplication',
        name: siteConfig.name,
        applicationCategory: 'MedicalApplication',
        operatingSystem: 'iOS, iPadOS, Android',
        url: siteConfig.origin,
        image: `${siteConfig.origin}/icon-512.png`,
        description: siteConfig.defaultDescription,
        author: { '@id': `${siteConfig.origin}/#organization` },
        publisher: { '@id': `${siteConfig.origin}/#organization` },
        installUrl: [siteConfig.stores.appStore.url, siteConfig.stores.googlePlay.url],
      },
    ],
  };
  return [
    `<title>${esc(meta.title)}</title>`,
    `<meta name="description" content="${esc(meta.description)}" />`,
    `<meta name="robots" content="${robots}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${esc(siteConfig.name)}" />`,
    `<meta property="og:title" content="${esc(meta.title)}" />`,
    `<meta property="og:description" content="${esc(meta.description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${siteConfig.origin}${siteConfig.social.image}" />`,
    `<meta property="og:image:width" content="${siteConfig.social.imageWidth}" />`,
    `<meta property="og:image:height" content="${siteConfig.social.imageHeight}" />`,
    `<meta property="og:image:alt" content="DICOM Camera app icon and wordmark beside an iPhone showing body-part selection." />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(meta.title)}" />`,
    `<meta name="twitter:description" content="${esc(meta.description)}" />`,
    `<meta name="twitter:image" content="${siteConfig.origin}${siteConfig.social.image}" />`,
    meta.path === '/' ? `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>` : '',
  ].filter(Boolean).join('\n    ');
}
