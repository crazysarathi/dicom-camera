// Enterprise page copy (approved public copy, used verbatim).
import type { LucideIcon } from 'lucide-react';
import { ClipboardList, Workflow, UserSearch, Network, Archive } from 'lucide-react';
import { routes } from '@/config/site';

export interface EnterpriseSection {
  id: string;
  title: string;
  body: string;
  icon: LucideIcon;
}

export const enterpriseHero = {
  eyebrow: 'Enterprise',
  title: 'Point-of-care capture, connected to hospital workflows.',
  lede:
    'Give clinical teams a mobile route into the imaging archive, with patient information queries, scheduled work, procedure status handling, and configurable retention.',
  primary: { label: 'Discuss hospital deployment', to: routes.contact },
  secondary: { label: 'Review integration details', to: routes.integration },
} as const;

/** The three hospital-interface sections, presented together. */
export const enterpriseInterfaces: EnterpriseSection[] = [
  {
    id: 'scheduled-work',
    title: 'Start from scheduled work',
    body:
      "Use DICOM Modality Worklist (MWL) to bring scheduled work into the capture workflow. Optional Modality Performed Procedure Step (MPPS) reporting supports procedure progress information where the hospital's systems use it.",
    icon: ClipboardList,
  },
  {
    id: 'procedure-status',
    title: 'Coordinate procedure status',
    body:
      'Support workflow status handling through Unified Procedure Step (UPS) and its DICOMweb interface, UPS-RS. Discuss the required interactions and status transitions with the systems responsible for managing your workflow.',
    icon: Workflow,
  },
  {
    id: 'patient-demographics',
    title: 'Query patient demographics',
    body:
      "Use HL7 and FHIR interfaces to query patient demographics and support patient association at capture. Interface configuration depends on the organisation's patient information services.",
    icon: UserSearch,
  },
];

export const enterpriseInfrastructure: EnterpriseSection = {
  id: 'imaging-infrastructure',
  title: 'Connect to your imaging infrastructure',
  body:
    'DICOM Camera supports DICOMweb and traditional DIMSE connections for integration with PACS and DICOM archives. Review supported services, object types, compression formats, and network access with your imaging IT team.',
  icon: Network,
};

export const enterpriseRetention: EnterpriseSection = {
  id: 'retention',
  title: 'Align local retention with archive confirmation',
  body:
    'Captures remain in the app unless explicitly exported to the Photo Album. Automatic deletion after successful send is enabled by default; a Storage Commitment gate can delay deletion until the archive confirms commitment for the relevant objects.',
  icon: Archive,
};

export const enterpriseDiscussion = {
  id: 'deployment-discussion',
  title: 'Plan a deployment discussion',
  lede: 'Bring the following topics to an initial conversation:',
  topics: [
    'Clinical departments and capture workflows.',
    'PACS/archive and available DIMSE or DICOMweb services.',
    'Worklist, procedure status, and patient demographic interfaces.',
    'Receiving-system support for image/video formats and annotations.',
    'Retention requirements and Storage Commitment availability.',
    'Devices, app platforms, and commercial deployment requirements.',
  ],
  note: 'Please do not include patient information in your enquiry.',
  action: { label: 'Contact Raster', to: routes.contact },
} as const;

/** Cross-links to related detail pages (labels are approved link text). */
export const enterpriseLinks = {
  integration: { label: 'View connectivity and formats', to: routes.integration },
  retention: { label: 'Understand storage and retention', to: routes.privacy },
} as const;
