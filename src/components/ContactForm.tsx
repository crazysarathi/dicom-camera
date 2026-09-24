import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { CircleAlert, CircleCheck, Mail, Send, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { siteConfig } from '@/config/site';
import { contactContent } from '@/content/contact';
import { cn } from '@/lib/utils';

type Status = 'idle' | 'validating' | 'submitting' | 'success' | 'error' | 'offline';

type FieldName = 'name' | 'email' | 'organisation' | 'topic' | 'pacs' | 'platform' | 'message';
type Values = Record<FieldName, string>;
type Errors = Partial<Record<FieldName, string>>;

const initialValues: Values = {
  name: '',
  email: '',
  organisation: '',
  topic: '',
  pacs: '',
  platform: '',
  message: '',
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const fieldClass =
  'block w-full min-h-11 rounded-lg border border-line bg-white px-3.5 py-2.5 text-[1rem] text-ink shadow-sm placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white aria-[invalid=true]:border-destructive';

function Label({ htmlFor, children, optional }: { htmlFor: string; children: string; optional?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-[0.95rem] font-medium text-ink">
      {children}
      {optional && <span className="ml-1.5 font-normal text-muted-foreground">({contactContent.form.optional})</span>}
    </label>
  );
}

interface ContactFormProps {
  /** Absolute URL of the configured form service. The form is not rendered anywhere unless one is set. */
  endpoint: string;
  className?: string;
}

/**
 * Enquiry form for a configured endpoint. Dormant unless siteConfig.contactFormEndpoint is set.
 * Posts JSON, no attachments. Success is shown only after the endpoint responds with an OK status.
 */
export function ContactForm({ endpoint, className }: ContactFormProps) {
  const copy = contactContent.form;
  const uid = useId();
  const [values, setValues] = useState<Values>(initialValues);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>('idle');
  const [honeypot, setHoneypot] = useState('');
  const successRef = useRef<HTMLDivElement>(null);

  // The submit button unmounts on success; move focus to the confirmation so keyboard and
  // screen-reader users are not dropped at the top of the document.
  useEffect(() => {
    if (status === 'success') successRef.current?.focus();
  }, [status]);

  const fieldId = (name: FieldName) => `${uid}-${name}`;
  const errorId = (name: FieldName) => `${uid}-${name}-error`;

  const set = (name: FieldName) => (event: { target: { value: string } }) => {
    setValues((prev) => ({ ...prev, [name]: event.target.value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = (v: Values): Errors => {
    const next: Errors = {};
    if (!v.name.trim()) next.name = copy.validation.required;
    if (!v.email.trim()) next.email = copy.validation.required;
    else if (!EMAIL_PATTERN.test(v.email.trim())) next.email = copy.validation.email;
    if (!v.organisation.trim()) next.organisation = copy.validation.required;
    if (!v.topic) next.topic = copy.validation.select;
    if (!v.message.trim()) next.message = copy.validation.required;
    return next;
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('validating');
    const nextErrors = validate(values);
    setErrors(nextErrors);
    const firstInvalid = (Object.keys(nextErrors) as FieldName[]).find((k) => nextErrors[k]);
    if (firstInvalid) {
      document.getElementById(fieldId(firstInvalid))?.focus();
      return;
    }
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      setStatus('offline');
      return;
    }
    if (honeypot) {
      // Automated submission: behave as if nothing happened.
      setStatus('idle');
      return;
    }
    setStatus('submitting');
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email.trim(),
          organisation: values.organisation.trim(),
          topic: values.topic,
          pacs: values.pacs.trim() || undefined,
          platform: values.platform || undefined,
          message: values.message.trim(),
          source: `${siteConfig.origin}/contact/`,
        }),
      });
      if (res.ok) {
        setStatus('success');
        setValues(initialValues);
      } else {
        setStatus('error');
      }
    } catch {
      setStatus(typeof navigator !== 'undefined' && navigator.onLine === false ? 'offline' : 'error');
    }
  };

  const submitting = status === 'submitting';
  const hasErrors = status === 'validating' && Object.values(errors).some(Boolean);

  const describedBy = (name: FieldName, extra?: string) => [errors[name] ? errorId(name) : null, extra ?? null].filter(Boolean).join(' ') || undefined;

  const renderError = (name: FieldName) =>
    errors[name] ? (
      <p id={errorId(name)} className="mt-1.5 flex items-start gap-1.5 text-sm text-destructive">
        <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        {errors[name]}
      </p>
    ) : null;

  // The live region below stays mounted across every state so that assistive technology
  // announces changes to it. The form fields are removed only after the endpoint confirms receipt.
  return (
    <div className={cn('card-surface relative p-6 sm:p-8', className)}>
      {status !== 'success' && (
        <form onSubmit={onSubmit} noValidate aria-busy={submitting || undefined}>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor={fieldId('name')}>{copy.labels.name}</Label>
              <input
                id={fieldId('name')}
                name="name"
                type="text"
                autoComplete="name"
                required
                value={values.name}
                onChange={set('name')}
                aria-invalid={errors.name ? true : undefined}
                aria-describedby={describedBy('name')}
                className={fieldClass}
              />
              {renderError('name')}
            </div>
            <div>
              <Label htmlFor={fieldId('email')}>{copy.labels.email}</Label>
              <input
                id={fieldId('email')}
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                value={values.email}
                onChange={set('email')}
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={describedBy('email')}
                className={fieldClass}
              />
              {renderError('email')}
            </div>
            <div>
              <Label htmlFor={fieldId('organisation')}>{copy.labels.organisation}</Label>
              <input
                id={fieldId('organisation')}
                name="organisation"
                type="text"
                autoComplete="organization"
                required
                value={values.organisation}
                onChange={set('organisation')}
                aria-invalid={errors.organisation ? true : undefined}
                aria-describedby={describedBy('organisation')}
                className={fieldClass}
              />
              {renderError('organisation')}
            </div>
            <div>
              <Label htmlFor={fieldId('topic')}>{copy.labels.topic}</Label>
              <select
                id={fieldId('topic')}
                name="topic"
                required
                value={values.topic}
                onChange={set('topic')}
                aria-invalid={errors.topic ? true : undefined}
                aria-describedby={describedBy('topic')}
                className={fieldClass}
              >
                <option value="">Select a topic</option>
                {copy.topics.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              {renderError('topic')}
            </div>
            <div>
              <Label htmlFor={fieldId('pacs')} optional>
                {copy.labels.pacs}
              </Label>
              <input id={fieldId('pacs')} name="pacs" type="text" value={values.pacs} onChange={set('pacs')} className={fieldClass} />
            </div>
            <div>
              <Label htmlFor={fieldId('platform')} optional>
                {copy.labels.platform}
              </Label>
              <select id={fieldId('platform')} name="platform" value={values.platform} onChange={set('platform')} className={fieldClass}>
                <option value="">Select a platform</option>
                {copy.platforms.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor={fieldId('message')}>{copy.labels.message}</Label>
              <textarea
                id={fieldId('message')}
                name="message"
                rows={6}
                required
                value={values.message}
                onChange={set('message')}
                aria-invalid={errors.message ? true : undefined}
                aria-describedby={describedBy('message', `${uid}-note`)}
                className={cn(fieldClass, 'min-h-36 resize-y')}
              />
              {renderError('message')}
              <p id={`${uid}-note`} className="mt-2 text-sm text-muted-foreground">
                {copy.note}
              </p>
            </div>
          </div>

          {/* Honeypot: hidden from assistive technology and keyboard focus; automated agents tend to fill it. */}
          <div className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
            <label htmlFor={`${uid}-website`}>Website</label>
            <input
              id={`${uid}-website`}
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Button type="submit" size="lg" disabled={submitting} aria-busy={submitting || undefined}>
              <Send aria-hidden="true" />
              {submitting ? copy.submitting : copy.submit}
            </Button>
          </div>
        </form>
      )}

      <div role="status" aria-live="polite" className="outline-none" ref={successRef} tabIndex={-1}>
        {status === 'success' && (
          <p className="m-0 flex items-start gap-3 text-ink">
            <CircleCheck className="mt-0.5 size-6 shrink-0 text-teal" aria-hidden="true" />
            <span>{copy.success}</span>
          </p>
        )}
        {hasErrors && (
          <p className="mt-4 flex items-start gap-2 text-sm text-destructive">
            <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {copy.validation.summary}
          </p>
        )}
        {status === 'error' && (
          <p className="mt-4 flex items-start gap-2 text-ink">
            <CircleAlert className="mt-1 size-5 shrink-0 text-destructive" aria-hidden="true" />
            <span>
              {copy.error.split(siteConfig.email.commercial.address)[0]}
              <a href={siteConfig.email.commercial.href} className="text-primary">
                {siteConfig.email.commercial.address}
              </a>
              {copy.error.split(siteConfig.email.commercial.address)[1]}
            </span>
          </p>
        )}
        {status === 'offline' && (
          <div className="mt-4 flex flex-col gap-3 rounded-xl border border-line bg-surface p-4 text-ink">
            <p className="m-0 flex items-start gap-2">
              <WifiOff className="mt-1 size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span>{copy.offline}</span>
            </p>
            <div>
              <Button asChild variant="secondary">
                <a href={siteConfig.email.commercial.href}>
                  <Mail aria-hidden="true" />
                  {contactContent.primaryAction.label}
                </a>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
