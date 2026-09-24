// Approved copy for /support/ (WEBSITE-COPY.md §7). Edit text here, not in the page component.
import { routes, siteConfig } from '@/config/site';

export interface FaqItem {
  question: string;
  answer: string;
}

export const supportContent = {
  eyebrow: 'Support',
  title: 'Help with DICOM Camera.',
  intro: 'Find answers to common workflow questions, or contact Raster for help with the app and integration.',
  primaryAction: {
    label: 'Email support',
    email: siteConfig.email.support,
    note: 'Opens your email application.',
  },
  faq: {
    id: 'faq',
    title: 'Frequently asked questions',
    items: [
      {
        question: 'What does DICOM Camera do?',
        answer:
          'It turns mobile clinical capture into a DICOM workflow: capture photographs and video, associate patient and study information, add annotations, and send to PACS or a DICOM archive.',
      },
      {
        question: 'Can I capture before entering patient details?',
        answer:
          'Yes. Quick Take lets you begin capturing immediately and add demographics afterwards. Review the patient and study association before sending.',
      },
      {
        question: 'Can I upload images already in my Photo Album?',
        answer: 'Yes. Import existing images, associate them with the patient and study, and upload through the configured connection.',
      },
      {
        question: 'Are images captured in the app saved to my Photo Album?',
        answer: 'They stay within the application unless you explicitly export them to the Photo Album.',
      },
      {
        question: 'When are local images deleted?',
        answer:
          'Automatic deletion is enabled by default after successful send. If Storage Commitment gating is enabled, deletion waits for successful commitment. Failed sends and pending or failed commitments do not trigger deletion.',
      },
      {
        question: 'Does DICOM Camera support worklists and patient queries?',
        answer:
          'It supports Modality Worklist with optional MPPS, UPS/UPS-RS status handling, and HL7/FHIR queries for patient demographics. The relevant hospital interfaces must be configured for the intended workflow.',
      },
      {
        question: 'Does it use DICOMweb or traditional DICOM?',
        answer: 'It supports both, including QIDO-RS, WADO-RS, STOW-RS, and UPS-RS through DICOMweb, alongside traditional DIMSE.',
      },
      {
        question: 'Will every compression format work with my PACS?',
        answer:
          'Compatibility depends on the receiving system. Confirm supported transfer syntaxes and object types, then choose an appropriate format for the deployment.',
      },
      {
        question: 'How are annotations stored?',
        answer:
          'As DICOM Presentation States or Structured Reports. The receiving viewer needs support for the relevant objects to display or interpret them.',
      },
      {
        question: 'Where can I check pricing and device requirements?',
        answer:
          'Use the App Store or Google Play listing for current information. Contact Raster for hospital and commercial deployment enquiries.',
      },
    ] satisfies FaqItem[],
  },
  beforeContacting: {
    id: 'before-contacting-support',
    title: 'Before contacting support',
    body:
      'Include the app platform and version, device and operating system, a brief description of the issue, and any relevant error message. For connectivity problems, describe the connection type and receiving system without sharing credentials.',
    caution: 'Please do not include patient information, patient images, passwords, or access tokens in your message.',
  },
  secondaryAction: {
    label: 'Hospital and commercial enquiries',
    to: routes.contact,
  },
} as const;
