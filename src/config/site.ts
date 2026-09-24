// Central configuration: destinations, contact routes, documents and switches.
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
    /** Same commercial route with the Enterprise Manager subject line (contact page with ?topic=enterprise-manager). */
    enterpriseManager: {
      address: 'info@raster.in',
      href: 'mailto:info@raster.in?subject=DICOM%20Camera%20Enterprise%20Manager%20enquiry',
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
  /** Optional server offering name and descriptor (recommended name from the September 2026 change package). */
  enterpriseManager: {
    name: 'DICOM Camera Enterprise Manager',
    shortName: 'Enterprise Manager',
    descriptor: 'Centralised licensing, configuration and policy control',
  },
} as const;

export const routes = {
  home: '/',
  workflows: '/workflows/',
  enterprise: '/enterprise/',
  integration: '/integration/',
  compression: '/compression/',
  conformance: '/conformance/',
  privacy: '/privacy-and-retention/',
  download: '/download/',
  support: '/support/',
  contact: '/contact/',
} as const;

/** Section anchor of the Enterprise Manager block on the Enterprise page. */
export const ENTERPRISE_MANAGER_ANCHOR = 'enterprise-manager';
export const enterpriseManagerHref = `${routes.enterprise}#${ENTERPRISE_MANAGER_ANCHOR}`;
/** Contact page query that pre-selects the Enterprise Manager enquiry route. */
export const ENTERPRISE_MANAGER_TOPIC = 'enterprise-manager';
export const enterpriseManagerContactHref = `${routes.contact}?topic=${ENTERPRISE_MANAGER_TOPIC}`;

/**
 * Published documents. The conformance statement is generated from documents-source/ by
 * scripts/build-documents.mjs (HTML edition for the /conformance/ route; PDF as a static file).
 * `productVersion` is intentionally absent until the owner supplies release scope: nothing renders it.
 */
export const documents = {
  conformance: {
    documentId: 'DCAM-DCS-001',
    revision: 'Draft 0.1',
    date: '24 September 2026',
    dateIso: '2026-09-24',
    /** Visible status label. Shown near every link to the document and inside the document itself. */
    status: 'Draft - implementation review pending',
    statusKind: 'draft' as 'draft' | 'issued',
    standardEdition: 'DICOM 2026d',
    structure: 'DICOM PS3.2 Annex N (Supplement 209 template)',
    htmlRoute: routes.conformance,
    pdfUrl: '/documents/DICOM-Camera-DICOM-Conformance-Statement-Draft-0.1.pdf',
    pdfFilename: 'DICOM-Camera-DICOM-Conformance-Statement-Draft-0.1.pdf',
    downloadLabel: 'Download draft conformance statement (PDF)',
    /** Search-engine exclusion while the document is a draft (route metadata; the PDF path gets a header, see DEPLOYMENT.md). */
    noindex: true,
  },
  compressionCsv: {
    url: '/documents/compression-comparison.csv',
    filename: 'compression-comparison.csv',
    label: 'Download the comparison as CSV',
  },
} as const;

export const currentYear = new Date().getFullYear();
