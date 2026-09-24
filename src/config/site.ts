// Central configuration: destinations, contact routes and switches.
// Edit here rather than in components. See CONTENT-EDITING.md.

const env = (import.meta as ImportMeta & { env: Record<string, string | undefined> }).env ?? {};

export const siteConfig = {
  name: 'DICOM Camera',
  publisher: 'Raster Images',
  publisherShort: 'Raster',
  origin: (env.VITE_SITE_ORIGIN || 'https://dicom.camera').replace(/\/$/, ''),
  indexable: env.VITE_INDEXABLE === 'true',
  contactFormEndpoint: env.VITE_CONTACT_FORM_ENDPOINT || '',
  defaultTitle: 'DICOM Camera | Clinical Photos and Video for PACS',
  defaultDescription:
    'Capture clinical photos and videos, add annotations, and connect with PACS using DICOM Camera for iOS and Android. Explore enterprise workflows and downloads.',
  stores: {
    appStore: {
      url: 'https://apps.apple.com/in/app/dicom-camera/id6459410698',
      label: 'Download DICOM Camera on the App Store',
      badge: '/badges/download-on-the-app-store.svg',
    },
    googlePlay: {
      url: 'https://play.google.com/store/apps/details?id=com.raster.dicomcamera',
      label: 'Get DICOM Camera on Google Play',
      badge: '/badges/get-it-on-google-play.png',
    },
  },
  email: {
    commercial: {
      address: 'info@raster.in',
      href: 'mailto:info@raster.in?subject=DICOM%20Camera%20hospital%20enquiry',
    },
    support: {
      address: 'support@raster.in',
      href: 'mailto:support@raster.in?subject=DICOM%20Camera%20support',
    },
  },
  // Legal destinations are owner-published reference pages; their scope for dicom.camera
  // is an external launch input (see VERIFICATION-REPORT.md). Update here once confirmed.
  legal: {
    privacy: { label: 'Privacy policy', href: 'https://www.raster.in/dc-privacy-policy.php' },
    terms: { label: 'Terms and conditions', href: 'https://www.raster.in/terms-and-conditions.php' },
  },
  social: { image: '/social-card.jpg', imageWidth: 1200, imageHeight: 630 },
  motion: {
    // GSAP ScrollSmoother on wide pointer devices only; always off with reduced motion.
    scrollSmoother: true,
    smooth: 0.9,
  },
} as const;

export const routes = {
  home: '/',
  workflows: '/workflows/',
  enterprise: '/enterprise/',
  integration: '/integration/',
  privacy: '/privacy-and-retention/',
  download: '/download/',
  support: '/support/',
  contact: '/contact/',
} as const;

export const currentYear = new Date().getFullYear();
