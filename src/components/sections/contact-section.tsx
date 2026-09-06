import { useLocale, useTranslations } from 'next-intl';

import { Panel } from '@/components/ui/panel';
import { Reveal } from '@/components/ui/reveal';
import { Section } from '@/components/ui/section';
import { PLATFORM_LABEL, SocialIcon } from '@/components/ui/social-icon';
import { profile } from '@/content';

import { ContactForm } from './contact-form';

interface ContactSectionProps {
  /**
   * False when the deployment has no mail credentials. The form is replaced by
   * a note rather than rendered as a control that silently fails on submit.
   */
  isFormEnabled: boolean;
}

/**
 * Closing section: the direct channels first, the form second.
 *
 * The links come first on purpose — most visitors would rather use the channel
 * they already have open than fill in a form.
 */
export function ContactSection({ isFormEnabled }: ContactSectionProps) {
  const t = useTranslations('contact');
  const common = useTranslations('common');
  const locale = useLocale();

  return (
    <Section id="contact" label={t('label')} title={t('title')} description={t('description')}>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <Reveal>
          <Panel className="h-full p-6 sm:p-7">
            <h3 className="telemetry">{t('directTitle')}</h3>

            <ul className="mt-5 space-y-3">
              {profile.socials.map((social) => (
                <li key={social.platform}>
                  <a
                    href={social.url}
                    {...(social.platform === 'email'
                      ? {}
                      : { target: '_blank', rel: 'noopener noreferrer' })}
                    className="group flex items-center justify-between gap-4 border-b border-horizon/40 pb-3 transition-colors hover:border-star/50"
                  >
                    <span className="flex items-center gap-2.5 font-mono text-[0.6875rem] tracking-wide text-dust uppercase transition-colors group-hover:text-moondust">
                      <SocialIcon platform={social.platform} />
                      {PLATFORM_LABEL[social.platform]}
                    </span>
                    <span className="text-sm text-moondust transition-colors group-hover:text-star">
                      {social.handle}
                      {social.platform === 'email' ? null : (
                        <span className="sr-only"> {common('opensInNewTab')}</span>
                      )}
                    </span>
                  </a>
                </li>
              ))}
            </ul>

            <p className="mt-6 font-mono text-[0.6875rem] tracking-wide text-dust">
              {profile.location[locale]}
            </p>
          </Panel>
        </Reveal>

        <Reveal delay={100}>
          <Panel className="h-full p-6 sm:p-7">
            <h3 className="telemetry">{t('form.title')}</h3>

            <div className="mt-5">
              {isFormEnabled ? (
                <ContactForm />
              ) : (
                <p className="text-sm leading-relaxed text-pretty text-moondust">
                  {t('form.disabled')}
                </p>
              )}
            </div>
          </Panel>
        </Reveal>
      </div>
    </Section>
  );
}
