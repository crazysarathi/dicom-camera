// Enterprise page copy (approved public copy, used verbatim).
import type { LucideIcon } from 'lucide-react';
import { ClipboardList, Workflow, UserSearch, Network, Archive, KeyRound, QrCode, LockKeyhole } from 'lucide-react';
import { ENTERPRISE_MANAGER_ANCHOR, enterpriseManagerContactHref, routes, siteConfig } from '@/config/site';

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

/**
 * DICOM Camera Enterprise Manager: the optional server for centralised licensing, configuration and
 * policy control (a commercial deployment option, not a separate app). Copy from the September 2026
 * change package, used verbatim. Nothing here describes console screens, deployment models, offline
 * licence rules, revocation timing, remote image erasure or backend behaviour.
 */
export const enterpriseManager = {
  id: ENTERPRISE_MANAGER_ANCHOR,
  eyebrow: siteConfig.enterpriseManager.name,
  title: 'Equip your team. Keep control of the deployment.',
  lede: 'Centralised licensing, configuration and policy control for enterprise deployments of DICOM Camera.',
  intro:
    "Enable advanced features through your organisation, configure each user's app with a personal link or QR code, and lock the settings your team needs to use consistently.",
  /** First-use explanation, rendered once with the eyebrow. */
  definition: 'DICOM Camera Enterprise Manager is the optional server for centralised licensing, configuration and policy control.',
  capabilities: [
    {
      id: 'manage-access',
      title: 'Manage access centrally',
      body:
        'Unlock advanced features for your enterprise deployment without requiring each user to make an individual in-app purchase. Manage floating licences from a shared pool and revoke licences centrally when access needs change.',
      icon: KeyRound,
    },
    {
      id: 'one-step-setup',
      title: 'Set up the app in one step',
      body:
        'Provide each user with a unique enrolment URL or QR code. Opening the link or scanning the code applies the assigned DICOM Camera configuration, including settings such as the AE Title and archive server address.',
      icon: QrCode,
    },
    {
      id: 'consistent-settings',
      title: 'Keep essential settings consistent',
      body:
        "Apply organisation-controlled settings and prevent users from changing locked values. Manage connection settings, compression choices, Photo Album export restrictions and automatic image-deletion policy to match the deployment's requirements.",
      icon: LockKeyhole,
    },
  ] satisfies EnterpriseSection[],
  controls: {
    id: 'enterprise-manager-controls',
    title: 'What your organisation can manage',
    columns: ['Area', 'Enterprise control'] as [string, string],
    rows: [
      { term: 'Advanced features', description: 'Enable managed feature entitlements centrally.' },
      { term: 'Floating licences', description: 'Allocate access from a shared licence pool.' },
      { term: 'Revocation', description: 'Revoke licences through central administration.' },
      { term: 'User setup', description: 'Provide an enrolment link or QR code unique to the user.' },
      { term: 'DICOM configuration', description: 'Apply settings such as AE Title and archive server address.' },
      { term: 'Compression', description: 'Set and lock the supported compression choice for the workflow.' },
      { term: 'Photo Album export', description: "Restrict the app's export of captures to the Photo Album." },
      { term: 'Image retention', description: 'Set and lock automatic-deletion options, including the Storage Commitment gate where configured.' },
    ],
  },
  workflow: {
    id: 'enterprise-manager-workflow',
    title: 'From administration to capture',
    steps: [
      'Assign feature access and app settings.',
      "Share the user's personal enrolment link or QR code.",
      'Apply the configuration in DICOM Camera.',
      "Capture using the organisation's managed settings.",
    ],
    supporting: 'Enterprise Manager controls access and configuration. DICOM Camera sends images to the configured PACS or archive.',
  },
  plan: {
    id: 'enterprise-manager-plan',
    title: 'Plan your managed deployment',
    body: 'Talk to Raster about your clinical teams, licence requirements, integration settings and retention policies.',
    action: { label: 'Discuss Enterprise Manager', to: enterpriseManagerContactHref },
  },
} as const;

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
