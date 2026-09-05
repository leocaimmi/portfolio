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
 */
export default async function HomePage({ params }: { params: Promise<LocaleRouteParams> }) {
  await resolveLocale(params);

  return (
    <>
      <HeroSection />
      <AboutSection />
      <TrajectorySection />
      <MissionsSection />
      <ConstellationsSection />
      <ContactSection isFormEnabled={isContactDeliveryConfigured} />
    </>
  );
}
