// Approved copy for /privacy-and-retention/ (WEBSITE-COPY.md §5). Product-behaviour explanation, not a legal policy.
import type { LucideIcon } from 'lucide-react';
import { CircleCheck, Hourglass, Import, Send, Smartphone, Trash2 } from 'lucide-react';
import { routes } from '@/config/site';

export interface ProseBlock {
  id: string;
  title: string;
  body: string;
  icon: LucideIcon;
}

/** Visual treatment for a diagram node. Never alarm styling: retention is the safe, restful state. */
export type RetentionNodeTone = 'neutral' | 'waiting' | 'confirmed' | 'delete' | 'retain';

export interface RetentionNode {
  label: string;
  tone: RetentionNodeTone;
  icon?: LucideIcon;
}

export interface RetentionFlow {
  id: string;
  /** Short visible label, e.g. "Diagram A". */
  label: string;
  /** Condition under which the flow applies, drawn from the section copy. */
  condition: string;
  steps: RetentionNode[];
}

export const privacyContent = {
  hero: {
    eyebrow: 'Storage and retention',
    title: 'Clear control over captured images.',
    lede: 'DICOM Camera keeps images captured in the application within the app. Export to the Photo Album is an explicit action, and local retention can follow the result of sending images to the archive.',
  },
  storage: [
    {
      id: 'captures-remain',
      title: 'Captures remain in the application',
      body: 'Capturing an image in DICOM Camera does not automatically add it to the Photo Album. Use an explicit export when you need a copy there.',
      icon: Smartphone,
    },
    {
      id: 'import-existing',
      title: 'Import existing photographs',
      body: 'Already captured images can be imported from the Photo Album for patient association and upload. Import and export are separate actions.',
      icon: Import,
    },
  ] satisfies ProseBlock[],
  deletion: [
    {
      id: 'auto-delete',
      title: 'Automatic deletion after successful send',
      body: 'Auto-delete after send is enabled by default. When no Storage Commitment gate is configured, successful send is the condition for automatic deletion. Failed sends do not trigger deletion.',
      icon: Send,
    },
    {
      id: 'storage-commitment',
      title: 'Wait for Storage Commitment when required',
      body: 'Enable Storage Commitment gating to wait for a positive commitment result from the archive before deleting the relevant local objects. While commitment is pending, or if it fails, those objects remain retained.',
      icon: Hourglass,
    },
  ] satisfies ProseBlock[],
  diagram: {
    flows: [
      {
        id: 'diagram-a',
        label: 'Diagram A',
        condition: 'No Storage Commitment gate configured',
        steps: [
          { label: 'Successful send', tone: 'neutral', icon: Send },
          { label: 'Auto-delete when enabled', tone: 'delete', icon: Trash2 },
        ],
      },
      {
        id: 'diagram-b',
        label: 'Diagram B',
        condition: 'Storage Commitment gating enabled',
        steps: [
          { label: 'Successful send', tone: 'neutral', icon: Send },
          { label: 'Await Storage Commitment', tone: 'waiting', icon: Hourglass },
          { label: 'Positive commitment', tone: 'confirmed', icon: CircleCheck },
          { label: 'Auto-delete when enabled', tone: 'delete', icon: Trash2 },
        ],
      },
    ] satisfies RetentionFlow[],
    note: {
      id: 'diagram-note',
      label: 'Diagram note',
      steps: [
        { label: 'Failed send, pending commitment, or failed commitment', tone: 'waiting' },
        { label: 'Retain in app', tone: 'retain', icon: Smartphone },
      ] satisfies RetentionNode[],
    },
    disclaimer: 'Illustration of app behaviour. It does not act on any data.',
  },
  fit: {
    title: 'Fit retention to the deployment',
    body: 'Review the intended behaviour with your clinical and imaging IT teams, including whether the archive provides Storage Commitment and how your workflow handles unsuccessful transfers.',
    action: { label: 'Discuss deployment requirements', to: routes.contact },
  },
  footnote: 'This page describes how the app handles captured images. The privacy policy and terms and conditions are linked in the footer.',
} as const;
