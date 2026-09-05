import { siGithub } from 'simple-icons';

import type { SocialLink } from '@/content';
import { cn } from '@/lib/cn';

/**
 * LinkedIn's mark, drawn here because the icon set dropped it over trademark
 * concerns. Used nominatively: it labels a link to the profile it belongs to.
 */
const LINKEDIN_PATH =
  'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z';

/** A plain envelope. Email is a protocol, not a brand, so nothing is borrowed. */
const EMAIL_PATH =
  'M1.5 4.5h21a1.5 1.5 0 0 1 1.5 1.5v12a1.5 1.5 0 0 1-1.5 1.5h-21A1.5 1.5 0 0 1 0 18V6a1.5 1.5 0 0 1 1.5-1.5Zm.9 2.4v.36l9.6 6.24 9.6-6.24V6.9H2.4Zm19.2 3.24-8.79 5.71a1.5 1.5 0 0 1-1.62 0L2.4 10.14v6.96h19.2v-6.96Z';

const SOCIAL_PATHS: Record<SocialLink['platform'], string> = {
  github: siGithub.path,
  linkedin: LINKEDIN_PATH,
  email: EMAIL_PATH,
};

interface SocialIconProps {
  platform: SocialLink['platform'];
  className?: string;
}

/**
 * Renders a contact channel's mark.
 *
 * Hidden from assistive technology: the link that wraps it always carries a
 * text label, so announcing the icon too would only duplicate it.
 */
export function SocialIcon({ platform, className }: SocialIconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn('size-4 shrink-0', className)}
    >
      <path d={SOCIAL_PATHS[platform]} />
    </svg>
  );
}
