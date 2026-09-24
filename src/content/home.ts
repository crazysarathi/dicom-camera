// Homepage copy (approved public copy, British spelling as written). Edit text here, not in components.
import type { LucideIcon } from 'lucide-react';
import { Bandage, Camera, ClipboardList, Images, ListChecks, Stethoscope, UserSearch, Users, Workflow } from 'lucide-react';
import { enterpriseManagerHref, routes } from '@/config/site';
import type { ScreenshotId } from '@/images/manifest';

export interface TextLink {
  label: string;
  to: string;
}

export interface TitledItem {
  title: string;
  body: string;
  icon?: LucideIcon;
}

export interface GalleryGroupContent {
  id: string;
  label: string;
  images: ScreenshotId[];
}

export const homeContent = {
  hero: {
    eyebrow: 'Clinical photography. Connected to PACS.',
    title: 'Your mobile device. A DICOM modality.',
    body: 'Capture clinical photographs and video at the point of care. Add patient and study information, annotate your images, and send them to your PACS with DICOM Camera.',
    secondary: { label: 'Explore enterprise workflows', to: routes.enterprise } as TextLink,
    supporting: 'For individual clinicians, clinical departments, and hospital imaging workflows.',
    image: 'iphone-06' as ScreenshotId,
    badgesLabel: 'Download DICOM Camera',
  },

  capabilities: {
    label: 'Enterprise capabilities',
    items: ['Modality Worklist (MWL)', 'HL7 and FHIR', 'DICOMweb', 'UPS and UPS-RS', 'Storage Commitment'],
  },

  capture: {
    title: 'Start with the patient. Or start with the image.',
    body: 'Choose the workflow that fits the moment, then review the patient and study details before sending.',
    items: [
      { title: 'Patient-first capture.', body: 'Select a worklist entry or add patient information, then capture photographs and video for the study.', icon: ClipboardList },
      { title: 'Quick Take.', body: 'Jump straight into capture and add demographics afterwards, before upload.', icon: Camera },
      { title: 'Import from Photo Album.', body: 'Bring already captured images into DICOM Camera, associate them with the patient and study, and send them to PACS.', icon: Images },
    ] as TitledItem[],
    link: { label: 'See how it works', to: routes.workflows } as TextLink,
    image: 'ipad-03' as ScreenshotId,
  },

  enterprise: {
    title: 'Part of the clinical workflow.',
    body: 'Connect point-of-care photography with the systems your organisation uses to identify patients and coordinate imaging work.',
    items: [
      { title: 'Worklist-driven capture.', body: 'Use DICOM Modality Worklist (MWL) to select scheduled work, with optional Modality Performed Procedure Step (MPPS) reporting.', icon: ListChecks },
      { title: 'Workflow status handling.', body: 'Work with Unified Procedure Step (UPS) and UPS-RS to exchange procedure status with connected systems.', icon: Workflow },
      { title: 'Patient demographic queries.', body: 'Retrieve patient demographics through HL7 and FHIR interfaces to support accurate patient association.', icon: UserSearch },
    ] as TitledItem[],
    link: { label: 'Explore hospital integration', to: routes.enterprise } as TextLink,
    /** Concise Enterprise Manager introduction (optional server for centralised licensing, configuration and policy control). */
    manager: {
      title: 'Central control for enterprise deployments.',
      body:
        'With DICOM Camera Enterprise Manager, your organisation can manage advanced-feature access, floating licences and app configuration from one place. Give each user a personal setup link or QR code, and keep key settings under administrative control.',
      link: { label: 'Explore Enterprise Manager', to: enterpriseManagerHref } as TextLink,
    },
  },

  annotations: {
    title: 'Keep clinical context with the images.',
    body: 'Add annotations and store them as DICOM Presentation States or Structured Reports, helping preserve image context for supported downstream systems.',
    supporting: "Display and interpretation depend on the receiving system's support for the relevant DICOM objects.",
  },

  storage: {
    title: 'Clinical captures stay in the app.',
    paragraphs: [
      'Images captured in DICOM Camera are stored within the application. They are added to the Photo Album only when you explicitly export them.',
      'Automatic deletion after successful send is enabled by default. For workflows that require confirmation from the archive, deletion can be gated by successful DICOM Storage Commitment.',
    ],
    link: { label: 'Understand storage and retention', to: routes.privacy } as TextLink,
  },

  fidelity: {
    title: 'Image quality, with control over delivery.',
    body: 'Choose lossy or lossless image compression to suit your workflow and the receiving system. Options include JPEG, JPEG-LS, JPEG 2000, HTJ2K, and JPEG XL, alongside uncompressed images.',
    ios: {
      // Explicitly iOS-labelled sub-block: the video/encoding statement stays inside it.
      label: 'Video on iOS',
      body: 'On iOS, capture H.264 video or H.265 on supported hardware. The captured encoded video stream is preserved when packaged into DICOM.',
    },
    supporting: 'Select formats supported by your PACS or archive. Codec and transfer-syntax support should be checked during integration.',
    link: { label: 'View connectivity and formats', to: routes.integration } as TextLink,
  },

  connectivity: {
    title: 'Connect through DICOMweb or traditional DICOM.',
    body: "Use full DICOMweb support, including QIDO-RS, WADO-RS, STOW-RS, and UPS-RS, alongside traditional DICOM DIMSE services. Choose the connection approach that fits your organisation's infrastructure.",
  },

  platforms: {
    title: 'Built for mobile clinical capture.',
    ios: {
      title: 'Native to iPhone and iPad.',
      body: "Architected from the ground up 100% in Swift, DICOM Camera for iOS takes advantage of Apple's hardware for responsive capture, image processing, and video. Camera controls adapt to the lenses and zoom options available on your device.",
    },
    android: {
      title: 'Available for Android.',
      body: 'Capture clinical images and connect them with your DICOM workflow using DICOM Camera for Android.',
    },
    galleryHeading: 'Screenshots',
    gallery: [
      { id: 'iphone', label: 'iPhone', images: ['iphone-06', 'iphone-01'] },
      { id: 'ipad', label: 'iPad', images: ['ipad-03', 'ipad-04'] },
      { id: 'android', label: 'Android', images: ['android-08', 'android-10'] },
    ] as GalleryGroupContent[],
  },

  clinical: {
    title: 'Bring clinical photography into the imaging record.',
    items: [
      { title: 'Dermatology and wound documentation.', body: 'Associate clinical photographs with the relevant patient and study for storage in the imaging archive.', icon: Bandage },
      { title: 'Procedures and bedside care.', body: 'Capture photographs or video at the point of care and connect them with the clinical workflow.', icon: Stethoscope },
      { title: 'Clinical departments and teams.', body: 'Use a consistent route from mobile capture to DICOM storage.', icon: Users },
    ] as TitledItem[],
  },

  final: {
    title: 'Put DICOM Camera to work.',
    body: 'Download the app for your device. For hospital workflows, talk to Raster about connectivity, patient information interfaces, and retention requirements.',
    secondary: { label: 'Discuss hospital deployment', to: routes.contact } as TextLink,
  },
} as const;
