import type { LucideIcon } from 'lucide-react';
import { ArrowDown, ArrowRight, Camera, ClipboardCheck, Images, Link2, Send, UserPlus, UserSearch } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Capture workflow illustration built from semantic HTML: each path is an ordered list of steps.
 * The list markup is the text equivalent; arrows and icons are decorative and hidden from assistive
 * technology. In the full variant, steps stack vertically on narrow screens and run horizontally from the
 * md breakpoint; the compact variant (for placement beside prose) always stacks.
 * This is a workflow illustration, not a rendering of any app screen.
 */

export type WorkflowPathId = 'patient-first' | 'quick-take' | 'photo-album';

export interface WorkflowStep {
  label: string;
  icon: LucideIcon;
}

export interface WorkflowPath {
  id: WorkflowPathId;
  /** Short path name shown above the steps. */
  name: string;
  steps: WorkflowStep[];
}

const review: WorkflowStep = { label: 'Review', icon: ClipboardCheck };
const send: WorkflowStep = { label: 'Send to PACS', icon: Send };
const capture: WorkflowStep = { label: 'Capture', icon: Camera };

export const workflowPaths: Record<WorkflowPathId, WorkflowPath> = {
  'patient-first': {
    id: 'patient-first',
    name: 'Patient-first',
    steps: [{ label: 'Identify patient', icon: UserSearch }, capture, review, send],
  },
  'quick-take': {
    id: 'quick-take',
    name: 'Quick Take',
    steps: [capture, { label: 'Add demographics', icon: UserPlus }, review, send],
  },
  'photo-album': {
    id: 'photo-album',
    name: 'Photo Album import',
    steps: [{ label: 'Import from Photo Album', icon: Images }, { label: 'Associate patient and study', icon: Link2 }, review, send],
  },
};

export const allWorkflowPaths: WorkflowPathId[] = ['patient-first', 'quick-take', 'photo-album'];

export const WORKFLOW_DIAGRAM_LABEL = 'Workflow illustration, not an app screen';

interface WorkflowDiagramProps {
  /** Which paths to draw, in order. Defaults to all three. */
  paths?: WorkflowPathId[];
  /** `full` for a standalone figure; `compact` when placed beside prose. */
  variant?: 'full' | 'compact';
  /** Element used for each path name. Use `p` when the surrounding heading structure should stay untouched. */
  pathHeading?: 'h3' | 'h4' | 'p';
  /** Show the visible "Workflow illustration, not an app screen" label (default true). */
  showLabel?: boolean;
  /** Show the path name above each list (default true). The name still labels the list for assistive technology. */
  showPathNames?: boolean;
  /** Required so the figure and each list can be labelled uniquely when several diagrams share a page. */
  id: string;
  className?: string;
}

export function WorkflowDiagram({
  paths = allWorkflowPaths,
  variant = 'full',
  pathHeading: PathTag = 'p',
  showLabel = true,
  showPathNames = true,
  id,
  className,
}: WorkflowDiagramProps) {
  const compact = variant === 'compact';
  const labelId = `${id}-label`;
  return (
    <figure
      id={id}
      className={cn('card-surface m-0', compact ? 'p-4 sm:p-5' : 'p-5 sm:p-8 lg:p-10', className)}
      aria-labelledby={showLabel ? labelId : undefined}
      aria-label={showLabel ? undefined : WORKFLOW_DIAGRAM_LABEL}
    >
      {showLabel && (
        <figcaption
          id={labelId}
          className={cn(
            'inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground',
            compact ? 'mb-4' : 'mb-6',
          )}
        >
          {WORKFLOW_DIAGRAM_LABEL}
        </figcaption>
      )}
      <div className={cn('flex flex-col', compact ? 'gap-6' : 'gap-8 lg:gap-10')}>
        {paths.map((pathId) => {
          const path = workflowPaths[pathId];
          const nameId = `${id}-${path.id}-name`;
          return (
            <div key={path.id}>
              <PathTag id={nameId} className={cn('font-semibold text-ink', compact ? 'mb-3 text-sm' : 'mb-4 text-base', !showPathNames && 'sr-only')}>
                {path.name}
              </PathTag>
              <ol role="list" aria-labelledby={nameId} className={cn('m-0 flex list-none flex-col p-0', compact ? 'gap-1.5' : 'gap-2 md:flex-row md:items-stretch md:gap-1')}>
                {path.steps.map((step, index) => {
                  const Icon = step.icon;
                  const last = index === path.steps.length - 1;
                  return (
                    <li key={step.label} className={cn('flex min-w-0 flex-col', !compact && 'md:flex-1 md:flex-row md:items-stretch')}>
                      {index > 0 && (
                        <span
                          aria-hidden="true"
                          className={cn('flex shrink-0 items-center justify-center text-muted-foreground/70', compact ? 'h-6' : 'h-8 md:h-auto md:w-9')}
                        >
                          {compact ? <ArrowDown className="size-4" /> : (
                            <>
                              <ArrowDown className="size-5 md:hidden" />
                              <ArrowRight className="hidden size-5 md:block" />
                            </>
                          )}
                        </span>
                      )}
                      <span
                        className={cn(
                          'flex min-w-0 flex-1 items-center gap-3 rounded-xl border',
                          compact ? 'px-3 py-2.5' : 'px-4 py-3.5 md:flex-col md:items-start md:gap-3 md:py-4',
                          last ? 'border-teal/30 bg-teal-soft' : 'border-line bg-surface',
                        )}
                      >
                        <span
                          aria-hidden="true"
                          className={cn(
                            'inline-flex shrink-0 items-center justify-center rounded-lg',
                            compact ? 'size-8' : 'size-10',
                            last ? 'bg-teal text-white' : 'bg-primary-soft text-primary-deep',
                          )}
                        >
                          <Icon className={compact ? 'size-4' : 'size-5'} />
                        </span>
                        <span className={cn('min-w-0 break-words font-medium text-ink', compact ? 'text-sm leading-snug' : 'text-[0.95rem] leading-snug')}>{step.label}</span>
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>
          );
        })}
      </div>
    </figure>
  );
}
