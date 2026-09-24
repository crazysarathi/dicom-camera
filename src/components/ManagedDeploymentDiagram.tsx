import type { LucideIcon } from 'lucide-react';
import { ArrowDown, ArrowRight, Database, LockKeyhole, QrCode, Settings2, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Conceptual Enterprise Manager workflow: administration on one lane, image transfer on a separate lane.
 * Built from semantic HTML (ordered lists are the text equivalent; arrows and icons are decorative).
 * It is a workflow illustration, not a screenshot of an administration console, and it draws no
 * enrolment link, token, credential, archive address or QR code: the link/QR step is a labelled icon.
 * The management server is never drawn on the image path.
 */

export const MANAGED_DIAGRAM_LABEL = 'Workflow illustration, not an administration console';

interface Step {
  label: string;
  icon: LucideIcon;
}

interface ManagedDeploymentDiagramProps {
  id: string;
  /** The four administration steps, in order (visitor-facing copy). */
  steps: readonly string[];
  /** Line shown under the lanes: what Enterprise Manager controls and where images go. */
  supporting: string;
  className?: string;
}

const ADMIN_ICONS: LucideIcon[] = [Settings2, QrCode, Smartphone, LockKeyhole];
const TRANSFER: Step[] = [
  { label: 'DICOM Camera', icon: Smartphone },
  { label: 'PACS or archive', icon: Database },
];

function Lane({ title, steps, tone, labelId }: { title: string; steps: Step[]; tone: 'admin' | 'transfer'; labelId: string }) {
  return (
    <div>
      <p id={labelId} className="mb-3 text-sm font-semibold text-ink">
        {title}
      </p>
      <ol role="list" aria-labelledby={labelId} className="m-0 flex list-none flex-col gap-2 p-0 md:flex-row md:items-stretch md:gap-1">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const last = index === steps.length - 1;
          return (
            <li key={step.label} className="flex min-w-0 flex-col md:flex-1 md:flex-row md:items-stretch">
              {index > 0 && (
                <span aria-hidden="true" className="flex h-8 shrink-0 items-center justify-center text-muted-foreground/70 md:h-auto md:w-9">
                  <ArrowDown className="size-5 md:hidden" />
                  <ArrowRight className="hidden size-5 md:block" />
                </span>
              )}
              <span
                className={cn(
                  'flex min-w-0 flex-1 items-center gap-3 rounded-xl border px-4 py-3.5 md:flex-col md:items-start md:gap-3 md:py-4',
                  tone === 'transfer' && last ? 'border-teal/30 bg-teal-soft' : 'border-line bg-surface',
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn('inline-flex size-10 shrink-0 items-center justify-center rounded-lg', tone === 'transfer' && last ? 'bg-teal text-teal-foreground' : 'bg-primary-soft text-primary-deep')}
                >
                  <Icon className="size-5" />
                </span>
                <span className="min-w-0 break-words text-[0.95rem] font-medium leading-snug text-ink">
                  {tone === 'admin' && <span className="mr-1.5 tabular-nums text-muted-foreground">{index + 1}.</span>}
                  {step.label}
                </span>
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function ManagedDeploymentDiagram({ id, steps, supporting, className }: ManagedDeploymentDiagramProps) {
  const labelId = `${id}-label`;
  const adminSteps: Step[] = steps.map((label, i) => ({ label, icon: ADMIN_ICONS[i] ?? Settings2 }));
  return (
    <figure id={id} className={cn('card-surface m-0 p-5 sm:p-8 lg:p-10', className)} aria-labelledby={labelId}>
      <figcaption id={labelId} className="mb-6 inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        {MANAGED_DIAGRAM_LABEL}
      </figcaption>
      <div className="flex flex-col gap-8 lg:gap-10">
        <Lane title="Administration and configuration" steps={adminSteps} tone="admin" labelId={`${id}-admin`} />
        <Lane title="Image transfer path" steps={TRANSFER} tone="transfer" labelId={`${id}-transfer`} />
      </div>
      <p className="mt-6 border-t border-line pt-5 text-[0.95rem] text-muted-foreground">{supporting}</p>
    </figure>
  );
}
