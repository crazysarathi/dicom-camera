// Image compression guide (/compression/): plain-language definitions, the qualitative comparison and
// selection guidance from the September 2026 change package, used verbatim. The table rows are generated
// from documents-source/compression-comparison.csv (see scripts/build-documents.mjs); the CSV is also the
// downloadable file. Nothing here states measured DICOM Camera benchmarks, percentages or rankings.
import { documents, enterpriseManagerHref, routes } from '@/config/site';
import { compressionRows, type CompressionMode, type CompressionRow } from '@/content/generated/compression-rows';

export type { CompressionMode, CompressionRow };
export { compressionRows };

export const compressionModes: readonly { value: CompressionMode; label: string }[] = [
  { value: 'lossless', label: 'Lossless' },
  { value: 'near-lossless', label: 'Near-lossless' },
  { value: 'lossy', label: 'Lossy' },
];

export const compressionContent = {
  meta: {
    title: 'Image Compression Guide | DICOM Camera',
    description:
      'Compare lossy, lossless and near-lossless image compression for DICOM workflows, including JPEG, JPEG-LS, JPEG 2000, HTJ2K and JPEG XL.',
  },
  hero: {
    eyebrow: 'Compression guide',
    title: 'Choose compression to fit your imaging workflow.',
    lede:
      'Compression affects image fidelity, file size, processing and compatibility. DICOM Camera offers a range of formats so your organisation can choose an encoding that fits its workflow and is supported by the receiving archive.',
  },
  approaches: {
    id: 'approaches',
    title: 'Understand the three approaches',
    items: [
      {
        mode: 'lossless' as CompressionMode,
        term: 'Lossless.',
        body:
          'Reconstructs the pixel values presented to the encoder exactly. It reduces file size without adding compression loss at that step. It does not undo changes already introduced by camera processing, colour conversion or an earlier lossy encoding.',
      },
      {
        mode: 'near-lossless' as CompressionMode,
        term: 'Near-lossless.',
        body:
          'Allows a controlled amount of pixel-value error. JPEG-LS provides this option as well as a separate lossless mode. Near-lossless remains a form of lossy compression, even when differences are difficult to see.',
      },
      {
        mode: 'lossy' as CompressionMode,
        term: 'Lossy.',
        body:
          'Trades some image information for smaller files. Results depend on the encoder settings and source content. Your organisation should determine whether a particular setting is appropriate for the intended use; DICOM does not prescribe a universally acceptable clinical compression ratio.',
      },
    ],
    uncompressed: 'Uncompressed transfer is also available. It avoids a further compression stage but generally requires more storage and network bandwidth.',
  },
  comparison: {
    id: 'compare',
    title: 'Compare image formats',
    caption:
      'Qualitative comparison of image-encoding families. These are format characteristics, not measured DICOM Camera benchmarks or a guarantee of PACS compatibility.',
    columns: { format: 'Format', modes: 'Modes', advantages: 'Advantages', tradeoffs: 'Tradeoffs', consideration: 'Selection consideration' },
    filter: {
      legend: 'Show formats',
      all: 'All modes',
      /** Announced when a filter is active: "{n} of {total} formats shown". */
      status: (shown: number, total: number) => `${shown} of ${total} formats shown`,
      note: 'Families that offer several modes stay listed in every applicable view.',
    },
    csv: documents.compressionCsv,
    footnote:
      'All formats depend on suitable receiving-system support. JPEG-LS lossless and near-lossless are different modes; JPEG lossless and ordinary JPEG are different processes. Some DICOM transfer syntaxes permit more than one encoding mode, so the actual encoded object also matters.',
  },
  choose: {
    id: 'choose',
    title: 'Choose by requirement',
    items: [
      {
        term: 'Preserving input pixel values:',
        body: 'choose a validated lossless path or uncompressed transfer. Check the acquisition and any prior conversion as well as the final compression setting.',
      },
      {
        term: 'Reducing transfer size:',
        body: 'compare actual files with representative images. Use lossy or near-lossless only when the organisation has accepted the resulting fidelity for the intended workflow.',
      },
      {
        term: 'Reducing processing time:',
        body: "measure the available choices on the intended devices. A format's design goal is not a performance result for a particular app or phone.",
      },
      {
        term: 'Matching an existing PACS:',
        body: "begin with the archive's declared SOP Class and transfer-syntax support, then validate storage and viewing of representative objects.",
      },
      {
        term: 'Standardising a department:',
        body: 'use Enterprise Manager to apply the chosen compression setting and lock it where required.',
        link: { label: 'Enterprise Manager', to: enterpriseManagerHref },
      },
    ],
  },
  history: {
    id: 'lossy-history',
    title: 'Lossless encoding does not undo an earlier lossy image',
    body:
      'An imported JPEG may already contain irreversible compression changes. Converting it to a lossless DICOM encoding preserves the decoded pixels from that JPEG; it does not recreate the original camera data. The source image, colour handling and encoding history all matter.',
  },
  // The only iOS-labelled content on this page: the video statement stays inside it.
  video: {
    id: 'video-ios',
    platformLabel: 'iOS',
    title: 'Video on iOS',
    body:
      "DICOM Camera for iOS supports H.264 video and H.265 on supported hardware. The captured encoded stream is preserved when packaged into DICOM. Confirm the receiving system's support for the exact DICOM video transfer syntax and profile. These are separate from the still-image formats in the comparison above.",
  },
  confirm: {
    id: 'confirm-connection',
    title: 'Confirm the complete connection',
    body:
      'Choose a format supported by your app version, configuration, PACS and viewing software. A DICOM standard defining a format does not mean that every archive or browser can display it.',
    primary: { label: 'View DICOM conformance', to: routes.conformance },
    secondary: { label: 'Discuss integration', to: routes.contact },
  },
  references: {
    id: 'standards-references',
    title: 'Standards references',
    intro:
      "Official DICOM sources for the terms used on this page. The chart's selection guidance is editorial synthesis, not a clinical recommendation or an app benchmark.",
    items: [
      { label: 'DICOM PS3.5: data structures and encoding', href: 'https://dicom.nema.org/medical/dicom/current/output/chtml/part05/PS3.5.html' },
      { label: 'PS3.5 §8.2.2: DICOM RLE', href: 'https://dicom.nema.org/medical/dicom/current/output/chtml/part05/sect_8.2.2.html' },
      { label: 'PS3.5 §8.2.3: JPEG-LS (lossless and near-lossless)', href: 'https://dicom.nema.org/medical/dicom/current/output/chtml/part05/sect_8.2.3.html' },
      { label: 'PS3.5 §8.2.4: JPEG 2000', href: 'https://dicom.nema.org/medical/dicom/current/output/chtml/part05/sect_8.2.4.html' },
      { label: 'PS3.5 §8.2.14: HTJ2K', href: 'https://dicom.nema.org/medical/dicom/current/output/chtml/part05/sect_8.2.14.html' },
      { label: 'PS3.5 §8.2.15: JPEG XL', href: 'https://dicom.nema.org/medical/dicom/current/output/chtml/part05/sect_8.2.15.html' },
      { label: 'PS3.5 §10.18: HTJ2K transfer syntaxes', href: 'https://dicom.nema.org/medical/dicom/current/output/chtml/part05/sect_10.18.html' },
      { label: 'PS3.5 §10.19: JPEG XL transfer syntaxes', href: 'https://dicom.nema.org/medical/dicom/current/output/chtml/part05/sect_10.19.html' },
      { label: 'PS3.6 Annex A: registry of DICOM unique identifiers', href: 'https://dicom.nema.org/medical/dicom/current/output/chtml/part06/chapter_A.html' },
    ],
  },
} as const;
