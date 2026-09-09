/**
 * The page's section order, in one place.
 *
 * Each id is simultaneously the DOM anchor, the `nav.*` translation key and the
 * scroll-spy target. Because the type is derived from this tuple, adding a
 * section without translating its label fails `typecheck`.
 */
export const SECTION_IDS = [
  'about',
  'trajectory',
  'missions',
  'constellations',
  'contact',
] as const;

export type SectionId = (typeof SECTION_IDS)[number];
