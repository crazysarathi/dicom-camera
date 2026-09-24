// Integration page copy (approved public copy, used verbatim).
import { documents, routes } from '@/config/site';

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
  intro:
    'Compression affects image fidelity, file size, processing and compatibility. Lossless encoding reconstructs the pixel values presented to the encoder exactly; near-lossless allows a controlled amount of pixel-value error and remains a form of lossy compression; lossy encoding trades some image information for smaller files. Uncompressed transfer is also available.',
  columns: ['Format family', 'Available compression modes'] as [string, string],
  // Lossy JPEG and the separate lossless JPEG process are different encodings and are listed separately.
  rows: [
    { term: 'Uncompressed', description: 'Uncompressed image transfer.' },
    { term: 'DICOM RLE', description: 'Lossless.' },
    { term: 'JPEG, lossy', description: 'Lossy (adjustable quality/size tradeoff).' },
    { term: 'JPEG, lossless', description: 'Lossless, through the separate lossless JPEG process.' },
    { term: 'JPEG-LS', description: 'Lossless and near-lossless.' },
    { term: 'JPEG 2000', description: 'Lossless and lossy.' },
    { term: 'HTJ2K', description: 'Lossless and lossy.' },
    { term: 'JPEG XL', description: 'Lossless and lossy.' },
  ] satisfies CapabilityRow[],
  guide: {
    title: 'Compare compression options.',
    body: 'Understand the differences between lossless, near-lossless and lossy formats, and the tradeoffs in file size, processing and compatibility.',
    action: { label: 'Read the compression guide', to: routes.compression },
  },
  /**
   * Distinguishes the educational comparison from the release-specific conformance document. Keeps the
   * receiving-system warnings from the earlier disclaimer.
   */
  disclaimer:
    'This overview and the compression guide are educational comparisons of encoding families, not a conformance matrix. Release-specific declarations of exact transfer syntaxes belong to the DICOM conformance statement, which is currently a draft under implementation review. Exact transfer syntaxes and receiving-system compatibility should be confirmed for the app version and deployment configuration. A compression option being available in DICOM Camera does not mean every archive accepts it.',
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

/** Conformance document card. Draft copy: replace with the exact release/platform scope and issue date once a final document is supplied. */
export const conformanceSection = {
  id: 'conformance',
  title: 'DICOM conformance',
  body:
    "Review the draft statement covering DICOM Camera's described workflows, connectivity and configuration. Implementation details and release-specific declarations are being completed.",
  document: documents.conformance,
  read: { label: 'Read the draft', to: routes.conformance },
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
  { label: conformanceSection.title, id: conformanceSection.id },
] as const;
