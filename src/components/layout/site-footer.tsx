import { useLocale, useTranslations } from 'next-intl';

import { PLATFORM_LABEL, SocialIcon } from '@/components/ui/social-icon';
import { SECTION_IDS } from '@/config/navigation';
import { profile } from '@/content';

import { CurrentYear } from './current-year';

const AVAILABILITY_DOT: Record<typeof profile.availability, string> = {
  open: 'bg-star',
  selective: 'bg-solar',
  unavailable: 'bg-dust',
};

/**
 * Closing band: who this is, where to go, and how to reach him.
 *
 * A footer is the second place a visitor looks for a way to make contact, and
 * the only one still on screen once they have read to the end — so it repeats
 * the route through the site and the three channels rather than signing off
 * with the name of the framework, which tells a reader nothing about the person
 * whose site it is.
 *
 * A server component apart from the year, which cannot be one: see
 * `CurrentYear`.
 */
export function SiteFooter() {
  const t = useTranslations('footer');
  const nav = useTranslations('nav');
  const common = useTranslations('common');
  const locale = useLocale();

  return (
    <footer className="border-t border-horizon/40">
      <div className="mx-auto w-full max-w-7xl px-6 py-12 sm:py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <p className="font-display text-lg font-semibold text-starlight">{profile.name}</p>
            <p className="mt-1 text-sm text-moondust">{profile.role[locale]}</p>

            <p className="mt-4 font-mono text-[0.6875rem] tracking-wide text-dust">
              {profile.location[locale]}
            </p>

            <p className="mt-2 flex items-center gap-2 font-mono text-[0.6875rem] tracking-wide text-moondust">
              <span
                aria-hidden="true"
                className={`size-1.5 rounded-full ${AVAILABILITY_DOT[profile.availability]}`}
              />
              {common(`availability.${profile.availability}`)}
            </p>
          </div>

          <nav aria-label={t('navTitle')}>
            <h2 className="telemetry">{t('navTitle')}</h2>

            <ul className="mt-4 space-y-2.5">
              {SECTION_IDS.map((id) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    className="text-sm text-moondust transition-colors duration-200 hover:text-star"
                  >
                    {nav(id)}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="telemetry">{t('contactTitle')}</h2>

            <ul className="mt-4 space-y-2.5">
              {profile.socials.map((social) => (
                <li key={social.platform}>
                  <a
                    href={social.url}
                    {...(social.platform === 'email'
                      ? {}
                      : { target: '_blank', rel: 'noopener noreferrer' })}
                    className="flex items-center gap-2.5 text-sm text-moondust transition-colors duration-200 hover:text-star"
                  >
                    <SocialIcon platform={social.platform} />
                    {PLATFORM_LABEL[social.platform]}
                    {social.platform === 'email' ? null : (
                      <span className="sr-only"> {common('opensInNewTab')}</span>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-horizon/40 pt-6 font-mono text-[0.6875rem] tracking-wide text-dust sm:flex-row sm:items-center sm:justify-between">
          <p>
            © <CurrentYear buildYear={new Date().getFullYear()} /> {profile.name}
          </p>

          <div className="flex items-center gap-5">
            <a
              href="https://github.com/leocaimmi/portfolio"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors duration-200 hover:text-star"
            >
              {t('sourceCode')}
              <span className="sr-only"> {common('opensInNewTab')}</span>
            </a>

            <a href="#top" className="transition-colors duration-200 hover:text-star">
              {t('backToTop')}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
