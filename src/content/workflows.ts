// How it works (/workflows/) — approved public copy. Edit wording here, not in the page component.
import { routes } from '@/config/site';
import type { ScreenshotId } from '@/images/manifest';
import type { WorkflowPathId } from '@/components/WorkflowDiagram';

export interface WorkflowSection {
  id: string;
  title: string;
  body: string;
  /** Diagram path illustrated beside this section, if any. */
  path?: WorkflowPathId;
  /** Genuine store screenshot shown beside this section, if any. */
  image?: ScreenshotId;
}

export const workflowsContent = {
  hero: {
    eyebrow: 'How it works',
    title: 'From clinical capture to the imaging archive.',
    lede:
      'Start from a patient, a worklist, or the moment you need to capture. DICOM Camera brings images and patient information together for review and upload to PACS.',
  },
  entryPoints: [
    {
      id: 'patient-first',
      title: 'Begin with a patient or worklist',
      body:
        'Select the scheduled work from Modality Worklist, query patient demographics through a configured interface, or enter patient information. Capture the images for the study, add annotations where needed, then review and send.',
      path: 'patient-first',
      image: 'iphone-06',
    },
    {
      id: 'quick-take',
      title: 'Quick Take: capture now, add demographics next',
      body: 'Open Quick Take to begin capturing immediately. Add the patient and study information afterwards, then review the association before sending.',
      path: 'quick-take',
      image: 'ipad-03',
    },
    {
      id: 'photo-album',
      title: 'Bring in existing images',
      body:
        'Import images already available in the Photo Album. Associate them with the correct patient and study, review the selection, and upload through your configured DICOM connection.',
      path: 'photo-album',
    },
  ] satisfies WorkflowSection[],
  annotations: {
    id: 'annotations',
    title: 'Add annotations that travel with the study',
    body:
      'Store annotations as DICOM Presentation States or Structured Reports. These objects carry annotation information for receiving systems that support them; presentation may vary between viewers.',
  },
  // The only iOS-labelled content on this page. Lens, zoom, sequential, direct JPEG and video-codec detail stays here.
  ios: {
    id: 'iphone-ipad',
    eyebrow: 'iPhone and iPad',
    title: 'Capture on iPhone and iPad',
    body:
      "Use native camera controls that adapt to your device's available lenses and zoom options. The iOS capture workflow supports sequential photography, configurable direct JPEG capture, and relevant acquisition metadata. Video uses H.264, with H.265 available on supported hardware.",
  },
  review: {
    id: 'review-and-send',
    title: 'Review the connection and retention workflow',
    body:
      'Review patient association and the selected media before sending. Images captured in the app remain within it unless explicitly exported. Automatic deletion is enabled by default after successful send and can be gated by successful Storage Commitment.',
    links: [
      { label: 'Storage and retention', to: routes.privacy },
      { label: 'Integration details', to: routes.integration },
    ],
  },
  // Closing action. Title and body reuse the approved Download page opening so the band carries no new copy.
  cta: {
    id: 'get-the-app',
    title: 'Get DICOM Camera.',
    body: 'Choose the app for your device. Visit the store for current availability, device requirements, and purchase information.',
    secondary: { label: 'Get the app', to: routes.download },
  },
} as const;
