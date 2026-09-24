import { routes, siteConfig } from '@/config/site';

export const headerNav = [
  { label: 'How it works', to: routes.workflows },
  { label: 'Enterprise', to: routes.enterprise },
  { label: 'Integration', to: routes.integration },
  { label: 'Support', to: routes.support },
] as const;

export const headerCta = { label: 'Get the app', to: routes.download } as const;

/** Short page names for breadcrumbs and cross-references. */
export const pageLabels: Record<string, string> = {
  [routes.home]: 'Home',
  [routes.workflows]: 'How it works',
  [routes.enterprise]: 'Enterprise',
  [routes.integration]: 'Integration',
  [routes.privacy]: 'Storage and retention',
  [routes.download]: 'Download',
  [routes.support]: 'Support',
  [routes.contact]: 'Contact Raster',
};

export const footerGroups = [
  {
    title: 'Product',
    links: [
      { label: 'How it works', to: routes.workflows },
      { label: 'Download', to: routes.download },
      { label: 'App Store', href: siteConfig.stores.appStore.url, external: true },
      { label: 'Google Play', href: siteConfig.stores.googlePlay.url, external: true },
    ],
  },
  {
    title: 'For organisations',
    links: [
      { label: 'Enterprise', to: routes.enterprise },
      { label: 'Integration', to: routes.integration },
      { label: 'Storage and retention', to: routes.privacy },
      { label: 'Contact Raster', to: routes.contact },
    ],
  },
  {
    title: 'Help and policies',
    links: [
      { label: 'Support', to: routes.support },
      { label: siteConfig.legal.privacy.label, href: siteConfig.legal.privacy.href, external: true },
      { label: siteConfig.legal.terms.label, href: siteConfig.legal.terms.href, external: true },
    ],
  },
] as const;

export const a11yLabels = {
  openNav: 'Open navigation',
  closeNav: 'Close navigation',
  copyEmail: 'Copy email address',
  emailCopied: 'Email address copied',
  viewLarger: 'View larger screenshot',
  closePreview: 'Close image preview',
  skip: 'Skip to content',
} as const;
