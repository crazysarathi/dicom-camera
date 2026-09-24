// Approved copy for /download/ (WEBSITE-COPY.md §6). Store destinations come from siteConfig only.
import type { ScreenshotId } from '@/images/manifest';
import { routes, siteConfig } from '@/config/site';

export interface PlatformPanel {
  id: string;
  title: string;
  body: string;
  store: keyof typeof siteConfig.stores;
  /**
   * Rendered badge box height in px. The App Store SVG has no built-in padding; the Google Play PNG
   * carries its own clear space, so its box is taller to give an equal or larger visible badge.
   */
  badgeHeight: number;
  /** Intrinsic artwork ratio (width / height) so width/height attributes avoid layout shift. */
  badgeRatio: number;
  screenshot: ScreenshotId;
  /** Platform app icon shown beside the heading (decorative: the heading already names the platform). */
  icon: { src: string; size: number };
}

export const downloadContent = {
  hero: {
    eyebrow: 'Get the app',
    title: 'Get DICOM Camera.',
    lede: 'Choose the app for your device. Visit the store for current availability, device requirements, and purchase information.',
    badgesLabel: 'Download DICOM Camera',
  },
  platforms: [
    {
      id: 'ios',
      title: 'iPhone and iPad',
      body: "Architected from the ground up 100% in Swift to take advantage of Apple's hardware.",
      store: 'appStore',
      badgeHeight: 52,
      badgeRatio: 119.66 / 40,
      screenshot: 'iphone-06',
      icon: { src: '/images/app-icon-128.png', size: 64 },
    },
    {
      id: 'android',
      title: 'Android',
      body: 'Mobile clinical capture for your DICOM workflow.',
      store: 'googlePlay',
      badgeHeight: 78,
      badgeRatio: 646 / 250,
      screenshot: 'android-08',
      icon: { src: '/images/android-app-icon-128.png', size: 64 },
    },
  ] satisfies PlatformPanel[],
  support: { label: 'Need help with the app?', to: routes.support },
  deployment: {
    title: 'Deploying across a hospital or department?',
    body: 'Talk to Raster about your capture workflow, PACS connectivity, patient information interfaces, and commercial requirements.',
    action: { label: 'Discuss hospital deployment', to: routes.contact },
  },
} as const;
