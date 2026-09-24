// Integration page copy (approved public copy, used verbatim).
import { routes } from '@/config/site';

export interface CapabilityRow {
  term: string;
  description: string;
}

export const integrationHero = {
  eyebrow: 'Integration',
  title: 'Integration details for imaging teams.',
  lede:
    'Connect mobile capture with your clinical systems using standard interfaces. Review the services and formats required by your workflow with Raster and your receiving-system team.',
  primary: { label: 'Request integration information', to: routes.contact },
  secondary: { label: 'Explore enterprise workflows', to: routes.enterprise },
} as const;

export const connectivitySection = {
  id: 'connectivity',
  title: 'Connectivity and workflow',
  columns: ['Capability', 'Role in the workflow'] as [string, string],
  rows: [
    { term: 'Traditional DICOM DIMSE', description: 'Connect with DICOM services used by PACS and imaging infrastructure.' },
    { term: 'QIDO-RS', description: 'Query DICOM studies, series, and instances through DICOMweb.' },
    { term: 'WADO-RS', description: 'Retrieve DICOM information and objects through DICOMweb.' },
    { term: 'STOW-RS', description: 'Store DICOM objects through DICOMweb.' },
    { term: 'Modality Worklist (MWL)', description: 'Select scheduled work for capture.' },
    { term: 'Optional MPPS', description: 'Report performed procedure step information where configured.' },
    { term: 'UPS / UPS-RS', description: 'Handle procedure workflow status through DICOM and DICOMweb interfaces.' },
    { term: 'HL7 and FHIR', description: 'Query patient demographics through configured hospital interfaces.' },
    { term: 'DICOM Storage Commitment', description: 'Gate local deletion on successful archive commitment when enabled.' },
  ] satisfies CapabilityRow[],
} as const;

export const compressionSection = {
  id: 'compression',
  title: 'Image compression',
  lede: 'Choose an encoding supported by the destination and appropriate to the workflow.',
  columns: ['Format family', 'Available compression modes'] as [string, string],
  rows: [
    { term: 'Uncompressed', description: 'Uncompressed image transfer.' },
    { term: 'DICOM RLE', description: 'Lossless.' },
    { term: 'JPEG', description: 'Lossy and lossless variants.' },
    { term: 'JPEG-LS', description: 'Lossless and near-lossless.' },
    { term: 'JPEG 2000', description: 'Lossless and lossy.' },
    { term: 'HTJ2K', description: 'Lossless and lossy.' },
    { term: 'JPEG XL', description: 'Lossless and lossy.' },
  ] satisfies CapabilityRow[],
  disclaimer:
    'This overview is not a formal DICOM Conformance Statement. Exact transfer syntaxes and receiving-system compatibility should be confirmed for the app version and deployment configuration. A compression option being available in DICOM Camera does not mean every archive accepts it.',
} as const;

export const videoSection = {
  id: 'video-ios',
  platformLabel: 'iOS',
  title: 'Video on iOS',
  body:
    "Capture H.264 video, or H.265 on supported hardware. The encoded capture stream is preserved during DICOM packaging. Confirm the receiving system's support for the selected video format before deployment.",
} as const;

export const annotationsSection = {
  id: 'annotations',
  title: 'Annotations',
  body:
    'Annotations are stored as DICOM Presentation States or Structured Reports. Confirm support for storing and displaying the relevant objects in the archive and viewer.',
} as const;

export const storageCommitmentSection = {
  id: 'storage-commitment',
  title: 'Storage Commitment',
  body:
    'Successful transfer and successful Storage Commitment are distinct. When commitment gating is enabled, local deletion waits for a positive commitment result covering the relevant objects. A pending or failed commitment does not authorise deletion.',
  link: { label: 'Understand storage and retention', to: routes.privacy },
} as const;

export const discussSection = {
  id: 'discuss',
  title: 'Discuss your integration',
  body:
    'Tell us about your PACS/archive, required interfaces, devices, and capture workflow. Raster can help clarify the information needed to assess the intended configuration.',
  action: { label: 'Request integration information', to: routes.contact },
} as const;

/** In-page contents shown in the hero aside; labels are the section headings. */
export const integrationContents = [
  { label: connectivitySection.title, id: connectivitySection.id },
  { label: compressionSection.title, id: compressionSection.id },
  { label: videoSection.title, id: videoSection.id },
  { label: annotationsSection.title, id: annotationsSection.id },
  { label: storageCommitmentSection.title, id: storageCommitmentSection.id },
] as const;
