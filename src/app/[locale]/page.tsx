import { Activity } from 'react';

import { AboutSection } from '@/components/sections/about-section';
import { ConstellationsSection } from '@/components/sections/constellations-section';
import { ContactSection } from '@/components/sections/contact-section';
import { HeroSection } from '@/components/sections/hero-section';
import { MissionsSection } from '@/components/sections/missions-section';
import { TrajectorySection } from '@/components/sections/trajectory-section';
import type { LocaleRouteParams } from '@/i18n/resolve-locale';
import { resolveLocale } from '@/i18n/resolve-locale';
import { isContactDeliveryConfigured } from '@/lib/env/server';

/**
 * The single page. Section order is the narrative: who, then history, then
 * evidence, then tools, then how to get in touch.
 *
 * Every section below the hero sits in an `Activity` boundary of its own. They
 * render nothing of their own and change nothing about the HTML, but React
 * hydrates each boundary as a separate piece of work, at a lower priority than
 * the page around it, and yields to the browser in between — and hurries one
 * along the moment someone interacts with it. Without them the whole page was
 * hydrated in one task that held the main thread for close to two hundred
 * milliseconds on a throttled phone, most of it spent on sections nobody had
 * scrolled to yet.
 *
 * `Activity` rather than `Suspense`, which splits hydration the same way but
 * also lets React move any boundary over twelve kilobytes to the end of the
 * document, to be put back in place by a script. Every section here is over
 * that, so with Suspense the page arrived as a hero and a set of hidden
 * templates, and without JavaScript the hero was all anyone saw.
 */
export default async function HomePage({ params }: { params: Promise<LocaleRouteParams> }) {
  await resolveLocale(params);

  return (
    <>
      <HeroSection />
      <Activity>
        <AboutSection />
      </Activity>
      <Activity>
        <TrajectorySection />
      </Activity>
      <Activity>
        <MissionsSection />
      </Activity>
      <Activity>
        <ConstellationsSection />
      </Activity>
      <Activity>
        <ContactSection isFormEnabled={isContactDeliveryConfigured} />
      </Activity>
    </>
  );
}
