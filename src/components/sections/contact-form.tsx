'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useId, useRef, useState } from 'react';

import { cn } from '@/lib/cn';
import type { ContactErrorKey, ContactField } from '@/lib/contact-schema';
import { CONTACT_LIMITS, contactMessageSchema, toFieldErrors } from '@/lib/contact-schema';

type SubmitState = 'idle' | 'sending' | 'sent' | 'error' | 'rateLimited';

const FIELD_BASE =
  'mt-2 w-full rounded-lg border bg-deep/60 px-3.5 py-2.5 text-sm text-starlight placeholder:text-dust/70 transition-colors duration-200 focus:border-star/70 focus:outline-none';

/**
 * `FormData.get` can return a `File`. Coercing one with `String()` would post
 * the literal text "[object File]", so anything that is not a string is
 * discarded here and rejected by the schema as empty.
 */
function readTextField(formData: FormData, name: string): string {
  const value = formData.get(name);

  return typeof value === 'string' ? value : '';
}

/**
 * Contact form.
 *
 * Validation runs against the same schema the endpoint uses, so the two can
 * never drift; the server re-parses regardless, since any request can be
 * crafted by hand. Errors are wired through `aria-invalid` and
 * `aria-describedby`, and the submit outcome is announced in a live region so
 * it reaches a screen reader without a focus jump.
 *
 * Spam is handled without a third-party captcha: a honeypot field, a minimum
 * fill time, and a rate limit on the endpoint. That keeps the visitor's data
 * out of an external service and the page free of an external script.
 */
export function ContactForm() {
  const t = useTranslations('contact.form');
  const fieldId = useId();
  const mountedAt = useRef(0);

  const [state, setState] = useState<SubmitState>('idle');
  const [errors, setErrors] = useState<Partial<Record<ContactField, ContactErrorKey>>>({});

  // Stamped from an effect rather than during render: reading the clock while
  // rendering is impure and would give a different value on every re-render.
  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);

  const describe = (field: ContactField) =>
    errors[field] ? `${fieldId}-${field}-error` : undefined;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Captured before the first await: `currentTarget` is cleared once the
    // synchronous part of the handler returns.
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      name: readTextField(formData, 'name'),
      email: readTextField(formData, 'email'),
      message: readTextField(formData, 'message'),
      website: readTextField(formData, 'website'),
      elapsedMs: Date.now() - mountedAt.current,
    };

    const parsed = contactMessageSchema.safeParse(payload);

    if (!parsed.success) {
      setErrors(toFieldErrors(parsed.error));
      setState('idle');
      return;
    }

    setErrors({});
    setState('sending');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });

      if (response.ok) {
        setState('sent');
        form.reset();
        mountedAt.current = Date.now();
        return;
      }

      setState(response.status === 429 ? 'rateLimited' : 'error');
    } catch {
      setState('error');
    }
  };

  return (
    <form
      noValidate
      onSubmit={(event) => {
        void handleSubmit(event);
      }}
      className="space-y-5"
    >
      <div>
        <label htmlFor={`${fieldId}-name`} className="telemetry">
          {t('name')}
        </label>
        <input
          id={`${fieldId}-name`}
          name="name"
          type="text"
          autoComplete="name"
          maxLength={CONTACT_LIMITS.nameMax}
          placeholder={t('namePlaceholder')}
          aria-invalid={errors.name !== undefined}
          aria-describedby={describe('name')}
          className={cn(FIELD_BASE, errors.name ? 'border-comet' : 'border-horizon/70')}
        />
        <FieldError id={`${fieldId}-name-error`} errorKey={errors.name} />
      </div>

      <div>
        <label htmlFor={`${fieldId}-email`} className="telemetry">
          {t('email')}
        </label>
        <input
          id={`${fieldId}-email`}
          name="email"
          type="email"
          autoComplete="email"
          maxLength={CONTACT_LIMITS.emailMax}
          placeholder={t('emailPlaceholder')}
          aria-invalid={errors.email !== undefined}
          aria-describedby={describe('email')}
          className={cn(FIELD_BASE, errors.email ? 'border-comet' : 'border-horizon/70')}
        />
        <FieldError id={`${fieldId}-email-error`} errorKey={errors.email} />
      </div>

      <div>
        <label htmlFor={`${fieldId}-message`} className="telemetry">
          {t('message')}
        </label>
        <textarea
          id={`${fieldId}-message`}
          name="message"
          rows={5}
          maxLength={CONTACT_LIMITS.messageMax}
          placeholder={t('messagePlaceholder')}
          aria-invalid={errors.message !== undefined}
          aria-describedby={describe('message')}
          className={cn(
            FIELD_BASE,
            'resize-y',
            errors.message ? 'border-comet' : 'border-horizon/70',
          )}
        />
        <FieldError id={`${fieldId}-message-error`} errorKey={errors.message} />
      </div>

      {/*
        Honeypot. Hidden from people with `hidden`, kept out of the tab order and
        out of the accessibility tree; only an automated filler will complete it.
      */}
      <div hidden aria-hidden="true">
        <label htmlFor={`${fieldId}-website`}>Website</label>
        <input
          id={`${fieldId}-website`}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <button
        type="submit"
        disabled={state === 'sending'}
        className="inline-flex items-center justify-center rounded-full bg-starlight px-6 py-2.5 font-mono text-xs tracking-wide text-void uppercase transition-colors duration-300 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {state === 'sending' ? t('sending') : t('submit')}
      </button>

      <p
        role="status"
        aria-live="polite"
        className={cn(
          'text-sm',
          state === 'sent' && 'text-star',
          (state === 'error' || state === 'rateLimited') && 'text-comet',
        )}
      >
        {state === 'sent' ? t('success') : null}
        {state === 'error' ? t('error') : null}
        {state === 'rateLimited' ? t('rateLimited') : null}
      </p>
    </form>
  );
}

function FieldError({ id, errorKey }: { id: string; errorKey: ContactErrorKey | undefined }) {
  const t = useTranslations('contact.form');

  if (!errorKey) {
    return null;
  }

  return (
    <p id={id} className="mt-2 text-xs text-comet">
      {t(errorKey)}
    </p>
  );
}
