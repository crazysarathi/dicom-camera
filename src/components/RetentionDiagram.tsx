import { ArrowDown, ArrowRight, Info } from 'lucide-react';
import type { RetentionFlow, RetentionNode, RetentionNodeTone } from '@/content/privacy';
import { cn } from '@/lib/utils';

interface RetentionDiagramProps {
  flows: readonly RetentionFlow[];
  note: { id: string; label: string; steps: readonly RetentionNode[] };
  /** Visible label stating that this is an illustration of app behaviour. */
  disclaimer: string;
  id?: string;
  className?: string;
}

/*
 * Restrained node palette. Retained and confirmed states use teal, waiting states are muted,
 * deletion is plain ink. No red or warning styling: a retained image is the safe outcome, not an error.
 */
const toneClasses: Record<RetentionNodeTone, string> = {
  neutral: 'border-line bg-card text-ink',
  waiting: 'border-dashed border-ink/25 bg-secondary text-muted-foreground',
  // Ink text keeps AA contrast on the teal tint; the teal accent lives in the border and icon (graphics need only 3:1).
  confirmed: 'border-teal/40 bg-teal-soft text-ink [&>svg]:text-teal',
  delete: 'border-ink bg-ink text-ink-foreground',
  retain: 'border-teal bg-teal text-teal-foreground',
};

/** Arrow between two steps: horizontal on wider screens, vertical when the flow stacks. Purely decorative. */
function Connector() {
  return (
    <span className="flex shrink-0 items-center justify-center text-muted-foreground" aria-hidden="true">
      <ArrowDown className="size-5 sm:hidden" />
      <ArrowRight className="hidden size-5 sm:block" />
    </span>
  );
}

function Step({ node, first }: { node: RetentionNode; first: boolean }) {
  const Icon = node.icon;
  return (
    <li className="flex flex-col items-center gap-2 sm:flex-row sm:gap-3">
      {!first && <Connector />}
      <span
        className={cn(
          'inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-center text-[0.95rem] font-medium leading-snug sm:w-auto sm:max-w-[16rem]',
          toneClasses[node.tone],
        )}
      >
        {Icon && <Icon className="size-4 shrink-0" aria-hidden="true" />}
        <span>{node.label}</span>
      </span>
    </li>
  );
}

function Flow({ steps, labelledBy }: { steps: readonly RetentionNode[]; labelledBy: string }) {
  // The ordered list is the text equivalent: screen readers read each step in sequence; arrows are hidden.
  return (
    <ol aria-labelledby={labelledBy} className="flex flex-col items-stretch gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
      {steps.map((node, i) => (
        <Step key={`${node.label}-${i}`} node={node} first={i === 0} />
      ))}
    </ol>
  );
}

/**
 * Semantic HTML/CSS retention diagram. Explains when local deletion can follow a send and when images
 * remain retained. It is static content only: it does not read, store or act on any data.
 */
export function RetentionDiagram({ flows, note, disclaimer, id = 'retention-diagram', className }: RetentionDiagramProps) {
  const disclaimerId = `${id}-disclaimer`;
  return (
    <figure id={id} aria-labelledby={disclaimerId} className={cn('card-surface m-0 p-6 sm:p-8', className)}>
      <div className="flex flex-col [&>*+*]:mt-8 [&>*+*]:border-t [&>*+*]:border-line [&>*+*]:pt-8">
        {flows.map((flow) => {
          const headingId = `${id}-${flow.id}-title`;
          return (
            <section key={flow.id} aria-labelledby={headingId}>
              <h3 id={headingId} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-lg sm:text-lg">
                <span>{flow.label}</span>
                <span className="sr-only">: </span>
                <span className="text-[0.95rem] font-normal text-muted-foreground">{flow.condition}</span>
              </h3>
              <div className="mt-4">
                <Flow steps={flow.steps} labelledBy={headingId} />
              </div>
            </section>
          );
        })}
        <section aria-labelledby={`${id}-${note.id}-title`}>
          <h3 id={`${id}-${note.id}-title`} className="text-lg sm:text-lg">{note.label}</h3>
          <div className="mt-4">
            <Flow steps={note.steps} labelledBy={`${id}-${note.id}-title`} />
          </div>
        </section>
      </div>
      <figcaption id={disclaimerId} className="mt-8 flex items-start gap-2 border-t border-line pt-5 text-sm text-muted-foreground">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <span>{disclaimer}</span>
      </figcaption>
    </figure>
  );
}
