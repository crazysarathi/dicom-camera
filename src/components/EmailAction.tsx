import { useEffect, useRef, useState } from 'react';
import { Check, Copy, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { a11yLabels } from '@/content/nav';
import { cn } from '@/lib/utils';

interface EmailActionProps {
  email: { address: string; href: string };
  /** Visible button label, e.g. "Email support". */
  buttonLabel: string;
  /** Behaviour line under the actions. Defaults to "Opens your email application." */
  note?: string;
  variant?: 'primary' | 'secondary';
  className?: string;
}

const COPY_FALLBACK_MESSAGE = 'Copying is not available in this browser. Select the address and copy it manually.';

/** Copy text to the clipboard with a fallback for browsers without the async clipboard API. */
async function copyText(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to the legacy path
  }
  try {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.setAttribute('aria-hidden', 'true');
    area.tabIndex = -1;
    area.style.position = 'fixed';
    area.style.top = '0';
    area.style.left = '0';
    area.style.opacity = '0';
    area.style.pointerEvents = 'none';
    document.body.appendChild(area);
    area.focus({ preventScroll: true });
    area.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(area);
    return ok;
  } catch {
    return false;
  }
}

/**
 * Email route as a button plus a visible, selectable plain-text address with an accessible copy action.
 * The mail link opens the visitor's email application; nothing is sent from the website.
 */
export function EmailAction({ email, buttonLabel, note = 'Opens your email application.', variant = 'primary', className }: EmailActionProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const onCopy = async () => {
    const ok = await copyText(email.address);
    if (ok) {
      setCopied(true);
      toast(a11yLabels.emailCopied);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } else {
      toast(COPY_FALLBACK_MESSAGE);
    }
  };

  return (
    <div className={cn('flex w-full min-w-0 flex-col gap-3', className)}>
      <div className="flex flex-wrap items-center gap-3">
        <Button asChild size="lg" variant={variant === 'primary' ? 'default' : 'secondary'}>
          <a href={email.href}>
            <Mail aria-hidden="true" />
            {buttonLabel}
          </a>
        </Button>
        <p className="m-0 text-sm text-muted-foreground">{note}</p>
      </div>
      <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
        <code className="min-w-0 select-all rounded-md bg-secondary px-2.5 py-1.5 font-sans text-[1rem] text-ink [overflow-wrap:anywhere]">{email.address}</code>
        <Button type="button" variant="ghost" size="default" onClick={onCopy} className="-ml-1 px-3 text-[0.95rem] text-ink">
          {copied ? <Check aria-hidden="true" className="text-teal" /> : <Copy aria-hidden="true" />}
          {a11yLabels.copyEmail}
        </Button>
        <span role="status" aria-live="polite" className={cn('text-sm font-medium text-teal', !copied && 'sr-only')}>
          {copied ? 'Copied' : ''}
        </span>
      </div>
    </div>
  );
}
