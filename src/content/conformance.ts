// DICOM conformance landing page (/conformance/). The document body is generated from
// documents-source/DICOM-CONFORMANCE-DRAFT.md by scripts/build-documents.mjs; the metadata below comes
// from src/config/site.ts and is validated against the Markdown header by that script.
import { documents, routes } from '@/config/site';

export const conformanceDocument = documents.conformance;

export const conformanceContent = {
  meta: {
    title: 'Draft DICOM Conformance Statement | DICOM Camera',
    description:
      'Draft DICOM conformance statement for DICOM Camera, organised on the PS3.2 Annex N template: scope, services, configuration and the release-specific details still to be completed.',
  },
  hero: {
    eyebrow: 'DICOM conformance',
    title: 'DICOM conformance statement.',
    intro:
      'This draft is organised using the current DICOM PS3.2 Annex N template developed through Supplement 209. It records the described product capabilities and identifies the release-specific implementation details still to be completed.',
    caveat:
      'It is not an issued declaration for a tested app release. Exact SOP Classes, transfer syntaxes, roles, protocol limits and security details require implementation verification.',
    secondary: { label: 'Request integration information', to: routes.contact },
  },
  /** Labels for the document identity block (values come from documents.conformance). */
  identity: {
    document: 'Document',
    revision: 'Revision',
    date: 'Date',
    edition: 'Reference edition',
    status: 'Status',
  },
  contents: { title: 'On this page', label: 'Document sections' },
  document: {
    /** Visible label on the rendered document; not an app screen or console. */
    title: 'DICOM Camera DICOM Conformance Statement',
    tableCaptionPrefix: 'Table in section',
    printNote: 'Printed from the website edition. The PDF edition carries the same revision, date and status.',
  },
  related: {
    title: 'Related reading',
    links: [
      { label: 'Compression guide', to: routes.compression },
      { label: 'Integration details', to: routes.integration },
      { label: 'Storage and retention', to: routes.privacy },
    ],
  },
} as const;
